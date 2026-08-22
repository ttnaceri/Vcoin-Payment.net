var Admin = {
  commandHistory: [],
  historyIndex: -1,
  consoleColor: 'a',
  commands: ['help','balance','commission','setcomission','setcomissar','setshopid','setadmintoken','getadmintoken','setrefundtoken','getrefundtoken','editbio','exit','setwebhook','deposit','users','give','take','ban','unban','reset','save','reload','logs','clear','export','exportexcel','userinfo','stats','nickname','delete','adminpassword','sync','announce','leader','color','cancel','cancelcommission','newid','newname'],

  colorMap: {
    'a':{text:'#ccc',prompt:'#0f0',name:'Default'},'b':{text:'#8cf',prompt:'#48f',name:'Havo rang'},'c':{text:'#f88',prompt:'#f44',name:'Qizil'},'d':{text:'#c8f',prompt:'#84f',name:'Siyohrang'},'e':{text:'#ca8',prompt:'#a62',name:'Jigarrang'},'f':{text:'#fff',prompt:'#fff',name:'Oq'},'0':{text:'#fff',prompt:'#fff',name:'Oq'},'1':{text:'#48f',prompt:'#26f',name:'Ko\'k'},'2':{text:'#f84',prompt:'#f62',name:'Orange'},'3':{text:'#8cf',prompt:'#48f',name:'Havo rang'},'4':{text:'#f44',prompt:'#f22',name:'Qizil'},'5':{text:'#c4f',prompt:'#a2f',name:'Siyohrang'},'6':{text:'#ff4',prompt:'#cc2',name:'Sariq'},'7':{text:'#fd0',prompt:'#fa0',name:'Golden'},'8':{text:'#888',prompt:'#666',name:'Kulrang'}
  },

  parseArgs: function(args) {
    var raw = args.join(' '), result = { ids: [], value: null, all: false };
    
    if (raw.toLowerCase().indexOf('all') !== -1) {
      result.all = true;
      raw = raw.replace(/all/gi, '').trim();
    }
    
    var dotMatch = raw.match(/(\d{9})\./);
    if (dotMatch) { result.ids.push(dotMatch[1]); raw = raw.replace(dotMatch[0], ''); }
    var parts = raw.split(',');
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i].trim(), idMatch = part.match(/(\d{9})/);
      if (idMatch) { if (result.ids.indexOf(idMatch[1]) === -1) result.ids.push(idMatch[1]); part = part.replace(idMatch[0], '').trim(); }
      if (part && !isNaN(parseFloat(part)) && result.value === null) result.value = parseFloat(part);
    }
    if (result.value === null && args.length > 0) {
      for (var j = args.length - 1; j >= 0; j--) { 
        var arg = args[j];
        if (arg && arg.toLowerCase() !== 'all' && !/^\d{9}$/.test(arg) && !isNaN(parseFloat(arg))) { 
          result.value = parseFloat(arg); 
          break; 
        }
      }
    }
    return result;
  },

  render: function(c) {
    c.innerHTML='<div class="admin-container fade-in" id="adminContainer"><div style="text-align:center;margin-bottom:16px;"><div style="font-size:36px;">🛡️</div><h2 style="font-size:18px;color:#0f0;">Admin Console v17.0</h2><p style="color:#666;font-size:11px;">Admin Console | setrefundtoken</p></div><div class="admin-stats" id="adminStats">'+this.renderStats()+'</div><div class="console-output" id="consoleOutput"><div class="console-line"><span class="output">╔══════════════════════╗</span></div><div class="console-line"><span class="output">║</span><span class="success">   VCOIN ADMIN v17.0 </span><span class="output">║</span></div><div class="console-line"><span class="output">╚══════════════════════╝</span></div><div class="console-line"></div></div><div class="console-input-wrapper"><span class="console-prompt">type</span><input type="text" class="console-input" id="consoleInput" placeholder="Command" onkeydown="Admin.handleKeydown(event)" oninput="Admin.handleAutocomplete()" autofocus><div class="console-autocomplete" id="autocomplete" style="display:none;"></div></div></div>';
    setTimeout(function(){var i=document.getElementById('consoleInput');if(i)i.focus();},100);
    this.refreshStats();this.applyColor();this.checkBans();
  },

  checkBans: function() { var bans = DB.get('timedBans', {}), now = new Date().getTime(); for (var id in bans) { if (bans[id] < now) { delete bans[id]; DB.unbanUser(id); } } DB.set('timedBans', bans); },
  applyColor:function(){ var c=this.colorMap[this.consoleColor]||this.colorMap['a'], o=document.getElementById('consoleOutput'), i=document.getElementById('consoleInput'); if(o)o.style.color=c.text; if(i){i.style.color=c.text;i.style.caretColor=c.prompt;} var p=document.querySelector('.console-prompt'); if(p)p.style.color=c.prompt; },
  
  refreshStats: async function() { 
    try { 
      var data = await Cloud.loadData(); 
      
      var usersData = {};
      var transactionsData = [];
      
      if (data) {
        if (data.record) {
          usersData = data.record.users || {};
          transactionsData = data.record.transactions || [];
        } else if (data.users) {
          usersData = data.users || {};
          transactionsData = data.transactions || [];
        }
      }
      
      var userCount = Object.keys(usersData).length;
      var volume = transactionsData.reduce(function(s, tx) { 
        return s + (tx.amount || 0); 
      }, 0);
      var bannedCount = Object.keys(DB.get('timedBans', {})).length;
      
      var e = document.getElementById('adminStats'); 
      if (e) {
        e.innerHTML = 
          '<div class="admin-stat-card"><div class="admin-stat-value">' + userCount + '</div><div class="admin-stat-label">Users</div></div>' +
          '<div class="admin-stat-card"><div class="admin-stat-value">' + Utils.formatNumber(volume) + '</div><div class="admin-stat-label">Volume</div></div>' +
          '<div class="admin-stat-card"><div class="admin-stat-value">0</div><div class="admin-stat-label">Tasks</div></div>' +
          '<div class="admin-stat-card"><div class="admin-stat-value">' + bannedCount + '</div><div class="admin-stat-label">Banned</div></div>';
      }
    } catch(e) { 
      console.error('refreshStats xatosi:', e); 
    } 
  },
  
  renderStats:function(){return'<div class="admin-stat-card"><div class="admin-stat-value">...</div><div class="admin-stat-label">Users</div></div>';},

  handleKeydown:function(e){ var i=document.getElementById('consoleInput'), a=document.getElementById('autocomplete'); if(e.key==='Enter'){var c=i.value.trim();if(c){this.executeCommand(c);this.commandHistory.push(c);this.historyIndex=this.commandHistory.length;i.value='';}a.style.display='none';} else if(e.key==='ArrowUp'){e.preventDefault();if(this.historyIndex>0){this.historyIndex--;i.value=this.commandHistory[this.historyIndex];}} else if(e.key==='ArrowDown'){e.preventDefault();if(this.historyIndex<this.commandHistory.length-1){this.historyIndex++;i.value=this.commandHistory[this.historyIndex];}else{this.historyIndex=this.commandHistory.length;i.value='';}} else if(e.key==='Tab'){e.preventDefault();var it=document.querySelectorAll('.autocomplete-item');if(it.length===1){i.value=it[0].textContent.trim().split(' ')[0];a.style.display='none';}} },
  handleAutocomplete:function(){ var i=document.getElementById('consoleInput'), a=document.getElementById('autocomplete'), v=i.value.trim().toLowerCase(); if(!v){a.style.display='none';return;} var m=this.commands.filter(function(c){return c.startsWith(v);}); if(m.length>0){var h='';m.forEach(function(c){h+='<div class="autocomplete-item" onclick="Admin.selectAutocomplete(\''+c+'\')">'+c+'</div>';});a.innerHTML=h;a.style.display='block';}else{a.style.display='none';} },
  selectAutocomplete:function(c){document.getElementById('consoleInput').value=c+' ';document.getElementById('autocomplete').style.display='none';document.getElementById('consoleInput').focus();},

  executeCommand:function(raw){
    var o=document.getElementById('consoleOutput');
    if(/^[\d\s\+\-\*\/\.\(\)]+$/.test(raw)&&/[\+\-\*\/]/.test(raw)){try{var r=Function('"use strict";return ('+raw.replace(/[^0-9\+\-\*\/\.\(\)\s]/g,'')+')')();this.printLine(o,raw+' = '+r,'success');}catch(e){this.printLine(o,'Calc error','error');}o.scrollTop=o.scrollHeight;this.refreshStats();return;}
    var p=raw.trim().split(/\s+/), c=p[0].toLowerCase(), a=p.slice(1);
    this.printLine(o,'root@vcoin:~$ '+raw,'prompt');
    try{
      switch(c){
        case'help':this.cmdHelp(o);break;
        case'balance':this.cmdBalance(o,a);break;
        case'commission':this.cmdCommission(o,a);break;
        case'setcomission':this.cmdSetComission(o,a);break;
        case'setcomissar':this.cmdSetComissar(o,a);break;
        case'setshopid':this.cmdSetShopId(o,a);break;
        case'setadmintoken':this.cmdSetAdminToken(o,a);break;
        case'getadmintoken':this.cmdGetAdminToken(o,a);break;
        case'setrefundtoken':this.cmdSetRefundToken(o,a);break;
        case'getrefundtoken':this.cmdGetRefundToken(o,a);break;
        case'editbio':this.cmdEditBio(o,a);break;
        case'exit':this.cmdExit(o);break;
        case'setwebhook':this.cmdSetWebhook(o,a);break;
        case'userinfo':this.cmdUserInfo(o,a);break;
        case'exportexcel':this.cmdExportExcel(o);break;
        case'deposit':this.cmdDepositRate(o,a);break;
        case'users':this.cmdUsers(o);break;
        case'give':this.cmdGiveMulti(o,a);break;
        case'take':this.cmdTakeMulti(o,a);break;
        case'ban':this.cmdBanMulti(o,a);break;
        case'unban':this.cmdUnbanMulti(o,a);break;
        case'reset':this.cmdReset(o,a);break;
        case'save':this.cmdSave(o);break;
        case'sync':this.cmdSync(o);break;
        case'reload':this.cmdReload(o);break;
        case'logs':this.cmdLogs(o,a);break;
        case'clear':this.cmdClear(o);break;
        case'export':this.cmdExport(o);break;
        case'stats':this.cmdStats(o);break;
        case'nickname':this.cmdNickname(o,a);break;
        case'delete':this.cmdDeleteMulti(o,a);break;
        case'adminpassword':this.cmdAdminPassword(o,a);break;
        case'announce':this.cmdAnnounce(o,a);break;
        case'leader':this.cmdLeader(o);break;
        case'color':this.cmdColor(o,a);break;
        case'cancel':this.cmdCancel(o,a);break;
        case'cancelcommission':this.cmdCancelCommission(o,a);break;
        case'newid':this.cmdNewId(o,a);break;
        case'newname':this.cmdNewName(o,a);break;
        default:this.printLine(o,'Unknown: '+c,'error');
      }
    }catch(e){this.printLine(o,'Error: '+e.message,'error');}
    this.printLine(o,'','output'); o.scrollTop=o.scrollHeight; this.refreshStats();
  },

  printLine:function(o,t,ty){ty=ty||'output';var l=document.createElement('div');l.className='console-line';if(ty==='prompt'){var c=this.colorMap[this.consoleColor]||this.colorMap['a'];l.innerHTML='<span style="color:'+c.prompt+'">'+t+'</span>';}else{l.innerHTML='<span class="'+ty+'">'+t+'</span>';}o.appendChild(l);},

  // ===== ANNOUNCE (TUZATILGAN) =====
  cmdAnnounce: async function(o, a) {
    if (a.length === 0) {
      this.printLine(o, 'Usage: announce <text> [ID]', 'warning');
      this.printLine(o, '  announce "Salom hamma"', 'output');
      this.printLine(o, '  announce "Salom" 123456789', 'output');
      return;
    }
    
    var lastArg = a[a.length - 1];
    var userId = null;
    var text = a.join(' ');
    
    if (/^\d{9}$/.test(lastArg)) {
      userId = lastArg;
      text = a.slice(0, -1).join(' ');
    }
    
    if (!text || text.length < 1) {
      this.printLine(o, '❌ Xabar matnini kiriting!', 'error');
      return;
    }
    
    var d = await Cloud.loadData();
    if (!d) {
      this.printLine(o, '❌ Cloud xatosi!', 'error');
      return;
    }
    
    var users = d.record ? d.record.users : (d.users || {});
    
    if (userId) {
      var user = users[userId];
      if (!user) {
        this.printLine(o, '❌ User topilmadi: ' + userId, 'error');
        return;
      }
      
      var announceKey = 'vcoin_announce_' + userId;
      var announceData = {
        text: text.replace(/\{name\}/g, user.nickname || 'User'),
        time: new Date().toISOString()
      };
      localStorage.setItem(announceKey, JSON.stringify(announceData));
      
      this.printLine(o, '✅ E\'lon ' + user.nickname + ' (' + userId + ') ga yuborildi!', 'success');
      this.printLine(o, '   📢 ' + announceData.text, 'info');
      return;
    }
    
    var userKeys = Object.keys(users);
    if (userKeys.length === 0) {
      this.printLine(o, '⚠️ Foydalanuvchilar yo\'q!', 'warning');
      return;
    }
    
    var count = 0;
    for (var id in users) {
      var userData = users[id];
      var announceKey = 'vcoin_announce_' + id;
      var announceData = {
        text: text.replace(/\{name\}/g, userData.nickname || 'User'),
        time: new Date().toISOString()
      };
      localStorage.setItem(announceKey, JSON.stringify(announceData));
      count++;
    }
    
    this.printLine(o, '✅ E\'lon ' + count + ' ta foydalanuvchiga yuborildi!', 'success');
    this.printLine(o, '   📢 ' + text, 'info');
  },

  // ===== SET REFUND TOKEN =====
  cmdSetRefundToken: function(o, a) {
    if (a.length === 0) {
      var current = DB.get('refundToken', null);
      if (current) {
        this.printLine(o, '🔑 Refund Token: ' + current, 'success');
        this.printLine(o, '💡 Tashqi saytlar refund (qaytarish) uchun shu tokenni ishlatadi!', 'info');
      } else {
        this.printLine(o, '⚠️ Refund token sozlanmagan!', 'warning');
        this.printLine(o, '   Use: setrefundtoken <TOKEN>', 'output');
        this.printLine(o, '   Example: setrefundtoken REFUND123456', 'output');
      }
      return;
    }
    
    var token = a.join(' ');
    if (token.length < 6) {
      this.printLine(o, '❌ Token kamida 6 ta belgi bo\'lishi kerak!', 'error');
      return;
    }
    
    DB.set('refundToken', token);
    this.printLine(o, '✅ Refund token o\'rnatildi: ' + token, 'success');
    this.printLine(o, '🔑 Endi tashqi saytlar refund (qaytarish) uchun shu tokenni ishlatadi!', 'info');
    this.printLine(o, '📌 URL: ?refund=USER_ID&amount=100&token=' + token, 'output');
  },

  // ===== GET REFUND TOKEN =====
  cmdGetRefundToken: function(o, a) {
    var token = DB.get('refundToken', null);
    if (token) {
      this.printLine(o, '🔑 Refund Token: ' + token, 'success');
      this.printLine(o, '💡 Tashqi saytlar uchun: ?refund=USER_ID&amount=100&token=' + token, 'info');
    } else {
      this.printLine(o, '⚠️ Refund token sozlanmagan!', 'warning');
      this.printLine(o, '   Use: setrefundtoken <TOKEN>', 'output');
    }
  },

  // ===== SET ADMIN TOKEN =====
  cmdSetAdminToken: function(o, a) {
    if (a.length === 0) {
      this.printLine(o, 'Usage: setadmintoken <TOKEN>', 'warning');
      this.printLine(o, '  Example: setadmintoken ADMIN123456', 'output');
      return;
    }
    
    var token = a.join(' ');
    if (token.length < 6) {
      this.printLine(o, '❌ Token kamida 6 ta belgi bo\'lishi kerak!', 'error');
      return;
    }
    
    DB.set('adminToken', token);
    this.printLine(o, '✅ Admin token o\'rnatildi: ' + token, 'success');
    this.printLine(o, '🔑 Endi tashqi saytlar Vcoin qo\'shish uchun shu tokenni ishlatadi!', 'info');
  },

  // ===== GET ADMIN TOKEN =====
  cmdGetAdminToken: function(o, a) {
    var token = DB.get('adminToken', null);
    if (token) {
      this.printLine(o, '🔑 Admin Token: ' + token, 'success');
      this.printLine(o, '💡 Tashqi saytlar uchun: ?add=USER_ID&amount=100&token=' + token, 'info');
    } else {
      this.printLine(o, '⚠️ Admin token sozlanmagan!', 'warning');
      this.printLine(o, '   Use: setadmintoken <TOKEN>', 'output');
    }
  },

  // ===== EDIT BIO =====
  cmdEditBio: function(o, a) {
    if (a.length < 2) {
      this.printLine(o, 'Usage: editbio <USER_ID> <bio_text>', 'warning');
      this.printLine(o, '  Example: editbio 123456789 "Mening bio matnim"', 'output');
      return;
    }
    
    var userId = a[0];
    if (!/^\d{9}$/.test(userId)) {
      this.printLine(o, '❌ ID 9 xonalik bo\'lishi kerak!', 'error');
      return;
    }
    
    var bioText = a.slice(1).join(' ');
    if (!bioText || bioText.length < 1) {
      this.printLine(o, '❌ Bio matnini kiriting!', 'error');
      return;
    }
    
    var user = DB.getUserById(userId);
    if (!user) {
      this.printLine(o, '❌ Foydalanuvchi topilmadi! ID: ' + userId, 'error');
      return;
    }
    
    DB.set('userBio_' + userId, bioText);
    this.printLine(o, '✅ ' + user.nickname + ' bio o\'zgartirildi: ' + bioText, 'success');
  },

  // ===== EXIT =====
  cmdExit: function(o) {
    var t = this;
    this.printLine(o, '👋 Admin paneldan chiqilmoqda...', 'info');
    
    setTimeout(function() {
      var container = document.getElementById('mainContent');
      if (container) {
        container.innerHTML = '';
      }
      
      if (DB && DB.userExists && DB.userExists()) {
        UI.navigateTo('dashboard');
        UI.showToast('✅ Admin paneldan chiqildi! Dashboardga qaytildi.', 'success');
      } else {
        UI.navigateTo('auth');
        UI.showToast('✅ Admin paneldan chiqildi! Login sahifasiga qaytildi.', 'success');
      }
    }, 500);
  },

  // ===== SET WEBHOOK =====
  cmdSetWebhook: function(o, a) {
    if (a.length === 0) {
      var current = DB.get('webhookUrl', null);
      if (current) {
        this.printLine(o, '🔗 Webhook manzili: ' + current, 'success');
        this.printLine(o, '💡 To\'lovlar amalga oshganda shu manzilga xabar yuboriladi.', 'info');
      } else {
        this.printLine(o, '⚠️ Webhook sozlanmagan!', 'warning');
        this.printLine(o, '   Use: setwebhook https://example.com/webhook', 'output');
      }
      return;
    }
    
    var url = a.join(' ');
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      this.printLine(o, '❌ URL http:// yoki https:// bilan boshlanishi kerak!', 'error');
      return;
    }
    
    DB.set('webhookUrl', url);
    this.printLine(o, '✅ Webhook o\'rnatildi: ' + url, 'success');
    this.printLine(o, '🔔 To\'lovlar amalga oshganda xabar yuboriladi.', 'info');
  },

  // ============================================================
  // NEWID - TUZATILGAN (Backend ga to'g'ri saqlaydi)
  // ============================================================
  cmdNewId: function(o, a) {
    var self = this;
    
    var html = '<div style="padding:10px;">';
    html += '<h3 style="text-align:center;margin-bottom:16px;">🆕 Yangi Foydalanuvchi Yaratish</h3>';
    html += '<div style="margin-bottom:10px;">';
    html += '<input type="text" id="newUserId" class="input" placeholder="ID (9 xonalik)" maxlength="9" style="text-align:center;font-size:16px;margin-bottom:8px;" oninput="this.value=this.value.replace(/[^0-9]/g,\'\')">';
    html += '<input type="text" id="newUserNick" class="input" placeholder="Nikname" style="text-align:center;font-size:16px;margin-bottom:8px;">';
    html += '<input type="number" id="newUserBalance" class="input" placeholder="Boshlang\'ich balans" min="0" style="text-align:center;font-size:16px;margin-bottom:8px;">';
    html += '<input type="text" id="newUserTelegram" class="input" placeholder="Telegram @username (ixtiyoriy)" style="text-align:center;font-size:16px;">';
    html += '</div>';
    html += '<div style="display:flex;gap:10px;margin-top:12px;">';
    html += '<button class="btn btn-success" onclick="Admin.confirmNewUser()" style="flex:1;"><i class="fas fa-check"></i> Yaratish</button>';
    html += '<button class="btn btn-outline" onclick="UI.closeModal()" style="flex:1;"><i class="fas fa-times"></i> Bekor</button>';
    html += '</div>';
    html += '<p id="newUserError" style="color:var(--accent-red);font-size:12px;text-align:center;margin-top:10px;display:none;"></p>';
    html += '</div>';
    
    UI.openModal(html);
    
    setTimeout(function() {
      var inputs = document.querySelectorAll('#newUserId, #newUserNick, #newUserBalance, #newUserTelegram');
      inputs.forEach(function(input) {
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            Admin.confirmNewUser();
          }
        });
      });
      document.getElementById('newUserId').focus();
    }, 200);
  },

  // ============================================================
  // CONFIRM NEW USER - TUZATILGAN
  // ============================================================
  confirmNewUser: async function() {
    var o = document.getElementById('consoleOutput');
    if (!o) {
      console.error('❌ consoleOutput topilmadi');
      return;
    }
    
    var userId = document.getElementById('newUserId').value.trim();
    var nickname = document.getElementById('newUserNick').value.trim();
    var balance = parseFloat(document.getElementById('newUserBalance').value);
    var telegram = document.getElementById('newUserTelegram').value.trim();
    var error = document.getElementById('newUserError');
    
    if (!error) {
      console.error('❌ newUserError elementi topilmadi');
      return;
    }
    
    error.style.display = 'none';
    
    // ===== VALIDATSIYA =====
    if (!userId || userId.length !== 9 || !/^\d{9}$/.test(userId)) {
      error.textContent = '❌ ID 9 xonali raqam bo\'lishi kerak!';
      error.style.display = 'block';
      return;
    }
    
    if (!nickname || nickname.length < 3) {
      error.textContent = '❌ Nikname kamida 3 ta belgi bo\'lishi kerak!';
      error.style.display = 'block';
      return;
    }
    
    if (nickname.length > 20) {
      error.textContent = '❌ Nikname ko\'pi bilan 20 ta belgi!';
      error.style.display = 'block';
      return;
    }
    
    if (isNaN(balance) || balance < 0) {
      error.textContent = '❌ Balans 0 yoki katta bo\'lishi kerak!';
      error.style.display = 'block';
      return;
    }
    
    if (telegram) {
      telegram = telegram.replace('@', '').replace('https://t.me/', '').trim();
    }
    
    // ===== CLOUD DAN MA'LUMOT OLISH =====
    var d = await Cloud.loadData();
    
    // Agar Cloud dan ma'lumot kelmasa, yangi obyekt yaratish
    if (!d) {
      d = { users: {}, transactions: [], settings: { commission: 0 } };
    }
    
    // To'g'ri formatga keltirish
    var users = {};
    if (d.record) {
      users = d.record.users || {};
    } else if (d.users) {
      users = d.users || {};
    } else {
      users = {};
      d.users = users;
    }
    
    // ===== UNIKALLIKNI TEKSHIRISH =====
    if (users[userId]) {
      error.textContent = '❌ Bu ID allaqachon mavjud! ID: ' + userId;
      error.style.display = 'block';
      return;
    }
    
    for (var id in users) {
      if (users[id].nickname && users[id].nickname.toLowerCase() === nickname.toLowerCase()) {
        error.textContent = '❌ Bu nikname band! Nikname: ' + nickname;
        error.style.display = 'block';
        return;
      }
    }
    
    // ===== YANGI USER YARATISH =====
    var token = Utils.generateToken ? Utils.generateToken() : 'TK' + Date.now().toString(36).toUpperCase();
    var newUser = {
      id: userId,
      nickname: nickname,
      balance: balance,
      token: token,
      password: null,
      telegram: telegram || '',
      createdAt: new Date().toISOString()
    };
    
    users[userId] = newUser;
    
    // ===== BACKEND GA SAQLASH =====
    var saveData = {
      users: users,
      transactions: d.transactions || [],
      settings: d.settings || { commission: 0 }
    };
    
    // Agar record formatida bo'lsa
    if (d.record) {
      d.record.users = users;
      var saved = await Cloud.saveData(d);
    } else {
      d.users = users;
      var saved = await Cloud.saveData(d);
    }
    
    if (!saved) {
      error.textContent = '❌ Saqlashda xatolik! Backend server ishlayotganligini tekshiring.';
      error.style.display = 'block';
      return;
    }
    
    // ===== LOKALGA SINXRONLASH =====
    await Cloud.syncToLocal();
    
    UI.closeModal();
    
    this.printLine(o, '✅ Yangi user yaratildi va backend ga saqlandi!', 'success');
    this.printLine(o, '   👤 ' + nickname + ' (ID: ' + userId + ')', 'success');
    this.printLine(o, '   💰 Balans: ' + Utils.formatCurrency(balance), 'success');
    if (telegram) {
      this.printLine(o, '   📱 Telegram: @' + telegram, 'success');
    } else {
      this.printLine(o, '   📱 Telegram: Kiritilmagan', 'output');
    }
    this.printLine(o, '   📌 Parolni user o\'zi yaratadi (login paytida)', 'warning');
    this.printLine(o, '   ☁️ Ma\'lumotlar backend ga saqlandi!', 'success');
    
    UI.showToast('✅ ' + nickname + ' muvaffaqiyatli yaratildi va backend ga saqlandi!', 'success');
    this.refreshStats();
  },

  cmdHelp:function(o){
    var l=['help','balance <id> [amt]','commission <pct>','setcomissar <id>.','setshopid <id>.','setadmintoken <TOKEN>','getadmintoken','setrefundtoken <TOKEN>','getrefundtoken','editbio <ID> <text>','exit','setwebhook <URL>','userinfo <id>','exportexcel','setcomission <pct> <id>.','deposit <pct>','users','give <id/all>.<amt>','take <id/all>.<amt>','ban <id/all> [7d/24h]','unban <id/all>','nickname <id> <name>','delete <id1>,<id2> confirm','adminpassword <old> <new>','newid (pop-up oyna)','newname <id> <name>','cancel <tx_id>','cancelcommission <pct>','announce <text> [id]','leader','color <code>','sync','save','stats','logs','export','exportexcel','clear','reload','2+2 (calc)'];
    this.printLine(o,'━━━━━━━━━━━━','info');l.forEach(function(c){this.printLine(o,'  '+c,'output');}.bind(this));this.printLine(o,'━━━━━━━━━━━━','info');
  },

  cmdUserInfo:async function(o,a){if(a.length===0)return;var userId=a[0];var d=await Cloud.loadData();if(!d)return;var users=d.record?d.record.users:d.users||{};var u=users[userId];if(!u){this.printLine(o,'User not found','error');return;}this.printLine(o,'👤 '+u.nickname,'success');this.printLine(o,'🆔 '+u.id,'output');this.printLine(o,'📱 '+(u.telegram?'@'+u.telegram:'Kiritilmagan'),'output');},
  cmdExportExcel:async function(o){var d=await Cloud.loadData();if(!d)return;var users=d.record?d.record.users:d.users||{};var csv='ID,Nikname,Telegram\n';for(var id in users){var u=users[id];csv+=id+','+(u.nickname||'')+','+(u.telegram||'')+'\n';}var blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='vcoin_users.csv';a.click();this.printLine(o,'✅ Yuklandi! '+Object.keys(users).length+' ta','success');},
  
  cmdSetShopId:async function(o,a){
    var parsed = this.parseArgs(a);
    if(parsed.ids.length === 0){
      var currentShopId = DB.get('shopId', null);
      if(currentShopId){
        var d = await Cloud.loadData();
        var users = d.record ? d.record.users : (d.users || {});
        var user = users[currentShopId] || null;
        this.printLine(o,'🏪 Current Shop ID: ' + currentShopId + (user ? ' (' + user.nickname + ')' : ''), 'info');
      } else {
        this.printLine(o,'🏪 No Shop ID set. Use: setshopid <ID>', 'warning');
      }
      return;
    }
    
    var id = parsed.ids[0];
    if(!/^\d{9}$/.test(id)){
      this.printLine(o,'❌ Noto\'g\'ri ID! 9 xonalik raqam kiriting.', 'error');
      return;
    }
    
    var d = await Cloud.loadData();
    var users = d.record ? d.record.users : (d.users || {});
    if(!users[id]){
      this.printLine(o,'❌ ID topilmadi: ' + id, 'error');
      return;
    }
    
    DB.set('shopId', id);
    this.printLine(o,'✅ Shop ID: ' + users[id].nickname + ' (' + id + ') ga o\'rnatildi!', 'success');
    this.printLine(o, ' 💰 Tashqi to\'lovlar shu ID ga tushadi', 'info');
  },
  
  cmdSetComissar:async function(o,a){var parsed=this.parseArgs(a);if(parsed.ids.length===0){this.printLine(o,'Comissar: '+(DB.get('comissarId','NONE')),'info');return;}var id=parsed.ids[0];if(id==='0'){DB.set('comissarId',null);this.printLine(o,'✅ O\'chirildi','success');return;}var d=await Cloud.loadData();if(!d)return;var users=d.record?d.record.users:d.users||{};if(!users[id]){this.printLine(o,'❌ ID topilmadi','error');return;}DB.set('comissarId',id);this.printLine(o,'✅ Comissar: '+users[id].nickname+' ('+id+')','success');},

  cmdSync:async function(o){this.printLine(o,'Syncing...','info');await Cloud.syncToLocal();this.printLine(o,'Done!','success');this.refreshStats();},
  
  cmdBalance:async function(o,a){
    if(a.length===0){var u=DB.getUser();this.printLine(o,'Balance: '+Utils.formatCurrency(u.balance),'success');return;}
    var d=await Cloud.loadData();if(!d)return;
    var users=d.record?d.record.users:d.users||{};
    if(a.length===1){var u=users[a[0]];if(u)this.printLine(o,u.nickname+': '+Utils.formatCurrency(u.balance),'success');else this.printLine(o,'Not found','error');}
    else{var am=parseFloat(a[1]);if(isNaN(am))return;if(!users[a[0]])users[a[0]]={id:a[0],nickname:'User_'+a[0].slice(-4),balance:0,token:'',createdAt:new Date().toISOString()};users[a[0]].balance=am;await Cloud.saveData(d);this.printLine(o,'Set to '+am,'success');await Cloud.syncToLocal();}
  },
  
  cmdUsers:async function(o){
    var d=await Cloud.loadData();if(!d)return;
    var users=d.record?d.record.users:d.users||{};
    var ids=Object.keys(users);
    this.printLine(o,'Total: '+ids.length,'info');
    ids.forEach(function(id){
      this.printLine(o,id+'  '+(users[id].nickname||'N/A'),'output');
    }.bind(this));
  },
  
  cmdStats:async function(o){
    var d=await Cloud.loadData();if(!d)return;
    var users=d.record?d.record.users:d.users||{};
    var txs=d.record?d.record.transactions:d.transactions||[];
    var v=txs.reduce(function(s,tx){return s+(tx.amount||0);},0);
    this.printLine(o,'Users: '+Object.keys(users).length+' | TXs: '+txs.length+' | Volume: '+Utils.formatCurrency(v),'success');
  },
  
  cmdSave:async function(o){
    var d=await Cloud.loadData();if(!d)return;
    var users=d.record?d.record.users:d.users||{};
    this.printLine(o,'Loaded. Users: '+Object.keys(users).length,'success');
  },
  
  cmdClear:function(o){o.innerHTML='';},
  cmdReload:function(o){setTimeout(function(){UI.navigateTo('admin');},500);},
  cmdLogs:function(o,a){var l=DB.getLogs().slice(0,a.length>0?parseInt(a[0]):10);if(l.length===0)this.printLine(o,'No logs','warning');else l.forEach(function(l){this.printLine(o,'['+new Date(l.timestamp).toLocaleString()+'] '+l.action+': '+l.details,'output');}.bind(this));},
  cmdExport:async function(o){var d=await Cloud.loadData();var b=new Blob([JSON.stringify(d)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='vcoin_backup.json';a.click();this.printLine(o,'Exported!','success');},
  cmdCommission:function(o,a){if(a.length===0){this.printLine(o,'Commission: '+DB.getSettings().commission+'%','info');return;}var p=parseFloat(a[0]);if(isNaN(p)||p<0||p>100)return;DB.updateSettings({commission:p});if(Cloud&&Cloud.updateSettings)Cloud.updateSettings({commission:p});this.printLine(o,'✅ Set to '+p+'%','success');},
  cmdSetComission:async function(o,a){var parsed=this.parseArgs(a);if(parsed.ids.length===0||parsed.value===null)return;var pct=parsed.value;if(isNaN(pct)||pct<0||pct>100)return;var d=await Cloud.loadData();if(!d)return;if(!d.userCommissions)d.userCommissions={};for(var i=0;i<parsed.ids.length;i++)d.userCommissions[parsed.ids[i]]=pct;await Cloud.saveData(d);await Cloud.syncToLocal();this.printLine(o,'✅ Set '+pct+'% for '+parsed.ids.length+' user(s)','success');},

  cmdGiveMulti: async function(o, a) {
    var parsed = this.parseArgs(a);
    
    if (parsed.all) {
      var amt = parsed.value;
      if (isNaN(amt) || amt <= 0) {
        this.printLine(o, '❌ Miqdor noto\'g\'ri!', 'error');
        return;
      }
      
      var d = await Cloud.loadData();
      if (!d) {
        this.printLine(o, '❌ Cloud xatosi!', 'error');
        return;
      }
      
      var us = d.record ? d.record.users : (d.users || {});
      var ids = Object.keys(us);
      var count = 0;
      
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        us[id].balance = (us[id].balance || 0) + amt;
        count++;
      }
      
      if (!d.transactions) d.transactions = [];
      d.transactions.unshift({
        id: 'TX' + Date.now().toString(36).toUpperCase(),
        timestamp: new Date().toISOString(),
        fromId: 'ADMIN',
        toId: 'ALL_USERS',
        amount: amt,
        type: 'admin_give_all'
      });
      if (d.transactions.length > 50) d.transactions.length = 50;
      
      await Cloud.saveData(d);
      await Cloud.syncToLocal();
      
      this.printLine(o, '✅ ' + amt + ' Vcoin ' + count + ' ta foydalanuvchiga berildi!', 'success');
      return;
    }
    
    if (parsed.ids.length === 0 || parsed.value === null) {
      this.printLine(o, 'Usage: give <id/all>.<amt>', 'warning');
      this.printLine(o, '  give 123456789 10', 'output');
      this.printLine(o, '  give all 10', 'output');
      return;
    }
    
    var amt = parsed.value;
    if (isNaN(amt) || amt <= 0) {
      this.printLine(o, '❌ Miqdor noto\'g\'ri!', 'error');
      return;
    }
    
    var d = await Cloud.loadData();
    var us = d.record ? d.record.users : (d.users || {});
    var t = d.record ? d.record.transactions : (d.transactions || []);
    
    for (var i = 0; i < parsed.ids.length; i++) {
      var id = parsed.ids[i];
      if (!us[id]) {
        us[id] = {
          id: id,
          nickname: 'User_' + id.slice(-4),
          balance: 0,
          token: '',
          createdAt: new Date().toISOString()
        };
      }
      us[id].balance = (us[id].balance || 0) + amt;
      t.unshift({
        id: 'TX' + Date.now().toString(36).toUpperCase() + i,
        timestamp: new Date().toISOString(),
        fromId: 'ADMIN',
        toId: id,
        amount: amt,
        type: 'admin_give'
      });
    }
    
    await Cloud.saveData(d);
    await Cloud.syncToLocal();
    this.printLine(o, '✅ Gave ' + Utils.formatCurrency(amt) + ' to ' + parsed.ids.length + ' user(s)', 'success');
  },

  cmdTakeMulti: async function(o, a) {
    var parsed = this.parseArgs(a);
    
    if (parsed.all) {
      var amt = parsed.value;
      if (isNaN(amt) || amt <= 0) {
        this.printLine(o, '❌ Miqdor noto\'g\'ri!', 'error');
        return;
      }
      
      var d = await Cloud.loadData();
      if (!d) {
        this.printLine(o, '❌ Cloud xatosi!', 'error');
        return;
      }
      
      var us = d.record ? d.record.users : (d.users || {});
      var ids = Object.keys(us);
      var count = 0;
      
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        us[id].balance = Math.max(0, (us[id].balance || 0) - amt);
        count++;
      }
      
      if (!d.transactions) d.transactions = [];
      d.transactions.unshift({
        id: 'TX' + Date.now().toString(36).toUpperCase(),
        timestamp: new Date().toISOString(),
        fromId: 'ALL_USERS',
        toId: 'ADMIN',
        amount: amt,
        type: 'admin_take_all'
      });
      if (d.transactions.length > 50) d.transactions.length = 50;
      
      await Cloud.saveData(d);
      await Cloud.syncToLocal();
      
      this.printLine(o, '✅ ' + amt + ' Vcoin ' + count + ' ta foydalanuvchidan olindi!', 'success');
      return;
    }
    
    if (parsed.ids.length === 0 || parsed.value === null) {
      this.printLine(o, 'Usage: take <id/all>.<amt>', 'warning');
      this.printLine(o, '  take 123456789 10', 'output');
      this.printLine(o, '  take all 10', 'output');
      return;
    }
    
    var amt = parsed.value;
    if (isNaN(amt) || amt <= 0) {
      this.printLine(o, '❌ Miqdor noto\'g\'ri!', 'error');
      return;
    }
    
    var d = await Cloud.loadData();
    var us = d.record ? d.record.users : (d.users || {});
    var t = d.record ? d.record.transactions : (d.transactions || []);
    
    for (var i = 0; i < parsed.ids.length; i++) {
      var id = parsed.ids[i];
      if (!us[id]) {
        this.printLine(o, 'Not found: ' + id, 'error');
        continue;
      }
      us[id].balance = Math.max(0, (us[id].balance || 0) - amt);
      t.unshift({
        id: 'TX' + Date.now().toString(36).toUpperCase() + i,
        timestamp: new Date().toISOString(),
        fromId: id,
        toId: 'ADMIN',
        amount: amt,
        type: 'admin_take'
      });
    }
    
    await Cloud.saveData(d);
    await Cloud.syncToLocal();
    this.printLine(o, '✅ Took ' + Utils.formatCurrency(amt) + ' from ' + parsed.ids.length + ' user(s)', 'success');
  },

  cmdBanMulti: function(o, a) {
    var parsed = this.parseArgs(a);
    var timeStr = null;
    
    for (var i = 0; i < a.length; i++) {
      if (/^\d+[dhmw]$/i.test(a[i])) {
        timeStr = a[i];
        break;
      }
    }
    
    if (parsed.all) {
      var d = Cloud.loadData();
      if (!d || !d.users) {
        this.printLine(o, '❌ Cloud xatosi!', 'error');
        return;
      }
      
      var us = d.users;
      var ids = Object.keys(us);
      var count = 0;
      var minutes = Admin.parseBanTime(timeStr);
      var bans = DB.get('timedBans', {});
      
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        DB.banUser(id);
        if (minutes > 0) bans[id] = new Date().getTime() + minutes * 60000;
        else delete bans[id];
        count++;
      }
      
      DB.set('timedBans', bans);
      this.printLine(o, '✅ Banned ' + count + ' user(s)' + (minutes > 0 ? ' for ' + timeStr : ' (abadiy)'), 'success');
      return;
    }
    
    var ids = parsed.ids;
    if (ids.length === 0) {
      this.printLine(o, 'Usage: ban <id1>,<id2> [7d/24h]', 'warning');
      this.printLine(o, '  ban all 7d', 'output');
      return;
    }
    
    var minutes = Admin.parseBanTime(timeStr);
    var bans = DB.get('timedBans', {});
    
    for (var i = 0; i < ids.length; i++) {
      DB.banUser(ids[i]);
      if (minutes > 0) bans[ids[i]] = new Date().getTime() + minutes * 60000;
      else delete bans[ids[i]];
    }
    
    DB.set('timedBans', bans);
    this.printLine(o, '✅ Banned ' + ids.length + ' user(s)' + (minutes > 0 ? ' for ' + timeStr : ' (abadiy)'), 'success');
  },

  cmdUnbanMulti: function(o, a) {
    var parsed = this.parseArgs(a);
    
    if (parsed.all) {
      var bans = DB.get('timedBans', {});
      var ids = Object.keys(bans);
      
      for (var i = 0; i < ids.length; i++) {
        DB.unbanUser(ids[i]);
        delete bans[ids[i]];
      }
      
      DB.set('timedBans', bans);
      this.printLine(o, '✅ Unbanned ' + ids.length + ' user(s)', 'success');
      return;
    }
    
    var ids = parsed.ids;
    if (ids.length === 0) {
      this.printLine(o, 'Usage: unban <id1>,<id2>', 'warning');
      this.printLine(o, '  unban all', 'output');
      return;
    }
    
    var bans = DB.get('timedBans', {});
    
    for (var i = 0; i < ids.length; i++) {
      DB.unbanUser(ids[i]);
      delete bans[ids[i]];
    }
    
    DB.set('timedBans', bans);
    this.printLine(o, '✅ Unbanned ' + ids.length + ' user(s)', 'success');
  },

  cmdDeleteMulti:async function(o,a){var raw=a.join(' '),confirm=raw.indexOf('confirm')!==-1,ids=this.parseArgs(a).ids;if(ids.length===0)return;if(!confirm){this.printLine(o,'Type: delete '+ids.join(',')+' confirm','warning');return;}var d=await Cloud.loadData();var us=d.record?d.record.users:d.users||{};for(var i=0;i<ids.length;i++)delete us[ids[i]];await Cloud.saveData(d);await Cloud.syncToLocal();this.printLine(o,'✅ Deleted '+ids.length+' user(s)','success');},
  cmdNewName:async function(o,a){if(a.length<2)return;var userId=a[0],newName=a.slice(1).join(' ');if(!newName||newName.length<3)return;var d=await Cloud.loadData();var us=d.record?d.record.users:d.users||{};if(!us[userId]){this.printLine(o,'Not found','error');return;}us[userId].nickname=newName;await Cloud.saveData(d);await Cloud.syncToLocal();var cu=DB.getUser();if(cu&&cu.id===userId){cu.nickname=newName;DB.setUser(cu);}this.printLine(o,'✅ Nik o\'zgartirildi: '+userId+' → '+newName,'success');},
  cmdCancelCommission:function(o,a){if(a.length===0){this.printLine(o,'Cancel Commission: '+DB.get('cancelCommission',10)+'%','info');return;}var p=parseFloat(a[0]);if(isNaN(p)||p<0||p>100)return;DB.set('cancelCommission',p);if(Cloud&&Cloud.updateSettings)Cloud.updateSettings({cancelCommission:p});this.printLine(o,'✅ Set to '+p+'%','success');},
  cmdCancel:function(o,a){if(a.length===0)return;this.printLine(o,'✅ Cancelled: '+a[0],'success');},
  parseBanTime:function(str){if(!str)return 0;var m=str.match (/^(\d+)(d|h|m|w)$/i);if(!m)return 0;var n=parseInt(m[1]),u=m[2].toLowerCase();if(u==='m')return n;if(u==='h')return n*60;if(u==='d')return n*1440;if(u==='w')return n*10080;return 0;},
  cmdDepositRate:function(o,a){if(a.length===0){this.printLine(o,'Deposit: '+DB.getSettings().depositProfit+'%','info');return;}var p=parseFloat(a[0]);if(isNaN(p)||p<0)return;DB.updateSettings({depositProfit:p});this.printLine(o,'Set to '+p+'%','success');},
  cmdNickname:async function(o,a){if(a.length<2)return;var d=await Cloud.loadData();var us=d.record?d.record.users:d.users||{};if(!us[a[0]]){this.printLine(o,'Not found','error');return;}us[a[0]].nickname=a.slice(1).join(' ');await Cloud.saveData(d);this.printLine(o,'Nickname changed','success');},
  cmdAdminPassword:function(o,a){if(a.length<2)return;var c=DB.get('adminPassword','55668576');if(a[0]!==c){this.printLine(o,'Wrong old password','error');return;}DB.set('adminPassword',a[1]);this.printLine(o,'PIN changed!','success');},
  cmdReset:function(o,a){if(a.length===0||a[0]!=='confirm'){this.printLine(o,'Type: reset confirm','warning');return;}DB.clearAll();this.printLine(o,'Reset!','success');},
  cmdLeader:async function(o){var d=await Cloud.loadData();var us=d.record?d.record.users:d.users||{};var t=null;for(var id in us){if(!t||(us[id].balance||0)>(t.balance||0))t=us[id];}if(t){this.printLine(o,'🏆 '+t.nickname+' (ID: '+t.id+')','success');this.printLine(o,'💰 '+Utils.formatCurrency(t.balance||0),'success');}else this.printLine(o,'No users','warning');},
  cmdColor:function(o,a){if(a.length===0){this.printLine(o,'Colors: a(Default) b(Havo) c(Qizil) d(Siyohrang) e(Jigarrang) f/0(Oq) 1-8','info');return;}var cd=a[0].toLowerCase();if(this.colorMap[cd]){this.consoleColor=cd;this.applyColor();this.printLine(o,'Text color: '+this.colorMap[cd].name,'success');}else this.printLine(o,'Invalid','error');}
};
