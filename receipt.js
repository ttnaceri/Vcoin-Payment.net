var Receipt = {
  show: function(data) {
    var user = DB.getUser();
    var isSender = user && user.id === data.fromId;

    var html = '<div style="padding: 10px; max-width: 400px; margin: 0 auto; background: #ffffff; border-radius: 16px; color: #1a1a2e; position: relative;">';
    
    // X tugmasi (o'ng tepada)
    html += '<span onclick="UI.closeModal()" style="position: absolute; top: 12px; right: 16px; cursor: pointer; font-size: 22px; color: #888; font-weight: 700;" title="Yopish">✕</span>';

    html += '<div style="text-align: center; margin-bottom: 20px;">';
    html += '<div style="font-size: 36px; margin-bottom: 8px;">🧾</div>';
    html += '<h2 style="font-size: 18px; color: #2ea043;">To\'lov Cheki</h2>';
    html += '<p style="font-size: 11px; color: #666;">Vcoin Transaction Receipt</p>';
    html += '</div>';

    html += '<div style="display: flex; justify-content: space-between; margin-bottom: 16px; padding: 0 8px;">';
    html += '<div style="text-align: left;"><div style="font-size: 10px; color: #888;">YUBORUVCHI</div><div style="font-weight: 700; font-size: 14px; color: #c0392b;">' + (data.fromNickname || 'N/A') + '</div><div style="font-size: 11px; color: #888;">ID: ' + (data.fromId || 'N/A') + '</div></div>';
    html += '<div style="text-align: right;"><div style="font-size: 10px; color: #888;">QABUL QILUVCHI</div><div style="font-weight: 700; font-size: 14px; color: #2ea043;">' + (data.toNickname || 'N/A') + '</div><div style="font-size: 11px; color: #888;">ID: ' + (data.toId || 'N/A') + '</div></div>';
    html += '</div>';

    html += '<div style="text-align: center; padding: 20px; margin-bottom: 16px; background: #f0f4ff; border-radius: 12px; border: 2px dashed #4a90d9;">';
    html += '<div style="font-size: 11px; color: #888; margin-bottom: 4px;">YUBORILGAN MIQDOR</div>';
    html += '<div style="font-size: 38px; font-weight: 800; color: #4a90d9;">' + Utils.formatNumber(data.amount) + '</div>';
    html += '<div style="font-size: 16px; color: #4a90d9; font-weight: 600;">Vcoin</div>';
    if (data.commission) { html += '<div style="font-size: 11px; color: #888; margin-top: 6px;">Komissiya: ' + Utils.formatNumber(data.commission) + ' Vcoin</div>'; }
    html += '</div>';

    html += '<div style="text-align: center; margin-bottom: 16px;">';
    html += '<div style="font-size: 10px; color: #888;">TRANZAKSIYA ID</div>';
    html += '<div style="font-size: 14px; font-weight: 600; font-family: monospace; color: #f0b90b; margin-top: 4px;">' + (data.txId || 'N/A') + '</div>';
    html += '</div>';

    html += '<div style="text-align: center; margin-bottom: 16px;">';
    html += '<div id="receiptQR" style="display: inline-block; background: #fff; padding: 12px; border-radius: 12px; border: 2px solid #eee;"></div>';
    html += '</div>';

    html += '<div style="text-align: center; font-size: 10px; color: #888; margin-bottom: 16px;">' + new Date().toLocaleString() + '</div>';

    // Tugmalar
    html += '<div style="display: flex; gap: 8px; margin-top: 12px;">';
    html += '<button class="btn btn-outline btn-sm" onclick="Receipt.shareReceipt(\'' + (data.txId || '') + '\')" style="flex: 1; border-color: #4a90d9; color: #4a90d9; padding: 12px;">📤 Ulashish</button>';
    
    // Yuboruvchi uchun — Bekor Qilish
    if (isSender) {
      html += '<button class="btn btn-sm" onclick="Receipt.cancelTransaction(\'' + (data.txId || '') + '\',\'' + (data.fromId || '') + '\',' + (data.amount || 0) + ')" style="flex: 1; background: #e74c3c; color: #fff; padding: 12px;">❌ Bekor Qilish</button>';
    }
    
    // Qabul qiluvchi uchun — Qaytarish (yana yuborish)
    if (!isSender) {
      html += '<button class="btn btn-sm" onclick="Receipt.refundTransaction(\'' + (data.txId || '') + '\',\'' + (data.fromId || '') + '\',' + (data.amount || 0) + ')" style="flex: 1; background: #f0b90b; color: #000; padding: 12px;">💰 Qaytarish</button>';
    }
    html += '</div>';

    html += '</div>';

    UI.openModal(html);

    setTimeout(function() {
      var qrEl = document.getElementById('receiptQR');
      if (qrEl && typeof QRCode !== 'undefined') {
        qrEl.innerHTML = '';
        new QRCode(qrEl, {
          text: JSON.stringify({ tx: data.txId, from: data.fromId, to: data.toId, amount: data.amount, time: new Date().toISOString() }),
          width: 120, height: 120,
          colorDark: '#1a1a2e',
          colorLight: '#ffffff'
        });
      }
    }, 300);
  },

  shareReceipt: function(txId) {
    UI.showToast('📤 Chek havolasi nusxalandi!', 'success');
  },

  cancelTransaction: function(txId, userId, amount) {
    var cancelCommission = DB.get('cancelCommission', 10);
    var fee = amount * (cancelCommission / 100);
    var refundAmount = amount - fee;

    var msg = 'Tranzaksiyani bekor qilasizmi?\n\n';
    msg += 'Summa: ' + Utils.formatNumber(amount) + ' Vcoin\n';
    msg += 'Bekor qilish komissiyasi (' + cancelCommission + '%): ' + Utils.formatNumber(fee) + ' Vcoin\n';
    msg += 'Qaytariladi: ' + Utils.formatNumber(refundAmount) + ' Vcoin';

    UI.confirm(msg, function() {
      var user = DB.getUser();
      if (user) {
        user.balance = (user.balance || 0) + refundAmount;
        DB.setUser(user);
        DB.saveUserToRegistry(user);
        DB.addTransaction({ type: 'cancel', fromId: 'SYSTEM', toId: user.id, amount: refundAmount, commission: fee, description: 'Bekor qilindi: ' + refundAmount + ' Vcoin (komissiya: ' + fee + ')' });
        if (Cloud && Cloud.saveUser) Cloud.saveUser(user);
        UI.closeModal();
        UI.showToast('❌ Bekor qilindi! ' + Utils.formatNumber(refundAmount) + ' Vcoin qaytarildi (komissiya: ' + cancelCommission + '%)', 'info');
        setTimeout(function() { UI.navigateTo('dashboard'); }, 1500);
      }
    });
  },

  refundTransaction: function(txId, userId, amount) {
    // Qaytarish — yana Vcoin yuborish (Jo'natish sahifasiga o'tish)
    UI.closeModal();
    UI.navigateTo('transfer');
    setTimeout(function() {
      var rid = document.getElementById('recipientId');
      var amt = document.getElementById('transferAmount');
      if (rid) rid.value = userId || '';
      if (amt) amt.value = amount || '';
      UI.showToast('💰 Qayta jo\'natish uchun tayyor!', 'success');
    }, 300);
  }
};