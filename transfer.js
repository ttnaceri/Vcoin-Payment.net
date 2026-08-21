/* ============================================
   TRANSFER MODULE - Vcoin jo'natish
   Til qo'llab-quvvatlovchi versiya
   Bitta transfer uchun bitta monitoring yozuvi
   ============================================ */

var Transfer = {
  lastTransfer: null,
  cancelRequested: {},

  render: function(container) {
    var user = DB.getUser();
    if (!user) { UI.navigateTo('auth'); return; }

    // Til funksiyasi
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };

    if (DB.isBanned && DB.isBanned(user.id)) {
      container.innerHTML = '<div class="fade-in" style="text-align:center;padding:40px;">' +
        '<div style="font-size:48px;">🚫</div>' +
        '<h2>' + t('you_are_banned', 'Siz bloklangansiz') + '</h2>' +
        '</div>';
      return;
    }

    var settings = DB.getSettings();
    var comm = (typeof settings.commission !== 'undefined') ? settings.commission : 0;
    
    container.innerHTML = `
      <div class="transfer-container fade-in" style="max-width:420px;margin:0 auto;">
        <div class="glass-card" style="padding:24px;">
          <h3 style="text-align:center;margin-bottom:20px;">
            <i class="fas fa-paper-plane" style="color:var(--accent-blue);"></i> 
            ${t('send_vcoin', "Vcoin Jo'natish")}
          </h3>
          <div style="margin-bottom:16px;">
            <label style="font-size:13px;color:var(--text-muted);">${t('recipient_id', 'Qabul qiluvchi ID')}</label>
            <input type="text" id="recipientId" class="input" placeholder="${t('id_placeholder', '9 xonali ID')}" maxlength="9" oninput="Transfer.lookupUser()">
            <div id="recipientInfo" style="margin-top:8px;"></div>
          </div>
          <div style="margin-bottom:16px;">
            <label style="font-size:13px;color:var(--text-muted);">${t('amount', 'Miqdor')}</label>
            <input type="number" id="transferAmount" class="input" placeholder="0" min="1" oninput="Transfer.updateSummary()">
            <div style="display:flex;gap:8px;margin-top:8px;">
              ${[10,50,100,500].map(function(a){return'<button class="btn btn-outline btn-sm" onclick="Transfer.setAmount('+a+')" style="flex:1;">'+a+'</button>';}).join('')}
            </div>
          </div>
          <div class="glass-card" style="padding:16px;background:rgba(255,255,255,0.02);margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;">
              <span style="color:var(--text-muted);">${t('commission', 'Komissiya')} (${comm}%)</span>
              <span id="commissionAmount" style="color:var(--accent-red);">0 Vcoin</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;">
              <span style="color:var(--text-muted);">${t('receiver_gets', "Qabul qiluvchiga")}</span>
              <span id="receiverAmount" style="color:var(--accent-green);">0 Vcoin</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:600;border-top:1px solid var(--border-color);padding-top:8px;margin-top:8px;">
              <span>${t('total', 'Jami')}</span>
              <span id="totalAmount" style="color:var(--accent-blue);">0 Vcoin</span>
            </div>
          </div>
          <button class="btn btn-primary w-full btn-lg" id="sendBtn" onclick="Transfer.sendVcoin()" disabled>
            <i class="fas fa-paper-plane"></i> ${t('send_button', "Jo'natish")}
          </button>
          <div id="actionButtons" style="display:none;gap:10px;margin-top:12px;">
            <button class="btn btn-outline w-full" onclick="Transfer.repeatTransfer()" style="flex:1;">
              <i class="fas fa-redo"></i> ${t('repeat', 'Takrorlash')}
            </button>
            <button class="btn w-full" onclick="Transfer.cancelTransfer()" style="flex:1;background:var(--accent-red);color:#fff;">
              <i class="fas fa-undo"></i> ${t('cancel', 'Bekor qilish')}
            </button>
          </div>
        </div>
        <div style="text-align:center;margin-top:16px;color:var(--text-muted);font-size:13px;">
          ${t('balance', 'Balansingiz')}: 
          <span style="color:var(--accent-blue);font-weight:600;">${Utils.formatNumber(user.balance)} Vcoin</span>
        </div>
      </div>
    `;
  },

  setAmount: function(a) { 
    var el = document.getElementById('transferAmount'); 
    if (el) { el.value = a; this.updateSummary(); } 
  },

  lookupUser: function() {
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    var id = (document.getElementById('recipientId') || {}).value.trim();
    var infoDiv = document.getElementById('recipientInfo');
    if (!infoDiv) return;
    
    if (id.length === 9 && /^\d{9}$/.test(id)) {
      var user = DB.getUser();
      if (user && user.id === id) {
        infoDiv.innerHTML = '<div class="glass-card" style="padding:12px;background:rgba(240,185,11,0.1);margin-top:8px;">' +
          '<p style="font-size:13px;color:var(--accent-gold);">⚠️ ' + t('self_transfer_error', "O'zingizga jo'nata olmaysiz!") + '</p></div>';
        document.getElementById('sendBtn').disabled = true;
        return;
      }
      if (Cloud && Cloud.getAllUsers) {
        Cloud.getAllUsers().then(function(users) {
          var r = users ? users[id] : null;
          if (r) {
            var ban = DB.isBanned ? DB.isBanned(id) : false;
            infoDiv.innerHTML = '<div class="glass-card" style="padding:12px;background:' + 
              (ban ? 'rgba(231,76,60,0.1)' : 'rgba(46,164,79,0.1)') + ';margin-top:8px;">' +
              '<div style="display:flex;align-items:center;gap:10px;">' +
              '<div style="width:36px;height:36px;border-radius:50%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;">' + 
              (r.nickname ? r.nickname.charAt(0).toUpperCase() : '?') + 
              '</div><div><div style="font-weight:600;">' + r.nickname + '</div>' +
              '<div style="font-size:11px;color:var(--text-muted);">' + t('id', 'ID') + ': ' + r.id + '</div></div></div></div>';
            if (ban) {
              UI.showToast(t('banned', 'Bloklangan!'), 'error');
              document.getElementById('sendBtn').disabled = true;
            } else Transfer.updateSummary();
          } else {
            infoDiv.innerHTML = '<div class="glass-card" style="padding:12px;background:rgba(240,185,11,0.08);margin-top:8px;">' +
              '<p style="font-size:13px;color:var(--accent-gold);">' + t('new_user', 'Yangi foydalanuvchi') + '</p></div>';
            Transfer.updateSummary();
          }
        }).catch(function() {});
      } else Transfer.updateSummary();
    } else {
      infoDiv.innerHTML = '';
      document.getElementById('sendBtn').disabled = true;
    }
  },

  updateSummary: function() {
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    var amt = parseFloat((document.getElementById('transferAmount') || {}).value) || 0;
    var commPct = DB.getSettings().commission;
    if (typeof commPct === 'undefined' || isNaN(commPct)) commPct = 0;
    var com = amt * (commPct / 100);
    document.getElementById('commissionAmount').textContent = Utils.formatNumber(com) + ' Vcoin';
    document.getElementById('receiverAmount').textContent = Utils.formatNumber(amt - com) + ' Vcoin';
    document.getElementById('totalAmount').textContent = Utils.formatNumber(amt) + ' Vcoin';
    var user = DB.getUser();
    var inp = document.getElementById('recipientId');
    var btn = document.getElementById('sendBtn');
    if (btn) btn.disabled = !(amt > 0 && amt <= user.balance && inp && inp.value.length === 9 && inp.value !== user.id);
  },

  sendVcoin: function() {
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    var rid = (document.getElementById('recipientId') || {}).value.trim();
    var amt = parseFloat((document.getElementById('transferAmount') || {}).value);
    var user = DB.getUser();
    
    if (!user || !rid || rid.length !== 9 || rid === user.id || !amt || amt <= 0 || amt > user.balance) {
      UI.showToast('❌ ' + t('error', "Noto'g'ri!"), 'error');
      return;
    }
    if (DB.isBanned && DB.isBanned(rid)) {
      UI.showToast('🚫 ' + t('banned', 'Bloklangan!'), 'error');
      return;
    }
    
    var self = this;
    UI.confirm(
      Utils.formatNumber(amt) + ' Vcoin ' + t('send_confirm', "jo'natilsinmi?") + '\n' + t('id', 'ID') + ': ' + rid,
      function() { self.processTransfer(rid, amt, user); }
    );
  },

  // ============================================================
  // ASOSIY TRANSFER FUNKSIYASI - FAQAT BITTA MONITORING YOZUV
  // ============================================================
  processTransfer: function(rid, amt, user) {
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    var btn = document.getElementById('sendBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + t('sending', "Jo'natilmoqda...");
    }
    this.lastTransfer = { recipientId: rid, amount: amt };

    // ===== Cloud orqali transfer =====
    if (Cloud && Cloud.transfer) {
      Cloud.transfer(user.id, rid, amt).then(function(r) {
        if (r && r.success) {
          // 1. User balansini yangilash
          user.balance = user.balance - amt;
          DB.setUser(user);
          DB.saveUserToRegistry(user);
          
          // 2. Cloud dan yangilangan balansni olish
          Cloud.getUser(user.id).then(function(updatedUser) {
            if (updatedUser) { 
              user.balance = updatedUser.balance; 
              DB.setUser(user); 
            }
          }).catch(function() {});
          
          // ===== 3. BITTA MONITORING YOZUV (Cloud.transfer ichida allaqachon yozilgan) =====
          // Cloud.transfer() funksiyasi ichida transactions ga qo'shiladi
          // Bu yerda QO'SHIMCHA transaction qo'shilmadi!
          
          // 4. Chek ko'rsatish
          var txId = 'TX' + Date.now().toString(36).toUpperCase();
          Cloud.getAllUsers().then(function(users) {
            var to = users ? users[rid] : null;
            Receipt.show({
              fromId: user.id,
              fromNickname: user.nickname,
              toId: rid,
              toNickname: to ? to.nickname : 'User_' + rid.slice(-4),
              amount: amt,
              commission: r.commission || 0,
              txId: txId
            });
          });
          
          UI.showToast('✅ ' + Utils.formatNumber(amt) + ' Vcoin ' + t('transfer_success', "jo'natildi!"), 'success');
          document.getElementById('actionButtons').style.display = 'flex';
          if (btn) btn.style.display = 'none';
          setTimeout(function() { UI.navigateTo('dashboard'); }, 2000);
        } else {
          UI.showToast('❌ ' + (r ? r.error : t('error', 'Xatolik!')), 'error');
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> ' + t('send_button', "Jo'natish");
          }
        }
      }).catch(function() {
        UI.showToast('❌ ' + t('error', 'Xatolik!'), 'error');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> ' + t('send_button', "Jo'natish");
        }
      });
    } else {
      // ===== Offline rejim =====
      var commPct = DB.getSettings().commission || 0;
      var receiverAmount = amt - (amt * (commPct / 100));
      
      // 1. Jo'natuvchidan yechish
      user.balance = user.balance - amt;
      DB.setUser(user);
      DB.saveUserToRegistry(user);
      
      // 2. Qabul qiluvchiga qo'shish
      var rec = DB.getUserById(rid);
      if (rec) {
        DB.setBalance(rid, (rec.balance || 0) + receiverAmount);
      } else {
        DB.saveUserToRegistry({
          id: rid,
          nickname: 'User_' + rid.slice(-4),
          balance: receiverAmount,
          token: '',
          createdAt: new Date().toISOString()
        });
      }
      
      // ===== 3. BITTA MONITORING YOZUV =====
      DB.addTransaction({
        type: 'transfer',
        fromId: user.id,
        toId: rid,
        amount: amt,
        commission: commPct,
        receiverAmount: receiverAmount,
        description: user.nickname + ' → ' + rid,
        timestamp: new Date().toISOString()
      });
      
      UI.showToast('✅ ' + Utils.formatNumber(amt) + ' Vcoin ' + t('transfer_success', "jo'natildi!"), 'success');
      document.getElementById('actionButtons').style.display = 'flex';
      if (btn) btn.style.display = 'none';
      setTimeout(function() { UI.navigateTo('dashboard'); }, 2000);
    }
  },

  repeatTransfer: function() {
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    if (!this.lastTransfer) {
      UI.showToast('❌ ' + t('no_data', "Ma'lumot yo'q"), 'error');
      return;
    }
    document.getElementById('recipientId').value = this.lastTransfer.recipientId;
    document.getElementById('transferAmount').value = this.lastTransfer.amount;
    document.getElementById('actionButtons').style.display = 'none';
    var btn = document.getElementById('sendBtn');
    if (btn) { btn.style.display = 'block'; btn.disabled = false; }
    this.lookupUser();
    this.updateSummary();
  },

  cancelTransfer: function() {
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    if (!this.lastTransfer) {
      UI.showToast('❌ ' + t('no_data', "Ma'lumot yo'q"), 'error');
      return;
    }
    var txKey = this.lastTransfer.recipientId + '_' + this.lastTransfer.amount;
    if (!this.cancelRequested[txKey]) this.cancelRequested[txKey] = 0;
    if (this.cancelRequested[txKey] >= 1) {
      UI.showToast('⚠️ ' + t('cancel_already', "Bu to'lov uchun so'rov yuborilgan!"), 'error');
      return;
    }
    var amt = this.lastTransfer.amount;
    var user = DB.getUser();
    localStorage.setItem('vcoin_cancel_req_' + Date.now(), JSON.stringify({
      fromId: user.id,
      fromNick: user.nickname,
      amount: amt,
      time: new Date().toISOString()
    }));
    this.cancelRequested[txKey] = 1;
    UI.showToast('✅ ' + t('cancel_requested', "Qaytarish so'rovi yuborildi!"), 'success');
  }
};