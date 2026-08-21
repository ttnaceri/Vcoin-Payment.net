/**
 * Vcoin Payment App — Main Application
 * Cloud sinxronlash bilan + Til qo'llab-quvvatlash
 * Tashqi to'lovlar setshopid ga tushadi
 * Tashqi saytlar Vcoin qo'sha oladi (add parametri)
 * Webhook qo'llab-quvvatlash (to'lovdan keyin xabar yuborish)
 * REFUND - Premium bekor qilish (Vcoin qaytarish)
 */

(function() {
  'use strict';

  async function initApp() {
    console.log('🚀 Vcoin Payment App starting...');
    
    // ============ 1. TILNI YUKLASH ============
    console.log('🌐 Loading language...');
    if (typeof LANG !== 'undefined' && LANG.loadLanguage) {
      var currentLang = LANG.loadLanguage();
      console.log('🌐 Language loaded:', currentLang);
    } else {
      
    }
    
    // ============ 2. ROUTER ============
    console.log('🔄 Initializing router...');
    Router.init();
    
    // ============ 3. UI ============
    console.log('🎨 Initializing UI...');
    UI.init();
    
    // ============ 4. CLOUD SINXRONLASH ============
    console.log('☁️ Cloud sync...');
    try {
      await Cloud.syncToLocal();
      console.log('✅ Cloud synced');
    } catch(e) {
      console.log('⚠️ Cloud sync error:', e.message);
    }
    
    // ============ 5. USER TEKSHIRISH ============
    if (DB.userExists()) {
      var user = DB.getUser();
      console.log('👤 User:', user.nickname, '| Balance:', user.balance);
      UI.navigateTo('dashboard');
    } else {
      console.log('🆕 No user found');
      UI.navigateTo('auth');
    }
    
    // ============ 6. URL PARAMETRLARNI TEKSHIRISH ============
    handlePaymentParams();
    
    console.log('✅ Vcoin Payment App ready');
  }
  
  // ============ TASHQI TO'LOV PARAMETRLARI ============
  function handlePaymentParams() {
    var params = Utils.getUrlParams ? Utils.getUrlParams() : {};
    
    console.log('🔍 URL parametrlar:', params);
    
    // ===== 1. VCOIN QO'SHISH (ADD) =====
    if (params.add && params.amount && params.token) {
      handleAddVcoin(params);
      return;
    }
    
    // ===== 2. VCOIN YECHIB OLISH (PAY/WITHDRAW) =====
    if (params.pay && params.amount && params.token) {
      handleWithdrawVcoin(params);
      return;
    }
    
    // ===== 3. REFUND - PREMIUM BEKOR QILISH (YANGI) =====
    if (params.refund && params.amount && params.token) {
      handleRefundVcoin(params);
      return;
    }
    
    // ===== 4. FAQAT TOKEN VA AMOUNT (ODDIY YECHIB OLISH) =====
    if (params.token && params.amount && !params.pay && !params.add && !params.refund) {
      handleSimpleWithdraw(params);
      return;
    }
  }
  
  // ============ VCOIN QO'SHISH (ADD) ============
  function handleAddVcoin(params) {
    var token = params.token;
    var amount = parseFloat(params.amount);
    var addTo = params.add || null;
    var note = params.note || 'Tashqi sayt orqali qo\'shish';
    
    console.log('➕ External add request:', { token, amount, addTo, note });
    
    var adminToken = DB.get('adminToken', null);
    
    if (!adminToken) {
      console.log('❌ Admin token sozlanmagan!');
      UI.showToast('❌ Admin token sozlanmagan!', 'error');
      clearUrlParams();
      return;
    }
    
    if (token !== adminToken) {
      console.log('❌ Admin token noto\'g\'ri! Kutilgan:', adminToken, 'Kiritilgan:', token);
      UI.showToast('❌ Admin token noto\'g\'ri!', 'error');
      clearUrlParams();
      return;
    }
    
    var userId = addTo;
    if (!userId) {
      console.log('❌ Qabul qiluvchi ID ko\'rsatilmagan!');
      UI.showToast('❌ Qabul qiluvchi ID ko\'rsatilmagan! (add=USER_ID)', 'error');
      clearUrlParams();
      return;
    }
    
    console.log('💰 Foydalanuvchiga qo\'shish:', userId, amount);
    
    var user = DB.getUserById(userId);
    if (user) {
      user.balance = (user.balance || 0) + amount;
      DB.saveUserToRegistry(user);
      console.log('💰 ' + amount + ' Vcoin ' + user.nickname + ' (' + userId + ') ga qo\'shildi ✅');
    } else {
      var newUser = {
        id: userId,
        nickname: 'User_' + userId.slice(-4),
        balance: amount,
        token: '',
        createdAt: new Date().toISOString()
      };
      DB.saveUserToRegistry(newUser);
      console.log('💰 Yangi foydalanuvchi yaratildi: ' + userId + ', balans: ' + amount);
    }
    
    DB.addTransaction({
      type: 'external_add',
      fromId: 'EXTERNAL',
      toId: userId,
      amount: amount,
      description: note + ' (Tashqi sayt orqali)',
      timestamp: new Date().toISOString()
    });
    
    UI.showToast('✅ ' + amount + ' Vcoin ' + userId + ' ga qo\'shildi!', 'success');
    
    sendWebhook({
      event: 'add_success',
      userId: userId,
      amount: amount,
      note: note,
      timestamp: new Date().toISOString()
    });
    
    clearUrlParams();
  }
  
  // ============ VCOIN YECHIB OLISH (PAY) ============
  function handleWithdrawVcoin(params) {
    var token = params.token;
    var amount = parseFloat(params.amount);
    var payTo = params.pay || null;
    var note = params.note || 'Tashqi to\'lov';
    
    console.log('💳 External payment request:', { token, amount, payTo, note });
    
    var user = DB.getUser();
    if (!user) {
      console.log('❌ Foydalanuvchi tizimga kirmagan');
      UI.showToast('❌ Tizimga kiring!', 'error');
      clearUrlParams();
      return;
    }
    
    console.log('👤 Foydalanuvchi:', user.id, user.nickname, 'Balans:', user.balance);
    
    if (user.token !== token) {
      console.log('❌ Token noto\'g\'ri! Kutilgan:', user.token, 'Kiritilgan:', token);
      UI.showToast('❌ Token noto\'g\'ri!', 'error');
      clearUrlParams();
      return;
    }
    
    if (user.balance < amount) {
      console.log('❌ Balans yetarli emas! Mavjud:', user.balance, 'Kerak:', amount);
      UI.showToast('❌ Balans yetarli emas! Mavjud: ' + user.balance + ' Vcoin', 'error');
      clearUrlParams();
      return;
    }
    
    // ===== USERDAN VCOIN YECHISH =====
    user.balance = user.balance - amount;
    DB.setUser(user);
    DB.saveUserToRegistry(user);
    console.log('💰 ' + amount + ' Vcoin ' + user.nickname + ' dan yechildi. Yangi balans:', user.balance);
    
    // ===== SHOP ID NI OLISH (setshopid) =====
    var shopId = DB.get('shopId', null);
    console.log('🏪 Shop ID (setshopid):', shopId || 'Yo\'q');
    
    // ===== VCOIN QAYERGA TUSHISHI =====
    var receiverId = shopId || payTo || user.id;
    console.log('📥 Qabul qiluvchi ID:', receiverId);
    
    var receiver = DB.getUserById(receiverId);
    if (receiver) {
      receiver.balance = (receiver.balance || 0) + amount;
      DB.saveUserToRegistry(receiver);
      console.log('💰 ' + amount + ' Vcoin ' + receiver.nickname + ' (' + receiverId + ') ga tushdi ✅');
    } else {
      var newUser = {
        id: receiverId,
        nickname: 'Shop_' + receiverId.slice(-4),
        balance: amount,
        token: '',
        createdAt: new Date().toISOString()
      };
      DB.saveUserToRegistry(newUser);
      console.log('💰 Yangi user yaratildi: ' + receiverId + ', balans: ' + amount);
    }
    
    // ===== TRANZAKSIYANI SAQLASH =====
    DB.addTransaction({
      type: 'external_payment',
      fromId: user.id,
      toId: receiverId,
      amount: amount,
      description: note + ' (Shop: ' + receiverId + ')',
      timestamp: new Date().toISOString()
    });
    
    var shopNick = receiver ? receiver.nickname : 'Shop_' + receiverId.slice(-4);
    UI.showToast('✅ ' + amount + ' Vcoin ' + shopNick + ' ga tushdi!', 'success');
    
    sendWebhook({
      event: 'payment_success',
      fromUserId: user.id,
      fromNickname: user.nickname,
      toUserId: receiverId,
      toNickname: shopNick,
      amount: amount,
      note: note,
      timestamp: new Date().toISOString()
    });
    
    clearUrlParams();
  }
  
  // ============ REFUND - PREMIUM BEKOR QILISH (YANGI) ============
  function handleRefundVcoin(params) {
    var token = params.token;
    var amount = parseFloat(params.amount);
    var refundTo = params.refund || null;
    var note = params.note || 'Premium bekor qilish (Refund)';
    var transactionId = params.tx || null;
    
    console.log('🔄 Refund request:', { token, amount, refundTo, note, transactionId });
    
    // Admin tokenni tekshirish
    var adminToken = DB.get('adminToken', null);
    
    if (!adminToken) {
      console.log('❌ Admin token sozlanmagan!');
      UI.showToast('❌ Admin token sozlanmagan!', 'error');
      clearUrlParams();
      return;
    }
    
    if (token !== adminToken) {
      console.log('❌ Admin token noto\'g\'ri! Kutilgan:', adminToken, 'Kiritilgan:', token);
      UI.showToast('❌ Admin token noto\'g\'ri!', 'error');
      clearUrlParams();
      return;
    }
    
    // Qabul qiluvchini aniqlash
    var userId = refundTo;
    if (!userId) {
      console.log('❌ Foydalanuvchi ID ko\'rsatilmagan!');
      UI.showToast('❌ Foydalanuvchi ID ko\'rsatilmagan! (refund=USER_ID)', 'error');
      clearUrlParams();
      return;
    }
    
    console.log('💰 Refund qilish:', userId, amount);
    
    // Foydalanuvchini topish
    var user = DB.getUserById(userId);
    if (user) {
      user.balance = (user.balance || 0) + amount;
      DB.saveUserToRegistry(user);
      console.log('💰 Refund: ' + amount + ' Vcoin ' + user.nickname + ' (' + userId + ') ga qaytarildi ✅');
    } else {
      console.log('❌ Foydalanuvchi topilmadi! ID: ' + userId);
      UI.showToast('❌ Foydalanuvchi topilmadi! ID: ' + userId, 'error');
      clearUrlParams();
      return;
    }
    
    // Tranzaksiyani saqlash
    DB.addTransaction({
      type: 'refund',
      fromId: 'ADMIN',
      toId: userId,
      amount: amount,
      description: note + ' (Refund)',
      timestamp: new Date().toISOString(),
      originalTx: transactionId
    });
    
    UI.showToast('✅ ' + amount + ' Vcoin ' + user.nickname + ' ga qaytarildi!', 'success');
    
    sendWebhook({
      event: 'refund_success',
      userId: userId,
      nickname: user.nickname,
      amount: amount,
      note: note,
      transactionId: transactionId,
      timestamp: new Date().toISOString()
    });
    
    clearUrlParams();
  }
  
  // ============ ODDIY YECHIB OLISH (FAQAT TOKEN + AMOUNT) ============
  function handleSimpleWithdraw(params) {
    var token = params.token;
    var amount = parseFloat(params.amount);
    var note = params.note || 'Oddiy yechib olish';
    
    console.log('💳 Simple withdraw:', { token, amount, note });
    
    var user = DB.getUser();
    if (!user) {
      console.log('❌ Foydalanuvchi tizimga kirmagan');
      UI.showToast('❌ Tizimga kiring!', 'error');
      clearUrlParams();
      return;
    }
    
    console.log('👤 Foydalanuvchi:', user.id, user.nickname, 'Balans:', user.balance);
    
    if (user.token !== token) {
      console.log('❌ Token noto\'g\'ri! Kutilgan:', user.token, 'Kiritilgan:', token);
      UI.showToast('❌ Token noto\'g\'ri!', 'error');
      clearUrlParams();
      return;
    }
    
    if (user.balance < amount) {
      console.log('❌ Balans yetarli emas! Mavjud:', user.balance, 'Kerak:', amount);
      UI.showToast('❌ Balans yetarli emas! Mavjud: ' + user.balance + ' Vcoin', 'error');
      clearUrlParams();
      return;
    }
    
    user.balance = user.balance - amount;
    DB.setUser(user);
    DB.saveUserToRegistry(user);
    console.log('💰 ' + amount + ' Vcoin ' + user.nickname + ' dan yechildi. Yangi balans:', user.balance);
    
    DB.addTransaction({
      type: 'withdraw',
      fromId: user.id,
      toId: 'EXTERNAL',
      amount: amount,
      description: note,
      timestamp: new Date().toISOString()
    });
    
    UI.showToast('✅ ' + amount + ' Vcoin yechib olindi!', 'success');
    
    sendWebhook({
      event: 'withdraw_success',
      userId: user.id,
      nickname: user.nickname,
      amount: amount,
      note: note,
      timestamp: new Date().toISOString()
    });
    
    clearUrlParams();
  }
  
  // ============ WEBHOOK YUBORISH ============
  function sendWebhook(data) {
    var webhookUrl = DB.get('webhookUrl', null);
    
    if (!webhookUrl) {
      console.log('ℹ️ Webhook sozlanmagan, xabar yuborilmadi');
      return;
    }
    
    console.log('📤 Webhook yuborilmoqda:', webhookUrl);
    console.log('📦 Data:', data);
    
    try {
      fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Source': 'Vcoin-Payment'
        },
        body: JSON.stringify(data)
      })
      .then(function(response) {
        console.log('✅ Webhook yuborildi! Status:', response.status);
      })
      .catch(function(error) {
        console.error('❌ Webhook xatosi:', error.message);
      });
    } catch(e) {
      console.error('❌ Webhook xatosi:', e.message);
    }
  }
  
  // ============ URL PARAMETRLARNI TOZALASH ============
  function clearUrlParams() {
    if (window.history && window.history.replaceState) {
      var cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();