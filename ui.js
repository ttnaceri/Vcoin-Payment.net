/* ============================================
   UI MODULE - Interfeys boshqaruvi
   Faqat O'zbek va Ingliz tillari
   Referral olib tashlangan
   Bottom nav tilga mos
   Profil + Developer + Admin tuzatilgan
   ============================================ */

var UI = {
  currentPage: 'auth',
  pageHistory: [],
  isInitialized: false,

  init: function() {
    if (this.isInitialized) return;
    this.hideSplash();
    this.setupNavigation();
    this.setupBackButton();
    this.setupTheme();
    this.setupKeyboardShortcuts();
    this.setupNotifButton();
    this.isInitialized = true;
  },

  // ==================== TIL YORDAMCHI ====================
  t: function(key, fallback) {
    if (typeof LANG !== 'undefined' && LANG.t) {
      var result = LANG.t(key);
      if (result && result !== key) return result;
    }
    return fallback || key;
  },

  // ==================== BILDIRISHNOMALAR ====================
  setupNotifButton: function() {
    var notifBtn = document.getElementById('notifBtn');
    if (notifBtn) {
      notifBtn.addEventListener('click', function() { UI.showNotificationsModal(); });
    }
    this.updateNotifBadge();
  },

  showNotificationsModal: function() {
    var t = this.t.bind(this);
    var announces = [];
    
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf('vcoin_announce_') === 0) {
        try { 
          var d = JSON.parse(localStorage.getItem(key)); 
          if (d && d.text) announces.push({ 
            type: 'announce', 
            text: d.text, 
            time: d.time, 
            key: key 
          }); 
        } catch(e) {}
      }
      if (key && key.indexOf('vcoin_cancel_req_') === 0) {
        try { 
          var d2 = JSON.parse(localStorage.getItem(key)); 
          if (d2 && d2.fromNick) announces.push({ 
            type: 'cancel', 
            fromNick: d2.fromNick, 
            amount: d2.amount, 
            time: d2.time, 
            key: key 
          }); 
        } catch(e) {}
      }
    }
    
    announces.sort(function(a, b) { 
      return (b.time || '').localeCompare(a.time || ''); 
    });

    var html = '<div style="padding: 10px; position: relative;">';
    html += '<span onclick="UI.closeModal()" style="position: absolute; top: 8px; left: 14px; cursor: pointer; font-size: 22px; color: #888; font-weight: 700; z-index: 10;">✕</span>';
    html += '<h3 style="text-align:center;margin-bottom:20px;padding-top:10px;">🔔 ' + t('notifications', 'Bildirishnomalar') + '</h3>';

    if (announces.length === 0) {
      html += '<div style="text-align:center;padding:40px;color:var(--text-muted);">';
      html += '<i class="fas fa-bell-slash" style="font-size:40px;margin-bottom:12px;opacity:0.5;"></i>';
      html += '<p>' + t('no_notifications', 'Hozircha bildirishnomalar yo\'q') + '</p>';
      html += '</div>';
    } else {
      announces.forEach(function(a) {
        if (a.type === 'announce') {
          html += '<div class="glass-card" style="padding:12px 36px 12px 14px;margin-bottom:10px;position:relative;">';
          html += '<div style="font-size:13px;">📢 ' + a.text + '</div>';
          html += '<div style="font-size:10px;color:var(--text-muted);margin-top:4px;">' + (a.time ? new Date(a.time).toLocaleString() : '') + '</div>';
          html += '<span onclick="UI.dismissNotifItem(\''+a.key+'\')" style="position:absolute;top:10px;right:12px;cursor:pointer;font-size:16px;color:#e74c3c;font-weight:700;">✕</span></div>';
        } else if (a.type === 'cancel') {
          html += '<div class="glass-card" style="padding:12px 36px 12px 14px;margin-bottom:10px;position:relative;background:rgba(240,185,11,0.08);">';
          html += '<div style="font-size:13px;margin-bottom:8px;">⚠️ <b>' + a.fromNick + '</b> ' + 
                  (Utils.formatNumber ? Utils.formatNumber(a.amount) : a.amount) + ' Vcoin ' + 
                  t('refund_request', 'qaytarishni so\'radi!') + '</div>';
          html += '<div style="display:flex;gap:8px;">';
          html += '<button class="btn btn-success btn-sm" onclick="UI.approveCancelNotif(\''+a.key+'\','+a.amount+',\''+a.fromNick+'\')" style="flex:1;">✅ ' + t('refund', 'Qaytarish') + '</button>';
          html += '<button class="btn btn-sm" onclick="UI.dismissNotifItem(\''+a.key+'\')" style="flex:1;background:#e74c3c;color:#fff;">❌ ' + t('no', 'Yo\'q') + '</button>';
          html += '</div></div>';
        }
      });
    }
    html += '<button class="btn btn-outline w-full mt-12" onclick="UI.closeModal()">' + t('close', 'Yopish') + '</button></div>';
    this.openModal(html);
  },

  dismissNotifItem: function(key) { 
    localStorage.removeItem(key); 
    this.closeModal(); 
    this.showNotificationsModal(); 
  },

  approveCancelNotif: function(key, amount, fromNick) {
    localStorage.removeItem(key); 
    this.closeModal();
    var t = this.t.bind(this);
    this.showToast('✅ ' + fromNick + ' ga ' + (Utils.formatNumber ? Utils.formatNumber(amount) : amount) + ' Vcoin ' + t('refund_done', 'qaytarildi!'), 'success');
  },

  // ==================== SPLASH ====================
  hideSplash: function() {
    var self = this;
    setTimeout(function() {
      var splash = document.getElementById('splash');
      if (splash) { 
        splash.classList.add('hide'); 
        setTimeout(function() { 
          splash.style.display = 'none'; 
          var app = document.getElementById('app'); 
          if (app) app.style.display = 'block'; 
          if (DB && DB.userExists && DB.userExists()) { 
            self.navigateTo('dashboard'); 
          } else { 
            self.navigateTo('auth'); 
          } 
        }, 500); 
      }
    }, 1200);
  },

  // ==================== NAVIGATSIYA ====================
  setupNavigation: function() {
    var items = document.querySelectorAll('.nav-item');
    items.forEach(function(item) { 
      item.addEventListener('click', function() { 
        var page = this.dataset.page; 
        if (page) UI.navigateTo(page); 
      }); 
    });
  },

  setupBackButton: function() { 
    var backBtn = document.getElementById('backBtn'); 
    if (backBtn) backBtn.addEventListener('click', function() { UI.goBack(); }); 
  },

  setupTheme: function() { 
    var theme = localStorage.getItem('vcoin_theme') || 'dark'; 
    document.documentElement.setAttribute('data-theme', theme); 
  },

  setupKeyboardShortcuts: function() {
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') { 
        var overlay = document.getElementById('modalOverlay'); 
        if (overlay && overlay.style.display === 'flex') UI.closeModal(); 
        else if (UI.currentPage !== 'dashboard' && UI.currentPage !== 'auth') UI.goBack(); 
      }
    });
  },

  // ==================== SAHIFALAR ====================
  navigateTo: function(page, data) {
    var t = this.t.bind(this);
    
    // Tilga mos sarlavhalar
    var titles = {
      auth: t('auth', 'Vcoin'),
      dashboard: t('dashboard', 'Asosiy'),
      transfer: t('send', "Jo'natish"),
      deposit: t('deposit', 'Depozit'),
      task: t('task', 'Topshiriq'),
      history: t('history', 'Tarix'),
      profile: t('profile', 'Profil'),
      token: t('token', 'Token'),
      developer: t('developer', 'Developer'),
      admin: t('admin', 'Admin Panel'),
      settings: t('settings', 'Sozlamalar')
    };

    // Ruxsatni tekshirish
    var protectedPages = ['dashboard', 'transfer', 'deposit', 'task', 'history', 'profile', 'token', 'developer', 'admin', 'settings'];
    if (protectedPages.indexOf(page) !== -1 && (!DB || !DB.userExists || !DB.userExists())) page = 'auth';

    // Nav itemlarni yangilash
    var navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(function(item) { 
      item.classList.toggle('active', item.dataset.page === page); 
    });

    // ===== BOTTOM NAV MATNLARINI YANGILASH =====
    var bottomNav = document.getElementById('bottomNav');
    if (bottomNav) {
      var navLabels = bottomNav.querySelectorAll('[data-i18n]');
      for (var l = 0; l < navLabels.length; l++) {
        var el = navLabels[l];
        var key = el.getAttribute('data-i18n');
        el.textContent = t(key);
      }
    }

    // Bottom nav ko'rsatish
    var navPages = ['dashboard', 'transfer', 'deposit', 'profile'];
    if (bottomNav) {
      bottomNav.style.display = navPages.indexOf(page) !== -1 && DB && DB.userExists && DB.userExists() ? 'flex' : 'none';
    }

    // Back button
    var backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.style.display = (page === 'auth' || page === 'dashboard' || !DB || !DB.userExists || !DB.userExists()) ? 'none' : 'flex';

    // Tarix
    if (this.currentPage !== page && this.currentPage !== 'auth') this.pageHistory.push(this.currentPage);
    this.currentPage = page;

    // Sarlavha
    var titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = titles[page] || 'Vcoin';

    // Sahifani render qilish
    this.renderPage(page, data);
    
    var mainContent = document.getElementById('mainContent');
    if (mainContent) mainContent.scrollTop = 0;
  },

  goBack: function() { 
    if (this.pageHistory.length > 0) { 
      var prev = this.pageHistory.pop(); 
      this.currentPage = prev; 
      this.navigateTo(prev); 
    } else { 
      this.navigateTo('dashboard'); 
    } 
  },

  renderPage: function(page, data) {
    var container = document.getElementById('mainContent');
    if (!container) return;
    
    container.classList.remove('fade-in'); 
    void container.offsetWidth; 
    container.classList.add('fade-in');

    var pages = {
      auth: function() { 
        if (typeof Auth !== 'undefined') {
          Auth.render(container);
        } else {
          container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">⚠️ Auth module not loaded</div>';
        }
      },
      
      dashboard: function() { 
        if (typeof Dashboard !== 'undefined') {
          Dashboard.render(container);
        } else {
          container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">⚠️ Dashboard module not loaded</div>';
        }
      },
      
      transfer: function() { 
        if (typeof Transfer !== 'undefined') {
          Transfer.render(container);
        } else {
          container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">⚠️ Transfer module not loaded</div>';
        }
      },
      
      deposit: function() { 
        if (typeof DepositModule !== 'undefined') {
          DepositModule.render(container);
        } else {
          container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">⚠️ Deposit module not loaded</div>';
        }
      },
      
      task: function() { 
        if (typeof Task !== 'undefined') {
          Task.render(container);
        } else {
          container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">⚠️ Task module not loaded</div>';
        }
      },
      
      history: function() { 
        if (typeof History !== 'undefined') {
          History.render(container);
        } else {
          container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">⚠️ History module not loaded</div>';
        }
      },
      
      profile: function() { 
        try {
          if (typeof Settings !== 'undefined') {
            Settings.render(container);
          } else if (typeof Profile !== 'undefined') {
            Profile.render(container);
          } else {
            container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">⚠️ Profil moduli yuklanmadi</div>';
          }
        } catch(e) {
          console.error('Profile render error:', e);
          container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--accent-red);">❌ Xatolik: ' + e.message + '</div>';
        }
      },
      
      token: function() { 
        if (typeof Token !== 'undefined') {
          Token.render(container);
        } else {
          container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">⚠️ Token module not loaded</div>';
        }
      },
      
      developer: function() { 
        try {
          if (typeof Developer !== 'undefined') {
            Developer.render(container);
          } else {
            container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">⚠️ Developer moduli yuklanmadi</div>';
          }
        } catch(e) {
          console.error('Developer render error:', e);
          container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--accent-red);">❌ Xatolik: ' + e.message + '</div>';
        }
      },
      
      // ===== ADMIN (TUZATILGAN - AdminPanel -> Admin) =====
      admin: function() { 
        try {
          // Admin obyekti mavjudligini tekshirish
          if (typeof Admin !== 'undefined' && Admin.render) {
            console.log('🛡️ Rendering Admin Panel via Admin');
            Admin.render(container);
          } 
          // Eski AdminPanel (agar mavjud bo'lsa)
          else if (typeof AdminPanel !== 'undefined' && AdminPanel.render) {
            console.log('🛡️ Rendering Admin Panel via AdminPanel');
            AdminPanel.render(container);
          } 
          else {
            console.warn('⚠️ Admin module not found');
            container.innerHTML = `
              <div style="text-align:center;padding:40px;">
                <div style="font-size:48px;margin-bottom:16px;">🛡️</div>
                <h3 style="color:var(--text-muted);">Admin moduli yuklanmadi</h3>
                <p style="color:var(--text-muted);font-size:13px;margin-top:8px;">
                  Iltimos, sahifani yangilang yoki admin panelga kirish huquqini tekshiring.
                </p>
                <button class="btn btn-primary" onclick="location.reload()" style="margin-top:16px;">
                  <i class="fas fa-sync"></i> Yangilash
                </button>
              </div>
            `;
          }
        } catch(e) {
          console.error('❌ Admin render error:', e);
          container.innerHTML = `
            <div style="text-align:center;padding:40px;">
              <div style="font-size:48px;margin-bottom:16px;">❌</div>
              <h3 style="color:var(--accent-red);">Xatolik yuz berdi</h3>
              <p style="color:var(--text-muted);font-size:13px;margin-top:8px;">${e.message}</p>
              <button class="btn btn-primary" onclick="location.reload()" style="margin-top:16px;">
                <i class="fas fa-sync"></i> Yangilash
              </button>
            </div>
          `;
        }
      },
      
      settings: function() { 
        if (typeof Settings !== 'undefined') {
          Settings.render(container);
        } else {
          container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">⚠️ Settings module not loaded</div>';
        }
      }
    };

    if (pages[page]) { 
      try { 
        pages[page](data); 
      } catch(e) { 
        console.error('❌ Page render error:', page, e);
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--accent-red);">❌ Xatolik: '+e.message+'</div>'; 
      } 
    } else { 
      container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--accent-red);">❌ Sahifa topilmadi: ' + page + '</div>'; 
    }
  },

  // ==================== MODAL ====================
  openModal: function(html) { 
    var overlay = document.getElementById('modalOverlay'); 
    var content = document.getElementById('modalContent'); 
    if (overlay && content) { 
      content.innerHTML = html; 
      overlay.style.display = 'flex'; 
      document.body.style.overflow = 'hidden'; 
    } 
  },
  
  closeModal: function() { 
    var overlay = document.getElementById('modalOverlay'); 
    if (overlay) { 
      overlay.style.display = 'none'; 
      document.body.style.overflow = ''; 
    } 
  },

  // ==================== TOAST ====================
  showToast: function(message, type, duration) {
    type = type || 'info'; 
    duration = duration || 3000;
    
    var container = document.getElementById('toastContainer');
    if (!container) { 
      container = document.createElement('div'); 
      container.id = 'toastContainer'; 
      container.style.cssText = 'position:fixed;top:70px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;max-width:320px;'; 
      document.body.appendChild(container); 
    }
    
    var colorMap = {
      success: 'var(--accent-green, #00ff88)',
      error: 'var(--accent-red, #ff2d55)',
      info: 'var(--accent-blue, #00d4ff)',
      warning: 'var(--accent-gold, #ffd700)'
    };
    var iconMap = {
      success: 'fa-check-circle',
      error: 'fa-times-circle',
      info: 'fa-info-circle',
      warning: 'fa-exclamation-triangle'
    };
    
    var toast = document.createElement('div'); 
    toast.className = 'toast slide-down';
    toast.style.cssText = 'background:var(--bg-card);border:1px solid '+(colorMap[type]||'var(--border-color)')+';border-left:4px solid '+(colorMap[type]||'var(--accent-blue)')+';padding:12px 16px;border-radius:12px;display:flex;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,0.3);cursor:pointer;';
    toast.innerHTML = '<i class="fas '+(iconMap[type]||'fa-info-circle')+'" style="color:'+(colorMap[type]||'var(--accent-blue)')+';font-size:16px;"></i><span style="flex:1;font-size:13px;">'+message+'</span><i class="fas fa-times" style="color:var(--text-muted);font-size:12px;cursor:pointer;"></i>';
    
    var closeBtn = toast.querySelector('.fa-times'); 
    if (closeBtn) closeBtn.addEventListener('click', function(e) { 
      e.stopPropagation(); 
      UI.dismissToast(toast); 
    });
    toast.addEventListener('click', function() { 
      UI.dismissToast(toast); 
    });
    
    container.appendChild(toast);
    
    setTimeout(function() { 
      UI.dismissToast(toast); 
    }, duration);
  },

  dismissToast: function(toast) { 
    if (!toast || !toast.parentNode) return; 
    toast.style.opacity = '0'; 
    toast.style.transform = 'translateX(60px)'; 
    setTimeout(function() { 
      if (toast.parentNode) toast.remove(); 
    }, 300); 
  },

  // ==================== BADGE ====================
  updateNotifBadge: function(count) { 
    var badge = document.getElementById('notifBadge'); 
    if (badge) { 
      if (count > 0) { 
        badge.textContent = count > 99 ? '99+' : count; 
        badge.style.display = 'flex'; 
      } else { 
        badge.style.display = 'none'; 
      } 
    } 
  },

  // ==================== CONFIRM ====================
  confirm: function(message, onConfirm, onCancel) {
    var t = this.t.bind(this);
    var cancelText = t('cancel', 'Bekor');
    var confirmText = t('confirm', 'Tasdiqlash');
    
    var html = '<div style="text-align:center;padding:8px 0;">';
    html += '<div style="font-size:40px;margin-bottom:12px;">⚠️</div>';
    html += '<p style="margin-bottom:20px;font-size:15px;">'+message+'</p>';
    html += '<div style="display:flex;gap:12px;">';
    html += '<button class="btn btn-outline" style="flex:1;" id="modalCancel">'+cancelText+'</button>';
    html += '<button class="btn btn-primary" style="flex:1;" id="modalConfirm">'+confirmText+'</button>';
    html += '</div></div>';
    
    this.openModal(html);
    
    document.getElementById('modalConfirm').addEventListener('click', function() { 
      UI.closeModal(); 
      if (onConfirm) onConfirm(); 
    });
    document.getElementById('modalCancel').addEventListener('click', function() { 
      UI.closeModal(); 
      if (onCancel) onCancel(); 
    });
  }
};

// ==================== BOSHLASH ====================
document.addEventListener('DOMContentLoaded', function() {
  var overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.addEventListener('click', function(e) { 
    if (e.target === overlay) UI.closeModal(); 
  });
  UI.init();
  
  // Admin obyekti mavjudligini tekshirish
  if (typeof Admin !== 'undefined') {
    console.log('🛡️ Admin loaded successfully');
  } else if (typeof AdminPanel !== 'undefined') {
    console.log('🛡️ AdminPanel loaded successfully');
  } else {
    console.warn('⚠️ Admin module not found, check admin.js');
  }
});