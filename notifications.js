/**
 * Vcoin Payment App — Notifications Module
 */

var Notifications = {
  queue: [],

  show: function(title, message, type, duration) {
    type = type || 'info';
    duration = duration || 4000;
    
    var container = document.getElementById('toastContainer');
    if (!container) return;

    var iconMap = {
      success: 'fa-check-circle',
      error: 'fa-times-circle',
      info: 'fa-info-circle',
      warning: 'fa-exclamation-triangle'
    };
    var colorMap = {
      success: 'var(--accent-green)',
      error: 'var(--accent-red)',
      info: 'var(--accent-blue)',
      warning: 'var(--accent-gold)'
    };

    var icon = iconMap[type] || 'fa-info-circle';
    var color = colorMap[type] || 'var(--accent-blue)';

    var el = document.createElement('div');
    el.className = 'toast toast-' + type + ' slide-down';
    el.innerHTML = '<i class="fas ' + icon + '" style="color:' + color + ';font-size:18px;margin-top:2px;"></i>' +
      '<div style="flex:1;"><div style="font-weight:600;font-size:13px;">' + title + '</div>' +
      '<div style="font-size:12px;color:var(--text-secondary);">' + message + '</div></div>';

    container.appendChild(el);

    setTimeout(function() {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-20px)';
      el.style.transition = 'all 0.3s ease';
      setTimeout(function() { if (el.parentNode) el.remove(); }, 300);
    }, duration);

    if (UI && UI.updateNotifBadge) UI.updateNotifBadge(1);
  },

  transferSuccess: function(amount, recipient) {
    this.show('✅ Jo\'natma Yuborildi', Utils.formatNumber(amount) + ' Vcoin jo\'natildi', 'success', 4000);
  },

  transferReceived: function(amount, sender) {
    this.show('📥 Vcoin Qabul Qilindi', Utils.formatNumber(amount) + ' Vcoin qabul qilindi', 'success', 4000);
  },

  referralBonus: function(name) {
    this.show('🎉 Referral Bonusi!', '+20 Vcoin — ' + (name || 'yangi foydalanuvchi'), 'success', 5000);
  },

  depositCompleted: function(amount) {
    this.show('📈 Depozit Yakunlandi', Utils.formatNumber(amount) + ' Vcoin qaytarildi', 'success', 6000);
  },

  adminAction: function(action) {
    this.show('🛡️ Admin Amaliyoti', action || '', 'warning', 3000);
  },

  error: function(message) {
    this.show('❌ Xatolik', message || '', 'error', 5000);
  },

  warning: function(message) {
    this.show('⚠️ Ogohlantirish', message || '', 'warning', 4000);
  },

  info: function(message) {
    this.show('ℹ️ Ma\'lumot', message || '', 'info', 3000);
  },

  syncComplete: function() {
    this.show('☁️ Sinxronlash', 'Cloud bilan sinxronlashtirildi', 'info', 2000);
  }
};