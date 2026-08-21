/**
 * Vcoin Payment App — Token Module
 * Personal payment token display
 */

const Token = {
  /**
   * Render token page
   */
  render: function(container) {
    const user = DB.getUser();
    if (!user) {
      UI.navigateTo('auth');
      return;
    }

    // Ensure user has a token
    if (!user.token) {
      user.token = this.generateToken();
      DB.setUser(user);
    }

    // Mask token for display (show full token)
    const displayToken = user.token;

    container.innerHTML = `
      <div class="fade-in" style="max-width: 420px; margin: 0 auto; padding: 4px 0;">
        
        <!-- Token Header -->
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 50%; 
                      background: var(--gradient-primary); display: flex; align-items: center; 
                      justify-content: center; font-size: 28px; color: #fff; box-shadow: var(--glow-blue);">
            <i class="fas fa-key"></i>
          </div>
          <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 4px;">Shaxsiy Token</h2>
          <p style="color: var(--text-secondary); font-size: 13px; margin-top: 4px;">
            To'lov tizimlarida ishlatish uchun maxfiy kalit
          </p>
        </div>

        <!-- Token Card -->
        <div class="glass-card" style="padding: 28px 20px; text-align: center; margin-bottom: 20px;
                    background: linear-gradient(145deg, #1c2333, #1a1f35);
                    border: 1px solid rgba(240,185,11,0.15);">
          <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">
            🔐 Sizning To'lovingiz Tokeni
          </div>
          
          <div id="tokenDisplay" style="font-size: 22px; font-weight: 700; letter-spacing: 2px; 
                      color: var(--accent-gold); font-family: 'Courier New', monospace; 
                      padding: 14px 12px; border-radius: var(--radius-md);
                      border: 1px dashed rgba(240,185,11,0.25);
                      background: rgba(240,185,11,0.06);
                      word-break: break-all;
                      transition: all 0.3s ease;
                      user-select: all;">
            ${displayToken}
          </div>
          
          <div style="display: flex; justify-content: center; gap: 16px; margin-top: 12px;">
            <span style="font-size: 10px; color: var(--text-muted);">
              <i class="fas fa-calendar-alt"></i> Yaratilgan: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
            <span style="font-size: 10px; color: var(--text-muted);">
              <i class="fas fa-hashtag"></i> Uzunlik: ${displayToken.length} ta belgi
            </span>
          </div>
        </div>

        <!-- Copy Button -->
        <button class="btn btn-primary w-full btn-lg" onclick="Token.copyToken()" style="gap: 8px; margin-bottom: 12px;">
          <i class="fas fa-copy"></i> Tokendan Nusxalash
        </button>

        <!-- Action Buttons -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
          <button class="btn btn-outline btn-sm" onclick="Token.regenerateToken()" style="gap: 6px;">
            <i class="fas fa-sync"></i> Qayta Yaratish
          </button>
          <button class="btn btn-outline btn-sm" onclick="Token.showQRCode()" style="gap: 6px;">
            <i class="fas fa-qrcode"></i> QR Kod
          </button>
        </div>

        <!-- Info Card -->
        <div class="glass-card" style="padding: 18px; margin-top: 4px;">
          <h4 style="font-size: 13px; margin-bottom: 10px; color: var(--text-primary);">
            <i class="fas fa-info-circle" style="color: var(--accent-blue);"></i> Qanday Ishlatiladi?
          </h4>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: var(--text-secondary);">
            <div style="display: flex; gap: 10px; align-items: flex-start;">
              <span style="color: var(--accent-blue); font-weight: 700; min-width: 20px;">1.</span>
              <span>Tokendan nusxa oling</span>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start;">
              <span style="color: var(--accent-blue); font-weight: 700; min-width: 20px;">2.</span>
              <span>To'lov qilmoqchi bo'lgan platformaga o'ting</span>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start;">
              <span style="color: var(--accent-blue); font-weight: 700; min-width: 20px;">3.</span>
              <span>Token maydoniga joylang va to'lovni amalga oshiring</span>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start;">
              <span style="color: var(--accent-blue); font-weight: 700; min-width: 20px;">4.</span>
              <span>To'lov avtomatik tasdiqlanadi ✅</span>
            </div>
          </div>
        </div>

        <!-- Security Warning -->
        <div class="glass-card" style="padding: 12px 16px; margin-top: 16px; 
                    background: rgba(231,76,60,0.06); border: 1px solid rgba(231,76,60,0.1);
                    text-align: center;">
          <p style="font-size: 11px; color: var(--accent-red);">
            <i class="fas fa-shield-alt" style="margin-right: 6px;"></i>
            <strong>Ogohlantirish:</strong> Tokeningizni hech kimga bermang! Bu sizning elektron hamyoningiz kaliti.
          </p>
        </div>

        <!-- Usage Stats -->
        <div style="margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="glass-card" style="padding: 12px; text-align: center;">
            <div style="font-size: 18px; font-weight: 700; color: var(--accent-blue);">
              ${this.getTokenUsageCount()}
            </div>
            <div style="font-size: 10px; color: var(--text-muted);">Ishlatilgan</div>
          </div>
          <div class="glass-card" style="padding: 12px; text-align: center;">
            <div style="font-size: 18px; font-weight: 700; color: var(--accent-gold);">
              ${this.getTokenAge()}
            </div>
            <div style="font-size: 10px; color: var(--text-muted);">Yaratilgan vaqt</div>
          </div>
        </div>

      </div>
    `;
  },

  /**
   * Generate a secure random token
   */
  generateToken: function() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const segments = [];
    
    for (let i = 0; i < 4; i++) {
      let segment = '';
      for (let j = 0; j < 4; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      segments.push(segment);
    }
    
    return 'VCOIN-' + segments.join('-');
  },

  /**
   * Copy token to clipboard
   */
  copyToken: function() {
    const user = DB.getUser();
    if (!user || !user.token) {
      UI.showToast('Token topilmadi', 'error');
      return;
    }

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(user.token)
        .then(() => {
          this.showCopySuccess();
        })
        .catch(() => {
          this.copyTokenFallback(user.token);
        });
    } else {
      this.copyTokenFallback(user.token);
    }
  },

  /**
   * Fallback copy method
   */
  copyTokenFallback: function(token) {
    const textarea = document.createElement('textarea');
    textarea.value = token;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      const success = document.execCommand('copy');
      if (success) {
        this.showCopySuccess();
      } else {
        UI.showToast('Nusxalashda xatolik', 'error');
      }
    } catch (e) {
      UI.showToast('Nusxalashda xatolik', 'error');
    }
    
    document.body.removeChild(textarea);
  },

  /**
   * Show copy success feedback
   */
  showCopySuccess: function() {
    UI.showToast('✅ Token nusxalandi! 📋', 'success');
    
    // Visual feedback on token element
    const tokenEl = document.getElementById('tokenDisplay');
    if (tokenEl) {
      tokenEl.style.borderColor = 'var(--accent-green)';
      tokenEl.style.backgroundColor = 'rgba(46,164,79,0.15)';
      tokenEl.style.transform = 'scale(1.02)';
      setTimeout(() => {
        tokenEl.style.borderColor = 'rgba(240,185,11,0.25)';
        tokenEl.style.backgroundColor = 'rgba(240,185,11,0.06)';
        tokenEl.style.transform = 'scale(1)';
      }, 1500);
    }
  },

  /**
   * Regenerate token
   */
  regenerateToken: function() {
    if (!UI.confirm) {
      if (!confirm(
        '⚠️ Tokenni qayta yaratishni xohlaysizmi?\n\n' +
        'Eski token o\'chiriladi va yangisi yaratiladi.\n' +
        'Bu amalni davom ettirmoqchimisiz?'
      )) return;
    } else {
      UI.confirm(
        '⚠️ Tokenni qayta yaratish\n\nEski token o\'chiriladi va yangisi yaratiladi.\nDavom etishni xohlaysizmi?',
        function() {
          Token.doRegenerateToken();
        }
      );
      return;
    }
    
    this.doRegenerateToken();
  },

  /**
   * Execute token regeneration
   */
  doRegenerateToken: function() {
    const user = DB.getUser();
    if (!user) return;
    
    const newToken = this.generateToken();
    user.token = newToken;
    DB.setUser(user);
    
    // Update in registry
    DB.updateUserInRegistry(user.id, { token: newToken });
    
    // Log action
    DB.addLog('token_regenerate', 'Token regenerated for user ' + user.id);
    
    UI.showToast('🔄 Token qayta yaratildi!', 'success');
    
    // Refresh page
    setTimeout(function() {
      UI.navigateTo('token');
    }, 500);
  },

  /**
   * Show QR Code for token
   */
  showQRCode: function() {
    const user = DB.getUser();
    if (!user || !user.token) return;
    
    const tokenData = user.token;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(tokenData)}`;
    
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.85); display: flex; align-items: center;
      justify-content: center; z-index: 9999; backdrop-filter: blur(8px);
      animation: fadeIn 0.3s ease;
    `;
    
    overlay.innerHTML = `
      <div style="background: var(--bg-card); padding: 32px 24px; border-radius: var(--radius-lg);
                  max-width: 340px; width: 90%; text-align: center; 
                  box-shadow: 0 24px 64px rgba(0,0,0,0.6);
                  border: 1px solid rgba(255,255,255,0.06);">
        <div style="font-size: 32px; margin-bottom: 8px;">📱</div>
        <h3 style="margin-bottom: 4px; font-size: 18px;">Token QR Kodi</h3>
        <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 16px;">
          Tokenni skaner orqali ulashish uchun
        </p>
        <img src="${qrUrl}" alt="Token QR Code" 
             style="width: 200px; height: 200px; margin: 0 auto 16px;
                    border-radius: var(--radius-md); background: #fff; padding: 12px;
                    image-rendering: pixelated;">
        <div style="font-size: 11px; color: var(--text-secondary); word-break: break-all;
                    background: rgba(255,255,255,0.05); padding: 8px 12px; 
                    border-radius: var(--radius-sm); margin-bottom: 16px;
                    font-family: 'Courier New', monospace;">
          ${tokenData}
        </div>
        <button class="btn btn-primary w-full" onclick="this.closest('div[style]').parentElement.remove()" style="gap: 8px;">
          <i class="fas fa-times"></i> Yopish
        </button>
      </div>
    `;
    
    // Close on overlay click
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.remove();
    });
    
    document.body.appendChild(overlay);
  },

  /**
   * Get token usage count
   */
  getTokenUsageCount: function() {
    const user = DB.getUser();
    if (!user) return 0;
    
    const transactions = DB.getUserTransactions ? DB.getUserTransactions(user.id) : [];
    // Count transactions that used token (by checking description)
    const tokenUses = transactions.filter(function(tx) {
      return tx.description && tx.description.includes('token');
    });
    
    return tokenUses.length || 0;
  },

  /**
   * Get token age in days
   */
  getTokenAge: function() {
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
   * Validate token format
   */
  isValidToken: function(token) {
    if (!token) return false;
    // VCOIN-XXXX-XXXX-XXXX-XXXX format
    const pattern = /^VCOIN-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;
    return pattern.test(token);
  },

  /**
   * Mask token for display (show first and last segments only)
   */
  maskToken: function(token) {
    if (!token) return '';
    const parts = token.split('-');
    if (parts.length < 2) return token;
    
    const first = parts[0];
    const last = parts[parts.length - 1];
    const middle = '••••-••••-••••';
    
    return first + '-' + middle + '-' + last;
  }
};