/* ============================================
   CLOUD MODULE - Backend bilan ishlash
   Faqat Local backend (backend.json) ishlatiladi
   JSONBin.io O'CHIRILDI
   ============================================ */

// CONFIG ni yuklash
var CONFIG = window.CONFIG || {};

var Cloud = {
  // ===== BACKEND SOZLAMALARI =====
  BACKEND_TYPE: 'local',
  
  // Local backend
  LOCAL_URL: (CONFIG.LOCAL && CONFIG.LOCAL.URL) ? CONFIG.LOCAL.URL : 'http://localhost:3000/api/',
  
  // ===== Ma'lumotlar kesh =====
  _cache: null,
  _cacheTime: 0,
  _cacheDuration: 60000, // 1 daqiqa

  // ============================================================
  // 1. MA'LUMOTLARNI YUKLASH
  // ============================================================
  loadData: async function(forceRefresh) {
    forceRefresh = forceRefresh || false;
    
    // Keshdan olish
    if (!forceRefresh && this._cache && (Date.now() - this._cacheTime) < this._cacheDuration) {
      console.log('📦 Keshlangan ma\'lumotlar ishlatilmoqda');
      return this._cache;
    }
    
    try {
      var url = this.LOCAL_URL + 'data';
      var headers = { 'Content-Type': 'application/json' };
      
      console.log('📥 Yuklanmoqda:', url);
      
      var response = await fetch(url, { headers: headers });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('⚠️ Backend topilmadi (404), lokal ma\'lumotlar ishlatiladi');
          return this._getLocalFallback();
        }
        throw new Error('HTTP ' + response.status);
      }
      
      var data = await response.json();
      console.log('✅ Local backend dan yuklandi');
      
      // ===== DATA FORMATINI TO'G'RILASH =====
      var result = null;
      
      // Format 1: { success: true, record: {...} }
      if (data && data.success && data.record) {
        result = data.record;
      }
      // Format 2: { success: true, users: {...}, transactions: [...] }
      else if (data && data.success && data.users) {
        result = {
          users: data.users || {},
          transactions: data.transactions || [],
          settings: data.settings || { commission: 0 }
        };
      }
      // Format 3: { users: {...}, transactions: [...] } (to'g'ridan-to'g'ri)
      else if (data && data.users) {
        result = data;
      }
      // Format 4: { record: {...} }
      else if (data && data.record) {
        result = data.record;
      }
      // Format 5: Boshqa format
      else {
        console.warn('⚠️ Backend dan kutilmagan format:', data);
        result = this._getLocalFallback();
      }
      
      // Keshga saqlash
      if (result) {
        this._cache = result;
        this._cacheTime = Date.now();
      }
      
      return result;
      
    } catch(e) { 
      console.error('❌ Yuklash xatosi:', e.message);
      return this._getLocalFallback();
    }
  },
  
  // ===== Lokal fallback =====
  _getLocalFallback: function() {
    try {
      var allUsers = DB.get('allUsers', {});
      var transactions = DB.get('transactions', []);
      var settings = DB.get('settings', { commission: 0 });
      
      var data = {
        users: allUsers,
        transactions: transactions,
        settings: settings
      };
      
      console.log('📦 Lokal storage dan ma\'lumotlar olindi');
      return data;
    } catch(e) {
      console.error('❌ Lokal fallback xatosi:', e);
      return { users: {}, transactions: [], settings: { commission: 0 } };
    }
  },

  // ============================================================
  // 2. MA'LUMOTLARNI SAQLASH
  // ============================================================
  saveData: async function(record) {
    try {
      var cleanRecord = JSON.parse(JSON.stringify(record));
      var url = this.LOCAL_URL + 'data';
      var options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanRecord)
      };
      
      console.log('💾 Saqlanmoqda:', url);
      
      var response = await fetch(url, options);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('⚠️ Backend topilmadi (404), lokalga saqlanadi');
          this._saveToLocal(record);
          return true;
        }
        throw new Error('HTTP ' + response.status);
      }
      
      var data = await response.json();
      console.log('✅ Local backend ga saqlandi');
      
      // Keshni yangilash
      this._cache = record;
      this._cacheTime = Date.now();
      
      // Lokalga ham saqlash
      this._saveToLocal(record);
      
      // Ba'zi backendlarda success maydoni bo'lmasligi mumkin
      if (data && data.success === false) {
        return false;
      }
      
      return true;
      
    } catch(e) { 
      console.error('❌ Saqlash xatosi:', e.message);
      this._saveToLocal(record);
      return true;
    }
  },
  
  // ===== Lokal storage ga saqlash =====
  _saveToLocal: function(record) {
    try {
      if (record.users) {
        DB.set('allUsers', record.users);
      }
      if (record.transactions) {
        DB.set('transactions', record.transactions);
      }
      if (record.settings) {
        DB.set('settings', record.settings);
      }
      console.log('💾 Lokal storage ga saqlandi');
    } catch(e) {
      console.error('❌ Lokal saqlash xatosi:', e);
    }
  },

  // ============================================================
  // 3. FOYDALANUVCHI FUNKSIYALARI
  // ============================================================
  
  addUser: async function(user) {
    try {
      // 1. Backend ga saqlash
      var response = await fetch(this.LOCAL_URL + 'users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      
      // 2. Lokalga saqlash
      DB.saveUserToRegistry(user);
      
      if (!response.ok) {
        console.warn('⚠️ Backend xatosi, lokalga saqlandi');
        return true;
      }
      
      var result = await response.json();
      return result && result.success !== false;
      
    } catch(e) {
      console.error('❌ addUser xatosi:', e);
      DB.saveUserToRegistry(user);
      return true;
    }
  },

  getUser: async function(userId) {
    try {
      var response = await fetch(this.LOCAL_URL + 'users/' + userId);
      if (!response.ok) {
        console.warn('⚠️ Backend xatosi, lokal dan olinadi');
        return DB.getUserById(userId);
      }
      var result = await response.json();
      return result && result.success ? result.user : null;
    } catch(e) {
      console.error('❌ getUser xatosi:', e);
      return DB.getUserById(userId);
    }
  },

  updateUser: async function(userId, updates) {
    try {
      // 1. Backend dan ma'lumot olish
      var data = await this.loadData();
      
      // 2. Agar backend da bo'lmasa, lokal dan yangilash
      if (!data || !data.users || !data.users[userId]) {
        DB.updateUserInRegistry(userId, updates);
        return true;
      }
      
      // 3. Yangilash
      for (var k in updates) {
        if (updates.hasOwnProperty(k)) {
          data.users[userId][k] = updates[k];
        }
      }
      
      // 4. Backend ga saqlash
      var saved = await this.saveData(data);
      
      // 5. Lokal ga yangilash
      DB.updateUserInRegistry(userId, updates);
      
      // 6. Joriy user bo'lsa yangilash
      var currentUser = DB.getUser();
      if (currentUser && currentUser.id === userId) {
        for (var key in updates) {
          currentUser[key] = updates[key];
        }
        DB.set('user', currentUser);
      }
      
      return saved;
      
    } catch(e) {
      console.error('❌ updateUser xatosi:', e);
      DB.updateUserInRegistry(userId, updates);
      return false;
    }
  },

  updateBalance: async function(userId, newBalance) {
    return await this.updateUser(userId, { balance: Number(newBalance) || 0 });
  },

  getAllUsers: async function() { 
    try {
      var response = await fetch(this.LOCAL_URL + 'users');
      if (!response.ok) {
        console.warn('⚠️ Backend xatosi, lokal dan olinadi');
        return DB.get('allUsers', {});
      }
      var result = await response.json();
      
      if (result && result.success && result.users) {
        DB.set('allUsers', result.users);
        return result.users;
      }
      
      return DB.get('allUsers', {});
      
    } catch(e) {
      console.error('❌ getAllUsers xatosi:', e);
      return DB.get('allUsers', {});
    }
  },

  // ============================================================
  // 4. TRANZAKSIYA FUNKSIYALARI
  // ============================================================
  
  getTransactions: async function() { 
    try {
      var response = await fetch(this.LOCAL_URL + 'transactions');
      if (!response.ok) {
        console.warn('⚠️ Backend xatosi, lokal dan olinadi');
        return DB.get('transactions', []);
      }
      var result = await response.json();
      
      if (result && result.success && result.transactions) {
        DB.set('transactions', result.transactions);
        return result.transactions;
      }
      
      return DB.get('transactions', []);
      
    } catch(e) {
      console.error('❌ getTransactions xatosi:', e);
      return DB.get('transactions', []);
    }
  },

  addTransaction: async function(transaction) {
    try {
      var response = await fetch(this.LOCAL_URL + 'transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      });
      
      DB.addTransaction(transaction);
      
      if (!response.ok) {
        console.warn('⚠️ Backend xatosi, lokalga saqlandi');
        return true;
      }
      
      var result = await response.json();
      return result && result.success !== false;
      
    } catch(e) {
      console.error('❌ addTransaction xatosi:', e);
      DB.addTransaction(transaction);
      return true;
    }
  },

  // ============================================================
  // 5. SETTINGS FUNKSIYALARI
  // ============================================================
  
  getSettings: async function() { 
    try {
      var response = await fetch(this.LOCAL_URL + 'settings');
      if (!response.ok) {
        console.warn('⚠️ Backend xatosi, lokal dan olinadi');
        return DB.get('settings', { commission: 0 });
      }
      var result = await response.json();
      
      if (result && result.success && result.settings) {
        DB.set('settings', result.settings);
        return result.settings;
      }
      
      return DB.get('settings', { commission: 0 });
      
    } catch(e) {
      console.error('❌ getSettings xatosi:', e);
      return DB.get('settings', { commission: 0 });
    }
  },

  updateSettings: async function(newSettings) {
    try {
      var response = await fetch(this.LOCAL_URL + 'settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      
      DB.updateSettings(newSettings);
      
      if (!response.ok) {
        console.warn('⚠️ Backend xatosi, lokalga saqlandi');
        return true;
      }
      
      var result = await response.json();
      return result && result.success !== false;
      
    } catch(e) {
      console.error('❌ updateSettings xatosi:', e);
      DB.updateSettings(newSettings);
      return true;
    }
  },

  // ============================================================
  // 6. TRANSFER
  // ============================================================
  
  transfer: async function(fromId, toId, amount) {
    amount = Number(amount);
    if (isNaN(amount) || amount <= 0) return { success: false, error: 'Noto\'g\'ri miqdor' };
    
    try {
      var response = await fetch(this.LOCAL_URL + 'transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId, toId, amount })
      });
      
      if (!response.ok) {
        console.warn('⚠️ Backend xatosi, lokal transfer bajariladi');
        return this._localTransfer(fromId, toId, amount);
      }
      
      var result = await response.json();
      return result;
      
    } catch(e) {
      console.error('❌ transfer xatosi:', e);
      return this._localTransfer(fromId, toId, amount);
    }
  },
  
  // ===== Lokal transfer =====
  _localTransfer: function(fromId, toId, amount) {
    try {
      var fromUser = DB.getUserById(fromId);
      var toUser = DB.getUserById(toId);
      
      if (!fromUser) return { success: false, error: 'Jo\'natuvchi topilmadi' };
      if (fromUser.balance < amount) return { success: false, error: 'Balans yetarli emas' };
      
      fromUser.balance = (fromUser.balance || 0) - amount;
      DB.saveUserToRegistry(fromUser);
      
      if (toUser) {
        toUser.balance = (toUser.balance || 0) + amount;
        DB.saveUserToRegistry(toUser);
      } else {
        var newUser = {
          id: toId,
          nickname: 'User_' + toId.slice(-4),
          balance: amount,
          token: '',
          createdAt: new Date().toISOString()
        };
        DB.saveUserToRegistry(newUser);
      }
      
      DB.addTransaction({
        type: 'transfer',
        fromId: fromId,
        toId: toId,
        amount: amount,
        description: fromUser.nickname + ' → ' + (toUser ? toUser.nickname : 'User_' + toId.slice(-4)),
        timestamp: new Date().toISOString()
      });
      
      var currentUser = DB.getUser();
      if (currentUser && currentUser.id === fromId) {
        currentUser.balance = fromUser.balance;
        DB.set('user', currentUser);
      }
      
      console.log('✅ Lokal transfer bajarildi');
      return { success: true, commission: 0, receiverAmount: amount };
      
    } catch(e) {
      console.error('❌ Lokal transfer xatosi:', e);
      return { success: false, error: 'Lokal transfer xatosi: ' + e.message };
    }
  },

  // ============================================================
  // 7. SINXRONLASH
  // ============================================================
  
  syncToLocal: async function() {
    console.log('🔄 Local backend sinxronlash...');
    try {
      var data = await this.loadData(true);
      if (!data) { 
        console.warn('⚠️ Backend bo\'sh, lokal ma\'lumotlar ishlatiladi'); 
        return; 
      }
      
      if (data.users) { 
        for (var id in data.users) { 
          data.users[id].balance = Number(data.users[id].balance) || 0; 
        } 
        DB.set('allUsers', data.users); 
      }
      
      if (data.transactions) DB.set('transactions', data.transactions);
      if (data.settings) DB.set('settings', data.settings);
      
      var currentUser = DB.getUser();
      if (currentUser && data.users && data.users[currentUser.id]) {
        currentUser.balance = Number(data.users[currentUser.id].balance) || 0;
        currentUser.nickname = data.users[currentUser.id].nickname;
        if (data.users[currentUser.id].password !== undefined) {
          currentUser.password = data.users[currentUser.id].password;
        }
        if (data.users[currentUser.id].telegram !== undefined) {
          currentUser.telegram = data.users[currentUser.id].telegram;
        }
        DB.set('user', currentUser);
        console.log('✅ Joriy user yangilandi:', currentUser.nickname, currentUser.balance);
      }
      console.log('✅ Sinxronlash tugadi');
    } catch(e) {
      console.error('❌ Sinxronlash xatosi:', e);
    }
  },

  // ============================================================
  // 8. TOZALASH
  // ============================================================
  
  clearCloud: async function() { 
    return await this.saveData({ 
      users: {}, 
      transactions: [], 
      settings: { commission: 0 } 
    }); 
  }
};

// ============ AVTOMATIK SINXRONLASH ============
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() { 
    Cloud.syncToLocal(); 
  }, 2000);
});

// Global qilish
if (typeof window !== 'undefined') {
  window.Cloud = Cloud;
}
