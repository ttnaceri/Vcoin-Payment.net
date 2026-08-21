/* ============================================
   CLOUD MODULE - Backend bilan ishlash
   Faqat Local backend (backend.json) ishlatiladi
   JSONBin.io O'CHIRILDI
   ============================================ */

// CONFIG ni yuklash
var CONFIG = window.CONFIG || {};

var Cloud = {
  // ===== BACKEND SOZLAMALARI =====
  BACKEND_TYPE: 'local', // Faqat local ishlatiladi
  
  // Local backend
  LOCAL_URL: (CONFIG.LOCAL && CONFIG.LOCAL.URL) ? CONFIG.LOCAL.URL : 'http://localhost:3000/api/',
  
  // JSONBin.io - O'CHIRILDI

  // ============ MA'LUMOTLARNI YUKLASH ============
  loadData: async function() {
    try {
      var url = this.LOCAL_URL + 'data';
      var headers = { 'Content-Type': 'application/json' };
      
      console.log('📥 Yuklanmoqda:', url);
      
      var response = await fetch(url, { headers: headers });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      
      var data = await response.json();
      console.log('✅ Local backend dan yuklandi');
      
      // Local backend: { success: true, record: {...} }
      if (data && data.success && data.record) {
        return data.record;
      }
      return data;
      
    } catch(e) { 
      console.error('❌ Yuklash xatosi:', e.message); 
      return null; 
    }
  },

  // ============ MA'LUMOTLARNI SAQLASH ============
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
      if (!response.ok) throw new Error('HTTP ' + response.status);
      
      var data = await response.json();
      console.log('✅ Local backend ga saqlandi');
      
      return data && data.success ? true : false;
      
    } catch(e) { 
      console.error('❌ Saqlash xatosi:', e.message); 
      return false; 
    }
  },

  // ============ FOYDALANUVCHI FUNKSIYALARI ============
  
  addUser: async function(user) {
    try {
      var response = await fetch(this.LOCAL_URL + 'users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      var result = await response.json();
      return result && result.success ? true : false;
    } catch(e) {
      console.error('❌ addUser xatosi:', e);
      return false;
    }
  },

  getUser: async function(userId) {
    try {
      var response = await fetch(this.LOCAL_URL + 'users/' + userId);
      if (!response.ok) return null;
      var result = await response.json();
      return result && result.success ? result.user : null;
    } catch(e) {
      console.error('❌ getUser xatosi:', e);
      return null;
    }
  },

  updateUser: async function(userId, updates) {
    try {
      var data = await this.loadData();
      if (!data || !data.users || !data.users[userId]) return false;
      
      for (var k in updates) {
        if (updates.hasOwnProperty(k)) {
          data.users[userId][k] = updates[k];
        }
      }
      return await this.saveData(data);
    } catch(e) {
      console.error('❌ updateUser xatosi:', e);
      return false;
    }
  },

  updateBalance: async function(userId, newBalance) {
    return await this.updateUser(userId, { balance: Number(newBalance) || 0 });
  },

  getAllUsers: async function() { 
    try {
      var response = await fetch(this.LOCAL_URL + 'users');
      var result = await response.json();
      return result && result.success ? result.users : {};
    } catch(e) {
      console.error('❌ getAllUsers xatosi:', e);
      return {};
    }
  },

  // ============ TRANZAKSIYA FUNKSIYALARI ============
  
  getTransactions: async function() { 
    try {
      var response = await fetch(this.LOCAL_URL + 'transactions');
      var result = await response.json();
      return result && result.success ? result.transactions : [];
    } catch(e) {
      console.error('❌ getTransactions xatosi:', e);
      return [];
    }
  },

  addTransaction: async function(transaction) {
    try {
      var response = await fetch(this.LOCAL_URL + 'transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      });
      var result = await response.json();
      return result && result.success ? true : false;
    } catch(e) {
      console.error('❌ addTransaction xatosi:', e);
      return false;
    }
  },

  // ============ SETTINGS FUNKSIYALARI ============
  
  getSettings: async function() { 
    try {
      var response = await fetch(this.LOCAL_URL + 'settings');
      var result = await response.json();
      return result && result.success ? result.settings : { commission: 0 };
    } catch(e) {
      console.error('❌ getSettings xatosi:', e);
      return { commission: 0 };
    }
  },

  updateSettings: async function(newSettings) {
    try {
      var response = await fetch(this.LOCAL_URL + 'settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      var result = await response.json();
      return result && result.success ? true : false;
    } catch(e) {
      console.error('❌ updateSettings xatosi:', e);
      return false;
    }
  },

  // ============ TRANSFER ============
  
  transfer: async function(fromId, toId, amount) {
    amount = Number(amount);
    if (isNaN(amount) || amount <= 0) return { success: false, error: 'Noto\'g\'ri miqdor' };
    
    try {
      var response = await fetch(this.LOCAL_URL + 'transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId, toId, amount })
      });
      var result = await response.json();
      return result;
      
    } catch(e) {
      console.error('❌ transfer xatosi:', e);
      return { success: false, error: 'Xatolik: ' + e.message };
    }
  },

  // ============ SINXRONLASH ============
  
  syncToLocal: async function() {
    console.log('🔄 Local backend sinxronlash...');
    try {
      var data = await this.loadData();
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
