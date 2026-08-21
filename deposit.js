/* ============================================
   DEPOSIT MODULE - Depozit boshqaruvi
   Til qo'llab-quvvatlovchi versiya
   ============================================ */

var DepositModule = {
  render: function(container) {
    var user = DB.getUser();
    if (!user) { UI.navigateTo('auth'); return; }

    // Til funksiyasi
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    
    // Sozlamalardan aniq qiymat olish
    var settings = DB.getSettings ? DB.getSettings() : {};
    var minDays = settings.minDepositDays || 7;
    var maxDays = settings.maxDepositDays || 30;
    var profit = settings.depositProfit || 5;
    
    var activeDeposits = DB.getUserDeposits ? DB.getUserDeposits(user.id).filter(function(d) { return d.status === 'active'; }) : [];

    container.innerHTML = `
      <div class="fade-in">
        ${activeDeposits.length > 0 ? `
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
              <i class="fas fa-chart-line" style="color: var(--accent-green);"></i> ${t('active_deposits', 'Faol Depozitlar')}
            </h3>
            ${activeDeposits.map(function(d) { return DepositModule.renderActiveDeposit(d); }).join('')}
          </div>
        ` : ''}

        <div class="glass-card" style="padding: 24px;">
          <h3 style="text-align: center; margin-bottom: 20px;">
            <i class="fas fa-plus-circle" style="color: var(--accent-gold);"></i> ${t('new_deposit', 'Yangi Depozit')}
          </h3>

          <div style="margin-bottom: 16px;">
            <label style="font-size: 13px; color: var(--text-muted); display: block; margin-bottom: 6px;">${t('amount', 'Miqdor')} (Vcoin)</label>
            <input type="number" id="depositAmount" class="input" placeholder="1000" min="1" oninput="DepositModule.calculateProfit()">
            <div style="display: flex; gap: 8px; margin-top: 8px;">
              ${[100, 500, 1000, 5000].map(function(amount) { return '<button class="btn btn-outline btn-sm" onclick="DepositModule.setAmount('+amount+')" style="flex: 1;">'+(Utils.formatNumber ? Utils.formatNumber(amount) : amount)+'</button>'; }).join('')}
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="font-size: 13px; color: var(--text-muted); display: block; margin-bottom: 6px;">
              ${t('duration', 'Muddat')}: <span id="durationValue">${minDays} ${t('days', 'kun')}</span>
            </label>
            <input type="range" id="depositDuration" min="${minDays}" max="${maxDays}" value="${minDays}" oninput="DepositModule.calculateProfit()" style="width: 100%; accent-color: var(--accent-blue);">
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted);">
              <span>${minDays} ${t('days', 'kun')}</span>
              <span>${maxDays} ${t('days', 'kun')}</span>
            </div>
          </div>

          <div class="glass-card" style="padding: 16px; background: rgba(46,164,79,0.05); margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
              <span style="color: var(--text-muted);">${t('daily_profit', "Kunlik foyda")} (${profit}%)</span>
              <span id="dailyProfit" style="color: var(--accent-green);">0 Vcoin</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
              <span style="color: var(--text-muted);">${t('total_profit', 'Umumiy foyda')}</span>
              <span id="totalProfit" style="color: var(--accent-green);">0 Vcoin</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; border-top: 1px solid var(--border-color); padding-top: 8px; margin-top: 8px;">
              <span>${t('final_amount', 'Yakuniy summa')}</span>
              <span id="finalAmount" style="color: var(--accent-gold);">0 Vcoin</span>
            </div>
          </div>

          <div class="glass-card" style="padding: 12px; background: rgba(240,185,11,0.05); margin-bottom: 16px;">
            <p style="font-size: 12px; color: var(--accent-gold); text-align: center;">
              <i class="fas fa-exclamation-triangle"></i> 
              ${t('deposit_warning', "Depozit muddati tugamaguncha mablag'ni yechib bo'lmaydi!")}
            </p>
          </div>

          <button class="btn btn-success w-full btn-lg" id="depositBtn" onclick="DepositModule.createDeposit()" disabled>
            <i class="fas fa-lock"></i> ${t('deposit_button', 'Depozit Qilish')}
          </button>

          <p style="text-align: center; font-size: 12px; color: var(--text-muted); margin-top: 12px;">
            ${t('balance', 'Balans')}: <span style="color: var(--accent-blue); font-weight: 600;">${Utils.formatNumber ? Utils.formatNumber(user.balance) : user.balance} Vcoin</span>
          </p>
        </div>

        ${DB.getUserDeposits && DB.getUserDeposits(user.id).filter(function(d) { return d.status === 'completed'; }).length > 0 ? `
          <div style="margin-top: 24px;">
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">${t('completed_deposits', 'Tugagan Depozitlar')}</h3>
            <div class="glass-card" style="overflow: hidden;">
              ${DB.getUserDeposits(user.id).filter(function(d) { return d.status === 'completed'; }).map(function(d) {
                return '<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border-color);">' +
                  '<div><div style="font-weight: 600;">'+(Utils.formatNumber ? Utils.formatNumber(d.amount) : d.amount)+' Vcoin</div><div style="font-size: 11px; color: var(--text-muted);">'+(d.days || 0)+' ' + t('days', 'kunlik') + '</div></div>' +
                  '<div style="text-align: right;"><div style="color: var(--accent-green);">+'+(Utils.formatNumber ? Utils.formatNumber((d.finalAmount || d.amount) - d.amount) : (d.finalAmount || d.amount) - d.amount)+' Vcoin</div><div style="font-size: 11px; color: var(--text-muted);">'+(d.endDate ? new Date(d.endDate).toLocaleDateString() : '')+'</div></div></div>';
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    this.calculateProfit();
  },

  setAmount: function(amount) {
    var input = document.getElementById('depositAmount');
    if (input) { input.value = amount; this.calculateProfit(); }
  },

  calculateProfit: function() {
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    var amount = parseFloat((document.getElementById('depositAmount') || {}).value) || 0;
    var days = parseInt((document.getElementById('depositDuration') || {}).value) || 7;
    var settings = DB.getSettings ? DB.getSettings() : {};
    var profitPct = settings.depositProfit || 5;
    var user = DB.getUser();

    var durationEl = document.getElementById('durationValue');
    if (durationEl) durationEl.textContent = days + ' ' + t('days', 'kun');

    if (amount > 0 && Utils.calculateDepositProfit) {
      var calc = Utils.calculateDepositProfit(amount, profitPct, days);
      document.getElementById('dailyProfit').textContent = Utils.formatNumber(calc.dailyProfit) + ' Vcoin';
      document.getElementById('totalProfit').textContent = Utils.formatNumber(calc.totalProfit) + ' Vcoin';
      document.getElementById('finalAmount').textContent = Utils.formatNumber(calc.finalAmount) + ' Vcoin';
      var btn = document.getElementById('depositBtn');
      if (btn) btn.disabled = amount > (user ? user.balance : 0) || amount <= 0;
    } else {
      document.getElementById('dailyProfit').textContent = '0 Vcoin';
      document.getElementById('totalProfit').textContent = '0 Vcoin';
      document.getElementById('finalAmount').textContent = '0 Vcoin';
      document.getElementById('depositBtn').disabled = true;
    }
  },

  renderActiveDeposit: function(deposit) {
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    var settings = DB.getSettings ? DB.getSettings() : {};
    var profitPct = settings.depositProfit || 5;
    var daysRemaining = Utils.daysRemaining ? Utils.daysRemaining(deposit.endDate) : 0;
    var currentValue = Utils.calculateCurrentDepositValue ? Utils.calculateCurrentDepositValue(deposit.amount, profitPct, deposit.startDate) : deposit.amount;
    var profit = currentValue - deposit.amount;
    var depositDays = deposit.days || 7;
    var progressPercent = Math.min(100, 100 - (daysRemaining / (depositDays || 1) * 100));

    return '<div class="glass-card" style="padding: 16px; margin-bottom: 10px;">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">' +
      '<div><div style="font-weight: 700; font-size: 16px;">'+(Utils.formatNumber ? Utils.formatNumber(deposit.amount) : deposit.amount)+' Vcoin</div><div style="font-size: 11px; color: var(--text-muted);">'+depositDays+' '+t('days', 'kunlik')+' • '+t('daily', 'Kunlik')+' '+profitPct+'%</div></div>' +
      '<div style="text-align: right;"><div style="color: var(--accent-green); font-weight: 600; font-size: 14px;">+'+(Utils.formatNumber ? Utils.formatNumber(profit) : profit)+' Vcoin</div><div style="font-size: 11px; color: var(--text-muted);">'+(daysRemaining > 0 ? daysRemaining + ' ' + t('days_left', 'kun qoldi') : t('expiring', 'Tugayapti...'))+'</div></div></div>' +
      '<div style="margin-top: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; height: 4px; overflow: hidden;"><div style="width: '+progressPercent+'%; height: 100%; background: var(--gradient-primary);"></div></div>' +
      (daysRemaining <= 0 ? '<button class="btn btn-success btn-sm w-full" style="margin-top: 8px;" onclick="DepositModule.claimDeposit(\''+deposit.id+'\')"><i class="fas fa-check"></i> '+t('claim_button', 'Yechib olish')+'</button>' : '') +
      '</div>';
  },

  createDeposit: function() {
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    var amount = parseFloat((document.getElementById('depositAmount') || {}).value);
    var days = parseInt((document.getElementById('depositDuration') || {}).value);
    var user = DB.getUser();
    var settings = DB.getSettings ? DB.getSettings() : {};
    var profitPct = settings.depositProfit || 5;

    if (!amount || amount <= 0) { 
      UI.showToast('⚠️ ' + t('enter_amount', 'Miqdorni kiriting'), 'error'); 
      return; 
    }
    if (!user) { 
      UI.showToast('⚠️ ' + t('login_required', "Iltimos, tizimga kiring"), 'error'); 
      return; 
    }
    if (amount > user.balance) { 
      UI.showToast('⚠️ ' + t('insufficient_balance', 'Balans yetarli emas'), 'error'); 
      return; 
    }

    var calc = Utils.calculateDepositProfit ? Utils.calculateDepositProfit(amount, profitPct, days) : { totalProfit: 0, finalAmount: amount };

    UI.confirm(
      (Utils.formatNumber ? Utils.formatNumber(amount) : amount) + ' Vcoin ' + t('deposit_confirm', "miqdorda ") + days + ' ' + t('days', 'kunlik') + ' ' + t('deposit_confirm2', 'depozit qilishni tasdiqlaysizmi?') + '\n\n' +
      t('daily_profit', 'Kunlik foyda') + ': ' + profitPct + '%\n' +
      t('total_profit', 'Umumiy foyda') + ': ' + (Utils.formatNumber ? Utils.formatNumber(calc.totalProfit) : calc.totalProfit) + ' Vcoin\n' +
      t('final_amount', 'Yakuniy summa') + ': ' + (Utils.formatNumber ? Utils.formatNumber(calc.finalAmount) : calc.finalAmount) + ' Vcoin\n\n' +
      '⚠️ ' + t('deposit_warning', "Muddat tugamaguncha yechib bo'lmaydi!"),
      function() { DepositModule.processDeposit(amount, days, user, profitPct); }
    );
  },

  processDeposit: function(amount, days, user, profitPct) {
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    
    DB.updateBalance(-amount);

    var endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    DB.addDeposit({
      userId: user.id, amount: amount, days: days,
      dailyPercent: profitPct, endDate: endDate.toISOString(),
      status: 'active', startDate: new Date().toISOString()
    });

    if (DB.addTransaction) {
      DB.addTransaction({ 
        type: 'deposit', 
        fromId: user.id, 
        toId: 'DEPOSIT', 
        amount: amount, 
        description: days + ' ' + t('days', 'kunlik') + ' ' + t('deposit', 'depozit') + ' (' + profitPct + '%)' 
      });
    }

    if (DB.addLog) { 
      DB.addLog('deposit', user.id + ' created ' + amount + ' Vcoin deposit for ' + days + ' days'); 
    }

    UI.showToast('✅ ' + (Utils.formatNumber ? Utils.formatNumber(amount) : amount) + ' Vcoin ' + t('deposit_created', "depozit yaratildi!") + ' 📈', 'success');
    setTimeout(function() { UI.navigateTo('deposit'); }, 800);
  },

  claimDeposit: function(depositId) {
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    var deposits = DB.getDeposits ? DB.getDeposits() : [];
    var deposit = deposits.find(function(d) { return d.id === depositId; });
    
    if (!deposit) { 
      UI.showToast('❌ ' + t('deposit_not_found', 'Depozit topilmadi'), 'error'); 
      return; 
    }
    if (deposit.status !== 'active') { 
      UI.showToast('⚠️ ' + t('deposit_closed', "Bu depozit allaqachon yopilgan"), 'error'); 
      return; 
    }

    var settings = DB.getSettings ? DB.getSettings() : {};
    var profitPct = settings.depositProfit || 5;
    var daysRemaining = Utils.daysRemaining ? Utils.daysRemaining(deposit.endDate) : 1;
    
    if (daysRemaining > 0) { 
      UI.showToast('⚠️ ' + t('deposit_not_ready', "Depozit muddati hali tugamagan. ") + daysRemaining + ' ' + t('days_left', 'kun qoldi.'), 'error'); 
      return; 
    }

    var finalValue = Utils.calculateCurrentDepositValue ? Utils.calculateCurrentDepositValue(deposit.amount, profitPct, deposit.startDate) : deposit.amount;
    var profit = finalValue - deposit.amount;

    DB.updateBalance(finalValue);

    if (DB.updateDeposit) {
      DB.updateDeposit(depositId, { status: 'completed', finalAmount: finalValue, claimedAt: new Date().toISOString() });
    }

    if (DB.addTransaction) {
      DB.addTransaction({ 
        type: 'deposit_profit', 
        fromId: 'DEPOSIT', 
        toId: deposit.userId, 
        amount: profit, 
        description: t('deposit_profit_desc', "Depozit foydasi: ") + (deposit.days || 7) + ' ' + t('days', 'kun') + ' (' + (Utils.formatNumber ? Utils.formatNumber(profit) : profit) + ' Vcoin)' 
      });
    }

    if (DB.addLog) { 
      DB.addLog('deposit_claim', deposit.userId + ' claimed ' + (Utils.formatNumber ? Utils.formatNumber(finalValue) : finalValue) + ' Vcoin deposit'); 
    }

    UI.showToast('✅ ' + (Utils.formatNumber ? Utils.formatNumber(finalValue) : finalValue) + ' Vcoin ' + t('deposit_claimed', "hisobingizga qo'shildi!") + ' 🎉', 'success');
    setTimeout(function() { UI.navigateTo('deposit'); }, 800);
  }
};