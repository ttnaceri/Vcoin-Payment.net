/* ============================================
   AUTH MODULE - Autentifikatsiya tizimi
   Login: Nikname + Password (2 input)
   CONFIG dan ma'lumotlar olinadi
   Referral O'CHIRILDI
   ============================================ */

var Auth = {
  step: 'login',
  verifyCode: null,
  verifyChatId: null,
  verifyNickname: null,
  verifyTelegram: null,
  recoveryCode: null,
  recoveryId: null,

  // ===== CONFIG DAN BOT MA'LUMOTLARI =====
  BOT_TOKEN: (typeof CONFIG !== 'undefined' && CONFIG.BOT_TOKEN) ? CONFIG.BOT_TOKEN : '8951698601:AAFnHx-hI1p86pjGBlYAoaswVydpDOlxnb4',
  BOT_USERNAME: (typeof CONFIG !== 'undefined' && CONFIG.BOT_USERNAME) ? CONFIG.BOT_USERNAME : 'Vcoinverify_bot',
  BOT_URL: 'https://t.me/' + ((typeof CONFIG !== 'undefined' && CONFIG.BOT_USERNAME) ? CONFIG.BOT_USERNAME : 'Vcoinverify_bot'),

  // ============ TIL FUNKSIYASI ============
  t: function(key, fallback) {
    if (typeof LANG !== 'undefined' && LANG.t) {
      var result = LANG.t(key);
      if (result && result !== key) return result;
    }
    return fallback || key;
  },

  // ============ PAROL VALIDATSIYASI ============
  validatePassword: function(password) {
    if (!password || password.length < 8) {
      return { valid: false, error: 'Parol kamida 8 belgi bo\'lishi kerak!' };
    }
    if (password === '12345678') {
      return { valid: false, error: 'Bu parol qabul qilinmaydi! (12345678)' };
    }
    if (/^(\d)\1{7,}$/.test(password)) {
      return { valid: false, error: 'Bir xil raqamlardan iborat parol qabul qilinmaydi!' };
    }
    return { valid: true };
  },

  // ============ PAROL KO'RISH/BERKITISH ============
  togglePassword: function(inputId, iconId) {
    var input = document.getElementById(inputId);
    var icon = document.getElementById(iconId);
    
    if (!input || !icon) return;
    
    if (input.type === 'password') {
      input.type = 'text';
      icon.className = 'fas fa-eye-slash';
    } else {
      input.type = 'password';
      icon.className = 'fas fa-eye';
    }
  },

  render: function(container) {
    var t = this.t.bind(this);

    container.innerHTML = `
      <div class="auth-container fade-in">
        <div style="text-align: center; margin-bottom: 24px; margin-top: 20px;">
          <div class="auth-logo" id="authLogo" style="cursor: pointer;">
            <i class="fa-solid fa-user" style="font-size: 48px; color: white"></i>
          </div>
          <h1 style="font-size: 28px; font-weight: 800; color: var(--accent-blue); margin-top: 16px;">Vcoin</h1>
          <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">${t('auth_subtitle', "Kripto to'lov tizimi")}</p>
        </div>

        ${this.step === 'login' ? `
        <div class="glass-card" style="padding: 24px;">
          <h3 style="text-align: center; margin-bottom: 16px; font-size: 16px;">🔑 ${t('login', 'Hisobga kirish')}</h3>
          <p style="text-align: center; font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">Nikname va Parolingizni kiriting</p>
          
          <input type="text" id="loginNickname" class="input" placeholder="${t('nickname', 'Nikname')}" 
                 style="text-align: center; font-size: 18px; margin-bottom: 10px;">
          
          <div style="position:relative; margin-bottom: 14px;">
            <input type="password" id="loginPassword" class="input" placeholder="${t('password', 'Parol')}" 
                   style="text-align: center; font-size: 18px; padding-right: 45px;">
            <span onclick="Auth.togglePassword('loginPassword', 'loginPasswordEye')" 
                  style="position:absolute; right:14px; top:50%; transform:translateY(-50%); cursor:pointer; color: var(--text-muted); font-size:18px;">
              <i class="fas fa-eye" id="loginPasswordEye"></i>
            </span>
          </div>
          
          <p id="loginError" style="color: var(--accent-red); font-size: 12px; text-align: center; margin-bottom: 8px; display: none;"></p>
          
          <button class="btn btn-primary w-full btn-lg" id="loginBtn" onclick="Auth.login()">
            <i class="fas fa-sign-in-alt"></i> ${t('login', 'Kirish')}
          </button>
          
          <div style="display: flex; justify-content: space-between; margin-top: 12px;">
            <a href="#" onclick="Auth.showForgot(); return false;" style="color: var(--accent-red); font-size: 12px;">
              <i class="fas fa-key"></i> ${t('forgot_password', 'Parolni unutdingizmi?')}
            </a>
            <a href="#" onclick="Auth.showRegister(); return false;" style="color: var(--accent-blue); font-size: 12px;">
              <i class="fas fa-user-plus"></i> ${t('new_account', 'Yangi akkaunt ochish')}
            </a>
          </div>
        </div>
        ` : this.step === 'register' ? `
        <div class="glass-card" style="padding: 24px;">
          <h3 style="text-align: center; margin-bottom: 16px; font-size: 16px;">👤 ${t('register', "Ro'yxatdan o'tish")}</h3>
          <p style="text-align: center; font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">${t('register_hint', 'Nikname va Telegram username kiriting')}</p>
          
          <input type="text" id="registerNickname" class="input" placeholder="${t('nickname', 'Nikname')}" maxlength="20" 
                 style="text-align: center; font-size: 18px; margin-bottom: 10px;" oninput="Auth.validateRegister()" autofocus>
          
          <input type="text" id="registerTelegram" class="input" placeholder="Telegram @username" 
                 style="text-align: center; font-size: 16px; margin-bottom: 14px;" oninput="Auth.validateRegister()">
          
          <p id="registerError" style="color: var(--accent-red); font-size: 12px; text-align: center; margin-bottom: 8px; display: none;"></p>
          
          <button class="btn btn-primary w-full btn-lg" id="registerBtn" onclick="Auth.startRegistration()" disabled>
            <i class="fas fa-paper-plane"></i> ${t('send_code', 'Kod yuborish')}
          </button>
          
          <p style="text-align: center; font-size: 10px; color: var(--text-muted); margin-top: 8px;">
            🤖 Avval <a href="${this.BOT_URL}" target="_blank" style="color: var(--accent-blue);">@${this.BOT_USERNAME}</a> ga /start bosing
          </p>
          
          <button class="btn btn-outline w-full btn-sm mt-8" onclick="Auth.showLogin()">
            <i class="fas fa-arrow-left"></i> ${t('back', 'Orqaga')}
          </button>
        </div>
        ` : this.step === 'verify' ? `
        <div class="glass-card" style="padding: 24px;">
          <h3 style="text-align: center; margin-bottom: 16px; font-size: 16px;">🔐 ${t('verify', 'Tasdiqlash')}</h3>
          <p style="text-align: center; font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">${t('verify_hint', 'Telegram bot orqali kod yuborildi')}</p>
          <p style="text-align: center; font-size: 11px; color: var(--text-muted); margin-bottom: 16px;">${t('verify_hint2', 'Kodni kiriting va parolingizni yarating (8+ belgi)')}</p>
          
          <input type="text" id="verifyCode" class="input" placeholder="${t('verify_code', '6 xonali kod')}" maxlength="6" 
                 style="text-align: center; font-size: 24px; letter-spacing: 8px; margin-bottom: 10px;" oninput="this.value=this.value.replace(/[^0-9]/g,'')">
          
          <div style="position:relative; margin-bottom: 14px;">
            <input type="password" id="verifyPassword" class="input" placeholder="Yangi parol (8+ belgi)" maxlength="30" 
                   style="text-align: center; font-size: 18px; padding-right: 45px;">
            <span onclick="Auth.togglePassword('verifyPassword', 'verifyPasswordEye')" 
                  style="position:absolute; right:14px; top:50%; transform:translateY(-50%); cursor:pointer; color: var(--text-muted); font-size:18px;">
              <i class="fas fa-eye" id="verifyPasswordEye"></i>
            </span>
          </div>
          
          <p id="verifyError" style="color: var(--accent-red); font-size: 12px; text-align: center; margin-bottom: 8px; display: none;"></p>
          
          <button class="btn btn-success w-full btn-lg" onclick="Auth.confirmRegistration()">
            <i class="fas fa-check"></i> ${t('confirm', "Ro'yxatdan o'tish")}
          </button>
          
          <button class="btn btn-outline w-full btn-sm mt-8" onclick="Auth.showRegister()">
            <i class="fas fa-arrow-left"></i> ${t('back', 'Orqaga')}
          </button>
        </div>
        ` : this.step === 'forgot' ? `
        <div class="glass-card" style="padding: 24px;">
          <h3 style="text-align: center; margin-bottom: 16px; font-size: 16px;">🔍 ${t('forgot_password', 'Parolni Tiklash')}</h3>
          <p style="text-align: center; font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">${t('recovery_hint', 'Nikname va Telegram username kiriting')}</p>
          
          <input type="text" id="forgotNickname" class="input" placeholder="${t('nickname', 'Nikname')}" 
                 style="text-align: center; font-size: 18px; margin-bottom: 10px;">
          
          <input type="text" id="forgotTelegram" class="input" placeholder="Telegram @username" 
                 style="text-align: center; font-size: 16px; margin-bottom: 14px;">
          
          <p id="forgotError" style="color: var(--accent-red); font-size: 12px; text-align: center; margin-bottom: 8px; display: none;"></p>
          
          <button class="btn btn-primary w-full btn-lg" onclick="Auth.recoverAccount()">
            <i class="fas fa-paper-plane"></i> ${t('send_recovery', 'Tiklash parolini yuborish')}
          </button>
          
          <button class="btn btn-outline w-full btn-sm mt-8" onclick="Auth.showLogin()">
            <i class="fas fa-arrow-left"></i> ${t('back', 'Orqaga')}
          </button>
        </div>
        ` : this.step === 'recovery' ? `
        <div class="glass-card" style="padding: 24px;">
          <h3 style="text-align: center; margin-bottom: 16px; font-size: 16px;">🔐 ${t('recovery_title', 'Tiklash parolini kiriting')}</h3>
          <p style="text-align: center; font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">${t('recovery_hint2', 'Telegram bot orqali yuborilgan parolni kiriting')}</p>
          
          <input type="text" id="recoveryInput" class="input" placeholder="${t('recovery_code', 'Tiklash paroli')}" maxlength="10" 
                 style="text-align: center; font-size: 20px; letter-spacing: 4px; margin-bottom: 14px;">
          
          <p id="recoveryError" style="color: var(--accent-red); font-size: 12px; text-align: center; margin-bottom: 8px; display: none;"></p>
          
          <button class="btn btn-success w-full btn-lg" onclick="Auth.confirmRecovery()">
            <i class="fas fa-sign-in-alt"></i> ${t('login', 'Hisobga kirish')}
          </button>
          
          <button class="btn btn-outline w-full btn-sm mt-8" onclick="Auth.showLogin()">
            <i class="fas fa-arrow-left"></i> ${t('back', 'Orqaga')}
          </button>
        </div>
        ` : ''}

        <p style="text-align: center; font-size: 11px; color: var(--text-muted); margin-top: 16px;">${t('terms', 'Davom etish orqali foydalanish shartlariga rozilik bildirasiz')}</p>
      </div>
    `;
    this.setupAdminAccess();
  },

  // ============ ADMIN ACCESS ============
  setupAdminAccess: function() {
    setTimeout(function() {
      var logo = document.getElementById('authLogo'); 
      if (!logo) return;
      logo.style.cursor = 'pointer'; 
      var clickCount = 0, clickTimer = null;
      logo.addEventListener('click', function(e) {
        clickCount++; 
        if (clickTimer) clearTimeout(clickTimer);
        clickTimer = setTimeout(function() { clickCount = 0; }, 2000);
        if (clickCount >= 5) { 
          clickCount = 0; 
          clearTimeout(clickTimer);
          var pin = prompt('🔐 Admin PIN kodini kiriting:');
          var currPin = DB.get('adminPassword', '55668576');
          if (pin === currPin) { 
            UI.navigateTo('admin'); 
            UI.showToast('Admin panelga xush kelibsiz! 🛡️', 'success'); 
          } else if (pin !== null && pin !== '') { 
            UI.showToast('❌ Noto\'g\'ri PIN kod!', 'error'); 
          }
        }
      });
    }, 500);
  },

  // ============ SAHIFALAR ============
  showRegister: function() { this.step = 'register'; UI.navigateTo('auth'); },
  showLogin: function() { this.step = 'login'; UI.navigateTo('auth'); },
  showVerify: function() { this.step = 'verify'; UI.navigateTo('auth'); },
  showForgot: function() { this.step = 'forgot'; UI.navigateTo('auth'); },
  showRecovery: function() { this.step = 'recovery'; UI.navigateTo('auth'); },

  // ============ VALIDATSIYA ============
  validateRegister: function() {
    var nickname = document.getElementById('registerNickname').value.trim();
    var telegram = document.getElementById('registerTelegram').value.trim();
    var error = document.getElementById('registerError');
    var btn = document.getElementById('registerBtn');
    
    if (!error || !btn) return;
    
    if (nickname.length === 0 && telegram.length === 0) {
      error.style.display = 'none';
      btn.disabled = true;
      return;
    }
    
    if (nickname.length < 3) {
      error.textContent = '⚠️ ' + this.t('nick_error', 'Nikname kamida 3 ta belgi');
      error.style.display = 'block';
      btn.disabled = true;
      return;
    }
    
    if (nickname.length > 20) {
      error.textContent = '⚠️ ' + this.t('nick_too_long', 'Nikname ko\'pi bilan 20 ta belgi');
      error.style.display = 'block';
      btn.disabled = true;
      return;
    }
    
    if (!telegram || telegram.length < 3) {
      error.textContent = '⚠️ ' + this.t('telegram_required', 'Telegram username kiriting');
      error.style.display = 'block';
      btn.disabled = true;
      return;
    }
    
    error.style.display = 'none';
    btn.disabled = false;
  },

  // ============ LOGIN (TUZATILGAN) ============
  login: async function() {
    var t = this.t.bind(this);
    var nickname = document.getElementById('loginNickname').value.trim();
    var password = document.getElementById('loginPassword').value.trim();
    var error = document.getElementById('loginError');
    var btn = document.getElementById('loginBtn');
    
    error.style.display = 'none';
    
    if (!nickname || nickname.length < 3) {
      error.textContent = '⚠️ ' + t('nick_error', 'Nikname kamida 3 ta belgi bo\'lishi kerak');
      error.style.display = 'block';
      return;
    }
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + t('checking', 'Tekshirilmoqda...');
    
    var self = this;
    
    try {
      // 1. Avval Cloud dan tekshirish
      var users = null;
      try {
        users = await Cloud.getAllUsers();
        console.log('☁️ Cloud dan ' + Object.keys(users).length + ' ta user yuklandi');
      } catch(e) {
        console.warn('⚠️ Cloud xatosi, lokal ma\'lumotlar ishlatiladi:', e.message);
        users = null;
      }
      
      var foundUser = null;
      
      // 2. Cloud da user ni qidirish
      if (users) {
        for (var id in users) {
          if (users[id].nickname && users[id].nickname.toLowerCase() === nickname.toLowerCase()) {
            foundUser = users[id];
            console.log('✅ Cloud dan user topildi:', foundUser.nickname);
            break;
          }
        }
      }
      
      // 3. Agar Cloud da topilmasa, lokal registry dan qidirish
      if (!foundUser) {
        console.log('🔍 Lokal registry dan qidirilmoqda...');
        var allUsers = DB.getAllUsers();
        for (var lid in allUsers) {
          if (allUsers[lid].nickname && allUsers[lid].nickname.toLowerCase() === nickname.toLowerCase()) {
            foundUser = allUsers[lid];
            console.log('✅ Lokal registry dan user topildi:', foundUser.nickname);
            break;
          }
        }
      }
      
      // 4. Agar topilmasa, joriy user ni tekshirish
      if (!foundUser) {
        var currentUser = DB.getUser();
        if (currentUser && currentUser.nickname && currentUser.nickname.toLowerCase() === nickname.toLowerCase()) {
          foundUser = currentUser;
          console.log('✅ Joriy user topildi:', foundUser.nickname);
        }
      }
      
      // 5. User topilmasa
      if (!foundUser) {
        showErr(t('user_not_found', '⚠️ Bunday nikname topilmadi'));
        return;
      }
      
      // 6. Parol tekshirish
      if (!foundUser.password) {
        self.showCreatePasswordNoVerify(foundUser, function(newPassword) {
          var validation = self.validatePassword(newPassword);
          if (!validation.valid) {
            UI.showToast('❌ ' + validation.error, 'error');
            return;
          }
          foundUser.password = newPassword;
          
          Cloud.updateUser(foundUser.id, { password: newPassword }).then(function() {
            self.loginSuccess(foundUser);
          }).catch(function() {
            DB.setUser(foundUser);
            DB.saveUserToRegistry(foundUser);
            self.loginSuccess(foundUser);
          });
        });
        
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> ' + t('login', 'Kirish');
        return;
      }
      
      // 7. Parol kiritilmagan bo'lsa
      if (!password || password.length < 8) {
        self.showPasswordInput(foundUser, function(enteredPassword) {
          if (!enteredPassword || enteredPassword.length < 8) {
            UI.showToast('❌ Parol kamida 8 belgi bo\'lishi kerak!', 'error');
            return;
          }
          if (foundUser.password !== enteredPassword) {
            UI.showToast('❌ Parol noto\'g\'ri!', 'error');
            return;
          }
          self.loginSuccess(foundUser);
        });
        
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> ' + t('login', 'Kirish');
        return;
      }
      
      // 8. Parolni tekshirish
      if (foundUser.password !== password) {
        showErr(t('wrong_password', '⚠️ Parol noto\'g\'ri'));
        return;
      }
      
      // 9. Muvaffaqiyatli kirish
      self.loginSuccess(foundUser);
      
    } catch(e) {
      console.error('❌ Login xatosi:', e);
      showErr(t('wrong_data', '⚠️ Noto\'g\'ri ma\'lumot!'));
    }
    
    function showErr(msg) {
      error.textContent = msg;
      error.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> ' + t('login', 'Kirish');
    }
  },

  // ============ PAROL KIRITISH OYNASI ============
  showPasswordInput: function(user, callback) {
    var html = '<div style="text-align:center;padding:10px;">';
    html += '<h3 style="margin-bottom:12px;">🔑 Parolni Kiriting</h3>';
    html += '<p style="font-size:13px;color:var(--text-muted);margin-bottom:8px;">👤 <b>' + user.nickname + '</b> uchun parolni kiriting</p>';
    
    html += '<div style="position:relative; margin-bottom:14px;">';
    html += '<input type="password" id="passwordInput" class="input" placeholder="Parol" style="text-align:center;font-size:18px;padding-right:45px;">';
    html += '<span onclick="Auth.togglePassword(\'passwordInput\', \'passwordInputEye\')" style="position:absolute; right:14px; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-muted); font-size:18px;">';
    html += '<i class="fas fa-eye" id="passwordInputEye"></i>';
    html += '</span></div>';
    
    html += '<p id="passwordInputError" style="color:var(--accent-red);font-size:12px;text-align:center;margin-bottom:8px;display:none;"></p>';
    html += '<button class="btn btn-success w-full" onclick="Auth.confirmPasswordInput()"><i class="fas fa-check"></i> Kirish</button>';
    html += '</div>';
    
    UI.openModal(html);
    
    this._passwordInputCallback = callback;
    this._passwordInputUser = user;
    
    setTimeout(function() {
      var input = document.getElementById('passwordInput');
      if (input) {
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            Auth.confirmPasswordInput();
          }
        });
        input.focus();
      }
    }, 200);
  },

  confirmPasswordInput: function() {
    var password = document.getElementById('passwordInput').value.trim();
    var error = document.getElementById('passwordInputError');
    
    error.style.display = 'none';
    
    if (!password || password.length < 8) {
      error.textContent = '⚠️ Parol kamida 8 belgi bo\'lishi kerak!';
      error.style.display = 'block';
      return;
    }
    
    UI.closeModal();
    
    if (this._passwordInputCallback) {
      this._passwordInputCallback(password);
    }
    
    this._passwordInputCallback = null;
    this._passwordInputUser = null;
  },

  // ============ PAROL YARATISH OYNASI ============
  showCreatePasswordNoVerify: function(user, callback) {
    var html = '<div style="text-align:center;padding:10px;">';
    html += '<h3 style="margin-bottom:12px;">🔐 Parol Yaratish</h3>';
    html += '<p style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">👤 <b>' + user.nickname + '</b> uchun parol yarating</p>';
    html += '<p style="font-size:11px;color:var(--accent-green);margin-bottom:16px;">✅ Bu akkaunt Admin tomonidan yaratilgan</p>';
    html += '<p style="font-size:11px;color:var(--text-muted);margin-bottom:16px;">⚠️ Parol kamida 8 belgi, 12345678 va bir xil raqamlar qabul qilinmaydi</p>';
    
    html += '<div style="position:relative; margin-bottom:10px;">';
    html += '<input type="password" id="createPasswordInput" class="input" placeholder="Yangi parol" style="text-align:center;font-size:18px;padding-right:45px;">';
    html += '<span onclick="Auth.togglePassword(\'createPasswordInput\', \'createPasswordEye\')" style="position:absolute; right:14px; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-muted); font-size:18px;">';
    html += '<i class="fas fa-eye" id="createPasswordEye"></i>';
    html += '</span></div>';
    
    html += '<div style="position:relative; margin-bottom:14px;">';
    html += '<input type="password" id="createPasswordConfirm" class="input" placeholder="Parolni qayta kiriting" style="text-align:center;font-size:18px;padding-right:45px;">';
    html += '<span onclick="Auth.togglePassword(\'createPasswordConfirm\', \'createPasswordConfirmEye\')" style="position:absolute; right:14px; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text-muted); font-size:18px;">';
    html += '<i class="fas fa-eye" id="createPasswordConfirmEye"></i>';
    html += '</span></div>';
    
    html += '<p id="createPasswordError" style="color:var(--accent-red);font-size:12px;text-align:center;margin-bottom:8px;display:none;"></p>';
    html += '<button class="btn btn-success w-full" onclick="Auth.createPasswordConfirmNoVerify()"><i class="fas fa-check"></i> Parolni saqlash va kirish</button>';
    html += '</div>';
    
    UI.openModal(html);
    
    this._createPasswordCallback = callback;
    this._createPasswordUser = user;
  },

  createPasswordConfirmNoVerify: function() {
    var password = document.getElementById('createPasswordInput').value.trim();
    var confirm = document.getElementById('createPasswordConfirm').value.trim();
    var error = document.getElementById('createPasswordError');
    
    error.style.display = 'none';
    
    if (!password || password.length < 8) {
      error.textContent = '⚠️ Parol kamida 8 belgi bo\'lishi kerak!';
      error.style.display = 'block';
      return;
    }
    
    if (password !== confirm) {
      error.textContent = '⚠️ Parollar mos kelmadi!';
      error.style.display = 'block';
      return;
    }
    
    var validation = this.validatePassword(password);
    if (!validation.valid) {
      error.textContent = '⚠️ ' + validation.error;
      error.style.display = 'block';
      return;
    }
    
    UI.closeModal();
    
    if (this._createPasswordCallback) {
      this._createPasswordCallback(password);
    }
    
    this._createPasswordCallback = null;
    this._createPasswordUser = null;
  },

  loginSuccess: function(userData) {
    var t = this.t.bind(this);
    DB.setUser(userData);
    DB.saveUserToRegistry(userData);
    if (Cloud && Cloud.addUser) {
      Cloud.addUser(userData).catch(function() {});
    }
    UI.showToast('✅ ' + t('welcome', 'Xush kelibsiz') + ', ' + userData.nickname + '!', 'success');
    setTimeout(function() { 
      UI.navigateTo('dashboard'); 
    }, 500);
  },

  // ============ REGISTRATION ============
  startRegistration: async function() {
    var t = this.t.bind(this);
    var nickname = document.getElementById('registerNickname').value.trim();
    var telegram = document.getElementById('registerTelegram').value.trim();
    var error = document.getElementById('registerError');
    var btn = document.getElementById('registerBtn');
    
    if (!nickname || nickname.length < 3) {
      error.textContent = '⚠️ ' + t('nick_error', 'Nikname kamida 3 ta belgi');
      error.style.display = 'block';
      return;
    }
    
    if (!telegram || telegram.length < 3) {
      error.textContent = '⚠️ ' + t('telegram_required', 'Telegram username kiriting');
      error.style.display = 'block';
      return;
    }
    
    telegram = telegram.replace('@', '').replace('https://t.me/', '').trim().toLowerCase();
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + t('checking', 'Tekshirilmoqda...');
    error.style.display = 'none';
    
    try {
      var users = await Cloud.getAllUsers();
      
      for (var id in users) {
        if (users[id].nickname && users[id].nickname.toLowerCase() === nickname.toLowerCase()) {
          error.textContent = '⚠️ ' + t('nick_taken', 'Bu nikname band!');
          error.style.display = 'block';
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> ' + t('send_code', 'Kod yuborish');
          return;
        }
        var userTelegram = users[id].telegram ? users[id].telegram.replace('@', '').trim().toLowerCase() : '';
        if (userTelegram && userTelegram === telegram) {
          error.textContent = '⚠️ ' + t('telegram_taken', 'Bu Telegram username band!');
          error.style.display = 'block';
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> ' + t('send_code', 'Kod yuborish');
          return;
        }
      }
    } catch(e) {
      console.warn('Cloud xatosi, local tekshirilmoqda:', e);
      var localUsers = DB.getAllUsers();
      for (var lid in localUsers) {
        if (localUsers[lid].nickname && localUsers[lid].nickname.toLowerCase() === nickname.toLowerCase()) {
          error.textContent = '⚠️ ' + t('nick_taken', 'Bu nikname band!');
          error.style.display = 'block';
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> ' + t('send_code', 'Kod yuborish');
          return;
        }
        var localTelegram = localUsers[lid].telegram ? localUsers[lid].telegram.replace('@', '').trim().toLowerCase() : '';
        if (localTelegram && localTelegram === telegram) {
          error.textContent = '⚠️ ' + t('telegram_taken', 'Bu Telegram username band!');
          error.style.display = 'block';
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> ' + t('send_code', 'Kod yuborish');
          return;
        }
      }
    }
    
    var code = Math.floor(100000 + Math.random() * 900000).toString();
    var sent = await this.sendTelegramCode(telegram, code);
    
    if (!sent) {
      error.textContent = '❌ ' + t('code_send_error', 'Kod jo\'natib bo\'lmadi. @' + this.BOT_USERNAME + ' ga /start bosing.');
      error.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> ' + t('send_code', 'Kod yuborish');
      return;
    }
    
    this.verifyCode = code;
    this.verifyNickname = nickname;
    this.verifyTelegram = telegram;
    
    UI.showToast('📱 ' + t('code_sent', 'Telegram ga 6 xonali kod yuborildi!'), 'success');
    this.showVerify();
  },

  // ============ SEND TELEGRAM CODE ============
  sendTelegramCode: async function(username, code) {
    try {
      username = username.replace('@', '').trim().toLowerCase();
      
      console.log('📱 Telegram kod yuborilmoqda:', { username, code });
      console.log('🤖 Bot: @' + this.BOT_USERNAME);
      
      var updates = await fetch('https://api.telegram.org/bot' + this.BOT_TOKEN + '/getUpdates?limit=100');
      var data = await updates.json();
      
      console.log('📱 Telegram javobi:', data);
      
      if (!data.ok) {
        console.error('❌ Telegram API xatosi:', data);
        return false;
      }
      
      var chatId = null;
      
      if (data.result && data.result.length > 0) {
        for (var i = data.result.length - 1; i >= 0; i--) {
          var msg = data.result[i].message;
          if (msg && msg.chat) {
            var chatUsername = msg.chat.username ? msg.chat.username.toLowerCase() : '';
            var fromUsername = msg.from && msg.from.username ? msg.from.username.toLowerCase() : '';
            
            if (chatUsername === username || fromUsername === username) {
              chatId = msg.chat.id;
              console.log('✅ Chat ID topildi:', chatId);
              break;
            }
          }
        }
      }
      
      if (!chatId) {
        console.error('❌ Chat ID topilmadi! Username:', username);
        console.log('📋 Mavjud usernamlar:');
        if (data.result && data.result.length > 0) {
          for (var k = 0; k < data.result.length; k++) {
            var m = data.result[k].message;
            if (m && m.chat && m.chat.username) {
              console.log('  - @' + m.chat.username);
            }
          }
        }
        
        UI.showToast('❌ @' + this.BOT_USERNAME + ' ga /start bosing va qaytadan urinib ko\'ring!', 'error');
        return false;
      }
      
      var text = '🔐 Vcoin tasdiqlash kodi: <code>' + code + '</code>\n\n' +
                 'Bu kod 5 daqiqa davomida amal qiladi.\n\n' +
                 '🤖 Bot: @' + this.BOT_USERNAME;
      
      var sendMsg = await fetch('https://api.telegram.org/bot' + this.BOT_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          parse_mode: 'HTML',
          text: text
        })
      });
      
      var result = await sendMsg.json();
      console.log('📨 Xabar yuborildi:', result);
      
      return result.ok === true;
      
    } catch(e) {
      console.error('❌ Telegram xatosi:', e.message);
      return false;
    }
  },

  // ============ CONFIRM REGISTRATION ============
  confirmRegistration: function() {
    var t = this.t.bind(this);
    var codeInput = document.getElementById('verifyCode');
    var passwordInput = document.getElementById('verifyPassword');
    var error = document.getElementById('verifyError');
    
    var code = codeInput ? codeInput.value.trim() : '';
    var password = passwordInput ? passwordInput.value.trim() : '';
    
    error.style.display = 'none';
    
    if (!code || code.length !== 6) {
      error.textContent = '⚠️ ' + t('code_error', '6 xonali kodni kiriting');
      error.style.display = 'block';
      return;
    }
    
    if (!password || password.length < 8) {
      error.textContent = '⚠️ Parol kamida 8 belgi bo\'lishi kerak!';
      error.style.display = 'block';
      return;
    }
    
    var validation = this.validatePassword(password);
    if (!validation.valid) {
      error.textContent = '⚠️ ' + validation.error;
      error.style.display = 'block';
      return;
    }
    
    if (code !== this.verifyCode) {
      error.textContent = '❌ ' + t('wrong_code', 'Noto\'g\'ri kod!');
      error.style.display = 'block';
      return;
    }
    
    this.verifyPassword = password;
    this.finishRegistration();
  },

  // ============ FINISH REGISTRATION (REFERRAL O'CHIRILDI) ============
  finishRegistration: async function() {
    var t = this.t.bind(this);
    var nickname = this.verifyNickname;
    var telegram = this.verifyTelegram;
    var password = this.verifyPassword;
    var userId = Utils.generateId ? Utils.generateId() : Math.floor(100000000 + Math.random() * 900000000).toString();
    var token = Utils.generateToken ? Utils.generateToken() : 'TK' + Date.now().toString(36).toUpperCase();
    
    var user = {
      id: userId,
      nickname: nickname,
      balance: 100,
      token: token,
      password: password,
      telegram: telegram || '',
      createdAt: new Date().toISOString()
    };
    
    DB.setUser(user);
    DB.saveUserToRegistry(user);
    
    try {
      await Cloud.addUser(user);
    } catch(e) {
      console.warn('Cloud ga saqlashda xatolik:', e);
    }
    
    DB.addTransaction({
      type: 'bonus',
      fromId: 'SYSTEM',
      toId: userId,
      amount: 100,
      description: t('welcome_bonus', 'Xush kelibsiz bonus!')
    });
    
    this.verifyCode = null;
    this.verifyNickname = null;
    this.verifyTelegram = null;
    this.verifyPassword = null;
    this.step = 'login';
    
    UI.showToast('✅ ' + t('register_success', 'Hisob yaratildi!') + ' 🎉', 'success');
    alert('🎉 ' + t('register_success_alert', 'Hisob muvaffaqiyatli yaratildi!') + '\n\n' +
          '🆔 ' + t('id', 'ID') + ': ' + userId + '\n' +
          '👤 ' + t('nickname', 'Nikname') + ': ' + nickname + '\n' +
          '💰 ' + t('balance', 'Balans') + ': 100 Vcoin\n\n' +
          '📌 ' + t('save_password', 'Parolingizni eslab qoling!'));
    
    setTimeout(function() {
      UI.navigateTo('dashboard');
    }, 500);
  },

  // ============ RECOVER ACCOUNT ============
  recoverAccount: async function() {
    var t = this.t.bind(this);
    var nickname = document.getElementById('forgotNickname').value.trim();
    var telegram = document.getElementById('forgotTelegram').value.trim();
    var error = document.getElementById('forgotError');
    
    error.style.display = 'none';
    
    if (!nickname || nickname.length < 3) {
      error.textContent = '⚠️ ' + t('nick_error', 'Nikname kamida 3 ta belgi bo\'lishi kerak');
      error.style.display = 'block';
      return;
    }
    
    if (!telegram || telegram.length < 3) {
      error.textContent = '⚠️ ' + t('telegram_required', 'Telegram username kiriting');
      error.style.display = 'block';
      return;
    }
    
    telegram = telegram.replace('@', '').replace('https://t.me/', '').trim().toLowerCase();
    
    try {
      var data = await Cloud.loadData();
      if (!data || !data.users) {
        error.textContent = '⚠️ Tizimda xatolik!';
        error.style.display = 'block';
        return;
      }
      
      var users = data.users;
      var foundUser = null;
      var foundUserId = null;
      
      for (var id in users) {
        if (users[id].nickname && users[id].nickname.toLowerCase() === nickname.toLowerCase()) {
          foundUser = users[id];
          foundUserId = id;
          break;
        }
      }
      
      if (!foundUser) {
        error.textContent = '⚠️ ' + t('user_not_found', 'Bunday nikname topilmadi');
        error.style.display = 'block';
        return;
      }
      
      console.log('✅ User topildi:', foundUser);
      
      var userTelegram = foundUser.telegram ? foundUser.telegram.replace('@', '').trim().toLowerCase() : '';
      
      console.log('📱 Telegrams:', {
        input: telegram,
        user: userTelegram,
        match: userTelegram === telegram
      });
      
      if (!userTelegram) {
        var confirmNick = prompt('🔐 Xavfsizlik uchun nikname ni qayta kiriting:');
        if (!confirmNick || confirmNick.trim().toLowerCase() !== nickname.toLowerCase()) {
          error.textContent = '❌ Nikname tasdiqlanmadi!';
          error.style.display = 'block';
          return;
        }
        
        foundUser.telegram = telegram;
        var updated = await Cloud.updateUser(foundUserId, { telegram: telegram });
        
        if (!updated) {
          foundUser.telegram = telegram;
          DB.saveUserToRegistry(foundUser);
        }
        
        await Cloud.syncToLocal();
        
        UI.showToast('✅ Telegram username saqlandi! Kod yuborilmoqda...', 'success');
        
        var recoveryPass = Math.floor(10000 + Math.random() * 90000).toString();
        this.recoveryCode = recoveryPass;
        this.recoveryId = foundUserId;
        
        var sent = await this.sendRecoveryCode(telegram, recoveryPass);
        
        if (sent) {
          UI.showToast('📱 ' + t('recovery_sent', 'Telegram ga tiklash paroli yuborildi!'), 'success');
          this.showRecovery();
        } else {
          error.textContent = '❌ ' + t('recovery_send_error', 'Xabar jo\'natib bo\'lmadi. @' + this.BOT_USERNAME + ' ga /start bosing.');
          error.style.display = 'block';
        }
        return;
      }
      
      if (userTelegram !== telegram) {
        error.textContent = '⚠️ ' + t('telegram_mismatch', 'Telegram username mos kelmadi');
        error.style.display = 'block';
        console.log('❌ Telegram mos kelmadi! Kiritilgan:', telegram, 'Saqlangan:', userTelegram);
        return;
      }
      
      var recoveryPass = Math.floor(10000 + Math.random() * 90000).toString();
      this.recoveryCode = recoveryPass;
      this.recoveryId = foundUserId;
      
      var sent = await this.sendRecoveryCode(telegram, recoveryPass);
      
      if (sent) {
        UI.showToast('📱 ' + t('recovery_sent', 'Telegram ga tiklash paroli yuborildi!'), 'success');
        this.showRecovery();
      } else {
        error.textContent = '❌ ' + t('recovery_send_error', 'Xabar jo\'natib bo\'lmadi. @' + this.BOT_USERNAME + ' ga /start bosing.');
        error.style.display = 'block';
      }
      
    } catch(e) {
      error.textContent = '⚠️ ' + t('cloud_error', 'Cloud ga ulanishda xatolik!');
      error.style.display = 'block';
      console.error('❌ Recovery xatosi:', e);
    }
  },

  // ============ SEND RECOVERY CODE ============
  sendRecoveryCode: async function(username, code) {
    try {
      username = username.replace('@', '').trim().toLowerCase();
      
      console.log('📱 Tiklash kodi yuborilmoqda:', { username, code });
      console.log('🤖 Bot: @' + this.BOT_USERNAME);
      
      var updates = await fetch('https://api.telegram.org/bot' + this.BOT_TOKEN + '/getUpdates?limit=100');
      var data = await updates.json();
      
      if (!data.ok) {
        console.error('❌ Telegram API xatosi:', data);
        return false;
      }
      
      var chatId = null;
      
      if (data.result && data.result.length > 0) {
        for (var i = data.result.length - 1; i >= 0; i--) {
          var msg = data.result[i].message;
          if (msg && msg.chat) {
            var chatUsername = msg.chat.username ? msg.chat.username.toLowerCase() : '';
            var fromUsername = msg.from && msg.from.username ? msg.from.username.toLowerCase() : '';
            
            if (chatUsername === username || fromUsername === username) {
              chatId = msg.chat.id;
              console.log('✅ Chat ID topildi:', chatId);
              break;
            }
          }
        }
      }
      
      if (!chatId) {
        console.error('❌ Chat ID topilmadi! Username:', username);
        return false;
      }
      
      var t = this.t.bind(this);
      var text = '🔐 ' + t('recovery_text', 'Akkauntingizni Tiklash Paroli') + ': <code>' + code + '</code>\n\n' +
                 '⚠️ ' + t('recovery_warning', 'Iltimos, parolni hech kimga bermang!') + '\n\n' +
                 t('recovery_ignore', 'Agarda siz akkaunt tiklash bo\'yicha so\'rov yubormagan bo\'lsangiz, bu xabarni e\'tiborsiz qoldiring!');
      
      var sendMsg = await fetch('https://api.telegram.org/bot' + this.BOT_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          parse_mode: 'HTML',
          text: text
        })
      });
      
      var result = await sendMsg.json();
      console.log('📨 Xabar yuborildi:', result);
      
      return result.ok === true;
      
    } catch(e) {
      console.error('❌ Telegram xatosi:', e.message);
      return false;
    }
  },

  // ============ CONFIRM RECOVERY ============
  confirmRecovery: function() {
    var t = this.t.bind(this);
    var input = document.getElementById('recoveryInput');
    var error = document.getElementById('recoveryError');
    var code = input ? input.value.trim() : '';
    
    error.style.display = 'none';
    
    if (!code || code.length < 4) {
      error.textContent = '⚠️ ' + t('recovery_code_required', 'Tiklash parolini kiriting');
      error.style.display = 'block';
      return;
    }
    
    if (code !== this.recoveryCode) {
      error.textContent = '❌ ' + t('wrong_recovery_code', 'Noto\'g\'ri parol!');
      error.style.display = 'block';
      return;
    }
    
    var self = this;
    Cloud.getUser(this.recoveryId).then(function(user) {
      if (user) {
        self.showCreatePasswordNoVerify(user, function(newPassword) {
          var validation = self.validatePassword(newPassword);
          if (!validation.valid) {
            UI.showToast('❌ ' + validation.error, 'error');
            return;
          }
          user.password = newPassword;
          Cloud.updateUser(user.id, { password: newPassword }).then(function() {
            UI.showToast('✅ Parol yangilandi!', 'success');
            self.loginSuccess(user);
          }).catch(function() {
            DB.setUser(user);
            DB.saveUserToRegistry(user);
            UI.showToast('✅ Parol yangilandi!', 'success');
            self.loginSuccess(user);
          });
        });
      } else {
        error.textContent = '❌ ' + t('user_not_found', 'Foydalanuvchi topilmadi');
        error.style.display = 'block';
      }
    }).catch(function() {
      error.textContent = '❌ ' + t('error', 'Xatolik!');
      error.style.display = 'block';
    });
    
    this.recoveryCode = null;
    this.recoveryId = null;
  }
};