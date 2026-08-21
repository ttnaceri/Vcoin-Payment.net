/* ============================================
   DEVELOPER MODULE - API Key Management
   Vcoin Payment App Developer API
   Hammasi bir papkada
   ============================================ */

var Developer = {
  // API key format: VP-XXXX-XXX-XXX
  API_KEY_PREFIX: 'VP',
  apiKeys: [],
  currentUser: null,

  // ============================================================
  // RENDER
  // ============================================================
  render: function(container) {
    var user = DB.getUser();
    
    console.log('🔑 Developer.render() called');
    
    if (!user) {
      container.innerHTML = `
        <div class="developer-container fade-in">
          <div class="glass-card" style="padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
            <h2 style="font-size: 20px; margin-bottom: 8px;">Please Login First</h2>
            <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 16px;">
              You need to be logged in to access Developer features.
            </p>
            <button class="btn btn-primary" onclick="UI.navigateTo('auth')">
              <i class="fas fa-sign-in-alt"></i> Go to Login
            </button>
          </div>
        </div>
      `;
      return;
    }
    
    // Check if user is banned
    if (DB.isBanned && DB.isBanned(user.id)) {
      container.innerHTML = `
        <div class="developer-container fade-in">
          <div class="glass-card" style="padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🚫</div>
            <h2 style="font-size: 20px; margin-bottom: 8px; color: var(--accent-red);">Access Denied</h2>
            <p style="color: var(--text-muted); font-size: 14px;">
              You have been banned from using Developer features.
            </p>
          </div>
        </div>
      `;
      return;
    }
    
    this.currentUser = user;
    this.loadApiKeys(user.id);
    this.loadStatistics();
    
    container.innerHTML = this.renderHTML(user);
    this.setupEventListeners();
  },

  // ============================================================
  // RENDER HTML
  // ============================================================
  renderHTML: function(user) {
    var stats = this.getStatistics();
    var apiKeys = this.apiKeys || [];
    
    return `
      <div class="developer-container fade-in">
        
        <!-- STATISTIKA KARTALARI -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-value" id="statUsers">${stats.totalUsers}</div>
            <div class="stat-label">Total Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-value" id="statSpent">${this.formatNumber(stats.totalSpent)}</div>
            <div class="stat-label">Vcoin Spent</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🛒</div>
            <div class="stat-value" id="statPurchases">${stats.totalPurchases}</div>
            <div class="stat-label">Total Purchases</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔑</div>
            <div class="stat-value" id="statApiKeys">${apiKeys.length}</div>
            <div class="stat-label">API Keys</div>
          </div>
        </div>

        <!-- API KALIT OLISH -->
        <div class="glass-card" style="padding: 24px; margin-bottom: 20px;">
          <h3 style="font-size: 18px; margin-bottom: 16px;">
            <i class="fas fa-key" style="color: var(--accent-gold);"></i> 
            Get Developer API Key
          </h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Enter your credentials to get your Developer API key.
          </p>

          <div class="form-group">
            <label>Nickname</label>
            <input type="text" id="devNickname" class="input" placeholder="Your nickname" 
                   value="${user.nickname || ''}">
          </div>

          <div class="form-group">
            <label>Password</label>
            <div style="position: relative;">
              <input type="password" id="devPassword" class="input" placeholder="Your password" 
                     style="padding-right: 45px;">
              <span onclick="Developer.togglePasswordVisibility('devPassword', 'devPasswordEye')" 
                    style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); cursor: pointer; color: var(--text-muted);">
                <i class="fas fa-eye" id="devPasswordEye"></i>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>Vcoin Token</label>
            <input type="text" id="devToken" class="input" placeholder="VCOIN-XXXX-XXXX-XXXX-XXXX" 
                   value="${user.token || ''}" style="font-family: monospace; font-size: 14px;">
          </div>

          <div class="form-group" style="margin-top: 12px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <input type="checkbox" id="devTerms" style="width: 18px; height: 18px; accent-color: var(--accent-blue);">
              <span style="font-size: 13px; color: var(--text-muted);">
                I accept the <a href="#" onclick="Developer.showTerms(); return false;" style="color: var(--accent-blue);">Terms</a> 
                and <a href="#" onclick="Developer.showPrivacy(); return false;" style="color: var(--accent-blue);">Privacy Policy</a>
              </span>
            </label>
          </div>

          <button class="btn btn-primary w-full btn-lg" id="getApiBtn" onclick="Developer.getApiKey()" disabled>
            <i class="fas fa-code"></i> Get API Key
          </button>

          <div id="apiResult" style="margin-top: 16px; display: none;">
            <div style="background: rgba(0, 255, 136, 0.05); border: 1px solid rgba(0, 255, 136, 0.2); border-radius: 10px; padding: 16px;">
              <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Your Developer API Key:</div>
              <div style="font-family: monospace; font-size: 20px; color: var(--accent-gold); letter-spacing: 2px; word-break: break-all;" id="apiKeyDisplay">
                VP-XXXX-XXX-XXX
              </div>
              <button class="btn btn-outline btn-sm" onclick="Developer.copyApiKey()" style="margin-top: 8px; width: auto; padding: 8px 20px;">
                <i class="fas fa-copy"></i> Copy
              </button>
              <button class="btn btn-danger btn-sm" onclick="Developer.revokeApiKey()" style="margin-top: 8px; width: auto; padding: 8px 20px; margin-left: 8px;">
                <i class="fas fa-trash"></i> Revoke
              </button>
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: var(--text-muted);">
              <i class="fas fa-info-circle"></i> Use: <code style="background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px;">?api=VP-XXXX-XXX-XXX</code>
            </div>
          </div>

          <div id="apiError" style="margin-top: 12px; display: none; padding: 12px; border-radius: 10px; background: rgba(255, 45, 85, 0.1); border: 1px solid rgba(255, 45, 85, 0.2); color: var(--accent-red); font-size: 14px;">
            <i class="fas fa-exclamation-circle"></i> <span id="apiErrorMessage">Error message</span>
          </div>
        </div>

        <!-- MY API KEYS -->
        <div class="glass-card" style="padding: 24px; margin-bottom: 20px;">
          <h3 style="font-size: 18px; margin-bottom: 16px;">
            <i class="fas fa-list" style="color: var(--accent-blue);"></i> 
            My API Keys
            <span style="font-size: 12px; color: var(--text-muted); font-weight: normal; margin-left: 8px;">(${apiKeys.length})</span>
          </h3>
          <div id="apiKeysList">
            ${apiKeys.length === 0 ? `
              <p style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 20px 0;">
                <i class="fas fa-inbox" style="font-size: 24px; display: block; margin-bottom: 8px; opacity: 0.5;"></i>
                No API keys yet.
              </p>
            ` : `
              ${apiKeys.map(function(key, index) {
                return Developer.renderApiKeyItem(key, index);
              }).join('')}
            `}
          </div>
        </div>

        <!-- DOCUMENTATION -->
        <div class="glass-card" style="padding: 24px;">
          <h3 style="font-size: 18px; margin-bottom: 16px;">
            <i class="fas fa-book" style="color: var(--accent-green);"></i> 
            API Documentation
          </h3>
          
          <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.8;">
            <p><strong>Base URL:</strong> <code style="background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px;">https://ttnaceri.github.io/vcoin-payment/</code></p>
            
            <div style="margin-top: 12px;">
              <p><strong>Authentication:</strong></p>
              <p style="font-size: 13px; color: var(--text-muted);">Pass your API key: <code>?api=YOUR_API_KEY</code></p>
            </div>

            <div style="margin-top: 12px;">
              <p><strong>Payment:</strong></p>
              <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; overflow-x: auto;">
                ?api=YOUR_API_KEY&pay=USER_ID&amount=100&note=Payment
              </div>
            </div>

            <div style="margin-top: 12px;">
              <p><strong>Add Vcoin:</strong></p>
              <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; overflow-x: auto;">
                ?api=YOUR_API_KEY&add=USER_ID&amount=50&note=Bonus
              </div>
            </div>

            <div style="margin-top: 12px;">
              <p><strong>Check Balance:</strong></p>
              <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; overflow-x: auto;">
                ?api=YOUR_API_KEY&balance=USER_ID
              </div>
            </div>

            <div style="margin-top: 16px; padding: 12px; background: rgba(255, 215, 0, 0.05); border-radius: 8px; border-left: 3px solid var(--accent-gold);">
              <p style="font-size: 13px; color: var(--accent-gold);">
                <i class="fas fa-info-circle"></i> 
                API key format: <strong>VP-XXXX-XXX-XXX</strong>
              </p>
            </div>
          </div>
        </div>

      </div>
    `;
  },

  // ============================================================
  // RENDER API KEY ITEM
  // ============================================================
  renderApiKeyItem: function(key, index) {
    var createdDate = key.createdAt ? new Date(key.createdAt).toLocaleDateString() : 'Unknown';
    var statusColor = key.active !== false ? 'var(--accent-green)' : 'var(--accent-red)';
    var statusText = key.active !== false ? 'Active' : 'Revoked';
    
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border-color);">
        <div>
          <div style="font-family: monospace; font-size: 14px; color: var(--accent-gold); letter-spacing: 1px;">
            ${key.key}
          </div>
          <div style="font-size: 11px; color: var(--text-muted);">
            Created: ${createdDate} • 
            <span style="color: ${statusColor};">${statusText}</span>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-outline btn-sm" onclick="Developer.copyApiKeyByIndex(${index})" style="padding: 4px 12px; font-size: 12px; width: auto;">
            <i class="fas fa-copy"></i>
          </button>
          ${key.active !== false ? `
            <button class="btn btn-danger btn-sm" onclick="Developer.revokeApiKeyByIndex(${index})" style="padding: 4px 12px; font-size: 12px; width: auto;">
              <i class="fas fa-times"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  },

  // ============================================================
  // LOAD STATISTICS
  // ============================================================
  loadStatistics: function() {
    var stats = this.getStatistics();
    
    setTimeout(function() {
      var el = document.getElementById('statUsers');
      if (el) el.textContent = stats.totalUsers;
      
      el = document.getElementById('statSpent');
      if (el) el.textContent = Developer.formatNumber(stats.totalSpent);
      
      el = document.getElementById('statPurchases');
      if (el) el.textContent = stats.totalPurchases;
      
      el = document.getElementById('statApiKeys');
      if (el) el.textContent = Developer.apiKeys.length;
    }, 100);
  },

  // ============================================================
  // GET STATISTICS
  // ============================================================
  getStatistics: function() {
    var allUsers = DB.getAllUsers ? DB.getAllUsers() : {};
    var transactions = DB.getTransactions ? DB.getTransactions() : [];
    
    var totalUsers = Object.keys(allUsers).length;
    var totalSpent = 0;
    var totalPurchases = 0;
    
    transactions.forEach(function(tx) {
      if (tx.type === 'external_payment' || tx.type === 'payment' || tx.type === 'withdraw') {
        totalSpent += tx.amount || 0;
        totalPurchases++;
      }
    });
    
    return {
      totalUsers: totalUsers,
      totalSpent: totalSpent,
      totalPurchases: totalPurchases
    };
  },

  // ============================================================
  // LOAD API KEYS (backend.json dan)
  // ============================================================
  loadApiKeys: function(userId) {
    var allApiKeys = DB.get('developerApiKeys', {});
    this.apiKeys = allApiKeys[userId] || [];
    return this.apiKeys;
  },

  // ============================================================
  // SAVE API KEYS (backend.json ga)
  // ============================================================
  saveApiKeys: function(userId) {
    var allApiKeys = DB.get('developerApiKeys', {});
    allApiKeys[userId] = this.apiKeys;
    DB.set('developerApiKeys', allApiKeys);
    
    // Cloud ga saqlash
    if (typeof Cloud !== 'undefined' && Cloud.saveData) {
      Cloud.saveData({ developerApiKeys: allApiKeys }).catch(function() {});
    }
    
    var statsEl = document.getElementById('statApiKeys');
    if (statsEl) statsEl.textContent = this.apiKeys.length;
  },

  // ============================================================
  // GET API KEY
  // ============================================================
  getApiKey: function() {
    var nickname = document.getElementById('devNickname').value.trim();
    var password = document.getElementById('devPassword').value.trim();
    var token = document.getElementById('devToken').value.trim();
    var terms = document.getElementById('devTerms').checked;
    var errorDiv = document.getElementById('apiError');
    var errorMsg = document.getElementById('apiErrorMessage');
    var resultDiv = document.getElementById('apiResult');
    var btn = document.getElementById('getApiBtn');
    
    errorDiv.style.display = 'none';
    resultDiv.style.display = 'none';
    
    // Validate
    if (!nickname || nickname.length < 3) {
      this.showError('Nickname must be at least 3 characters.');
      return;
    }
    
    if (!password || password.length < 8) {
      this.showError('Password must be at least 8 characters.');
      return;
    }
    
    if (!token || token.length < 10) {
      this.showError('Please enter your Vcoin token.');
      return;
    }
    
    if (!terms) {
      this.showError('You must accept the Terms and Privacy Policy.');
      return;
    }
    
    // Check credentials
    var user = DB.getUser();
    if (!user) {
      this.showError('Please login first.');
      return;
    }
    
    if (user.nickname.toLowerCase() !== nickname.toLowerCase()) {
      this.showError('Invalid nickname.');
      return;
    }
    
    if (user.password !== password) {
      this.showError('Invalid password.');
      return;
    }
    
    if (user.token !== token) {
      this.showError('Invalid Vcoin token.');
      return;
    }
    
    if (DB.isBanned && DB.isBanned(user.id)) {
      this.showError('You are banned from using Developer features.');
      return;
    }
    
    // Generate API key
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    
    var apiKey = this.generateApiKey();
    
    // Save API key
    this.apiKeys.push({
      key: apiKey,
      createdAt: new Date().toISOString(),
      active: true,
      userId: user.id,
      nickname: user.nickname
    });
    
    this.saveApiKeys(user.id);
    
    // Show result
    setTimeout(function() {
      document.getElementById('apiKeyDisplay').textContent = apiKey;
      resultDiv.style.display = 'block';
      
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-code"></i> Get API Key';
      
      Developer.updateApiKeysList();
      
      if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast('✅ API key generated!', 'success');
      }
      
      var statsEl = document.getElementById('statApiKeys');
      if (statsEl) statsEl.textContent = Developer.apiKeys.length;
    }, 1000);
  },

  // ============================================================
  // GENERATE API KEY
  // ============================================================
  generateApiKey: function() {
    var prefix = this.API_KEY_PREFIX;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var parts = [];
    
    var part1 = '';
    for (var i = 0; i < 4; i++) {
      part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    parts.push(part1);
    
    var part2 = '';
    for (var i = 0; i < 3; i++) {
      part2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    parts.push(part2);
    
    var part3 = '';
    for (var i = 0; i < 3; i++) {
      part3 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    parts.push(part3);
    
    var fullKey = prefix + '-' + parts.join('-');
    
    // Ensure uniqueness
    var exists = true;
    while (exists) {
      exists = false;
      for (var i = 0; i < this.apiKeys.length; i++) {
        if (this.apiKeys[i].key === fullKey) {
          exists = true;
          break;
        }
      }
      if (exists) {
        parts = [];
        var part1 = '';
        for (var j = 0; j < 4; j++) {
          part1 += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        parts.push(part1);
        var part2 = '';
        for (var j = 0; j < 3; j++) {
          part2 += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        parts.push(part2);
        var part3 = '';
        for (var j = 0; j < 3; j++) {
          part3 += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        parts.push(part3);
        fullKey = prefix + '-' + parts.join('-');
      }
    }
    
    return fullKey;
  },

  // ============================================================
  // COPY API KEY
  // ============================================================
  copyApiKey: function() {
    var keyDisplay = document.getElementById('apiKeyDisplay');
    if (!keyDisplay) return;
    this.copyToClipboard(keyDisplay.textContent);
  },

  copyApiKeyByIndex: function(index) {
    var key = this.apiKeys[index];
    if (!key) return;
    this.copyToClipboard(key.key);
  },

  copyToClipboard: function(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        if (typeof UI !== 'undefined' && UI.showToast) {
          UI.showToast('✅ Copied!', 'success');
        }
      }).catch(function() {
        Developer.copyToClipboardFallback(text);
      });
    } else {
      Developer.copyToClipboardFallback(text);
    }
  },

  copyToClipboardFallback: function(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast('✅ Copied!', 'success');
      }
    } catch(e) {
      if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast('❌ Failed to copy', 'error');
      }
    }
    document.body.removeChild(textarea);
  },

  // ============================================================
  // REVOKE API KEY
  // ============================================================
  revokeApiKey: function() {
    var keyDisplay = document.getElementById('apiKeyDisplay');
    if (!keyDisplay) return;
    var key = keyDisplay.textContent;
    
    if (typeof UI !== 'undefined' && UI.confirm) {
      UI.confirm('Revoke this API key?\n\n' + key, function() {
        Developer.revokeKey(key);
      });
    } else {
      if (confirm('Revoke this API key?\n\n' + key)) {
        Developer.revokeKey(key);
      }
    }
  },

  revokeApiKeyByIndex: function(index) {
    var key = this.apiKeys[index];
    if (!key) return;
    
    if (typeof UI !== 'undefined' && UI.confirm) {
      UI.confirm('Revoke this API key?\n\n' + key.key, function() {
        Developer.revokeKey(key.key);
      });
    } else {
      if (confirm('Revoke this API key?\n\n' + key.key)) {
        Developer.revokeKey(key.key);
      }
    }
  },

  revokeKey: function(key) {
    var user = DB.getUser();
    if (!user) return;
    
    for (var i = 0; i < this.apiKeys.length; i++) {
      if (this.apiKeys[i].key === key) {
        this.apiKeys[i].active = false;
        break;
      }
    }
    
    this.saveApiKeys(user.id);
    this.updateApiKeysList();
    
    var resultDiv = document.getElementById('apiResult');
    if (resultDiv) resultDiv.style.display = 'none';
    
    var statsEl = document.getElementById('statApiKeys');
    if (statsEl) statsEl.textContent = this.apiKeys.length;
    
    if (typeof UI !== 'undefined' && UI.showToast) {
      UI.showToast('✅ API key revoked.', 'success');
    }
  },

  // ============================================================
  // UPDATE API KEYS LIST
  // ============================================================
  updateApiKeysList: function() {
    var container = document.getElementById('apiKeysList');
    if (!container) return;
    
    if (this.apiKeys.length === 0) {
      container.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 20px 0;">
          <i class="fas fa-inbox" style="font-size: 24px; display: block; margin-bottom: 8px; opacity: 0.5;"></i>
          No API keys yet.
        </p>
      `;
      return;
    }
    
    var html = '';
    for (var i = 0; i < this.apiKeys.length; i++) {
      html += this.renderApiKeyItem(this.apiKeys[i], i);
    }
    container.innerHTML = html;
  },

  // ============================================================
  // SETUP EVENT LISTENERS
  // ============================================================
  setupEventListeners: function() {
    var termsCheckbox = document.getElementById('devTerms');
    var btn = document.getElementById('getApiBtn');
    
    if (termsCheckbox && btn) {
      termsCheckbox.addEventListener('change', function() {
        btn.disabled = !this.checked;
      });
    }
    
    var user = DB.getUser();
    if (user) {
      var nicknameInput = document.getElementById('devNickname');
      var tokenInput = document.getElementById('devToken');
      
      if (nicknameInput && !nicknameInput.value) {
        nicknameInput.value = user.nickname || '';
      }
      if (tokenInput && !tokenInput.value) {
        tokenInput.value = user.token || '';
      }
    }
    
    var inputs = ['devNickname', 'devPassword', 'devToken'];
    for (var i = 0; i < inputs.length; i++) {
      var input = document.getElementById(inputs[i]);
      if (input) {
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            var btn = document.getElementById('getApiBtn');
            if (btn && !btn.disabled) {
              Developer.getApiKey();
            }
          }
        });
      }
    }
  },

  // ============================================================
  // TOGGLE PASSWORD VISIBILITY
  // ============================================================
  togglePasswordVisibility: function(inputId, iconId) {
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

  // ============================================================
  // SHOW ERROR
  // ============================================================
  showError: function(message) {
    var errorDiv = document.getElementById('apiError');
    var errorMsg = document.getElementById('apiErrorMessage');
    
    if (errorDiv && errorMsg) {
      errorMsg.textContent = message;
      errorDiv.style.display = 'block';
    }
  },

  // ============================================================
  // SHOW TERMS
  // ============================================================
  showTerms: function() {
    var html = `
      <div style="padding: 10px;">
        <h3 style="margin-bottom: 16px; text-align: center;">📜 Terms and Conditions</h3>
        <div style="max-height: 400px; overflow-y: auto; font-size: 14px; color: var(--text-secondary); line-height: 1.8;">
          <p><strong>1. Acceptance</strong> - By using this API, you agree to these terms.</p>
          <p><strong>2. Usage</strong> - Use the API for legitimate purposes only.</p>
          <p><strong>3. Rate Limits</strong> - 100 requests per minute max.</p>
          <p><strong>4. Security</strong> - Keep your API key confidential.</p>
          <p><strong>5. Prohibited</strong> - No illegal activities or fraud.</p>
          <p><strong>6. Termination</strong> - We may suspend access for violations.</p>
          <p><strong>7. Changes</strong> - Terms may be updated periodically.</p>
        </div>
        <button class="btn btn-primary w-full mt-16" onclick="UI.closeModal()">I Understand</button>
      </div>
    `;
    
    if (typeof UI !== 'undefined' && UI.openModal) {
      UI.openModal(html);
    }
  },

  // ============================================================
  // SHOW PRIVACY
  // ============================================================
  showPrivacy: function() {
    var html = `
      <div style="padding: 10px;">
        <h3 style="margin-bottom: 16px; text-align: center;">🔒 Privacy Policy</h3>
        <div style="max-height: 400px; overflow-y: auto; font-size: 14px; color: var(--text-secondary); line-height: 1.8;">
          <p><strong>1. Data Collected</strong> - Nickname, ID, token, API usage stats.</p>
          <p><strong>2. Usage</strong> - To provide and improve the API service.</p>
          <p><strong>3. Storage</strong> - Securely stored in our database.</p>
          <p><strong>4. Sharing</strong> - We do not sell or share your data.</p>
          <p><strong>5. Your Rights</strong> - Access, modify, or delete your data.</p>
          <p><strong>6. Retention</strong> - Data kept while account is active.</p>
          <p><strong>7. Security</strong> - Industry-standard security measures.</p>
          <p><strong>8. Changes</strong> - Policy may be updated periodically.</p>
        </div>
        <button class="btn btn-primary w-full mt-16" onclick="UI.closeModal()">I Understand</button>
      </div>
    `;
    
    if (typeof UI !== 'undefined' && UI.openModal) {
      UI.openModal(html);
    }
  },

  // ============================================================
  // FORMAT NUMBER
  // ============================================================
  formatNumber: function(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num).toString();
  }
};

// ============================================================
// GLOBAL EXPORT
// ============================================================
window.Developer = Developer;

console.log('🔑 Developer module loaded!');
console.log('📌 Navigate: UI.navigateTo("developer")');