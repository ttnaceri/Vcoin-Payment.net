var VcoinAPI = {
  baseURL: 'https://ttnaceri.github.io/vcoin-payment/',
  version: '2.0.0',

  // JSONBin.io orqali Cloud ga ulanish
  cloudLoad: async function() {
    try {
      var res = await fetch('https://api.jsonbin.io/v3/b/6a43ae2df5f4af5e29471fb8/latest', {
        headers: { 'X-Master-Key': '$2a$10$/r5j23KIs5ifP0fzwBCDDuDBTCegNBxm/T8loZCgwSqpuXv3AxYMy' }
      });
      var data = await res.json();
      return data.record;
    } catch(e) { return null; }
  },

  cloudSave: async function(record) {
    try {
      var res = await fetch('https://api.jsonbin.io/v3/b/6a43ae2df5f4af5e29471fb8', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': '$2a$10$/r5j23KIs5ifP0fzwBCDDuDBTCegNBxm/T8loZCgwSqpuXv3AxYMy'
        },
        body: JSON.stringify(record)
      });
      return res.ok;
    } catch(e) { return false; }
  },

  verifyToken: async function(token) {
    if (!token) return { success: false, error: 'Token kiritilmagan' };
    if (!/^VC_[A-Z0-9]{12}$/.test(token)) return { success: false, error: 'Noto\'g\'ri token formati' };

    try {
      var data = await this.cloudLoad();
      if (!data || !data.users) return { success: false, error: 'Tizimda xatolik' };

      var user = null;
      for (var id in data.users) {
        if (data.users[id].token === token) { user = data.users[id]; break; }
      }

      if (!user) return { success: false, error: 'Token topilmadi' };

      return {
        success: true,
        user: { id: user.id, nickname: user.nickname || 'User', balance: Number(user.balance) || 0, token: user.token }
      };
    } catch(e) { return { success: false, error: 'Tizim xatosi' }; }
  },

  processPayment: async function(token, amount, description, siteName) {
    if (!token) return { success: false, error: 'Token kiritilmagan' };
    if (!amount || amount <= 0) return { success: false, error: 'Miqdor noto\'g\'ri' };
    description = description || 'To\'lov';
    siteName = siteName || 'Tashqi sayt';

    var v = await this.verifyToken(token);
    if (!v.success) return v;
    if (v.user.balance < amount) return { success: false, error: 'Balans yetarli emas' };

    try {
      var data = await this.cloudLoad();
      if (!data || !data.users || !data.users[v.user.id]) return { success: false, error: 'Foydalanuvchi topilmadi' };

      data.users[v.user.id].balance = Number(data.users[v.user.id].balance) - amount;

      if (!data.transactions) data.transactions = [];
      var txId = 'TX' + Date.now().toString(36).toUpperCase();
      data.transactions.unshift({
        id: txId, timestamp: new Date().toISOString(),
        fromId: v.user.id, toId: 'EXTERNAL', amount: amount,
        type: 'payment', description: siteName + ': ' + description
      });
      if (data.transactions.length > 50) data.transactions.length = 50;

      var saved = await this.cloudSave(data);
      if (saved) {
        return { success: true, message: amount + ' Vcoin yechildi', newBalance: data.users[v.user.id].balance, transactionId: txId, amount: amount, site: siteName };
      }
      return { success: false, error: 'Saqlashda xatolik' };
    } catch(e) { return { success: false, error: 'Xatolik' }; }
  },

  openPaymentModal: function(token, amount, description, siteName) {
    return new Promise(function(resolve, reject) {
      var modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;';
      modal.innerHTML = '<div style="background:#1c2333;border-radius:20px;padding:30px;max-width:400px;width:90%;color:#fff;">'+
        '<div style="text-align:center;margin-bottom:20px;"><div style="font-size:40px;">💳</div><h3>Vcoin To\'lov</h3><p style="color:#8b949e;">'+(siteName||'Tashqi sayt')+'</p></div>'+
        '<div style="background:rgba(74,144,217,0.1);padding:16px;border-radius:12px;margin-bottom:16px;"><div style="display:flex;justify-content:space-between;"><span style="color:#8b949e;">Miqdor:</span><span style="font-size:22px;font-weight:700;color:#4a90d9;">'+amount+' Vcoin</span></div></div>'+
        '<div style="background:rgba(240,185,11,0.1);padding:12px;border-radius:8px;margin-bottom:16px;text-align:center;"><p style="color:#f0b90b;font-size:12px;">⚠️ Hisobingizdan '+amount+' Vcoin yechiladi</p></div>'+
        '<div style="display:flex;gap:10px;"><button id="vcCancel" style="flex:1;padding:14px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#fff;border-radius:12px;cursor:pointer;">Bekor</button><button id="vcConfirm" style="flex:1;padding:14px;border:none;background:linear-gradient(135deg,#2ea043,#238636);color:#fff;border-radius:12px;cursor:pointer;font-weight:600;">Tasdiqlash</button></div></div>';
      
      document.body.appendChild(modal);
      modal.addEventListener('click',function(e){if(e.target===modal){document.body.removeChild(modal);reject(new Error('Bekor qilindi'));}});
      document.getElementById('vcCancel').addEventListener('click',function(){document.body.removeChild(modal);reject(new Error('Bekor qilindi'));});
      document.getElementById('vcConfirm').addEventListener('click',async function(){
        this.textContent='Kutilmoqda...';this.disabled=true;
        try{var r=await VcoinAPI.processPayment(token,amount,description,siteName);document.body.removeChild(modal);if(r.success)resolve(r);else reject(new Error(r.error));}
        catch(e){document.body.removeChild(modal);reject(e);}
      });
    });
  },

  getBalance: async function(token) {
    var r = await this.verifyToken(token);
    return r.success ? { success: true, balance: r.user.balance, user: r.user } : r;
  }
};

if (typeof window !== 'undefined') { window.VcoinAPI = VcoinAPI; }