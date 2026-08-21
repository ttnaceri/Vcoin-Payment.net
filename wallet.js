/**
 * Vcoin Payment App — Wallet Module
 * Wallet overview (used by Dashboard)
 */

const Wallet = {
  /**
   * Get wallet summary
   */
  getSummary: function() {
    const user = DB.getUser();
    
    if (!user) {
      return {
        balance: 0,
        nickname: 'N/A',
        userId: 'N/A',
        token: 'N/A',
        hasWallet: false
      };
    }
    
    return {
      balance: user.balance || 0,
      nickname: user.nickname || 'N/A',
      userId: user.id || 'N/A',
      token: user.token || 'N/A',
      hasWallet: true,
      createdAt: user.createdAt || null,
      referralLink: user.referralLink || ''
    };
  },

  /**
   * Get wallet stats
   */
  getStats: function() {
    const user = DB.getUser();
    if (!user) {
      return {
        totalTransactions: 0,
        totalDeposits: 0,
        totalReferrals: 0,
        totalSent: 0,
        totalReceived: 0
      };
    }

    const transactions = DB.getUserTransactions ? DB.getUserTransactions(user.id) : [];
    const deposits = DB.getUserDeposits ? DB.getUserDeposits(user.id) : [];
    const referrals = DB.getReferralsByUser ? DB.getReferralsByUser(user.id) : [];
    
    // Calculate totals
    let totalSent = 0;
    let totalReceived = 0;
    
    transactions.forEach(function(tx) {
      if (tx.fromId === user.id) {
        totalSent += tx.amount || 0;
      }
      if (tx.toId === user.id) {
        totalReceived += tx.amount || 0;
      }
    });

    return {
      totalTransactions: transactions.length,
      totalDeposits: deposits.filter(function(d) { return d.status === 'completed'; }).length,
      totalReferrals: referrals.length,
      totalSent: totalSent,
      totalReceived: totalReceived,
      activeDeposits: deposits.filter(function(d) { return d.status === 'active'; }).length
    };
  },

  /**
   * Get formatted balance
   */
  getFormattedBalance: function() {
    const user = DB.getUser();
    const balance = user ? user.balance || 0 : 0;
    return Utils.formatNumber ? Utils.formatNumber(balance) : balance.toString();
  },

  /**
   * Check if wallet has sufficient balance
   */
  hasSufficientBalance: function(amount) {
    const user = DB.getUser();
    if (!user) return false;
    return (user.balance || 0) >= amount;
  },

  /**
   * Get wallet history (last N transactions)
   */
  getHistory: function(limit) {
    limit = limit || 10;
    const user = DB.getUser();
    if (!user) return [];
    
    const transactions = DB.getUserTransactions ? DB.getUserTransactions(user.id) : [];
    return transactions.slice(0, limit);
  },

  /**
   * Get wallet address (user ID)
   */
  getAddress: function() {
    const user = DB.getUser();
    return user ? user.id : null;
  },

  /**
   * Check if wallet is active
   */
  isActive: function() {
    const user = DB.getUser();
    if (!user) return false;
    return user.balance > 0 || DB.getUserTransactions(user.id).length > 0;
  },

  /**
   * Get wallet age in days
   */
  getAge: function() {
    const user = DB.getUser();
    if (!user || !user.createdAt) return 'N/A';
    
    try {
      const created = new Date(user.createdAt);
      const now = new Date();
      const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return '< 1 kun';
      if (diffDays === 1) return '1 kun';
      return diffDays + ' kun';
    } catch (e) {
      return 'N/A';
    }
  },

  /**
   * Get wallet summary as object
   */
  getFullInfo: function() {
    const user = DB.getUser();
    if (!user) return null;
    
    const stats = this.getStats();
    const summary = this.getSummary();
    
    return {
      ...summary,
      ...stats,
      age: this.getAge(),
      formattedBalance: this.getFormattedBalance(),
      isActive: this.isActive()
    };
  },

  /**
   * Render wallet card (for use in UI)
   */
  renderCard: function(container) {
    const user = DB.getUser();
    if (!user) {
      container.innerHTML = `
        <div class="glass-card" style="padding: 20px; text-align: center;">
          <p style="color: var(--text-muted);">Hisob topilmadi</p>
          <button class="btn btn-primary" onclick="UI.navigateTo('auth')">
            <i class="fas fa-sign-in-alt"></i> Kirish
          </button>
        </div>
      `;
      return;
    }

    const stats = this.getStats();
    const summary = this.getSummary();

    container.innerHTML = `
      <div class="wallet-card glass-card" style="padding: 24px; text-align: center;
                  background: linear-gradient(145deg, #1a2a4a, #1c2333);
                  border: 1px solid rgba(74,144,217,0.15);">
        
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; 
                      background: var(--gradient-primary); display: flex; align-items: center; 
                      justify-content: center; font-size: 20px; color: #fff; flex-shrink: 0;">
            ${user.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style="text-align: left; flex: 1;">
            <div style="font-weight: 600; font-size: 16px;">${user.nickname || 'User'}</div>
            <div style="font-size: 11px; color: var(--text-muted);">ID: ${user.id || 'N/A'}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: 700; color: var(--accent-blue);">
              ${this.getFormattedBalance()}
            </div>
            <div style="font-size: 10px; color: var(--text-muted);">Vcoin</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; 
                    background: rgba(0,0,0,0.2); border-radius: 10px; padding: 12px;">
          <div>
            <div style="font-size: 16px; font-weight: 600; color: var(--accent-gold);">
              ${stats.totalTransactions}
            </div>
            <div style="font-size: 10px; color: var(--text-muted);">Tranzaksiya</div>
          </div>
          <div>
            <div style="font-size: 16px; font-weight: 600; color: var(--accent-green);">
              ${stats.totalReferrals}
            </div>
            <div style="font-size: 10px; color: var(--text-muted);">Do'stlar</div>
          </div>
          <div>
            <div style="font-size: 16px; font-weight: 600; color: var(--accent-purple);">
              ${stats.activeDeposits}
            </div>
            <div style="font-size: 10px; color: var(--text-muted);">Depozit</div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Update wallet UI (balance only)
   */
  updateUI: function() {
    const balanceElements = document.querySelectorAll('.wallet-balance');
    const formattedBalance = this.getFormattedBalance();
    
    balanceElements.forEach(function(el) {
      el.textContent = formattedBalance + ' Vcoin';
    });
  },

  /**
   * Subscribe to wallet events
   */
  subscribe: function(callback) {
    if (document.addEventListener) {
      document.addEventListener('vcoin_balanceUpdated', function(e) {
        callback(e.detail);
      });
      document.addEventListener('vcoin_transactionAdded', function(e) {
        callback(e.detail);
      });
    }
  }
};

// Auto-update wallet UI when balance changes
if (typeof document !== 'undefined') {
  document.addEventListener('vcoin_balanceUpdated', function() {
    Wallet.updateUI();
  });
}

// Export for debugging
window.Wallet = Wallet;