/* ============================================
   CLOUD MODULE - Backend bilan ishlash
   CONFIG.BACKEND_TYPE ga qarab ishlaydi
   ============================================ */

// CONFIG ni yuklash
var CONFIG = window.CONFIG || {};

// ===== BACKEND TURINI ANIQLASH =====
var BACKEND_TYPE = CONFIG.BACKEND_TYPE || 'cloud'; // 'local' yoki 'cloud'

var Cloud = {
  // ===== BACKEND SOZLAMALARI =====
  BACKEND_TYPE: BACKEND_TYPE,
  
  // Local backend
  LOCAL_URL: (CONFIG.LOCAL && CONFIG.LOCAL.URL) ? CONFIG.LOCAL.URL : 'http://localhost:3000/api/',
  
  // Cloud backend (JSONBin.io)
  BIN_ID: (CONFIG.CLOUD && CONFIG.CLOUD.BIN_ID) ? CONFIG.CLOUD.BIN_ID : '6a43ae2df5f4af5e29471fb8',
  MASTER_KEY: (CONFIG.CLOUD && CONFIG.CLOUD.MASTER_KEY) ? CONFIG.CLOUD.MASTER_KEY : '$2a$10$/r5j23KIs5ifP0fzwBCDDuDBTCegNBxm/T8loZCgwSqpuXv3AxYMy',
  CLOUD_URL: (CONFIG.CLOUD && CONFIG.CLOUD.URL) ? CONFIG.CLOUD.URL : 'https://api.jsonbin.io/v3/b/',

  // ============ MA'LUMOTLARNI YUKLASH ============
  loadData: async function() {
    try {
      var url, headers = {};
      
      if (this.BACKEND_TYPE === 'local') {
        url = this.LOCAL_URL + 'data';
        headers = { 'Content-Type': 'application/json' };
      } else {
        url = this.CLOUD_URL + this.BIN_ID + '/latest';
        headers = { 'X-Master-Key': this.MASTER_KEY };
      }
      
      
      var response = await fetch(url, { headers: headers });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      
      var data = await response.json();
      
      if (this.BACKEND_TYPE === 'local') {
        console.log('☁️ Local backend dan yuklandi ✅');
        // Local backend: { success: true, record: {...} }
        if (data && data.success && data.record) {
          return data.record;
        }
        return data;
      } else {
        console.log('☁️ Cloud dan yuklandi ✅');
        return data.record || null;
      }
    } catch(e) { 
      console.error('☁️ Yuklash xatosi:', e.message); 
      return null; 
    }
  },

  // ============ MA'LUMOTLARNI SAQLASH ============
  saveData: async function(record) {
    try {
      var cleanRecord = JSON.parse(JSON.stringify(record));
      var url, options;
      
      if (this.BACKEND_TYPE === 'local') {
        url = this.LOCAL_URL + 'data';
        options = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanRecord)
        };
      } else {
        url = this.CLOUD_URL + this.BIN_ID;
        options = {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json', 
            'X-Master-Key': this.MASTER_KEY 
          },
          body: JSON.stringify(cleanRecord)
        };
      }
      
      console.log('🔗 Saving data to:', url);
      
      var response = await fetch(url, options);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      
      var data = await response.json();
      
      if (this.BACKEND_TYPE === 'local') {
        console.log('☁️ Local backend ga saqlandi ✅');
        return data && data.success ? true : false;
      } else {
        console.log('☁️ Cloud ga saqlandi ✅');
        return true;
      }
    } catch(e) { 
      console.error('☁️ Saqlash xatosi:', e.message); 
      return false; 
    }
  },

  // ============ FOYDALANUVCHI FUNKSIYALARI ============
  
  addUser: async function(user) {
    try {
      if (this.BACKEND_TYPE === 'local') {
        var response = await fetch(this.LOCAL_URL + 'users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
        var result = await response.json();
        return result && result.success ? true : false;
      } else {
        var data = await this.loadData();
        if (!data) data = { users: {}, transactions: [], settings: { commission: 0 } };
        if (!data.users) data.users = {};
        
        data.users[user.id] = {
          id: user.id, 
          nickname: user.nickname || '', 
          balance: Number(user.balance) || 0,
          token: user.token || '', 
          password: user.password || null,
          telegram: user.telegram || '',
          referralLink: user.referralLink || '', 
          createdAt: user.createdAt || new Date().toISOString()
        };
        
        return await this.saveData(data);
      }
    } catch(e) {
      console.error('☁️ addUser xatosi:', e);
      return false;
    }
  },

  getUser: async function(userId) {
    try {
      if (this.BACKEND_TYPE === 'local') {
        var response = await fetch(this.LOCAL_URL + 'users/' + userId);
        if (!response.ok) return null;
        var result = await response.json();
        return result && result.success ? result.user : null;
      } else {
        var data = await this.loadData();
        if (!data || !data.users || !data.users[userId]) return null;
        var u = data.users[userId];
        u.balance = Number(u.balance) || 0;
        return u;
      }
    } catch(e) {
      console.error('☁️ getUser xatosi:', e);
      return null;
    }
  },

  updateUser: async function(userId, updates) {
    try {
      if (this.BACKEND_TYPE === 'local') {
        var data = await this.loadData();
        if (!data || !data.users || !data.users[userId]) return false;
        
        for (var k in updates) {
          if (updates.hasOwnProperty(k)) {
            data.users[userId][k] = updates[k];
          }
        }
        return await this.saveData(data);
      } else {
        var data = await this.loadData();
        if (!data || !data.users || !data.users[userId]) return false;
        
        for (var k in updates) {
          if (updates.hasOwnProperty(k)) {
            data.users[userId][k] = updates[k];
          }
        }
        return await this.saveData(data);
      }
    } catch(e) {
      console.error('☁️ updateUser xatosi:', e);
      return false;
    }
  },

  updateBalance: async function(userId, newBalance) {
    return await this.updateUser(userId, { balance: Number(newBalance) || 0 });
  },

  getAllUsers: async function() { 
    try {
      if (this.BACKEND_TYPE === 'local') {
        var response = await fetch(this.LOCAL_URL + 'users');
        var result = await response.json();
        return result && result.success ? result.users : {};
      } else {
        var data = await this.loadData(); 
        return (data && data.users) ? data.users : {}; 
      }
    } catch(e) {
      console.error('☁️ getAllUsers xatosi:', e);
      return {};
    }
  },

  // ============ TRANZAKSIYA FUNKSIYALARI ============
  
  getTransactions: async function() { 
    try {
      if (this.BACKEND_TYPE === 'local') {
        var response = await fetch(this.LOCAL_URL + 'transactions');
        var result = await response.json();
        return result && result.success ? result.transactions : [];
      } else {
        var data = await this.loadData(); 
        return (data && data.transactions) ? data.transactions : []; 
      }
    } catch(e) {
      console.error('☁️ getTransactions xatosi:', e);
      return [];
    }
  },

  addTransaction: async function(transaction) {
    try {
      if (this.BACKEND_TYPE === 'local') {
        var response = await fetch(this.LOCAL_URL + 'transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction)
        });
        var result = await response.json();
        return result && result.success ? true : false;
      } else {
        var data = await this.loadData();
        if (!data) data = { users: {}, transactions: [], settings: { commission: 0 } };
        if (!data.transactions) data.transactions = [];
        
        transaction.timestamp = transaction.timestamp || new Date().toISOString();
        transaction.id = transaction.id || 'TX' + Date.now().toString(36).toUpperCase();
        data.transactions.unshift(transaction);
        if (data.transactions.length > 50) data.transactions.length = 50;
        
        return await this.saveData(data);
      }
    } catch(e) {
      console.error('☁️ addTransaction xatosi:', e);
      return false;
    }
  },

  // ============ SETTINGS FUNKSIYALARI ============
  
  getSettings: async function() { 
    try {
      if (this.BACKEND_TYPE === 'local') {
        var response = await fetch(this.LOCAL_URL + 'settings');
        var result = await response.json();
        return result && result.success ? result.settings : { commission: 0 };
      } else {
        var data = await this.loadData(); 
        return (data && data.settings) ? data.settings : { commission: 0 }; 
      }
    } catch(e) {
      console.error('☁️ getSettings xatosi:', e);
      return { commission: 0 };
    }
  },

  updateSettings: async function(newSettings) {
    try {
      if (this.BACKEND_TYPE === 'local') {
        var response = await fetch(this.LOCAL_URL + 'settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSettings)
        });
        var result = await response.json();
        return result && result.success ? true : false;
      } else {
        var data = await this.loadData();
        if (!data) return false;
        data.settings = data.settings || {};
        for (var k in newSettings) {
          if (newSettings.hasOwnProperty(k)) {
            data.settings[k] = newSettings[k];
          }
        }
        return await this.saveData(data);
      }
    } catch(e) {
      console.error('☁️ updateSettings xatosi:', e);
      return false;
    }
  },

  // ============ TRANSFER ============
  
  transfer: async function(fromId, toId, amount) {
    amount = Number(amount);
    if (isNaN(amount) || amount <= 0) return { success: false, error: 'Noto\'g\'ri miqdor' };
    
    try {
      if (this.BACKEND_TYPE === 'local') {
        var response = await fetch(this.LOCAL_URL + 'transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromId, toId, amount })
        });
        var result = await response.json();
        return result;
      } else {
        var data = await this.loadData();
        if (!data || !data.users) return { success: false, error: 'Ma\'lumot topilmadi' };
        
        // === KOMMISSIYA HISOBLASH ===
        var commPercent = 0;
        if (data.userCommissions && typeof data.userCommissions[fromId] !== 'undefined') {
          commPercent = Number(data.userCommissions[fromId]);
        } else if (data.settings && typeof data.settings.commission !== 'undefined') {
          commPercent = Number(data.settings.commission);
        }
        if (isNaN(commPercent) || commPercent < 0) commPercent = 0;
        
        var commission = 0;
        var receiverAmount = amount;
        
        if (commPercent > 0) {
          commission = amount * commPercent / 100;
          receiverAmount = amount - commission;
          commission = Math.round(commission * 100) / 100;
          receiverAmount = Math.round(receiverAmount * 100) / 100;
        }
        
        var commTarget = DB.get('comissarId', null);
        
        console.log('💰 Transfer: ' + fromId + '(-' + amount + ') → ' + toId + '(+' + receiverAmount + ')');
        
        if (!data.users[fromId]) return { success: false, error: 'Jo\'natuvchi topilmadi' };
        
        data.users[fromId].balance = Number(data.users[fromId].balance) || 0;
        if (data.users[fromId].balance < amount) return { success: false, error: 'Balans yetarli emas' };
        
        if (!data.users[toId]) {
          data.users[toId] = { 
            id: toId, 
            nickname: 'User_' + toId.slice(-4), 
            balance: 0, 
            token: '', 
            password: null,
            createdAt: new Date().toISOString() 
          };
        }
        data.users[toId].balance = Number(data.users[toId].balance) || 0;
        
        // Balanslarni yangilash
        data.users[fromId].balance = data.users[fromId].balance - amount;
        data.users[toId].balance = data.users[toId].balance + receiverAmount;
        
        // Komissiyani setcomissar ID ga o'tkazish
        if (commTarget && data.users[commTarget] && commission > 0) {
          data.users[commTarget].balance = Number(data.users[commTarget].balance || 0) + commission;
          console.log('  💰 Commission → ' + commTarget + ' (+' + commission + ')');
        }
        
        // ===== BITTA MONITORING YOZUV =====
        if (!data.transactions) data.transactions = [];
        data.transactions.unshift({
          id: 'TX' + Date.now().toString(36).toUpperCase(),
          timestamp: new Date().toISOString(),
          fromId: fromId, 
          toId: toId, 
          commTarget: commTarget || '',
          amount: amount, 
          commission: commission, 
          receiverAmount: receiverAmount,
          type: 'transfer',
          description: data.users[fromId].nickname + ' → ' + data.users[toId].nickname
        });
        
        if (data.transactions.length > 50) data.transactions.length = 50;
        
        var saved = await this.saveData(data);
        return saved ? { 
          success: true, 
          commission: commission, 
          receiverAmount: receiverAmount 
        } : { 
          success: false, 
          error: 'Saqlashda xatolik' 
        };
      }
    } catch(e) {
      console.error('☁️ transfer xatosi:', e);
      return { success: false, error: 'Xatolik: ' + e.message };
    }
  },

  // ============ SINXRONLASH ============
  
  syncToLocal: async function() {
    console.log('🔄 Cloud sinxronlash...');
    try {
      var data = await this.loadData();
      if (!data) { 
        console.warn('☁️ Cloud bo\'sh, lokal ma\'lumotlar ishlatiladi'); 
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
        console.log('☁️ Joriy user yangilandi:', currentUser.nickname, currentUser.balance);
      }
      console.log('✅ Sinxronlash tugadi');
    } catch(e) {
      console.error('☁️ Sinxronlash xatosi:', e);
    }
  },

  // ============ TOZALASH ============
  
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