// ==================== TIL TARJIMALARI ====================
var LANG = {
  current: localStorage.getItem('vcoin_lang') || 'uz',
  
  data: {
    uz: {
      profile: 'Profil',
      nickname: 'Nikname',
      id: 'ID',
      balance: 'Balans',
      changeNick: 'Nik o\'zgartirish',
      daysLeft: 'kundan keyin o\'zgartira olasiz',
      token: 'Shaxsiy Token',
      tokenDesc: 'To\'lov tokenini ko\'rish',
      history: 'Tranzaksiya Tarixi',
      historyDesc: 'Barcha to\'lovlar',
      deposit: 'Depozitlar',
      depositDesc: 'Faol va tugagan depozitlar',
      download: 'Ma\'lumotlarni Yuklash',
      sync: 'Sinxronlash',
      sysInfo: 'Tizim Ma\'lumoti',
      commission: 'Komissiya',
      depositRate: 'Depozit stavkasi',
      totalUsers: 'Jami foydalanuvchilar',
      registered: 'Ro\'yxatdan o\'tgan',
      danger: 'Xavfli Hudud',
      clearData: 'Barcha Ma\'lumotlarni Tozalash',
      resetApp: 'Dasturni Qayta O\'rnatish',
      dangerWarn: 'Bu amallar qaytarib bo\'lmaydi!',
      logout: 'Akkauntdan Chiqish',
      logoutConfirm: 'Akkauntdan chiqishni xohlaysizmi?',
      logoutDone: 'Akkauntdan chiqildi ✅',
      syncStart: 'Sinxronlash...',
      syncDone: 'Tugadi!',
      syncError: 'Xatolik',
      cloudError: 'Cloud mavjud emas',
      clearConfirm: 'Barcha ma\'lumotlaringiz o\'chiriladi! Davom etasizmi?',
      clearDone: 'Tozalandi, yangilanmoqda...',
      resetConfirm: 'Dastur qayta o\'rnatiladi! Davom etasizmi?',
      resetDone: 'Qayta o\'rnatilmoqda...',
      nickError: 'Nikname 3-20 belgi bo\'lishi kerak!',
      nickSame: 'Bu sizning hozirgi niknameingiz!',
      nickTaken: 'Bu nikname band!',
      nickChanged: 'Nikname o\'zgartirildi: ',
      nickWait: 'Nik o\'zgartirish uchun ',
      nickWait2: ' kun kuting!',
      language: 'Til',
      daily: 'kunlik',
      version: 'Vcoin Payment App v3.0',
      
      // Dashboard uchun
      active_deposits: 'Faol Depozitlar',
      new_deposit: 'Yangi Depozit',
      duration: 'Muddat',
      days: 'kun',
      daily_profit: 'Kunlik foyda',
      total_profit: 'Umumiy foyda',
      final_amount: 'Yakuniy summa',
      deposit_warning: "Depozit muddati tugamaguncha mablag'ni yechib bo'lmaydi!",
      deposit_button: 'Depozit Qilish',
      completed_deposits: 'Tugagan Depozitlar',
      days_left: 'kun qoldi',
      expiring: 'Tugayapti...',
      claim_button: 'Yechib olish',
      enter_amount: 'Miqdorni kiriting',
      login_required: "Iltimos, tizimga kiring",
      insufficient_balance: 'Balans yetarli emas',
      deposit_confirm: 'miqdorda ',
      deposit_confirm2: 'depozit qilishni tasdiqlaysizmi?',
      deposit_created: 'depozit yaratildi!',
      deposit_not_found: 'Depozit topilmadi',
      deposit_closed: "Bu depozit allaqachon yopilgan",
      deposit_not_ready: "Depozit muddati hali tugamagan. ",
      deposit_profit_desc: "Depozit foydasi: ",
      deposit_claimed: "hisobingizga qo'shildi!",
      
      // Transfer uchun
      send_vcoin: "Vcoin Jo'natish",
      recipient_id: 'Qabul qiluvchi ID',
      id_placeholder: '9 xonali ID',
      receiver_gets: "Qabul qiluvchiga",
      total: 'Jami',
      send_button: "Jo'natish",
      sending: "Jo'natilmoqda...",
      transfer_success: "jo'natildi!",
      send_confirm: "jo'natilsinmi?",
      self_transfer_error: "O'zingizga jo'nata olmaysiz!",
      new_user: 'Yangi foydalanuvchi',
      no_data: "Ma'lumot yo'q",
      cancel_already: "Bu to'lov uchun so'rov yuborilgan!",
      cancel_requested: "Qaytarish so'rovi yuborildi!",
      you_are_banned: 'Siz bloklangansiz',
      banned: 'Bloklangan!',
      repeat: 'Takrorlash',
      cancel: 'Bekor qilish',
      
      // Dashboard uchun
      send: "Jo'natish",
      referral: 'Referral',
      buy: "Sotib olish",
      qr_pay: 'QR Pay',
      recent_transactions: "So'nggi tranzaksiyalar",
      no_transactions: 'Tranzaksiyalar mavjud emas',
      invite_friends: "Do'stlarni Taklif Qiling",
      referral_hint: "Do'stingiz havola orqali kirsa, siz <b style='color:var(--accent-green);'>+10 Vcoin</b> olasiz!",
      copy_link: 'Havoladan Nusxalash',
      copy_success: 'Havola nusxalandi!',
      refreshed: 'Yangilandi!',
      scanned: 'Skanerlashtirildi!',
      invalid_qr: 'Bu Vcoin QR kodi emas',
      invalid_format: "Noto'g'ri format",
      camera_error: 'Kamera ochilmadi. HTTPS kerak.',
      refunded: 'qaytarildi!',
      rejected: "So'rov rad etildi",
      day_deposit: 'kunlik',
      bonus: 'Bonus',
      transaction: 'Tranzaksiya',
      shop_opened: "Vcoin do'koni ochildi",
      admin_pin_prompt: 'Admin PIN kodini kiriting:',
      admin_welcome: 'Admin panelga xush kelibsiz!',
      wrong_pin: "Noto'g'ri PIN kod!",
      my_qr: 'Mening QR',
      scan_qr: 'Skanerlash',
      all: 'Barchasi',
      
      // Auth uchun
      notifications: 'Bildirishnomalar',
      no_notifications: "Hozircha bildirishnomalar yo'q",
      refund_request: "qaytarishni so'radi!",
      refund: 'Qaytarish',
      refund_done: 'qaytarildi!',
      close: 'Yopish',
      
      auth_subtitle: "Kripto to'lov tizimi",
      id_error: "ID 9 xonali raqam bo'lishi kerak",
      password_error: "Parol 4-6 xonali bo'lishi kerak",
      checking: "Tekshirilmoqda...",
      user_not_found: "Bunday ID topilmadi",
      wrong_nickname: "Nikname noto'g'ri",
      wrong_password: "Parol noto'g'ri",
      wrong_data: "Noto'g'ri ma'lumot!",
      welcome: "Xush kelibsiz",
      register_hint: "Nikname va Telegram username kiriting",
      nick_too_long: "Nikname ko'pi bilan 20 ta belgi",
      telegram_required: "Telegram username kiriting",
      telegram_taken: "Bu Telegram username band!",
      code_send_error: "Kod jo'natib bo'lmadi",
      code_sent: "Telegram ga 6 xonali kod yuborildi!",
      code_error: "6 xonali kodni kiriting",
      wrong_code: "Noto'g'ri kod!",
      welcome_bonus: "Xush kelibsiz bonus!",
      register_success: "Hisob yaratildi!",
      register_success_alert: "Hisob muvaffaqiyatli yaratildi!",
      save_password: "Parolingizni eslab qoling!",
      telegram_mismatch: "Telegram username mos kelmadi",
      recovery_sent: "Telegram ga tiklash paroli yuborildi!",
      recovery_send_error: "Xabar jo'natib bo'lmadi",
      recovery_text: "Akkauntingizni Tiklash Paroli",
      recovery_warning: "Iltimos, parolni hech kimga bermang!",
      recovery_ignore: "Agarda siz akkaunt tiklash bo'yicha so'rov yubormagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring!",
      recovery_code_required: "Tiklash parolini kiriting",
      wrong_recovery_code: "Noto'g'ri parol!",
      
      // Common
      error: 'Xatolik',
      success: 'Muvaffaqiyatli',
      warning: 'Ogohlantirish',
      loading: 'Yuklanmoqda...',
      save: 'Saqlash',
      edit: 'Tahrirlash',
      delete: "O'chirish",
      none: 'Hech qanday',
      yes: 'Ha',
      no: "Yo'q",
      all: 'Barchasi',
      close: 'Yopish'
    },
    en: {
      profile: 'Profile',
      nickname: 'Nickname',
      id: 'ID',
      balance: 'Balance',
      changeNick: 'Change Nickname',
      daysLeft: 'days until change',
      token: 'Token',
      tokenDesc: 'View payment token',
      history: 'History',
      historyDesc: 'All transactions',
      deposit: 'Deposits',
      depositDesc: 'Active and completed',
      download: 'Download Data',
      sync: 'Sync',
      sysInfo: 'System Info',
      commission: 'Commission',
      depositRate: 'Deposit Rate',
      totalUsers: 'Total Users',
      registered: 'Registered',
      danger: 'Danger Zone',
      clearData: 'Clear All Data',
      resetApp: 'Reset App',
      dangerWarn: 'These actions cannot be undone!',
      logout: 'Logout',
      logoutConfirm: 'Are you sure you want to logout?',
      logoutDone: 'Logged out ✅',
      syncStart: 'Syncing...',
      syncDone: 'Done!',
      syncError: 'Error',
      cloudError: 'Cloud not available',
      clearConfirm: 'All your data will be deleted! Continue?',
      clearDone: 'Cleared, reloading...',
      resetConfirm: 'App will be reset! Continue?',
      resetDone: 'Resetting...',
      nickError: 'Nickname must be 3-20 characters!',
      nickSame: 'This is your current nickname!',
      nickTaken: 'Nickname is taken!',
      nickChanged: 'Nickname changed: ',
      nickWait: 'Nick change in ',
      nickWait2: ' days',
      language: 'Language',
      daily: 'daily',
      version: 'Vcoin Payment App v3.0',
      
      // Dashboard uchun
      active_deposits: 'Active Deposits',
      new_deposit: 'New Deposit',
      duration: 'Duration',
      days: 'days',
      daily_profit: 'Daily Profit',
      total_profit: 'Total Profit',
      final_amount: 'Final Amount',
      deposit_warning: "You cannot withdraw until the deposit term ends!",
      deposit_button: 'Make Deposit',
      completed_deposits: 'Completed Deposits',
      days_left: 'days left',
      expiring: 'Expiring...',
      claim_button: 'Withdraw',
      enter_amount: 'Enter amount',
      login_required: "Please login",
      insufficient_balance: 'Insufficient balance',
      deposit_confirm: 'amount of ',
      deposit_confirm2: 'confirm deposit?',
      deposit_created: 'deposit created!',
      deposit_not_found: 'Deposit not found',
      deposit_closed: 'This deposit is already closed',
      deposit_not_ready: "Deposit term is not over yet. ",
      deposit_profit_desc: "Deposit profit: ",
      deposit_claimed: "added to your account!",
      
      // Transfer uchun
      send_vcoin: "Send Vcoin",
      recipient_id: 'Recipient ID',
      id_placeholder: '9-digit ID',
      receiver_gets: "Receiver gets",
      total: 'Total',
      send_button: "Send",
      sending: "Sending...",
      transfer_success: "sent!",
      send_confirm: "send?",
      self_transfer_error: "Cannot send to yourself!",
      new_user: 'New user',
      no_data: "No data",
      cancel_already: "Request already sent for this payment!",
      cancel_requested: "Refund request sent!",
      you_are_banned: 'You are banned',
      banned: 'Banned!',
      repeat: 'Repeat',
      cancel: 'Cancel',
      
      // Dashboard uchun
      send: "Send",
      referral: 'Referral',
      buy: "Buy",
      qr_pay: 'QR Pay',
      recent_transactions: "Recent Transactions",
      no_transactions: 'No transactions',
      invite_friends: "Invite Friends",
      referral_hint: "If your friend joins via link, you get <b style='color:var(--accent-green);'>+10 Vcoin</b>!",
      copy_link: 'Copy Link',
      copy_success: 'Link copied!',
      refreshed: 'Refreshed!',
      scanned: 'Scanned!',
      invalid_qr: 'This is not a Vcoin QR code',
      invalid_format: 'Invalid format',
      camera_error: 'Camera not opened. HTTPS required.',
      refunded: 'refunded!',
      rejected: 'Request rejected',
      day_deposit: 'daily',
      bonus: 'Bonus',
      transaction: 'Transaction',
      shop_opened: 'Vcoin shop opened',
      admin_pin_prompt: 'Enter Admin PIN:',
      admin_welcome: 'Welcome to Admin Panel!',
      wrong_pin: 'Wrong PIN!',
      my_qr: 'My QR',
      scan_qr: 'Scan QR',
      all: 'All',
      
      // Auth uchun
      notifications: 'Notifications',
      no_notifications: 'No notifications yet',
      refund_request: 'requested refund!',
      refund: 'Refund',
      refund_done: 'refunded!',
      close: 'Close',
      
      auth_subtitle: "Crypto Payment System",
      id_error: "ID must be 9 digits",
      password_error: "Password must be 4-6 digits",
      checking: "Checking...",
      user_not_found: "User not found",
      wrong_nickname: "Wrong nickname",
      wrong_password: "Wrong password",
      wrong_data: "Wrong data!",
      welcome: "Welcome",
      register_hint: "Enter nickname and Telegram username",
      nick_too_long: "Nickname max 20 characters",
      telegram_required: "Enter Telegram username",
      telegram_taken: "This Telegram username is taken!",
      code_send_error: "Failed to send code",
      code_sent: "6-digit code sent to Telegram!",
      code_error: "Enter 6-digit code",
      wrong_code: "Wrong code!",
      welcome_bonus: "Welcome bonus!",
      register_success: "Account created!",
      register_success_alert: "Account successfully created!",
      save_password: "Remember your password!",
      telegram_mismatch: "Telegram username doesn't match",
      recovery_sent: "Recovery code sent to Telegram!",
      recovery_send_error: "Failed to send recovery code",
      recovery_text: "Account Recovery Code",
      recovery_warning: "Please don't share this code with anyone!",
      recovery_ignore: "If you didn't request account recovery, ignore this message!",
      recovery_code_required: "Enter recovery code",
      wrong_recovery_code: "Wrong recovery code!",
      
      // Common
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      loading: 'Loading...',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      none: 'None',
      yes: 'Yes',
      no: 'No',
      all: 'All',
      close: 'Close'
    }
  },
  
  t: function(key) {
    if (this.data[this.current] && this.data[this.current][key]) {
      return this.data[this.current][key];
    }
    return this.data['uz'][key] || key;
  },
  
  setLang: function(lang) {
    if (this.data[lang]) {
      this.current = lang;
      localStorage.setItem('vcoin_lang', lang);
      return true;
    }
    return false;
  }
};

// ==================== SETTINGS MODULE ====================
var Settings = {
  render: async function(container) {
    var user = DB.getUser();
    if (!user) { UI.navigateTo('auth'); return; }
    var t = LANG.t.bind(LANG);
    
    var cloudSettings = { commission: 1, depositProfit: 5 };
    var cloudStats = { totalUsers: 0 };
    try {
      if (Cloud && Cloud.loadData) {
        var data = await Cloud.loadData();
        if (data && data.settings) cloudSettings = data.settings;
        if (data && data.users) cloudStats.totalUsers = Object.keys(data.users).length;
      }
    } catch(e) {
      cloudSettings = DB.getSettings ? DB.getSettings() : { commission: 1, depositProfit: 5 };
      cloudStats = DB.getStats ? DB.getStats() : { totalUsers: 0 };
    }

    var lastNickChange = DB.get('lastNickChange', null);
    var canChangeNick = true, daysLeft = 0;
    if (lastNickChange) {
      var daysSince = Math.floor((new Date() - new Date(lastNickChange)) / (1000 * 60 * 60 * 24));
      daysLeft = 14 - daysSince;
      if (daysLeft > 0) canChangeNick = false;
    }

    container.innerHTML = `
      <div class="fade-in">
        <!-- Profil karta -->
        <div class="glass-card" style="padding: 28px 20px; text-align: center; margin-bottom: 20px;
                    background: linear-gradient(145deg, #1c2333, #1a1f35); border: 1px solid rgba(74,144,217,0.15);">
          <div style="width: 72px; height: 72px; margin: 0 auto 16px; border-radius: 50%; 
                      background: var(--gradient-primary); display: flex; align-items: center; 
                      justify-content: center; font-size: 30px; font-weight: 700; color: #fff;
                      box-shadow: var(--glow-blue); position: relative;">
            ${user.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 style="font-size: 20px; margin-bottom: 4px;">${user.nickname || 'User'}</h2>
          <p style="color: var(--text-muted); font-size: 12px; margin-top: 4px; font-family: monospace;">${t('id')}: ${user.id || 'N/A'}</p>
          
          <button class="btn btn-outline btn-sm" onclick="Settings.changeNickname()" style="margin-top: 10px;">
            <i class="fas fa-edit"></i> ${t('changeNick')}
          </button>
          ${!canChangeNick ? '<p style="font-size: 10px; color: var(--accent-gold); margin-top: 4px;">⚠️ ' + daysLeft + ' ' + t('daysLeft') + '</p>' : ''}
          
          <div style="display: flex; justify-content: center; gap: 24px; margin-top: 12px;">
            <div>
              <div style="font-size: 18px; font-weight: 700; color: var(--accent-blue);">${Utils.formatNumber ? Utils.formatNumber(user.balance || 0) : (user.balance || 0)}</div>
              <div style="font-size: 10px; color: var(--text-muted);">${t('balance')}</div>
            </div>
          </div>
        </div>

        <!-- Til tanlash -->
        <div class="glass-card" style="padding: 16px; margin-bottom: 16px;">
          <h4 style="font-size: 13px; margin-bottom: 10px;"><i class="fas fa-globe" style="color: var(--accent-green);"></i> ${t('language')}</h4>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm" onclick="Settings.setLanguage('uz')" style="flex:1; ${LANG.current==='uz'?'background:var(--accent-blue);color:#fff;':'background:transparent;color:var(--text-muted);border:1px solid var(--border-color);'}">🇺🇿 O'zbek</button>
            <button class="btn btn-sm" onclick="Settings.setLanguage('en')" style="flex:1; ${LANG.current==='en'?'background:var(--accent-blue);color:#fff;':'background:transparent;color:var(--text-muted);border:1px solid var(--border-color);'}">🇬🇧 English</button>
          </div>
        </div>

        <!-- Menu itemlar -->
        <div class="glass-card" style="overflow: hidden; margin-bottom: 16px;">
          ${this.menuItem('token', 'fa-key', t('token'), t('tokenDesc'), 'var(--accent-gold)')}
          ${this.menuItem('history', 'fa-clock', t('history'), t('historyDesc'), 'var(--accent-blue)')}
          ${this.menuItem('deposit', 'fa-chart-line', t('deposit'), t('depositDesc'), 'var(--accent-purple)')}
        </div>

        <!-- Tugmalar -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
          <button class="btn btn-outline btn-sm" onclick="Settings.exportData()"><i class="fas fa-download"></i> ${t('download')}</button>
          <button class="btn btn-outline btn-sm" onclick="Settings.syncNow()"><i class="fas fa-sync"></i> ${t('sync')}</button>
        </div>

        <!-- Tizim ma'lumoti -->
        <div class="glass-card" style="padding: 16px; margin-bottom: 16px;">
          <h4 style="font-size: 13px; margin-bottom: 10px;"><i class="fas fa-info-circle" style="color: var(--accent-blue);"></i> ${t('sysInfo')}</h4>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-muted);">${t('commission')}</span><span>${cloudSettings.commission || 0}%</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-muted);">${t('depositRate')}</span><span>${cloudSettings.depositProfit || 5}% ${t('daily')}</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-muted);">${t('totalUsers')}</span><span>${cloudStats.totalUsers || 0}</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-muted);">${t('registered')}</span><span>${user.createdAt ? (Utils.formatDate ? Utils.formatDate(user.createdAt) : new Date(user.createdAt).toLocaleDateString()) : 'N/A'}</span></div>
          </div>
        </div>

        <!-- Xavfli hudud -->
        <div class="glass-card" style="padding: 16px; border: 1px solid rgba(255,59,48,0.2); margin-bottom: 16px;">
          <h4 style="font-size: 13px; margin-bottom: 10px; color: var(--accent-red);"><i class="fas fa-exclamation-triangle"></i> ${t('danger')}</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="btn btn-danger btn-sm w-full" onclick="Settings.clearData()"><i class="fas fa-trash"></i> ${t('clearData')}</button>
            <button class="btn btn-danger btn-sm w-full" onclick="Settings.resetApp()" style="background: rgba(255,59,48,0.3);"><i class="fas fa-power-off"></i> ${t('resetApp')}</button>
          </div>
          <p style="font-size: 10px; color: var(--text-muted); text-align: center; margin-top: 8px;">⚠️ ${t('dangerWarn')}</p>
        </div>

        <!-- Chiqish -->
        <button class="btn btn-danger w-full" onclick="Settings.logout()" style="gap: 8px;"><i class="fas fa-sign-out-alt"></i> ${t('logout')}</button>
        <p style="text-align: center; font-size: 10px; color: var(--text-muted); margin-top: 12px;">${t('version')}</p>
      </div>
    `;
  },

  // ============ TILNI O'ZGARTIRISH ============
  setLanguage: function(lang) {
    LANG.setLang(lang);
    // Sahifani qayta yuklash
    UI.navigateTo('settings');
    var t = LANG.t.bind(LANG);
    UI.showToast('✅ ' + t('language') + ' ' + (lang === 'uz' ? "O'zbek" : 'English') + ' tiliga o\'zgartirildi!', 'success');
  },

  changeNickname: function() {
    var t = LANG.t.bind(LANG);
    var user = DB.getUser(); if (!user) return;
    var lastNickChange = DB.get('lastNickChange', null);
    if (lastNickChange) {
      var daysSince = Math.floor((new Date() - new Date(lastNickChange)) / (1000 * 60 * 60 * 24));
      var daysLeft = 14 - daysSince;
      if (daysLeft > 0) { UI.showToast('⚠️ ' + t('nickWait') + daysLeft + t('nickWait2'), 'warning'); return; }
    }
    var newNick = prompt(t('changeNick'), user.nickname);
    if (!newNick || newNick.length < 3 || newNick.length > 20) { UI.showToast('⚠️ ' + t('nickError'), 'error'); return; }
    if (newNick === user.nickname) { UI.showToast('⚠️ ' + t('nickSame'), 'warning'); return; }
    var self = this;
    Cloud.getAllUsers().then(function(users) {
      for (var id in users) { if (users[id].nickname && users[id].nickname.toLowerCase() === newNick.toLowerCase()) { UI.showToast('⚠️ ' + t('nickTaken'), 'error'); return; } }
      user.nickname = newNick; DB.setUser(user); DB.saveUserToRegistry(user);
      DB.set('lastNickChange', new Date().toISOString());
      if (Cloud && Cloud.addUser) Cloud.addUser(user);
      UI.showToast('✅ ' + t('nickChanged') + newNick, 'success');
      setTimeout(function() { UI.navigateTo('settings'); }, 500);
    }).catch(function() { UI.showToast('❌ Cloud error', 'error'); });
  },

  menuItem: function(page, icon, title, desc, color) {
    return '<div onclick="UI.navigateTo(\''+page+'\')" style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer;">' +
      '<div style="width: 36px; height: 36px; border-radius: 50%; background: '+color+'20; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">' +
      '<i class="fas '+icon+'" style="color: '+color+';"></i></div>' +
      '<div style="flex: 1; min-width: 0;"><div style="font-weight: 500; font-size: 14px;">'+title+'</div><div style="font-size: 11px; color: var(--text-muted);">'+desc+'</div></div>' +
      '<i class="fas fa-chevron-right" style="color: var(--text-muted); font-size: 12px;"></i></div>';
  },

  logout: function() { 
    var t = LANG.t.bind(LANG);
    UI.confirm(t('logoutConfirm'), function() { DB.remove('user'); UI.showToast(t('logoutDone'), 'info'); setTimeout(function() { location.reload(); }, 800); }); 
  },
  
  syncNow: function() { 
    var t = LANG.t.bind(LANG);
    if (!Cloud || !Cloud.syncToLocal) { UI.showToast(t('cloudError'), 'error'); return; } 
    UI.showToast('🔄 ' + t('syncStart'), 'info'); 
    Cloud.syncToLocal().then(function() { UI.showToast('✅ ' + t('syncDone'), 'success'); UI.navigateTo('settings'); }).catch(function() { UI.showToast('❌ ' + t('syncError'), 'error'); }); 
  },
  
  clearData: function() { 
    var t = LANG.t.bind(LANG);
    UI.confirm('⚠️ ' + t('clearConfirm'), function() { localStorage.clear(); sessionStorage.clear(); UI.showToast(t('clearDone'), 'info'); setTimeout(function() { location.reload(); }, 1500); }); 
  },
  
  resetApp: function() { 
    var t = LANG.t.bind(LANG);
    UI.confirm('⚠️ ' + t('resetConfirm'), function() { localStorage.clear(); sessionStorage.clear(); document.cookie.split(';').forEach(function(c) { document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/'); }); UI.showToast(t('resetDone'), 'info'); setTimeout(function() { location.reload(); }, 1500); }); 
  }
};

var Profile = Settings;
window.Settings = Settings;