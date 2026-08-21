/* ============================================
   CONFIG - Vcoin Payment App
   FAKE CONFIG (Default / Namuna)
   Bu fayl repository da bo'ladi
   Haqiqiy ma'lumotlarni o'zingizning config.js ga yozing
   ============================================ */

var CONFIG = {
  // ===== JSONBin.io (Cloud Database) =====
  // O'zingizning BIN_ID va MASTER_KEY ni kiriting
  BIN_ID: 'YOUR_BACKEND_OR_BIN_ID_HERE',
  MASTER_KEY: 'YOUR_MASTER_KEY_HERE',
  
  // ===== Telegram Bot =====
  // O'zingizning Bot Token va Username ni kiriting
  BOT_TOKEN: 'BOT_TOKEN_HERE',
  BOT_USERNAME: 'BOT_URL_HERE',
  
  // ===== Admin Settings =====
  ADMIN_PASSWORD: 'ADMIN_PASSWORD_HERE',
  ADMIN_TOKEN: 'ADMIN_TOKEN_HERE',
  
  // ===== App Settings =====
  APP_VERSION: '3.0.0',
  APP_NAME: 'Vcoin Payment App',
  
  // ===== Default Settings =====
  DEFAULT_COMMISSION: 1,
  DEFAULT_DEPOSIT_PROFIT: 16,
  DEFAULT_REFERRAL_BONUS: 20,
  
  // ===== API Endpoints =====
  API_URL: 'https://api.jsonbin.io/v3/b/',
  
  // ===== Features =====
  ENABLE_REFERRAL: false,
  ENABLE_DEPOSIT: true,
  ENABLE_TRANSFER: true,
  ENABLE_ADMIN: true
};

// Global qilish
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
