/**
 * Vcoin Payment App — Storage Manager
 * LocalStorage + Cloud Database (JSONBin.io)
 * Referral O'CHIRILDI
 */

const DB = {
  PREFIX: 'vcoin_',
  
  /**
   * Get item from localStorage
   */
  get: function(key, defaultValue) {
    defaultValue = (defaultValue !== undefined) ? defaultValue : null;
    try {
      var item = localStorage.getItem(this.PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('❌ Storage get error:', e);
      return defaultValue;
    }
  },

  /**
   * Set item to localStorage
   */
  set: function(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
      console.log('💾 Storage set:', key, value);
      return true;
    } catch (e) {
      console.error('❌ Storage set error:', e);
      return false;
    }
  },

  /**
   * Remove item from localStorage
   */
  remove: function(key) {
    localStorage.removeItem(this.PREFIX + key);
  },

  /**
   * Clear all app data from localStorage
   */
  clearAll: function() {
    var keys = Object.keys(localStorage).filter(function(k) { 
      return k.startsWith(this.PREFIX); 
    }.bind(this));
    keys.forEach(function(k) { localStorage.removeItem(k); });
    console.log('🗑️ All data cleared');
  },

  /**
   * Get current user
   */
  getUser: function() {
    return this.get('user', null);
  },

  /**
   * Set current user
   */
  setUser: function(userData) {
    if (!userData) return false;
    
    this.set('user', userData);
    this.saveUserToRegistry(userData);
    
    // Cloud ga saqlash
    if (window.Cloud && Cloud.addUser) {
      Cloud.addUser(userData).catch(function(e) {
        console.warn('⚠️ Cloud save error:', e.message);
      });
    }
    
    // Trigger event
    this.triggerEvent('userUpdated', userData);
    return true;
  },

  /**
   * Check if user exists
   */
  userExists: function() {
    var user = this.getUser();
    return user !== null && user !== undefined && user.id;
  },

  /**
   * Get all users from registry
   */
  getAllUsers: function() {
    return this.get('allUsers', {});
  },

  /**
   * Get user by ID
   */
  getUserById: function(id) {
    if (!id) return null;
    
    var allUsers = this.getAllUsers();
    
    // Check in registry first
    if (allUsers[id]) {
      return allUsers[id];
    }
    
    // Check if it's current user
    var currentUser = this.getUser();
    if (currentUser && currentUser.id === id) {
      return currentUser;
    }
    
    return null;
  },

  /**
   * Save user to registry (all users list)
   * Referral O'CHIRILDI
   */
  saveUserToRegistry: function(user) {
    if (!user || !user.id) return false;
    
    var allUsers = this.getAllUsers();
    allUsers[user.id] = {
      id: user.id,
      nickname: user.nickname || 'Unknown',
      balance: user.balance || 0,
      // referralLink: O'CHIRILDI
      token: user.token || '',
      // referredBy: O'CHIRILDI
      createdAt: user.createdAt || new Date().toISOString()
    };
    this.set('allUsers', allUsers);
    
    // Cloud ga saqlash
    if (window.Cloud && Cloud.addUser) {
      Cloud.addUser(allUsers[user.id]).catch(function(e) {
        console.warn('⚠️ Cloud registry save error:', e.message);
      });
    }
    
    return true;
  },

  /**
   * Update user in registry
   */
  updateUserInRegistry: function(userId, updates) {
    var allUsers = this.getAllUsers();
    if (!allUsers[userId]) return false;
    
    for (var key in updates) {
      allUsers[userId][key] = updates[key];
    }
    
    this.set('allUsers', allUsers);
    
    // Update current user if it's the same
    var currentUser = this.getUser();
    if (currentUser && currentUser.id === userId) {
      for (var k in updates) {
        currentUser[k] = updates[k];
      }
      this.set('user', currentUser);
    }
    
    // Cloud ga saqlash
    if (window.Cloud && Cloud.updateUser) {
      Cloud.updateUser(userId, updates).catch(function(e) {
        console.warn('⚠️ Cloud update error:', e.message);
      });
    }
    
    return true;
  },

  /**
   * Get user balance
   */
  getBalance: function() {
    var user = this.getUser();
    return user ? (user.balance || 0) : 0;
  },

  /**
   * Update user balance (add/subtract)
   */
  updateBalance: function(amount) {
    var user = this.getUser();
    if (!user) return false;
    
    var newBalance = (user.balance || 0) + amount;
    user.balance = newBalance;
    this.set('user', user);
    this.saveUserToRegistry(user);
    
    // Cloud ga saqlash
    if (window.Cloud && Cloud.updateBalance) {
      Cloud.updateBalance(user.id, newBalance).catch(function(e) {
        console.warn('⚠️ Cloud balance update error:', e.message);
      });
    }
    
    // Trigger event
    this.triggerEvent('balanceUpdated', { userId: user.id, balance: newBalance });
    
    return true;
  },

  /**
   * Set user balance directly
   */
  setBalance: function(userId, amount) {
    var allUsers = this.getAllUsers();
    
    if (allUsers[userId]) {
      allUsers[userId].balance = amount;
      this.set('allUsers', allUsers);
      
      var currentUser = this.getUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.balance = amount;
        this.set('user', currentUser);
      }
      
      // Cloud ga saqlash
      if (window.Cloud && Cloud.updateBalance) {
        Cloud.updateBalance(userId, amount).catch(function(e) {
          console.warn('⚠️ Cloud balance set error:', e.message);
        });
      }
      
      return true;
    }
    
    // Agar topilmasa, yangi user yaratish
    allUsers[userId] = {
      id: userId,
      nickname: 'User_' + userId.slice(-4),
      balance: amount,
      token: '',
      // referralLink: O'CHIRILDI
      createdAt: new Date().toISOString()
    };
    this.set('allUsers', allUsers);
    return true;
  },

  /**
   * Get all transactions
   */
  getTransactions: function() {
    return this.get('transactions', []);
  },

  /**
   * Add transaction
   */
  addTransaction: function(tx) {
    if (!tx) return false;
    
    var transactions = this.getTransactions();
    transactions.unshift({
      id: 'TX' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase(),
      timestamp: tx.timestamp || new Date().toISOString(),
      fromId: tx.fromId || '',
      toId: tx.toId || '',
      amount: tx.amount || 0,
      type: tx.type || 'transfer',
      description: tx.description || '',
      commission: tx.commission || 0,
      receiverAmount: tx.receiverAmount || tx.amount || 0
    });
    
    // Limit to 500 transactions
    if (transactions.length > 500) transactions.length = 500;
    this.set('transactions', transactions);
    
    // Cloud ga saqlash
    if (window.Cloud && Cloud.addTransaction) {
      Cloud.addTransaction(tx).catch(function(e) {
        console.warn('⚠️ Cloud transaction save error:', e.message);
      });
    }
    
    // Trigger event
    this.triggerEvent('transactionAdded', tx);
    
    return true;
  },

  /**
   * Get user's transactions
   */
  getUserTransactions: function(userId) {
    if (!userId) return [];
    
    return this.getTransactions().filter(function(tx) {
      return tx.fromId === userId || tx.toId === userId;
    });
  },

  // ============================================================
  // REFERRAL - BUTUNLAY O'CHIRILDI
  // getReferrals() - O'CHIRILDI
  // addReferral() - O'CHIRILDI
  // getReferralsByUser() - O'CHIRILDI
  // ============================================================

  /**
   * Get all deposits
   */
  getDeposits: function() {
    return this.get('deposits', []);
  },

  /**
   * Add deposit
   */
  addDeposit: function(deposit) {
    if (!deposit) return null;
    
    var deposits = this.getDeposits();
    var newDeposit = {
      id: 'DEP' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase(),
      startDate: deposit.startDate || new Date().toISOString(),
      status: deposit.status || 'active',
      userId: deposit.userId || '',
      amount: deposit.amount || 0,
      days: deposit.days || 7,
      dailyPercent: deposit.dailyPercent || 16,
      endDate: deposit.endDate || ''
    };
    
    deposits.push(newDeposit);
    this.set('deposits', deposits);
    
    // Trigger event
    this.triggerEvent('depositAdded', newDeposit);
    
    return newDeposit.id;
  },

  /**
   * Update deposit
   */
  updateDeposit: function(depositId, updates) {
    if (!depositId || !updates) return false;
    
    var deposits = this.getDeposits();
    var index = deposits.findIndex(function(d) { return d.id === depositId; });
    
    if (index === -1) return false;
    
    for (var key in updates) {
      deposits[index][key] = updates[key];
    }
    
    this.set('deposits', deposits);
    
    // Trigger event
    this.triggerEvent('depositUpdated', { depositId: depositId, updates: updates });
    
    return true;
  },

  /**
   * Get user's deposits
   */
  getUserDeposits: function(userId) {
    if (!userId) return [];
    
    return this.getDeposits().filter(function(d) { 
      return d.userId === userId; 
    });
  },

  /**
   * Get settings
   * Referral bonus O'CHIRILDI
   */
  getSettings: function() {
    return this.get('settings', {
      commission: 1,
      depositProfit: 16,
      minDepositDays: 7,
      maxDepositDays: 30,
      // referralBonus: O'CHIRILDI
      adminPassword: '55668576'
    });
  },

  /**
   * Update settings
   */
  updateSettings: function(newSettings) {
    if (!newSettings) return false;
    
    var settings = this.getSettings();
    for (var key in newSettings) {
      settings[key] = newSettings[key];
    }
    this.set('settings', settings);
    
    // Cloud ga saqlash
    if (window.Cloud && Cloud.updateSettings) {
      Cloud.updateSettings(settings).catch(function(e) {
        console.warn('⚠️ Cloud settings update error:', e.message);
      });
    }
    
    return true;
  },

  /**
   * Get admin logs
   */
  getLogs: function() {
    return this.get('adminLogs', []);
  },

  /**
   * Add log entry
   */
  addLog: function(action, details) {
    if (!action) return false;
    
    var logs = this.getLogs();
    logs.unshift({
      timestamp: new Date().toISOString(),
      action: action,
      details: details || '',
      id: 'LOG' + Date.now().toString(36).toUpperCase()
    });
    
    if (logs.length > 1000) logs.length = 1000;
    this.set('adminLogs', logs);
    
    return true;
  },

  /**
   * Get banned users
   */
  getBannedUsers: function() {
    return this.get('bannedUsers', []);
  },

  /**
   * Ban user
   */
  banUser: function(userId) {
    if (!userId) return false;
    
    var banned = this.getBannedUsers();
    if (banned.indexOf(userId) === -1) {
      banned.push(userId);
      this.set('bannedUsers', banned);
      this.addLog('ban', 'User banned: ' + userId);
      return true;
    }
    return false;
  },

  /**
   * Unban user
   */
  unbanUser: function(userId) {
    if (!userId) return false;
    
    var banned = this.getBannedUsers();
    var newList = banned.filter(function(id) { return id !== userId; });
    
    if (newList.length !== banned.length) {
      this.set('bannedUsers', newList);
      this.addLog('unban', 'User unbanned: ' + userId);
      return true;
    }
    return false;
  },

  /**
   * Check if user is banned
   */
  isBanned: function(userId) {
    if (!userId) return false;
    return this.getBannedUsers().indexOf(userId) !== -1;
  },

  /**
   * Export all data as JSON
   */
  exportData: function() {
    var data = {};
    var keys = Object.keys(localStorage).filter(function(k) { 
      return k.startsWith(this.PREFIX); 
    }.bind(this));
    
    keys.forEach(function(k) {
      try { 
        data[k] = JSON.parse(localStorage.getItem(k)); 
      } catch (e) {
        data[k] = localStorage.getItem(k);
      }
    });
    
    return JSON.stringify(data, null, 2);
  },

  /**
   * Import data from JSON
   */
  importData: function(jsonStr) {
    try {
      var data = JSON.parse(jsonStr);
      var count = 0;
      
      for (var key in data) {
        if (key.startsWith(this.PREFIX)) {
          localStorage.setItem(key, JSON.stringify(data[key]));
          count++;
        }
      }
      
      console.log('✅ Imported ' + count + ' items');
      return true;
    } catch (e) {
      console.error('❌ Import error:', e);
      return false;
    }
  },

  /**
   * Get statistics
   * Referral O'CHIRILDI
   */
  getStats: function() {
    var allUsers = this.getAllUsers();
    var transactions = this.getTransactions();
    var deposits = this.getDeposits();
    // var referrals = this.getReferrals(); - O'CHIRILDI
    
    var totalVolume = transactions.reduce(function(sum, tx) { 
      return sum + Math.abs(tx.amount || 0); 
    }, 0);
    
    var totalDeposited = deposits.reduce(function(sum, d) { 
      return sum + (d.amount || 0); 
    }, 0);
    
    var activeDeposits = deposits.filter(function(d) { 
      return d.status === 'active'; 
    });
    
    return {
      totalUsers: Object.keys(allUsers).length,
      totalTransactions: transactions.length,
      totalVolume: totalVolume,
      activeDeposits: activeDeposits.length,
      totalDeposited: totalDeposited,
      // totalReferrals: O'CHIRILDI
      bannedUsers: this.getBannedUsers().length,
      deposits: deposits
    };
  },

  /**
   * Trigger custom events
   */
  triggerEvent: function(eventName, data) {
    try {
      var event = new CustomEvent('vcoin_' + eventName, { detail: data });
      document.dispatchEvent(event);
    } catch (e) {
      // CustomEvent not supported
    }
  },

  /**
   * Listen for events
   */
  on: function(eventName, callback) {
    document.addEventListener('vcoin_' + eventName, function(e) {
      callback(e.detail);
    });
  },

  /**
   * Sync with cloud
   */
  syncWithCloud: async function() {
    if (!window.Cloud) {
      console.warn('⚠️ Cloud not available');
      return false;
    }
    
    try {
      await Cloud.syncToLocal();
      console.log('✅ Synced with cloud');
      return true;
    } catch (e) {
      console.error('❌ Sync error:', e);
      return false;
    }
  },

  /**
   * Check if cloud is available
   */
  isCloudAvailable: function() {
    return typeof Cloud !== 'undefined' && Cloud !== null;
  }
};

// ==================== Initialize ====================
(function initDB() {
  if (!DB.get('initialized')) {
    console.log('📦 Initializing database...');
    
    DB.set('settings', {
      commission: 1,
      depositProfit: 16,
      minDepositDays: 7,
      maxDepositDays: 30,
      // referralBonus: O'CHIRILDI
      adminPassword: '55668576'
    });
    DB.set('allUsers', {});
    DB.set('transactions', []);
    // DB.set('referrals', []); - O'CHIRILDI
    DB.set('deposits', []);
    DB.set('adminLogs', []);
    DB.set('bannedUsers', []);
    DB.set('initialized', true);
    
    console.log('✅ Database initialized');
  }
  
  // Auto-sync with cloud on load
  if (DB.isCloudAvailable()) {
    setTimeout(function() {
      DB.syncWithCloud();
    }, 3000);
  }
  
  // ===== SHOP ID NI TEKSHIRISH =====
  var shopId = DB.get('shopId', null);
  if (shopId) {
    console.log('🏪 Shop ID (setshopid):', shopId);
  } else {
    console.log('ℹ️ Shop ID sozlanmagan. Admin panelda "setshopid <ID>" buyrug\'i bilan sozlang.');
  }
})();

// Export for debugging
window.DB = DB;