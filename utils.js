/**
 * Vcoin Payment App — Utility Functions
 */

const Utils = {
  /**
   * Generate random 9-digit ID
   */
  generateId: function() {
    var id;
    var allUsers = (DB && DB.getAllUsers) ? DB.getAllUsers() : {};
    var attempts = 0;
    var maxAttempts = 100;
    
    do {
      id = Math.floor(100000000 + Math.random() * 900000000).toString();
      attempts++;
    } while (allUsers[id] && attempts < maxAttempts);
    
    return id;
  },

  /**
   * Generate personal token (VCOIN-XXXX-XXXX-XXXX-XXXX format)
   */
  generateToken: function() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var segments = [];
    
    for (var s = 0; s < 4; s++) {
      var segment = '';
      for (var i = 0; i < 4; i++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      segments.push(segment);
    }
    
    return 'VCOIN-' + segments.join('-');
  },

  /**
   * Format number with commas
   */
  formatNumber: function(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Number(num).toLocaleString('en-US', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    });
  },

  /**
   * Format currency
   */
  formatCurrency: function(amount) {
    return this.formatNumber(amount) + ' Vcoin';
  },

  /**
   * Format date
   */
  formatDate: function(dateStr) {
    if (!dateStr) return 'N/A';
    
    try {
      var date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      var now = new Date();
      var diff = now - date;
      
      if (diff < 60000) return 'Hozir';
      if (diff < 3600000) return Math.floor(diff / 60000) + ' daqiqa oldin';
      if (diff < 86400000) return Math.floor(diff / 3600000) + ' soat oldin';
      if (diff < 604800000) return Math.floor(diff / 86400000) + ' kun oldin';
      if (diff < 2592000000) return Math.floor(diff / 604800000) + ' hafta oldin';
      
      return date.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  },

  /**
   * Format time only
   */
  formatTime: function(dateStr) {
    if (!dateStr) return '';
    try {
      var date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  },

  /**
   * Shorten string
   */
  shorten: function(str, start, end) {
    start = start || 6;
    end = end || 4;
    if (!str) return '';
    if (typeof str !== 'string') str = String(str);
    if (str.length <= start + end) return str;
    return str.slice(0, start) + '...' + str.slice(-end);
  },

  /**
   * Copy to clipboard
   */
  copyToClipboard: async function(text) {
    if (!text) return false;
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      console.warn('Clipboard API failed, using fallback');
    }
    
    // Fallback method
    try {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (e) {
      console.error('Copy failed:', e);
      return false;
    }
  },

  /**
   * Calculate deposit profit
   */
  calculateDepositProfit: function(amount, dailyPercent, days) {
    if (!amount || amount <= 0) {
      return {
        totalProfit: 0,
        finalAmount: 0,
        dailyProfit: 0
      };
    }
    
    var total = amount;
    var dailyProfit = amount * (dailyPercent / 100);
    
    for (var i = 0; i < days; i++) {
      total += total * (dailyPercent / 100);
    }
    
    return {
      totalProfit: total - amount,
      finalAmount: total,
      dailyProfit: dailyProfit
    };
  },

  /**
   * Calculate days remaining
   */
  daysRemaining: function(endDate) {
    if (!endDate) return 0;
    
    try {
      var end = new Date(endDate);
      if (isNaN(end.getTime())) return 0;
      
      var now = new Date();
      var diff = end - now;
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    } catch (e) {
      return 0;
    }
  },

  /**
   * Calculate current deposit value
   */
  calculateCurrentDepositValue: function(amount, dailyPercent, startDate) {
    if (!amount || amount <= 0 || !startDate) return amount || 0;
    
    try {
      var start = new Date(startDate);
      if (isNaN(start.getTime())) return amount;
      
      var now = new Date();
      var daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      
      if (daysPassed <= 0) return amount;
      
      var total = amount;
      for (var i = 0; i < daysPassed; i++) {
        total += total * (dailyPercent / 100);
      }
      return total;
    } catch (e) {
      return amount;
    }
  },

  /**
   * Check if valid user ID (9 digits)
   */
  isValidUserId: function(id) {
    if (!id) return false;
    if (typeof id !== 'string') id = String(id);
    return /^\d{9}$/.test(id);
  },

  /**
   * Check if valid token format
   */
  isValidToken: function(token) {
    if (!token) return false;
    if (typeof token !== 'string') token = String(token);
    return /^VCOIN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(token);
  },

  /**
   * Mask sensitive data (token, ID, etc.)
   */
  maskString: function(str, showStart, showEnd) {
    showStart = showStart || 4;
    showEnd = showEnd || 4;
    
    if (!str) return '';
    if (typeof str !== 'string') str = String(str);
    if (str.length <= showStart + showEnd) return str;
    
    var start = str.slice(0, showStart);
    var end = str.slice(-showEnd);
    var middle = '•'.repeat(Math.min(str.length - showStart - showEnd, 8));
    
    return start + middle + end;
  },

  /**
   * Get random color
   */
  randomColor: function() {
    var colors = [
      '#4a90d9', '#7b68ee', '#2ea043', '#f0883e',
      '#da3633', '#d29922', '#58a6ff', '#3fb950',
      '#f85149', '#d2a8ff', '#79c0ff', '#7ee787'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  /**
   * Debounce function
   */
  debounce: function(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  },

  /**
   * Throttle function
   */
  throttle: function(func, limit) {
    var inThrottle;
    return function() {
      var context = this;
      var args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  },

  /**
   * Sleep/delay
   */
  sleep: function(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms);
    });
  },

  /**
   * Parse query parameters
   */
  getQueryParams: function() {
    var params = {};
    var query = window.location.search.substring(1);
    if (!query) return params;
    
    var pairs = query.split('&');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return params;
  },

  /**
   * Build query string
   */
  buildQueryString: function(params) {
    var parts = [];
    for (var key in params) {
      if (params.hasOwnProperty(key) && params[key] !== null && params[key] !== undefined) {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
      }
    }
    return parts.length ? '?' + parts.join('&') : '';
  },

  /**
   * Validate email
   */
  isValidEmail: function(email) {
    if (!email) return false;
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * Truncate text with ellipsis
   */
  truncate: function(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  },

  /**
   * Capitalize first letter
   */
  capitalize: function(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Safe JSON parse
   */
  safeJSONParse: function(json, defaultValue) {
    defaultValue = defaultValue !== undefined ? defaultValue : null;
    try {
      return JSON.parse(json);
    } catch (e) {
      return defaultValue;
    }
  },

  /**
   * Get file extension
   */
  getFileExtension: function(filename) {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
  },

  /**
   * Generate unique ID
   */
  uniqueId: function(prefix) {
    prefix = prefix || '';
    return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  /**
   * Check if mobile device
   */
  isMobile: function() {
    return /Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent);
  },

  /**
   * Check if in iframe
   */
  isInIframe: function() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  },

  /**
   * Get browser info
   */
  getBrowserInfo: function() {
    var ua = navigator.userAgent;
    var browser = 'Unknown';
    
    if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Safari') > -1) browser = 'Safari';
    else if (ua.indexOf('Edge') > -1) browser = 'Edge';
    else if (ua.indexOf('Opera') > -1) browser = 'Opera';
    
    return browser;
  },

  /**
   * Get device info
   */
  getDeviceInfo: function() {
    var ua = navigator.userAgent;
    if (/Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Mac/i.test(ua)) return 'Mac';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'Unknown';
  }
};

// Export for debugging
window.Utils = Utils;