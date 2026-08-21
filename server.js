/* ============================================
   SERVER - Local Backend for Vcoin Payment App
   Domain: https://ttnaceri.github.io/Vcoin-Payment.net/
   Localhost: http://localhost:3000
   ============================================ */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ DOMAIN SOZLAMALARI ============
const DOMAIN = 'https://ttnaceri.github.io';
const BASE_PATH = '/Vcoin-Payment.net';

// ============ CORS SOZLAMALARI ============
const allowedOrigins = [
  // Localhost
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  // Domain
  'https://ttnaceri.github.io',
  'https://ttnaceri.github.io/',
  'https://ttnaceri.github.io/Vcoin-Payment.net',
  'https://ttnaceri.github.io/Vcoin-Payment.net/',
  'https://ttnaceri.github.io/vcoin-payment',
  'https://ttnaceri.github.io/vcoin-payment/',
  // Vercel / Netlify
  'https://vcoin-payment.vercel.app',
  'https://vcoin-payment.netlify.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS bloklandi:', origin);
      // Development uchun barcha origin ga ruxsat (faqat localhost da)
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true); // Production uchun ham ruxsat (kerak bo'lsa o'zgartiring)
      }
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'X-Master-Key'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// ============ BACKEND.JSON PATH ============
const DB_PATH = path.join(__dirname, 'backend.json');

// ============ MA'LUMOTLARNI YUKLASH ============
function loadData() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('❌ Yuklash xatosi:', e.message);
  }
  return { users: {}, transactions: [], settings: { commission: 0 } };
}

// ============ MA'LUMOTLARNI SAQLASH ============
function saveData(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('❌ Saqlash xatosi:', e.message);
    return false;
  }
}

// ============ REQUEST LOGGER ============
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// ============================================================
// ===== ROOT - API ma'lumotlari =====
// ============================================================

app.get('/', (req, res) => {
  res.json({
    name: 'Vcoin Payment App API',
    version: '3.0.0',
    domain: DOMAIN,
    basePath: BASE_PATH,
    localhost: 'http://localhost:' + PORT,
    endpoints: {
      v1: {
        user: '/api/v1/user?username=&token=',
        pay: '/api/v1/pay (POST)',
        apikey: '/api/v1/apikey (POST)',
        balance: '/api/v1/balance?userId=&token=',
        stats: '/api/v1/stats',
        health: '/api/v1/health'
      },
      legacy: {
        data: '/api/data',
        users: '/api/users',
        transfer: '/api/transfer'
      }
    }
  });
});

// ============================================================
// ===== API v1 ENDPOINTLAR =====
// ============================================================

// 1. Foydalanuvchi ma'lumotlarini olish (username + token)
app.get('/api/v1/user', (req, res) => {
  const username = req.query.username;
  const token = req.query.token;
  
  console.log('📤 /api/v1/user called:', { username, token });
  
  if (!username || !token) {
    return res.status(400).json({ 
      success: false, 
      error: 'Username and token required' 
    });
  }
  
  const data = loadData();
  if (!data || !data.users) {
    return res.status(404).json({ 
      success: false, 
      error: 'No users found' 
    });
  }
  
  let foundUser = null;
  let foundUserId = null;
  
  for (const id in data.users) {
    const user = data.users[id];
    if (user.nickname && user.nickname.toLowerCase() === username.toLowerCase()) {
      if (user.token === token) {
        foundUser = user;
        foundUserId = id;
        break;
      }
    }
  }
  
  if (!foundUser) {
    return res.status(404).json({ 
      success: false, 
      error: 'User not found or invalid token' 
    });
  }
  
  console.log('✅ User found:', foundUser.nickname);
  
  res.json({
    success: true,
    user: {
      id: foundUser.id,
      nickname: foundUser.nickname,
      balance: Number(foundUser.balance) || 0,
      token: foundUser.token
    }
  });
});

// 2. To'lov qilish (pay)
app.post('/api/v1/pay', (req, res) => {
  const { username, token, amount, receiverId, note } = req.body;
  
  console.log('📤 /api/v1/pay called:', { username, amount, receiverId, note });
  
  if (!username || !token) {
    return res.status(400).json({ 
      success: false, 
      error: 'Username and token required' 
    });
  }
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid amount' 
    });
  }
  
  const data = loadData();
  if (!data || !data.users) {
    return res.status(404).json({ 
      success: false, 
      error: 'No users found' 
    });
  }
  
  let foundUser = null;
  let foundUserId = null;
  
  for (const id in data.users) {
    const user = data.users[id];
    if (user.nickname && user.nickname.toLowerCase() === username.toLowerCase()) {
      if (user.token === token) {
        foundUser = user;
        foundUserId = id;
        break;
      }
    }
  }
  
  if (!foundUser) {
    return res.status(404).json({ 
      success: false, 
      error: 'User not found or invalid token' 
    });
  }
  
  const userBalance = Number(foundUser.balance) || 0;
  
  if (userBalance < amount) {
    return res.status(400).json({ 
      success: false, 
      error: 'Insufficient balance' 
    });
  }
  
  const commPercent = data.settings?.commission || 0;
  const commission = amount * (commPercent / 100);
  const receiverAmount = amount - commission;
  
  let receiverIdToUse = receiverId || foundUserId;
  
  const shopId = data.settings?.shopId || null;
  if (shopId && data.users[shopId]) {
    receiverIdToUse = shopId;
    console.log('🏪 Shop ID ishlatilmoqda:', shopId);
  }
  
  if (!data.users[receiverIdToUse]) {
    data.users[receiverIdToUse] = {
      id: receiverIdToUse,
      nickname: 'User_' + receiverIdToUse.slice(-4),
      balance: 0,
      token: '',
      createdAt: new Date().toISOString()
    };
  }
  
  data.users[foundUserId].balance = userBalance - amount;
  data.users[receiverIdToUse].balance = Number(data.users[receiverIdToUse].balance) + receiverAmount;
  
  if (!data.transactions) data.transactions = [];
  const txId = 'TX' + Date.now().toString(36).toUpperCase();
  data.transactions.unshift({
    id: txId,
    timestamp: new Date().toISOString(),
    fromId: foundUserId,
    toId: receiverIdToUse,
    amount: amount,
    commission: commission,
    receiverAmount: receiverAmount,
    type: 'api_payment',
    description: note || 'API payment'
  });
  
  if (data.transactions.length > 50) data.transactions.length = 50;
  
  const saved = saveData(data);
  
  if (saved) {
    console.log('✅ Payment successful:', { txId, amount, receiverIdToUse });
    res.json({
      success: true,
      transaction: {
        id: txId,
        amount: amount,
        commission: commission,
        receiverId: receiverIdToUse,
        newBalance: data.users[foundUserId].balance,
        timestamp: new Date().toISOString()
      }
    });
  } else {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save transaction' 
    });
  }
});

// 3. API KEY (Developer) - API kalit olish
app.post('/api/v1/apikey', (req, res) => {
  const { username, password, token } = req.body;
  
  console.log('📤 /api/v1/apikey called:', { username });
  
  if (!username || !password || !token) {
    return res.status(400).json({ 
      success: false, 
      error: 'Username, password and token required' 
    });
  }
  
  const data = loadData();
  if (!data || !data.users) {
    return res.status(404).json({ 
      success: false, 
      error: 'No users found' 
    });
  }
  
  let foundUser = null;
  let foundUserId = null;
  
  for (const id in data.users) {
    const user = data.users[id];
    if (user.nickname && user.nickname.toLowerCase() === username.toLowerCase()) {
      if (user.password === password && user.token === token) {
        foundUser = user;
        foundUserId = id;
        break;
      }
    }
  }
  
  if (!foundUser) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid credentials' 
    });
  }
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let apiKey = 'VP-';
  
  for (let i = 0; i < 4; i++) {
    apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  apiKey += '-';
  for (let i = 0; i < 3; i++) {
    apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  apiKey += '-';
  for (let i = 0; i < 3; i++) {
    apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  if (!data.developerApiKeys) data.developerApiKeys = {};
  if (!data.developerApiKeys[foundUserId]) data.developerApiKeys[foundUserId] = [];
  
  data.developerApiKeys[foundUserId].push({
    key: apiKey,
    createdAt: new Date().toISOString(),
    active: true
  });
  
  saveData(data);
  
  console.log('✅ API key generated:', apiKey);
  
  res.json({
    success: true,
    apiKey: apiKey,
    message: 'API key generated successfully'
  });
});

// 4. API KEY ni olish (GET)
app.get('/api/v1/apikey', (req, res) => {
  const token = req.query.token;
  
  console.log('📤 /api/v1/apikey (GET) called:', { token });
  
  if (!token) {
    return res.status(400).json({ 
      success: false, 
      error: 'Token required' 
    });
  }
  
  const data = loadData();
  if (!data || !data.users) {
    return res.status(404).json({ 
      success: false, 
      error: 'No users found' 
    });
  }
  
  let foundUserId = null;
  for (const id in data.users) {
    if (data.users[id].token === token) {
      foundUserId = id;
      break;
    }
  }
  
  if (!foundUserId) {
    return res.status(404).json({ 
      success: false, 
      error: 'User not found' 
    });
  }
  
  const apiKeys = data.developerApiKeys?.[foundUserId] || [];
  
  res.json({
    success: true,
    apiKeys: apiKeys
  });
});

// 5. Balans tekshirish
app.get('/api/v1/balance', (req, res) => {
  const userId = req.query.userId;
  const token = req.query.token;
  
  console.log('📤 /api/v1/balance called:', { userId });
  
  if (!userId) {
    return res.status(400).json({ 
      success: false, 
      error: 'userId required' 
    });
  }
  
  const data = loadData();
  if (!data || !data.users) {
    return res.status(404).json({ 
      success: false, 
      error: 'No users found' 
    });
  }
  
  const user = data.users[userId];
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      error: 'User not found' 
    });
  }
  
  if (token && user.token !== token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
  
  res.json({
    success: true,
    userId: userId,
    nickname: user.nickname,
    balance: Number(user.balance) || 0
  });
});

// 6. Statistika
app.get('/api/v1/stats', (req, res) => {
  console.log('📤 /api/v1/stats called');
  
  const data = loadData();
  if (!data || !data.users) {
    return res.json({
      success: true,
      totalUsers: 0,
      totalSpent: 0,
      totalPurchases: 0
    });
  }
  
  const totalUsers = Object.keys(data.users).length;
  let totalSpent = 0;
  let totalPurchases = 0;
  
  if (data.transactions) {
    data.transactions.forEach(tx => {
      if (tx.type === 'api_payment' || tx.type === 'external_payment' || tx.type === 'withdraw') {
        totalSpent += tx.amount || 0;
        totalPurchases++;
      }
    });
  }
  
  res.json({
    success: true,
    totalUsers: totalUsers,
    totalSpent: totalSpent,
    totalPurchases: totalPurchases,
    totalTransactions: data.transactions?.length || 0
  });
});

// 7. Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    domain: DOMAIN,
    basePath: BASE_PATH,
    localhost: 'http://localhost:' + PORT
  });
});

// ============================================================
// ===== ESKI API ENDPOINTLAR (Backward compatibility) =====
// ============================================================

app.get('/api/data', (req, res) => {
  const data = loadData();
  res.json({ success: true, record: data });
});

app.put('/api/data', (req, res) => {
  const newData = req.body;
  const saved = saveData(newData);
  if (saved) {
    res.json({ success: true, message: 'Saqlangan' });
  } else {
    res.status(500).json({ success: false, message: 'Saqlash xatosi' });
  }
});

app.get('/api/users', (req, res) => {
  const data = loadData();
  res.json({ success: true, users: data.users || {} });
});

app.post('/api/users', (req, res) => {
  const data = loadData();
  const user = req.body;
  if (!data.users) data.users = {};
  data.users[user.id] = user;
  const saved = saveData(data);
  if (saved) {
    res.json({ success: true, message: 'Foydalanuvchi qo\'shildi' });
  } else {
    res.status(500).json({ success: false, message: 'Saqlash xatosi' });
  }
});

app.get('/api/users/:id', (req, res) => {
  const data = loadData();
  const userId = req.params.id;
  if (data.users && data.users[userId]) {
    res.json({ success: true, user: data.users[userId] });
  } else {
    res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
  }
});

app.post('/api/transfer', (req, res) => {
  const { fromId, toId, amount } = req.body;
  const data = loadData();
  
  if (!data.users || !data.users[fromId]) {
    return res.status(404).json({ success: false, error: 'Jo\'natuvchi topilmadi' });
  }
  
  if (data.users[fromId].balance < amount) {
    return res.status(400).json({ success: false, error: 'Balans yetarli emas' });
  }
  
  if (!data.users[toId]) {
    data.users[toId] = {
      id: toId,
      nickname: 'User_' + toId.slice(-4),
      balance: 0,
      token: '',
      createdAt: new Date().toISOString()
    };
  }
  
  data.users[fromId].balance -= amount;
  data.users[toId].balance += amount;
  
  if (!data.transactions) data.transactions = [];
  data.transactions.unshift({
    id: 'TX' + Date.now().toString(36).toUpperCase(),
    timestamp: new Date().toISOString(),
    fromId: fromId,
    toId: toId,
    amount: amount,
    commission: 0,
    receiverAmount: amount,
    type: 'transfer',
    description: data.users[fromId].nickname + ' → ' + data.users[toId].nickname
  });
  
  const saved = saveData(data);
  if (saved) {
    res.json({ success: true, commission: 0, receiverAmount: amount });
  } else {
    res.status(500).json({ success: false, error: 'Saqlash xatosi' });
  }
});

app.post('/api/transactions', (req, res) => {
  const data = loadData();
  const transaction = req.body;
  if (!data.transactions) data.transactions = [];
  transaction.timestamp = transaction.timestamp || new Date().toISOString();
  transaction.id = transaction.id || 'TX' + Date.now().toString(36).toUpperCase();
  data.transactions.unshift(transaction);
  if (data.transactions.length > 50) data.transactions.length = 50;
  const saved = saveData(data);
  if (saved) {
    res.json({ success: true, transaction: transaction });
  } else {
    res.status(500).json({ success: false, message: 'Saqlash xatosi' });
  }
});

app.get('/api/transactions', (req, res) => {
  const data = loadData();
  res.json({ success: true, transactions: data.transactions || [] });
});

app.get('/api/settings', (req, res) => {
  const data = loadData();
  res.json({ success: true, settings: data.settings || { commission: 0 } });
});

app.put('/api/settings', (req, res) => {
  const data = loadData();
  const newSettings = req.body;
  data.settings = data.settings || {};
  for (let key in newSettings) {
    data.settings[key] = newSettings[key];
  }
  const saved = saveData(data);
  if (saved) {
    res.json({ success: true, settings: data.settings });
  } else {
    res.status(500).json({ success: false, message: 'Saqlash xatosi' });
  }
});

// ============================================================
// ===== SERVERNI ISHGA TUSHIRISH =====
// ============================================================

app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log('🚀 Vcoin Server ishga tushdi!');
  console.log('🚀 ========================================');
  console.log(`📍 Domain: ${DOMAIN}${BASE_PATH}`);
  console.log(`📍 Localhost: http://localhost:${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api/v1/`);
  console.log(`📁 Backend: ${DB_PATH}`);
  console.log('');
  console.log('🔗 API v1 endpointlar:');
  console.log(`  GET  /api/v1/user?username=&token=`);
  console.log(`  POST /api/v1/pay`);
  console.log(`  POST /api/v1/apikey`);
  console.log(`  GET  /api/v1/apikey?token=`);
  console.log(`  GET  /api/v1/balance?userId=&token=`);
  console.log(`  GET  /api/v1/stats`);
  console.log(`  GET  /api/v1/health`);
  console.log('');
  console.log('🔗 Eski API endpointlar:');
  console.log(`  GET  /api/data`);
  console.log(`  PUT  /api/data`);
  console.log(`  GET  /api/users`);
  console.log(`  POST /api/users`);
  console.log(`  GET  /api/users/:id`);
  console.log(`  POST /api/transfer`);
  console.log('🚀 ========================================');
  
  if (!fs.existsSync(DB_PATH)) {
    console.log('📄 Yangi backend.json yaratilmoqda...');
    saveData({ users: {}, transactions: [], settings: { commission: 0 } });
  }
});