/* ============================================
   LANG MODULE - Til boshqaruvi
   Faqat O'zbek va Ingliz tillari
   ============================================ */

(function() {
  'use strict';
  
  // DEFAULT LANGUAGE
  var DEFAULT_LANG = 'uz';
  
  // LANG obyekti
  var LANG = {
    current: DEFAULT_LANG,
    
    data: {
      uz: {
        // ===== AUTH =====
        auth: 'Vcoin',
        login: 'Kirish',
        register: "Ro'yxatdan o'tish",
        id: 'ID',
        nickname: 'Nikname',
        password: 'Parol',
        forgot_password: 'Parolni unutdingizmi?',
        new_account: 'Yangi akkaunt ochish',
        back: 'Orqaga',
        verify: 'Tasdiqlash',
        verify_code: 'Tasdiqlash kodi',
        send_code: 'Kod yuborish',
        confirm: 'Tasdiqlash',
        welcome: 'Xush kelibsiz!',
        login_success: 'Muvaffaqiyatli kirish!',
        register_success: "Ro'yxatdan o'tish muvaffaqiyatli!",
        
        // ===== DASHBOARD =====
        dashboard: 'Asosiy',
        balance: 'Balans',
        send: "Jo'natish",
        deposit: 'Depozit',
        token: 'Token',
        buy: "Sotib olish",
        qr_pay: 'QR Pay',
        history: 'Tarix',
        profile: 'Profil',
        settings: 'Sozlamalar',
        admin: 'Admin Panel',
        logout: 'Chiqish',
        refresh: 'Yangilash',
        recent_transactions: "So'nggi tranzaksiyalar",
        no_transactions: 'Tranzaksiyalar mavjud emas',
        active_deposits: 'Faol depozitlar',
        total_balance: 'Jami balans',
        
        // ===== TASK =====
        task: 'Topshiriq',
        
        // ===== TRANSFER =====
        send_vcoin: "Vcoin Jo'natish",
        recipient_id: 'Qabul qiluvchi ID',
        id_placeholder: '9 xonali ID',
        amount: 'Miqdor',
        commission: 'Komissiya',
        receiver_gets: 'Qabul qiluvchiga',
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
        
        // ===== DEPOSIT =====
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
        
        // ===== QR =====
        my_qr: 'Mening QR',
        scan_qr: 'Skanerlash',
        scanned: 'Skanerlashtirildi!',
        invalid_qr: 'Bu Vcoin QR kodi emas',
        invalid_format: "Noto'g'ri format",
        camera_error: 'Kamera ochilmadi. HTTPS kerak.',
        
        // ===== SETTINGS =====
        change_nick: "Nik o'zgartirish",
        days_left_change: 'kundan keyin o\'zgartira olasiz',
        token_desc: "To'lov tokenini ko'rish",
        history_desc: 'Barcha to\'lovlar',
        deposit_desc: 'Faol va tugagan depozitlar',
        download: "Ma'lumotlarni Yuklash",
        sync: 'Sinxronlash',
        sys_info: 'Tizim Ma\'lumoti',
        deposit_rate: 'Depozit stavkasi',
        total_users: 'Jami foydalanuvchilar',
        registered: "Ro'yxatdan o'tgan",
        danger: 'Xavfli Hudud',
        clear_data: 'Barcha Ma\'lumotlarni Tozalash',
        reset_app: 'Dasturni Qayta O\'rnatish',
        danger_warn: 'Bu amallar qaytarib bo\'lmaydi!',
        logout_confirm: 'Akkauntdan chiqishni xohlaysizmi?',
        logout_done: 'Akkauntdan chiqildi ✅',
        sync_start: 'Sinxronlash...',
        sync_done: 'Tugadi!',
        sync_error: 'Xatolik',
        cloud_error: 'Cloud mavjud emas',
        clear_confirm: 'Barcha ma\'lumotlaringiz o\'chiriladi! Davom etasizmi?',
        clear_done: 'Tozalandi, yangilanmoqda...',
        reset_confirm: 'Dastur qayta o\'rnatiladi! Davom etasizmi?',
        reset_done: 'Qayta o\'rnatilmoqda...',
        nick_error: 'Nikname 3-20 belgi bo\'lishi kerak!',
        nick_same: 'Bu sizning hozirgi niknameingiz!',
        nick_taken: 'Bu nikname band!',
        nick_changed: 'Nikname o\'zgartirildi: ',
        nick_wait: 'Nik o\'zgartirish uchun ',
        nick_wait2: ' kun kuting!',
        language: 'Til',
        daily: 'kunlik',
        version: 'Vcoin Payment App v3.0',
        
        // ===== NOTIFICATIONS =====
        notifications: 'Bildirishnomalar',
        no_notifications: "Hozircha bildirishnomalar yo'q",
        refund_request: "qaytarishni so'radi!",
        refund: 'Qaytarish',
        refund_done: 'qaytarildi!',
        refunded: 'qaytarildi!',
        rejected: "So'rov rad etildi",
        close: 'Yopish',
        
        // ===== SHARED =====
        all: 'Barchasi',
        yes: 'Ha',
        no: "Yo'q",
        error: 'Xatolik',
        success: 'Muvaffaqiyatli',
        warning: 'Ogohlantirish',
        loading: 'Yuklanmoqda...',
        save: 'Saqlash',
        edit: 'Tahrirlash',
        delete: "O'chirish",
        none: 'Hech qanday',
        
        // ===== ADMIN =====
        admin_pin_prompt: 'Admin PIN kodini kiriting:',
        admin_welcome: 'Admin panelga xush kelibsiz!',
        wrong_pin: "Noto'g'ri PIN kod!",
        admin_commands: 'Buyruqlar',
        admin_help: 'Yordam',
        admin_balance: 'Balans',
        admin_users: 'Foydalanuvchilar',
        admin_settings: 'Sozlamalar',
        
        // ===== SHOP =====
        shop_opened: "Vcoin do'koni ochildi",
        bonus: 'Bonus',
        transaction: 'Tranzaksiya',
        day_deposit: 'kunlik',
        
        // ===== COMMON =====
        refresh_success: 'Yangilandi!',
        
        // ===== AUTH SUBTITLE =====
        auth_subtitle: "Kripto to'lov tizimi",
        id_error: "ID 9 xonali raqam bo'lishi kerak",
        password_error: "Parol 4-6 xonali bo'lishi kerak",
        checking: "Tekshirilmoqda...",
        user_not_found: "Bunday ID topilmadi",
        wrong_nickname: "Nikname noto'g'ri",
        wrong_password: "Parol noto'g'ri",
        wrong_data: "Noto'g'ri ma'lumot!",
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
        terms: "Davom etish orqali foydalanish shartlariga rozilik bildirasiz",
        verify_hint: 'Telegram bot orqali kod yuborildi',
        verify_hint2: 'Kodni kiriting',
        verify_password: 'Yangi parol (4-6 xonali)',
        balance_placeholder: 'Balans (Vcoin)',
        id_placeholder: 'ID (9 xonalik)'
      },
      en: {
        // ===== AUTH =====
        auth: 'Vcoin',
        login: 'Login',
        register: 'Register',
        id: 'ID',
        nickname: 'Nickname',
        password: 'Password',
        forgot_password: 'Forgot password?',
        new_account: 'Create new account',
        back: 'Back',
        verify: 'Verify',
        verify_code: 'Verification code',
        send_code: 'Send code',
        confirm: 'Confirm',
        welcome: 'Welcome!',
        login_success: 'Login successful!',
        register_success: 'Registration successful!',
        
        // ===== DASHBOARD =====
        dashboard: 'Dashboard',
        balance: 'Balance',
        send: 'Send',
        deposit: 'Deposit',
        token: 'Token',
        buy: 'Buy',
        qr_pay: 'QR Pay',
        history: 'History',
        profile: 'Profile',
        settings: 'Settings',
        admin: 'Admin Panel',
        logout: 'Logout',
        refresh: 'Refresh',
        recent_transactions: 'Recent Transactions',
        no_transactions: 'No transactions yet',
        active_deposits: 'Active Deposits',
        total_balance: 'Total Balance',
        
        // ===== TASK =====
        task: 'Tasks',
        
        // ===== TRANSFER =====
        send_vcoin: 'Send Vcoin',
        recipient_id: 'Recipient ID',
        id_placeholder: '9-digit ID',
        amount: 'Amount',
        commission: 'Commission',
        receiver_gets: 'Receiver gets',
        total: 'Total',
        send_button: 'Send',
        sending: 'Sending...',
        transfer_success: 'sent!',
        send_confirm: 'send?',
        self_transfer_error: 'Cannot send to yourself!',
        new_user: 'New user',
        no_data: 'No data',
        cancel_already: 'Request already sent for this payment!',
        cancel_requested: 'Refund request sent!',
        you_are_banned: 'You are banned',
        banned: 'Banned!',
        repeat: 'Repeat',
        cancel: 'Cancel',
        
        // ===== DEPOSIT =====
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
        login_required: 'Please login',
        insufficient_balance: 'Insufficient balance',
        deposit_confirm: 'amount of ',
        deposit_confirm2: 'confirm deposit?',
        deposit_created: 'deposit created!',
        deposit_not_found: 'Deposit not found',
        deposit_closed: 'This deposit is already closed',
        deposit_not_ready: "Deposit term is not over yet. ",
        deposit_profit_desc: 'Deposit profit: ',
        deposit_claimed: 'added to your account!',
        
        // ===== QR =====
        my_qr: 'My QR',
        scan_qr: 'Scan QR',
        scanned: 'Scanned!',
        invalid_qr: 'This is not a Vcoin QR code',
        invalid_format: 'Invalid format',
        camera_error: 'Camera not opened. HTTPS required.',
        
        // ===== SETTINGS =====
        change_nick: 'Change Nickname',
        days_left_change: 'days until change',
        token_desc: 'View payment token',
        history_desc: 'All transactions',
        deposit_desc: 'Active and completed',
        download: 'Download Data',
        sync: 'Sync',
        sys_info: 'System Info',
        deposit_rate: 'Deposit Rate',
        total_users: 'Total Users',
        registered: 'Registered',
        danger: 'Danger Zone',
        clear_data: 'Clear All Data',
        reset_app: 'Reset App',
        danger_warn: 'These actions cannot be undone!',
        logout_confirm: 'Are you sure you want to logout?',
        logout_done: 'Logged out ✅',
        sync_start: 'Syncing...',
        sync_done: 'Done!',
        sync_error: 'Error',
        cloud_error: 'Cloud not available',
        clear_confirm: 'All your data will be deleted! Continue?',
        clear_done: 'Cleared, reloading...',
        reset_confirm: 'App will be reset! Continue?',
        reset_done: 'Resetting...',
        nick_error: 'Nickname must be 3-20 characters!',
        nick_same: 'This is your current nickname!',
        nick_taken: 'Nickname is taken!',
        nick_changed: 'Nickname changed: ',
        nick_wait: 'Nick change in ',
        nick_wait2: ' days',
        language: 'Language',
        daily: 'daily',
        version: 'Vcoin Payment App v3.0',
        
        // ===== NOTIFICATIONS =====
        notifications: 'Notifications',
        no_notifications: 'No notifications yet',
        refund_request: 'requested refund!',
        refund: 'Refund',
        refund_done: 'refunded!',
        refunded: 'refunded!',
        rejected: 'Request rejected',
        close: 'Close',
        
        // ===== SHARED =====
        all: 'All',
        yes: 'Yes',
        no: 'No',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        loading: 'Loading...',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        none: 'None',
        
        // ===== ADMIN =====
        admin_pin_prompt: 'Enter Admin PIN:',
        admin_welcome: 'Welcome to Admin Panel!',
        wrong_pin: 'Wrong PIN!',
        admin_commands: 'Commands',
        admin_help: 'Help',
        admin_balance: 'Balance',
        admin_users: 'Users',
        admin_settings: 'Settings',
        
        // ===== SHOP =====
        shop_opened: 'Vcoin shop opened',
        bonus: 'Bonus',
        transaction: 'Transaction',
        day_deposit: 'daily',
        
        // ===== COMMON =====
        refresh_success: 'Refreshed!',
        
        // ===== AUTH SUBTITLE =====
        auth_subtitle: "Crypto Payment System",
        id_error: "ID must be 9 digits",
        password_error: "Password must be 4-6 digits",
        checking: "Checking...",
        user_not_found: "User not found",
        wrong_nickname: "Wrong nickname",
        wrong_password: "Wrong password",
        wrong_data: "Wrong data!",
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
        terms: "By continuing you agree to the terms of use",
        verify_hint: 'Code sent via Telegram bot',
        verify_hint2: 'Enter code',
        verify_password: 'New password (4-6 digits)',
        balance_placeholder: 'Balance (Vcoin)',
        id_placeholder: 'ID (9 digits)'
      }
    },
    
    // ===== TARJIMA OLISH =====
    t: function(key) {
      if (!key) return key;
      var langData = this.data[this.current];
      if (langData && langData[key] !== undefined) {
        return langData[key];
      }
      var defaultData = this.data[DEFAULT_LANG];
      return (defaultData && defaultData[key] !== undefined) ? defaultData[key] : key;
    },
    
    // ===== TILNI O'ZGARTIRISH =====
    setLang: function(lang) {
      if (!lang || !this.data[lang]) {
        console.warn('⚠️ Language not supported:', lang);
        return false;
      }
      this.current = lang;
      try {
        localStorage.setItem('vcoin_lang', lang);
      } catch(e) {
        console.warn('⚠️ Could not save language to localStorage:', e);
      }
      this.updateUI();
      console.log('🌐 Language changed to:', lang);
      return true;
    },
    
    // ===== UI NI YANGILASH =====
    updateUI: function() {
      try {
        // 1. data-i18n atributi bo'lgan elementlar
        var elements = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < elements.length; i++) {
          var el = elements[i];
          var key = el.getAttribute('data-i18n');
          if (key) {
            el.textContent = this.t(key);
          }
        }
        
        // 2. Placeholderlar
        var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        for (var j = 0; j < placeholders.length; j++) {
          var el = placeholders[j];
          var key = el.getAttribute('data-i18n-placeholder');
          if (key) {
            el.placeholder = this.t(key);
          }
        }
        
        // 3. Title attributlari
        var titles = document.querySelectorAll('[data-i18n-title]');
        for (var k = 0; k < titles.length; k++) {
          var el = titles[k];
          var key = el.getAttribute('data-i18n-title');
          if (key) {
            el.title = this.t(key);
          }
        }
        
        // 4. Bottom nav
        var bottomNav = document.getElementById('bottomNav');
        if (bottomNav) {
          var navLabels = bottomNav.querySelectorAll('[data-i18n]');
          for (var l = 0; l < navLabels.length; l++) {
            var el = navLabels[l];
            var key = el.getAttribute('data-i18n');
            if (key) {
              el.textContent = this.t(key);
            }
          }
        }
        
        // 5. Joriy sahifani yangilash
        if (typeof Router !== 'undefined' && Router.getCurrentPage) {
          var currentPage = Router.getCurrentPage();
          if (currentPage && typeof UI !== 'undefined' && UI.navigateTo) {
            UI.navigateTo(currentPage);
          }
        }
      } catch(e) {
        console.warn('⚠️ UI update error:', e.message);
      }
    },
    
    // ===== TILNI YUKLASH =====
    loadLanguage: function() {
      try {
        var saved = localStorage.getItem('vcoin_lang');
        if (saved && this.data[saved]) {
          this.current = saved;
        } else {
          this.current = DEFAULT_LANG;
          try {
            localStorage.setItem('vcoin_lang', DEFAULT_LANG);
          } catch(e) {}
        }
      } catch(e) {
        this.current = DEFAULT_LANG;
      }
      
      this.updateUI();
      console.log('🌐 Language loaded:', this.current);
      return this.current;
    },
    
    // ===== JORIY TILNI OLISH =====
    getCurrent: function() {
      return this.current;
    }
  };
  
  // ===== GLOBAL QILISH =====
  window.LANG = LANG;
  
  // ===== AVTOMATIK YUKLASH =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      LANG.loadLanguage();
    });
  } else {
    LANG.loadLanguage();
  }
  
  console.log('✅ LANG module loaded successfully!');
  console.log('🌐 Current language:', LANG.current);
  console.log('🔍 loadLanguage type:', typeof LANG.loadLanguage);
  console.log('🔍 LANG object keys:', Object.keys(LANG));
  
})(); 