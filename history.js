var History = {
  currentFilter: 'all',

  render: function(container) {
    var user = DB.getUser();
    if (!user) { UI.navigateTo('auth'); return; }
    
    var allTransactions = DB.getUserTransactions ? DB.getUserTransactions(user.id) : [];
    var filtered = this.filterTransactions(allTransactions);

    var incomingTotal = allTransactions.filter(function(tx){return tx.toId===user.id;}).reduce(function(s,tx){return s+(tx.amount||0);},0);
    var outgoingTotal = allTransactions.filter(function(tx){return tx.fromId===user.id;}).reduce(function(s,tx){return s+(tx.amount||0);},0);

    container.innerHTML = `
      <div class="fade-in">
        <div class="glass-card" style="padding:16px;margin-bottom:16px;text-align:center;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div><div style="font-size:20px;font-weight:700;color:var(--accent-green);">+${Utils.formatNumber?Utils.formatNumber(incomingTotal):incomingTotal}</div><div style="font-size:11px;color:var(--text-muted);">Kelgan</div></div>
            <div><div style="font-size:20px;font-weight:700;color:var(--accent-red);">-${Utils.formatNumber?Utils.formatNumber(outgoingTotal):outgoingTotal}</div><div style="font-size:11px;color:var(--text-muted);">Ketgan</div></div>
          </div>
        </div>

        <div style="display:flex;gap:6px;margin-bottom:16px;overflow-x:auto;padding-bottom:4px;">
          ${this.filterTab('all','📊 Barchasi')}
          ${this.filterTab('transfer','✈️ Jo\'natmalar')}
          ${this.filterTab('deposit','📈 Depozitlar')}
          ${this.filterTab('bonus','🎁 Bonuslar')}
        </div>

        <div class="glass-card" style="overflow:hidden;">
          ${filtered.length>0?filtered.map(function(tx){return History.renderTransaction(tx,user.id);}).join(''):'<div style="padding:40px;text-align:center;color:var(--text-muted);"><i class="fas fa-receipt" style="font-size:40px;margin-bottom:12px;opacity:0.4;"></i><p>Tranzaksiyalar topilmadi</p></div>'}
        </div>

        ${filtered.length>0?'<button class="btn btn-outline w-full" style="margin-top:12px;" onclick="History.exportHistory()"><i class="fas fa-download"></i> Tarixni Yuklash (CSV)</button>':''}
      </div>
    `;
  },

  filterTab: function(type, label) {
    return '<button class="btn '+(this.currentFilter===type?'btn-primary':'btn-outline')+' btn-sm" onclick="History.setFilter(\''+type+'\')" style="white-space:nowrap;flex-shrink:0;">'+label+'</button>';
  },

  setFilter: function(type) { this.currentFilter = type; UI.navigateTo('history'); },

  filterTransactions: function(transactions) {
    if (this.currentFilter === 'all') return transactions;
    if (this.currentFilter === 'deposit') return transactions.filter(function(tx){return tx.type==='deposit'||tx.type==='deposit_profit';});
    return transactions.filter(function(tx){return tx.type===History.currentFilter;});
  },

  renderTransaction: function(tx, userId) {
    if (!tx) return '';
    
    var isIncoming = tx.toId === userId;
    var typeIcons = {transfer:'fa-exchange-alt',deposit:'fa-chart-line',deposit_profit:'fa-coins',referral_bonus:'fa-gift',bonus:'fa-gift',cancel:'fa-undo'};
    var typeColors = {transfer:'var(--accent-blue)',deposit:'var(--accent-purple)',deposit_profit:'var(--accent-green)',referral_bonus:'var(--accent-gold)',bonus:'var(--accent-gold)',cancel:'var(--accent-orange)'};
    var icon = typeIcons[tx.type] || 'fa-circle';
    var color = typeColors[tx.type] || 'var(--text-muted)';
    var sign = isIncoming ? '+' : '-';
    var amountColor = isIncoming ? 'var(--accent-green)' : 'var(--accent-red)';
    var description = tx.description || tx.type || 'Tranzaksiya';

    var fromNick = (tx.fromId===userId?DB.getUser().nickname:'User_'+String(tx.fromId||'').slice(-4));
    var toNick = (tx.toId===userId?DB.getUser().nickname:'User_'+String(tx.toId||'').slice(-4));

    return '<div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--border-color);">'+
      '<div style="width:38px;height:38px;border-radius:50%;background:'+color+'20;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas '+icon+'" style="color:'+color+';font-size:15px;"></i></div>'+
      '<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:500;">'+description+'</div><div style="font-size:11px;color:var(--text-muted);">'+(Utils.formatDate?Utils.formatDate(tx.timestamp):(tx.timestamp||''))+'</div>'+
      (tx.commission&&tx.commission>0?'<div style="font-size:10px;color:var(--text-muted);">💰 Komissiya: '+(Utils.formatNumber?Utils.formatNumber(tx.commission):tx.commission)+' Vcoin</div>':'')+'</div>'+
      '<div style="font-weight:700;font-size:14px;color:'+amountColor+';text-align:right;flex-shrink:0;">'+sign+(Utils.formatNumber?Utils.formatNumber(tx.amount):tx.amount)+' Vcoin</div>'+
      // ===== CHEK TUGMASI (to'g'ridan-to'g'ri ma'lumotlar bilan) =====
      (tx.type==='transfer'?'<button class="btn btn-outline btn-sm" onclick="History.showReceiptNow(\''+fromNick+'\',\''+String(tx.fromId||'')+'\',\''+toNick+'\',\''+String(tx.toId||'')+'\','+(tx.amount||0)+','+(tx.commission||0)+',\''+(tx.id||'')+'\')" style="margin-left:6px;flex-shrink:0;font-size:11px;padding:6px 8px;" title="Chek"><i class="fas fa-receipt"></i></button>':'')+
      '</div>';
  },

  // ===== CHEK KO'RSATISH (to'g'ridan-to'g'ri) =====
  showReceiptNow: function(fromNick, fromId, toNick, toId, amount, commission, txId) {
    if (typeof Receipt !== 'undefined') {
      Receipt.show({
        fromId: fromId,
        fromNickname: fromNick,
        toId: toId,
        toNickname: toNick,
        amount: parseFloat(amount),
        commission: parseFloat(commission),
        txId: txId
      });
    } else {
      UI.showToast('Chek moduli yuklanmagan','error');
    }
  },

  exportHistory: function() {
    var user = DB.getUser();
    if (!user) return;
    var transactions = DB.getUserTransactions?DB.getUserTransactions(user.id):[];
    if (transactions.length===0){UI.showToast('Tarix bo\'sh','error');return;}
    try{
      var csv='Sana,Turi,Tavsif,Miqdor,Kimdan,Kimga\n';
      transactions.forEach(function(tx){
        csv+='"'+new Date(tx.timestamp).toLocaleString()+'","'+tx.type+'","'+(tx.description||'').replace(/,/g,';')+'",'+tx.amount+',"'+tx.fromId+'","'+tx.toId+'"\n';
      });
      var blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');a.href=url;a.download='vcoin_history_'+user.id+'.csv';a.click();
      URL.revokeObjectURL(url);
      UI.showToast('✅ Yuklandi!','success');
    }catch(e){UI.showToast('Xatolik','error');}
  }
};