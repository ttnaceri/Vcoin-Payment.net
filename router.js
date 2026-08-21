/**
 * Vcoin Payment App — Router
 * URL parametrlarini boshqarish
 * Referral butunlay o'chirilgan
 */

var Router = {
  /**
   * Router ni ishga tushirish
   */
  init: function() {
    console.log('🔀 Router initialized');
  },

  /**
   * URL dan parametrni o'chirish
   */
  removeUrlParam: function(param) {
    try {
      var url = new URL(window.location);
      url.searchParams.delete(param);
      window.history.replaceState({}, document.title, url.toString());
    } catch (e) {
      console.warn('Could not remove URL param:', e);
    }
  },

  /**
   * Joriy sahifa nomini olish
   */
  getCurrentPage: function() {
    var path = window.location.pathname;
    var page = path.split('/').pop().replace('.html', '') || 'index';
    return page;
  },

  /**
   * Sahifaga o'tish
   */
  navigateTo: function(page) {
    var url = page + '.html';
    window.location.href = url;
  },

  /**
   * Orqaga qaytish
   */
  goBack: function() {
    window.history.back();
  },

  /**
   * URL parametrlarini olish
   */
  getUrlParams: function() {
    var params = {};
    var search = window.location.search;
    if (search) {
      var pairs = search.substring(1).split('&');
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
      }
    }
    return params;
  },

  /**
   * URL ga parametr qo'shish
   */
  addUrlParam: function(key, value) {
    try {
      var url = new URL(window.location);
      url.searchParams.set(key, value);
      window.history.replaceState({}, document.title, url.toString());
    } catch (e) {
      console.warn('Could not add URL param:', e);
    }
  },

  /**
   * Sahifa yuklanganda ishlov berish
   */
  handlePageLoad: function() {
    var params = this.getUrlParams();
    
    // Tashqi to'lov parametrlarini tekshirish
    if (params.pay && params.amount && params.token) {
      console.log('💳 External payment request detected');
      // Payment handling is done in app.js
    }
  }
};

// Avtomatik ishga tushirish
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    Router.init();
    Router.handlePageLoad();
  });
} else {
  Router.init();
  Router.handlePageLoad();
}