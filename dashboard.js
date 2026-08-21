/* ============================================
   DASHBOARD MODULE - Asosiy sahifa
   QR Pay 2:1 + Developer tugmasi + Pay Pop-up
   ============================================ */

var Dashboard = {
  render: function(container) {
    var user = DB.getUser();
    if (!user) { UI.navigateTo('auth'); return; }

    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };

    var balance = user.balance || 0;
    var activeDeposits = DB.getUserDeposits ? DB.getUserDeposits(user.id).filter(function(d) { return d.status === 'active'; }) : [];
    var recentTransactions = DB.getUserTransactions ? DB.getUserTransactions(user.id).slice(0, 5) : [];

    container.innerHTML = `
      <div class="dashboard-container fade-in">
        <div id="announceBox"></div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--gradient-primary); 
                      display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: #fff;
                      box-shadow: var(--glow-blue);">
            ${user.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style="font-weight: 700; font-size: 16px;">${user.nickname || 'User'}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${t('id', 'ID')}: ${user.id || 'N/A'}</div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="UI.navigateTo('profile')" style="margin-left: auto;">
            <i class="fas fa-user-cog"></i>
          </button>
        </div>

        <div class="balance-card glass-card" id="balanceCard" style="padding: 28px 24px; text-align: center; margin-bottom: 20px;
                    background: linear-gradient(145deg, #1a2a4a, #1c2333); position: relative; overflow: hidden;">
          <div class="balance-glow" style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
                      background: radial-gradient(circle, rgba(74,144,217,0.1) 0%, transparent 70%);
                      animation: pulse 3s infinite;"></div>
          <div style="position: relative; z-index: 1;">
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">${t('balance', 'Balans')}</p>
            <h2 style="font-size: 42px; font-weight: 800; color: #fff; margin-bottom: 4px;">${Utils.formatNumber(balance)}</h2>
            <p style="font-size: 16px; color: var(--accent-blue); font-weight: 600;">Vcoin</p>
          </div>
        </div>

        <!-- 1-QATOR: Token, Jo'natish, Depozit -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <button class="action-btn glass-card glass-card-hover" onclick="UI.navigateTo('token')">
            <i class="fas fa-key" style="font-size: 22px; color: var(--accent-gold);"></i>
            <span>${t('token', 'Token')}</span>
          </button>
          <button class="action-btn glass-card glass-card-hover" onclick="UI.navigateTo('transfer')">
            <i class="fas fa-paper-plane" style="font-size: 22px; color: var(--accent-blue);"></i>
            <span>${t('send', "Jo'natish")}</span>
          </button>
          <button class="action-btn glass-card glass-card-hover" onclick="UI.navigateTo('deposit')">
            <i class="fas fa-chart-line" style="font-size: 22px; color: var(--accent-purple);"></i>
            <span>${t('deposit', 'Depozit')}</span>
          </button>
        </div>

        <!-- 2-QATOR: QR Pay (2:1) + Sotib olish (1) -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 10px;">
          <button class="action-btn glass-card glass-card-hover" onclick="Dashboard.qrPay()" 
                  style="padding: 18px 12px; background: linear-gradient(135deg, rgba(255,45,149,0.1), rgba(0,212,255,0.05));">
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
              <i class="fas fa-qrcode" style="font-size: 28px; color: var(--accent-pink);"></i>
              <div style="display: flex; flex-direction: column; align-items: flex-start;">
                <span style="font-size: 16px; font-weight: 600;">${t('qr_pay', 'QR Pay')}</span>
                <span style="font-size: 11px; color: var(--text-muted);">${t('scan_qr', 'Skanerlash')}</span>
              </div>
            </div>
          </button>
          
          <button class="action-btn glass-card glass-card-hover" onclick="Dashboard.showPayPopup()">
            <i class="fas fa-shopping-cart" style="font-size: 22px; color: var(--accent-cyan);"></i>
            <span>${t('buy', "Sotib olish")}</span>
          </button>
        </div>

        <!-- 3-QATOR: Developer (2:1) + Tarix (1) -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 20px;">
          <button class="action-btn glass-card glass-card-hover" onclick="UI.navigateTo('developer')" 
                  style="padding: 18px 12px; background: linear-gradient(135deg, rgba(123,47,252,0.15), rgba(0,212,255,0.05));">
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
              <i class="fas fa-code" style="font-size: 28px; color: var(--accent-purple);"></i>
              <div style="display: flex; flex-direction: column; align-items: flex-start;">
                <span style="font-size: 16px; font-weight: 600;">${t('Developer', 'Developer')}</span>
                <span style="font-size: 11px; color: var(--text-muted);"></span>
              </div>
            </div>
          </button>
          
          <button class="action-btn glass-card glass-card-hover" onclick="UI.navigateTo('history')">
            <i class="fas fa-clock" style="font-size: 22px; color: var(--accent-blue);"></i>
            <span>${t('history', 'Tarix')}</span>
          </button>
        </div>

        ${activeDeposits.length > 0 ? '<div style="margin-bottom: 20px;"><h3 style="font-size: 15px; font-weight: 600; margin-bottom: 10px;">' + t('active_deposits', 'Faol depozitlar') + '</h3>' + activeDeposits.map(function(d) { return Dashboard.renderDepositCard(d); }).join('') + '</div>' : ''}

        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="font-size: 15px; font-weight: 600;">${t('recent_transactions', "So'nggi tranzaksiyalar")}</h3>
            <button class="btn btn-outline btn-sm" onclick="UI.navigateTo('history')">${t('all', 'Barchasi')}</button>
          </div>
          <div class="glass-card" style="overflow: hidden;">
            ${recentTransactions.length > 0 ? recentTransactions.map(function(tx) { return Dashboard.renderTransaction(tx); }).join('') : '<div style="padding: 24px; text-align: center; color: var(--text-muted);"><i class="fas fa-receipt" style="font-size: 32px; margin-bottom: 8px; opacity: 0.5;"></i><p style="font-size: 13px;">' + t('no_transactions', 'Tranzaksiyalar mavjud emas') + '</p></div>'}
          </div>
        </div>
      </div>
    `;

    this.showAnnounce(user.id);
    this.setupAdminAccess();
  },

  // ============================================================
  // PAY POP-UP
  // ============================================================
  showPayPopup: function() {
    var html = this.getPayPopupHTML();
    UI.openModal(html);
    
    setTimeout(function() {
      Dashboard.setupPayPopupEvents();
      Dashboard.loadExchangeRate();
    }, 200);
  },

  getPayPopupHTML: function() {
    var vcoinPrice = CONFIG.VCOIN_PRICE || 100;
    
    return `
      <div style="padding: 10px; max-width: 420px; margin: 0 auto;">
        <h3 style="text-align: center; margin-bottom: 4px; font-size: 20px;">
          💳 <span style="color: var(--accent-gold);">Vcoin Sotib Olish</span>
        </h3>
        <p style="text-align: center; font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
          1 Vcoin = ${vcoinPrice} so'm
        </p>

        <div class="glass-card" style="padding: 16px; margin-bottom: 16px; background: rgba(255,215,0,0.03);">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; text-align: center; margin-bottom: 8px;">
            <div style="padding: 8px; background: rgba(255,215,0,0.05); border-radius: 8px;">
              <div style="font-weight: 700; font-size: 18px; color: var(--accent-gold);">1</div>
              <div style="font-size: 11px; color: var(--text-muted);">Vcoin</div>
              <div style="font-size: 14px; color: var(--accent-blue);">${vcoinPrice} so'm</div>
            </div>
            <div style="padding: 8px; background: rgba(255,215,0,0.05); border-radius: 8px;">
              <div style="font-weight: 700; font-size: 18px; color: var(--accent-gold);">10</div>
              <div style="font-size: 11px; color: var(--text-muted);">Vcoin</div>
              <div style="font-size: 14px; color: var(--accent-blue);">${vcoinPrice * 10} so'm</div>
            </div>
            <div style="padding: 8px; background: rgba(255,215,0,0.05); border-radius: 8px;">
              <div style="font-weight: 700; font-size: 18px; color: var(--accent-gold);">100</div>
              <div style="font-size: 11px; color: var(--text-muted);">Vcoin</div>
              <div style="font-size: 14px; color: var(--accent-blue);">${vcoinPrice * 100} so'm</div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 8px;">
            <div>
              <label style="font-size: 12px; color: var(--text-muted);">Vcoin</label>
              <input type="number" id="payVcoinAmount" class="input" placeholder="0" min="1" 
                     style="text-align: center; font-size: 18px; padding: 10px;"
                     oninput="Dashboard.calculateFromVcoin()">
            </div>
            <div>
              <label style="font-size: 12px; color: var(--text-muted);">So'm</label>
              <input type="number" id="payUzsAmount" class="input" placeholder="0" min="1" 
                     style="text-align: center; font-size: 18px; padding: 10px;"
                     oninput="Dashboard.calculateFromUzs()">
            </div>
            <div>
              <label style="font-size: 12px; color: var(--text-muted);">
                $ USD
                <span id="usdRate" style="font-size: 10px; color: var(--accent-gold); margin-left: 4px;">⬇️</span>
              </label>
              <input type="number" id="payUsdAmount" class="input" placeholder="0" min="0.01" step="0.01" 
                     style="text-align: center; font-size: 18px; padding: 10px;"
                     oninput="Dashboard.calculateFromUsd()">
            </div>
          </div>
          <div id="usdRateDisplay" style="text-align: center; font-size: 11px; color: var(--text-muted); margin-top: 6px;">
            <i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...
          </div>
        </div>

        <button class="btn btn-success w-full btn-lg" onclick="Dashboard.processPayPayment()" 
                style="font-size: 17px; padding: 14px;">
          <i class="fas fa-check"></i> 
          <span id="payConfirmText">Tasdiqlash</span>
        </button>

        <div id="payError" style="display: none; margin-top: 12px; padding: 12px; border-radius: 10px; 
                  background: rgba(255,45,85,0.1); border: 1px solid rgba(255,45,85,0.2); color: var(--accent-red); font-size: 14px;">
          <i class="fas fa-exclamation-circle"></i> <span id="payErrorMessage">Xatolik</span>
        </div>
      </div>
    `;
  },

  // ============================================================
  // VALYUTA KURSINI YUKLASH
  // ============================================================
  loadExchangeRate: function() {
    var url = 'https://v6.exchangerate-api.com/v6/6a1dd308edeaccd55c853818/latest/USD';
    
    fetch(url)
      .then(function(response) {
        if (!response.ok) throw new Error('Kurs yuklanmadi');
        return response.json();
      })
      .then(function(data) {
        if (data.result === 'success') {
          var usdToUzs = data.conversion_rates.UZS || 11847.6;
          window.VCOIN_EXCHANGE_RATE = usdToUzs;
          
          var display = document.getElementById('usdRateDisplay');
          if (display) {
            display.innerHTML = '💰 1 $ USD = ' + Math.round(usdToUzs).toLocaleString() + ' so\'m';
          }
          console.log('💱 Kurs yuklandi: 1 USD =', usdToUzs, 'UZS');
        }
      })
      .catch(function(error) {
        console.warn('⚠️ Kurs yuklanmadi, default qiymat ishlatiladi:', error);
        var display = document.getElementById('usdRateDisplay');
        if (display) {
          display.innerHTML = '⚠️ Kurs yuklanmadi, 1 USD = 11847 so\'m';
        }
        window.VCOIN_EXCHANGE_RATE = 11847.6;
      });
  },

  // ============================================================
  // KALKULYATOR FUNKSIYALARI
  // ============================================================
  calculateFromVcoin: function() {
    var vcoinInput = document.getElementById('payVcoinAmount');
    var uzsInput = document.getElementById('payUzsAmount');
    var usdInput = document.getElementById('payUsdAmount');
    var vcoinPrice = CONFIG.VCOIN_PRICE || 100;
    var usdRate = window.VCOIN_EXCHANGE_RATE || 11847.6;
    
    var vcoin = parseFloat(vcoinInput.value) || 0;
    if (vcoin > 0) {
      var uzs = vcoin * vcoinPrice;
      uzsInput.value = Math.round(uzs);
      usdInput.value = (uzs / usdRate).toFixed(2);
    }
  },

  calculateFromUzs: function() {
    var vcoinInput = document.getElementById('payVcoinAmount');
    var uzsInput = document.getElementById('payUzsAmount');
    var usdInput = document.getElementById('payUsdAmount');
    var vcoinPrice = CONFIG.VCOIN_PRICE || 100;
    var usdRate = window.VCOIN_EXCHANGE_RATE || 11847.6;
    
    var uzs = parseFloat(uzsInput.value) || 0;
    if (uzs > 0 && vcoinPrice > 0) {
      vcoinInput.value = Math.round(uzs / vcoinPrice);
      usdInput.value = (uzs / usdRate).toFixed(2);
    }
  },

  calculateFromUsd: function() {
    var vcoinInput = document.getElementById('payVcoinAmount');
    var uzsInput = document.getElementById('payUzsAmount');
    var usdInput = document.getElementById('payUsdAmount');
    var vcoinPrice = CONFIG.VCOIN_PRICE || 100;
    var usdRate = window.VCOIN_EXCHANGE_RATE || 11847.6;
    
    var usd = parseFloat(usdInput.value) || 0;
    if (usd > 0 && usdRate > 0) {
      var uzs = usd * usdRate;
      uzsInput.value = Math.round(uzs);
      vcoinInput.value = Math.round(uzs / vcoinPrice);
    }
  },

  // ============================================================
  // PAY POPUP EVENTLAR
  // ============================================================
  setupPayPopupEvents: function() {
    var inputs = ['payVcoinAmount', 'payUzsAmount', 'payUsdAmount'];
    for (var i = 0; i < inputs.length; i++) {
      var input = document.getElementById(inputs[i]);
      if (input) {
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            Dashboard.processPayPayment();
          }
        });
      }
    }
  },

  // ============================================================
  // TO'LOVNI QAYTA ISHLASH
  // ============================================================
  processPayPayment: function() {
    var vcoinInput = document.getElementById('payVcoinAmount');
    var uzsInput = document.getElementById('payUzsAmount');
    var errorDiv = document.getElementById('payError');
    var errorMsg = document.getElementById('payErrorMessage');
    var btn = document.querySelector('#modalContent .btn-success');
    
    if (errorDiv) errorDiv.style.display = 'none';
    
    var vcoin = parseFloat(vcoinInput ? vcoinInput.value : 0);
    var price = parseFloat(uzsInput ? uzsInput.value : 0);
    
    if (!vcoin || vcoin <= 0) {
      Dashboard.showPayError('Iltimos, Vcoin miqdorini kiriting!');
      return;
    }
    
    if (!price || price <= 0) {
      Dashboard.showPayError('Iltimos, to\'lov miqdorini kiriting!');
      return;
    }
    
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> To\'lov amalga oshirilmoqda...';
    }
    
    var paymentData = {
      amount: price,
      vcoinAmount: vcoin,
      userId: DB.getUser() ? DB.getUser().id : null
    };
    
    console.log('💳 To\'lov ma\'lumotlari:', {
      amount: price,
      vcoinAmount: vcoin
    });
    
    Dashboard.paySuccess(vcoin, price);
  },

  // ============================================================
  // TO'LOV MUVAFFAQIYATLI
  // ============================================================
  paySuccess: function(vcoin, price) {
    var user = DB.getUser();
    var btn = document.querySelector('#modalContent .btn-success');
    
    if (user) {
      user.balance = (user.balance || 0) + vcoin;
      DB.setUser(user);
      DB.saveUserToRegistry(user);
      console.log('💰 ' + user.nickname + ' ga ' + vcoin + ' Vcoin qo\'shildi. Yangi balans:', user.balance);
      
      var adminId = CONFIG.ADMIN ? CONFIG.ADMIN.ID : '920956990';
      var admin = DB.getUserById(adminId);
      
      if (admin) {
        var adminOldBalance = admin.balance || 0;
        admin.balance = adminOldBalance - vcoin;
        DB.saveUserToRegistry(admin);
        console.log('💰 Admin balansidan ' + vcoin + ' Vcoin yechildi. Eski: ' + adminOldBalance + ' → Yangi: ' + admin.balance);
      }
      
      DB.addTransaction({
        type: 'sale',
        fromId: adminId,
        toId: user.id,
        amount: vcoin,
        description: user.nickname + ' karta orqali ' + vcoin + ' Vcoin sotib oldi (' + price + ' so\'m)'
      });
      
      if (DB.addLog) {
        DB.addLog('sale', user.id + ' purchased ' + vcoin + ' Vcoin for ' + price + ' UZS');
      }
      
      var balanceEl = document.querySelector('.balance-amount');
      if (balanceEl) {
        balanceEl.innerHTML = Utils.formatNumber(user.balance) + ' <span class="currency">Vcoin</span>';
      }
    }
    
    UI.showToast('✅ ' + vcoin + ' Vcoin muvaffaqiyatli sotib olindi! 💳', 'success');
    
    setTimeout(function() {
      UI.closeModal();
      UI.navigateTo('dashboard');
    }, 1000);
  },

  // ============================================================
  // XATOLIK KO'RSATISH
  // ============================================================
  showPayError: function(message) {
    var errorDiv = document.getElementById('payError');
    var errorMsg = document.getElementById('payErrorMessage');
    
    if (errorDiv && errorMsg) {
      errorMsg.textContent = message;
      errorDiv.style.display = 'block';
    }
  },

  // ============================================================
  // ANNOUNCE - TUZATILGAN (Global + Shaxsiy)
  // ============================================================
  showAnnounce: function(userId) {
    setTimeout(function() {
      var el = document.getElementById('announceBox');
      if (!el) return;
      
      var html = '';
      var hasAnnounce = false;
      
      // 1. GLOBAL e'lonni tekshirish
      var globalData = localStorage.getItem('vcoin_announce_global');
      if (globalData) {
        try {
          var global = JSON.parse(globalData);
          // 24 soat ichida yaratilgan bo'lsa ko'rsatish
          var timeDiff = Date.now() - new Date(global.time).getTime();
          if (timeDiff < 86400000) { // 24 soat
            html += '<div id="announcePopup" style="background:linear-gradient(135deg,#1a1a40,#2a1050);border:1px solid rgba(180,77,255,0.4);border-radius:14px;padding:16px 40px 16px 18px;margin-bottom:14px;position:relative;color:#fff;font-size:13px;box-shadow:0 4px 20px rgba(139,92,246,0.3);">📢 ' + global.text + '<span onclick="Dashboard.dismissGlobalAnnounce()" style="position:absolute;top:10px;right:14px;cursor:pointer;font-size:18px;color:#aaa;font-weight:700;">✕</span></div>';
            hasAnnounce = true;
          }
        } catch(e) {}
      }
      
      // 2. SHAXSIY e'lonni tekshirish
      var personalData = localStorage.getItem('vcoin_announce_' + userId);
      if (personalData) {
        try {
          var personal = JSON.parse(personalData);
          var timeDiff = Date.now() - new Date(personal.time).getTime();
          if (timeDiff < 86400000) { // 24 soat
            html += '<div id="announcePopup" style="background:linear-gradient(135deg,#1a1a40,#2a1050);border:1px solid rgba(180,77,255,0.4);border-radius:14px;padding:16px 40px 16px 18px;margin-bottom:14px;position:relative;color:#fff;font-size:13px;box-shadow:0 4px 20px rgba(139,92,246,0.3);">📢 ' + personal.text + '<span onclick="Dashboard.dismissAnnounce(\''+userId+'\')" style="position:absolute;top:10px;right:14px;cursor:pointer;font-size:18px;color:#aaa;font-weight:700;">✕</span></div>';
            hasAnnounce = true;
          }
        } catch(e) {}
      }
      
      if (hasAnnounce) {
        el.innerHTML = html;
      } else {
        el.innerHTML = '';
      }
    }, 300);
  },

  // Global e'lonni o'chirish
  dismissGlobalAnnounce: function() {
    localStorage.removeItem('vcoin_announce_global');
    var el = document.getElementById('announcePopup');
    if (el) el.style.display = 'none';
  },

  // Shaxsiy e'lonni o'chirish
  dismissAnnounce: function(userId) {
    localStorage.removeItem('vcoin_announce_' + userId);
    var el = document.getElementById('announcePopup');
    if (el) el.style.display = 'none';
  },

  // ============================================================
  // BOSHQA FUNKSIYALAR
  // ============================================================
  doRefresh: function() { 
    Cloud.syncToLocal().then(function() { 
      var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
      UI.showToast('🔄 ' + t('refreshed', 'Yangilandi!'), 'success'); 
      UI.navigateTo('dashboard'); 
    }); 
  },

  qrPay: function() {
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    var user = DB.getUser(); 
    if (!user) return;
    
    var html = '<div style="text-align:center;padding:10px;">';
    html += '<h3 style="margin-bottom:12px;">📱 ' + t('qr_pay', 'QR To\'lov') + '</h3>';
    html += '<div style="display:flex;gap:8px;margin-bottom:12px;">';
    html += '<button class="btn btn-primary btn-sm" onclick="Dashboard.showMyQR()" style="flex:1;">📱 ' + t('my_qr', 'Mening QR') + '</button>';
    html += '<button class="btn btn-outline btn-sm" onclick="Dashboard.scanQR()" style="flex:1;">📷 ' + t('scan_qr', 'Skanerlash') + '</button>';
    html += '</div><div id="qrArea"></div>';
    html += '<button class="btn btn-outline w-full mt-8" onclick="Dashboard.stopScanner(); UI.closeModal();">' + t('close', 'Yopish') + '</button></div>';
    UI.openModal(html); 
    this.showMyQR();
  },

  showMyQR: function() {
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    var user = DB.getUser(); 
    var area = document.getElementById('qrArea'); 
    if (!area) return;
    
    area.innerHTML = '<div style="background:#fff;display:inline-block;padding:16px;border-radius:12px;margin-top:8px;"><div id="qrPayCode"></div></div><p style="font-size:12px;color:var(--text-muted);margin-top:8px;">' + t('id', 'ID') + ': ' + user.id + '</p>';
    setTimeout(function() { 
      var qrEl = document.getElementById('qrPayCode'); 
      if (qrEl && typeof QRCode !== 'undefined') { 
        new QRCode(qrEl, { 
          text: JSON.stringify({ type: 'vcoin_pay', id: user.id, nickname: user.nickname }), 
          width: 180, 
          height: 180, 
          colorDark: '#1a1a2e', 
          colorLight: '#ffffff' 
        }); 
      } 
    }, 200);
  },

  scanQR: function() {
    var area = document.getElementById('qrArea'); 
    if (!area) return;
    
    area.innerHTML = '<div style="padding:10px;"><div id="qrReader" style="width:100%;max-width:300px;margin:0 auto;"></div><p id="qrResult" style="margin-top:8px;font-size:13px;color:var(--accent-gold);"></p></div>';
    if (typeof Html5Qrcode === 'undefined') { 
      var script = document.createElement('script'); 
      script.src = 'https://unpkg.com/html5-qrcode'; 
      script.onload = function() { Dashboard.startScanner(); }; 
      document.head.appendChild(script); 
    } else { 
      this.startScanner(); 
    }
  },

  startScanner: function() {
    if (this._scanner) this._scanner.stop(); 
    this._scanner = new Html5Qrcode('qrReader'); 
    var self = this;
    
    this._scanner.start(
      { facingMode: 'environment' }, 
      { fps: 10, qrbox: { width: 250, height: 250 } }, 
      function(decodedText) {
        self._scanner.stop(); 
        document.getElementById('qrResult').textContent = '✅ ' + (function() {
          var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
          return t('scanned', 'Skanerlashtirildi!');
        })();
        try { 
          var data = JSON.parse(decodedText); 
          if (data.type === 'vcoin_pay' && data.id) { 
            UI.closeModal(); 
            UI.navigateTo('transfer'); 
            setTimeout(function() { 
              var rid = document.getElementById('recipientId'); 
              if (rid) { 
                rid.value = data.id; 
                Transfer.lookupUser(); 
              } 
            }, 400); 
          } else { 
            document.getElementById('qrResult').textContent = '❌ ' + (function() {
              var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
              return t('invalid_qr', 'Bu Vcoin QR kodi emas');
            })();
          } 
        } catch(e) { 
          document.getElementById('qrResult').textContent = '❌ ' + (function() {
            var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
            return t('invalid_format', "Noto'g'ri format");
          })();
        } 
      }, 
      function(err) {}
    ).catch(function() { 
      document.getElementById('qrResult').textContent = '❌ ' + (function() {
        var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
        return t('camera_error', 'Kamera ochilmadi. HTTPS kerak.');
      })();
    });
  },

  stopScanner: function() { 
    if (this._scanner) { 
      try { this._scanner.stop(); } catch(e) {} 
      this._scanner = null; 
    } 
  },
  
  showNotifications: function() {},
  
  approveCancel: function(key, amount, fromNick) { 
    localStorage.removeItem(key); 
    UI.closeModal(); 
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    UI.showToast('✅ ' + fromNick + ' ga ' + Utils.formatNumber(amount) + ' Vcoin ' + t('refunded', 'qaytarildi!'), 'success'); 
  },
  
  rejectCancel: function(key) { 
    localStorage.removeItem(key); 
    UI.closeModal(); 
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    UI.showToast('❌ ' + t('rejected', "So'rov rad etildi"), 'info'); 
  },
  
  setupAdminAccess: function() {
    setTimeout(function() { 
      var balanceCard = document.getElementById('balanceCard'); 
      if (!balanceCard) return; 
      balanceCard.style.cursor = 'pointer'; 
      var clickCount = 0, clickTimer = null;
      
      balanceCard.addEventListener('click', function(e) { 
        clickCount++; 
        if (clickTimer) clearTimeout(clickTimer); 
        clickTimer = setTimeout(function() { clickCount = 0; }, 2000);
        
        if (clickCount >= 5) { 
          clickCount = 0; 
          clearTimeout(clickTimer); 
          var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
          var pin = prompt('🔐 ' + t('admin_pin_prompt', 'Admin PIN kodini kiriting:')); 
          var currPin = DB.get('adminPassword', '55668576');
          
          if (pin === currPin) { 
            UI.navigateTo('admin'); 
            UI.showToast(t('admin_welcome', 'Admin panelga xush kelibsiz!') + ' 🛡️', 'success'); 
          } else if (pin !== null && pin !== '') { 
            UI.showToast('❌ ' + t('wrong_pin', "Noto'g'ri PIN kod!"), 'error'); 
          } 
        } 
      }); 
    }, 500);
  },
  
  renderDepositCard: function(deposit) {
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    var settings = DB.getSettings ? DB.getSettings() : { depositProfit: 5 }; 
    var daysRemaining = Utils.daysRemaining ? Utils.daysRemaining(deposit.endDate) : 0;
    var profit = (Utils.calculateCurrentDepositValue ? Utils.calculateCurrentDepositValue(deposit.amount, settings.depositProfit, deposit.startDate) : deposit.amount) - deposit.amount;
    
    return '<div class="glass-card" style="padding:16px;margin-bottom:8px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<div><div style="font-weight:600;">' + Utils.formatCurrency(deposit.amount) + '</div>' +
        '<div style="font-size:12px;color:var(--text-muted);">' + (deposit.days||0) + ' ' + t('day_deposit', 'kunlik') + '</div></div>' +
        '<div style="text-align:right;"><div style="color:var(--accent-green);font-weight:600;">+' + Utils.formatNumber(profit) + ' Vcoin</div>' +
        '<div style="font-size:11px;color:var(--text-muted);">' + daysRemaining + ' ' + t('days_left', 'kun qoldi') + '</div></div>' +
      '</div>' +
      '<div style="margin-top:8px;background:rgba(255,255,255,0.05);border-radius:4px;height:4px;overflow:hidden;">' +
        '<div style="width:' + Math.min(100, 100 - (daysRemaining / (deposit.days||1) * 100)) + '%;height:100%;background:var(--gradient-primary);"></div>' +
      '</div></div>';
  },
  
  renderTransaction: function(tx) {
    var t = (typeof LANG !== 'undefined' && LANG.t) ? LANG.t.bind(LANG) : function(key, fallback) { return fallback || key; };
    var currentUser = DB.getUser(); 
    var isIncoming = tx.toId === (currentUser ? currentUser.id : '');
    
    var icon = tx.type === 'deposit' ? 'fa-chart-line' : 
               tx.type === 'transfer' ? 'fa-exchange-alt' : 
               tx.type === 'bonus' ? 'fa-gift' : 'fa-circle';
    var color = isIncoming ? 'var(--accent-green)' : 'var(--accent-red)'; 
    var sign = isIncoming ? '+' : '-';
    
    var typeName = tx.type === 'deposit' ? t('deposit', 'Depozit') : 
                   tx.type === 'transfer' ? t('send', "Jo'natish") : 
                   tx.type === 'bonus' ? t('bonus', 'Bonus') : 
                   tx.type || t('transaction', 'Tranzaksiya');
    
    return '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border-color);">' +
      '<div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;">' +
        '<i class="fas ' + icon + '" style="color:' + color + ';"></i>' +
      '</div>' +
      '<div style="flex:1;"><div style="font-size:13px;font-weight:500;">' + (tx.description || typeName) + '</div>' +
      '<div style="font-size:11px;color:var(--text-muted);">' + (Utils.formatDate ? Utils.formatDate(tx.timestamp) : tx.timestamp) + '</div></div>' +
      '<div style="font-weight:600;color:' + color + ';">' + sign + (Utils.formatNumber ? Utils.formatNumber(tx.amount) : tx.amount) + ' Vcoin</div>' +
    '</div>';
  }
};