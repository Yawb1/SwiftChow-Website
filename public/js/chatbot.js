/* ============================================
   SWIFT CHOW — Ultimate Interactive Chatbot v3
   Self-contained intelligent assistant
   No external AI APIs — powered by SwiftChow backend
   ============================================ */

(function () {
  'use strict';

  // ─── Session context ────────────────────────────────────
  const ctx = {
    selectedOrderId: null,
    lastOrderData: null,
    userName: null,
    greeted: false,
    messageCount: 0,
    orderPollTimer: null,
    activeTrackTimer: null,  // 15-second polling for actively tracked order
    lastKnownStatuses: {},   // orderId → status, for change detection
    lastTopic: null,         // session memory: last conversation topic
    allOrders: [],           // cached orders for the session
  };

  // ─── Helpers ────────────────────────────────────────────
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = (s) => typeof escapeHTML === 'function' ? escapeHTML(s) : String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function timeGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function formatTime(d) {
    return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  }

  function relativeTime(d) {
    const diff = new Date(d) - Date.now();
    if (diff <= 0) return 'any moment now';
    const mins = Math.round(diff / 60000);
    if (mins < 1) return 'any moment now';
    if (mins === 1) return '~1 minute';
    return `~${mins} minutes`;
  }

  const statusLabels = {
    pending: '🕐 Pending',
    confirmed: '✅ Confirmed',
    preparing: '👨‍🍳 Preparing',
    ready: '📦 Ready',
    out_for_delivery: '🚴 Out for Delivery',
    delivered: '🎉 Delivered',
    cancelled: '❌ Cancelled',
  };

  function statusLabel(s) { return statusLabels[s] || s; }

  // ─── Fun facts & tips of the day ──────────────────────
  const funFacts = [
    "🍔 Fun fact: The world's largest burger weighed over 2,000 pounds!",
    "🍕 Did you know? Pizza was originally a poor man's meal in Naples, Italy.",
    "🎉 Tip: Use promo code SWIFT30 to get 30% off your first order!",
    "🚴 SwiftChow riders deliver to 10+ cities across Ghana!",
    "🍰 Pro tip: Our Chocolate Lava Cake pairs perfectly with a Vanilla Milkshake.",
    "⭐ Over 15,000 happy customers have ordered from SwiftChow!",
    "🌍 SwiftChow sources ingredients from local Ghanaian farms whenever possible.",
    "📱 Tip: You can track your delivery in real-time on the Tracking page!",
    "🎂 Fun fact: Our pastry chef trained in Paris before joining SwiftChow.",
    "💡 Save your favourite delivery address in your Account for faster checkout!",
  ];

  const jokes = [
    "Why did the burger go to the gym? To get better buns! 🍔😂",
    "What does a nosy pepper do? Gets jalapeño business! 🌶️",
    "Why don't eggs tell jokes? They'd crack each other up! 🥚",
    "I told my pizza a joke… it was a bit too cheesy! 🍕",
    "What did the cake say to the fork? You want a piece of me? 🍰",
    "Why did the tomato turn red? Because it saw the salad dressing! 🥗",
    "What do you call a fake noodle? An impasta! 🍝",
    "Why did the coffee file a police report? It got mugged! ☕",
  ];

  // ─── DOM injection ──────────────────────────────────────
  function injectHTML() {
    if (document.getElementById('chatbot-fab')) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <button id="chatbot-fab" aria-label="Open chat assistant">
        <i class="fas fa-comments" id="chatbot-fab-icon"></i>
        <span class="chatbot-fab-badge" id="chatbot-badge" style="display:none">1</span>
      </button>

      <div id="chatbot-window" role="dialog" aria-label="SwiftChow Chat Assistant">
        <div class="chatbot-header">
          <div class="chatbot-header-info">
            <div class="chatbot-avatar">🤖</div>
            <div>
              <div class="chatbot-name">SwiftChow Assistant</div>
              <div class="chatbot-status"><span class="chatbot-status-dot"></span> Online — ready to help</div>
            </div>
          </div>
          <button class="chatbot-close" aria-label="Close chat">&times;</button>
        </div>

        <div class="chatbot-messages" id="chatbot-messages"></div>

        <div class="chatbot-quick-actions" id="chatbot-quick-actions"></div>

        <div class="chatbot-input-area">
          <input type="text" id="chatbot-input" placeholder="Type a message…" autocomplete="off" maxlength="500" />
          <button class="chatbot-send" id="chatbot-send" aria-label="Send"><i class="fas fa-paper-plane"></i></button>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);
  }

  // ─── Render helpers ─────────────────────────────────────
  function getMessagesEl() { return document.getElementById('chatbot-messages'); }

  function scrollBottom() {
    const el = getMessagesEl();
    if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 60);
  }

  function addMessage(text, sender) {
    const el = getMessagesEl();
    if (!el) return;
    const time = formatTime(new Date());
    const avatarHTML = sender === 'bot'
      ? '<div class="chatbot-msg-avatar"><i class="fas fa-robot"></i></div>'
      : '';
    const div = document.createElement('div');
    div.className = `chatbot-msg ${sender}`;
    div.innerHTML = `${avatarHTML}<div class="chatbot-bubble ${sender}">${text}<span class="chatbot-time">${time}</span></div>`;
    el.appendChild(div);
    scrollBottom();
    ctx.messageCount++;
  }

  function showTyping() {
    const el = getMessagesEl();
    if (!el) return;
    const div = document.createElement('div');
    div.className = 'chatbot-msg bot';
    div.id = 'chatbot-typing';
    div.innerHTML = '<div class="chatbot-msg-avatar"><i class="fas fa-robot"></i></div><div class="chatbot-bubble bot"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    el.appendChild(div);
    scrollBottom();
  }

  function hideTyping() {
    const el = document.getElementById('chatbot-typing');
    if (el) el.remove();
  }

  function botSay(text, delay) {
    const ms = delay !== undefined ? delay : 400 + Math.min(text.length * 4, 1200);
    showTyping();
    setTimeout(() => { hideTyping(); addMessage(text, 'bot'); }, ms);
  }

  // Quick-action buttons
  function setQuickActions(actions) {
    const container = document.getElementById('chatbot-quick-actions');
    if (!container) return;
    container.innerHTML = '';
    actions.forEach(({ label, icon, value }) => {
      const btn = document.createElement('button');
      btn.className = 'chatbot-quick-btn';
      btn.innerHTML = icon ? `<i class="${icon}"></i> ${esc(label)}` : esc(label);
      btn.addEventListener('click', () => handleInput(value || label));
      container.appendChild(btn);
    });
  }

  function defaultQuickActions() {
    const actions = [
      { label: 'Track Order', icon: 'fas fa-truck', value: 'track my order' },
      { label: 'Menu', icon: 'fas fa-utensils', value: 'show menu' },
      { label: 'Contact', icon: 'fas fa-phone', value: 'contact info' },
      { label: 'Hours', icon: 'fas fa-clock', value: 'delivery hours' },
    ];
    if (typeof isAuthenticated === 'function' && isAuthenticated()) {
      actions.unshift({ label: 'My Orders', icon: 'fas fa-receipt', value: 'my orders' });
    }
    setQuickActions(actions);
  }

  // ─── Order API helpers ──────────────────────────────────
  async function fetchOrders() {
    try {
      const data = await apiCall('/orders');
      return data.orders || [];
    } catch { return []; }
  }

  async function fetchLatestOrder() {
    try {
      const data = await apiCall('/orders/latest');
      return data.order || null;
    } catch { return null; }
  }

  async function fetchOrder(id) {
    try {
      const safeId = typeof sanitizeId === 'function' ? sanitizeId(id) : String(id).replace(/[^a-zA-Z0-9_\-]/g, '');
      const data = await apiCall(`/orders/${safeId}`);
      return data.order || null;
    } catch { return null; }
  }

  // ─── Order status pretty print ─────────────────────────
  function orderSummary(o) {
    const items = (o.items || []).map(i => `${esc(i.name)} x${i.quantity}`).join(', ');
    const eta = o.estimatedDeliveryAt ? relativeTime(o.estimatedDeliveryAt) : (o.estimatedDeliveryTime ? `~${o.estimatedDeliveryTime} min` : '—');
    return `<b>Order #${esc(o.orderId)}</b><br>` +
      `📋 Items: ${items || 'N/A'}<br>` +
      `💰 Total: GH₵${Number(o.total).toFixed(2)}<br>` +
      `📍 Status: ${statusLabel(o.status)}<br>` +
      (o.status !== 'delivered' && o.status !== 'cancelled' ? `⏱️ ETA: ${eta}<br>` : '') +
      (o.deliveredAt ? `✅ Delivered at ${formatTime(o.deliveredAt)}<br>` : '') +
      `<br>${statusProgress(o.status)}`;
  }

  function orderListBrief(orders) {
    return orders.slice(0, 5).map((o, i) => {
      return `<b>${i + 1}.</b> #${esc(o.orderId)} — ${statusLabel(o.status)} (${formatDate(o.createdAt)})`;
    }).join('<br>');
  }

  // ─── Status progress bar ────────────────────────────────
  const statusSteps = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

  function statusProgress(status) {
    if (status === 'cancelled') return '❌ This order was cancelled.';
    if (status === 'pending') return '🕐 Waiting for confirmation...';
    const idx = statusSteps.indexOf(status);
    if (idx < 0) return '';
    return statusSteps.map((s, i) => {
      const icon = i <= idx ? '🟢' : '⚪';
      const lbl = statusLabels[s] ? statusLabels[s].replace(/^\S+\s*/, '') : s;
      return `${icon} ${lbl}`;
    }).join(' → ');
  }

  // ─── Filtered order helpers ─────────────────────────────
  function filterOrders(orders, filter) {
    switch (filter) {
      case 'delivered': return orders.filter(o => o.status === 'delivered');
      case 'pending': return orders.filter(o => ['pending', 'confirmed'].includes(o.status));
      case 'in_progress': return orders.filter(o => ['preparing', 'ready', 'out_for_delivery'].includes(o.status));
      case 'cancelled': return orders.filter(o => o.status === 'cancelled');
      case 'active': return orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
      default: return orders;
    }
  }

  function orderCountSummary(orders) {
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const active = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const parts = [];
    if (delivered) parts.push(`<b>${delivered}</b> delivered`);
    if (active) parts.push(`<b>${active}</b> in progress`);
    if (cancelled) parts.push(`<b>${cancelled}</b> cancelled`);
    return parts.join(', ');
  }

  // ─── Active tracking (15-second poll for specific order) ──
  function startActiveTracking(orderId) {
    stopActiveTracking();
    if (!orderId) return;
    ctx.activeTrackTimer = setInterval(async () => {
      try {
        const order = await fetchOrder(orderId);
        if (!order) { stopActiveTracking(); return; }
        const prev = ctx.lastKnownStatuses[order.orderId];
        ctx.lastKnownStatuses[order.orderId] = order.status;
        ctx.lastOrderData = order;
        if (prev && prev !== order.status) {
          notifyStatusChange(order, prev);
          if (order.status === 'delivered' || order.status === 'cancelled') {
            stopActiveTracking();
          }
        }
      } catch { /* silent */ }
    }, 15000);
  }

  function stopActiveTracking() {
    if (ctx.activeTrackTimer) {
      clearInterval(ctx.activeTrackTimer);
      ctx.activeTrackTimer = null;
    }
  }

  // ─── Background order polling ───────────────────────────
  function startOrderPolling() {
    if (ctx.orderPollTimer) return;
    if (typeof isAuthenticated !== 'function' || !isAuthenticated()) return;
    ctx.orderPollTimer = setInterval(async () => {
      try {
        const orders = await fetchOrders();
        orders.forEach(o => {
          const prev = ctx.lastKnownStatuses[o.orderId];
          if (prev && prev !== o.status) {
            notifyStatusChange(o, prev);
          }
          ctx.lastKnownStatuses[o.orderId] = o.status;
        });
      } catch { /* silent */ }
    }, 30000); // Every 30 seconds
  }

  function notifyStatusChange(order, prevStatus) {
    const msgs = {
      preparing: `👨‍🍳 Great news! Your order <b>#${esc(order.orderId)}</b> is now being prepared!`,
      ready: `📦 Your order <b>#${esc(order.orderId)}</b> is ready and waiting for pickup by our rider!`,
      out_for_delivery: `🚴 Your order <b>#${esc(order.orderId)}</b> is out for delivery! Keep an eye out!`,
      delivered: `🎉 Your order <b>#${esc(order.orderId)}</b> has been delivered! Enjoy your meal! Bon appétit! 🍔`,
    };
    const msg = msgs[order.status];
    if (msg) {
      // Show badge if window is closed
      const win = document.getElementById('chatbot-window');
      if (!win || !win.classList.contains('open')) {
        showBadge();
      }
      botSay(msg, 300);
    }
  }

  function showBadge() {
    const badge = document.getElementById('chatbot-badge');
    if (badge) { badge.style.display = 'flex'; }
  }

  function hideBadge() {
    const badge = document.getElementById('chatbot-badge');
    if (badge) { badge.style.display = 'none'; }
  }

  // ─── Intent detection ──────────────────────────────────
  function normalise(s) { return s.toLowerCase().replace(/[^\w\s]/g, '').trim(); }

  function match(input, patterns) {
    const n = normalise(input);
    return patterns.some(p => {
      if (p instanceof RegExp) return p.test(n);
      return n.includes(p);
    });
  }

  // ─── Main response engine ──────────────────────────────
  async function handleInput(raw) {
    const text = raw.trim();
    if (!text) return;

    // Show user message
    addMessage(esc(text), 'user');

    // Clear input
    const input = document.getElementById('chatbot-input');
    if (input) input.value = '';

    const lower = normalise(text);

    // --- Greetings ---
    if (match(text, ['hello', 'hi', 'hey', 'howdy', 'sup', 'yo', 'hola', 'greetings', 'good morning', 'good afternoon', 'good evening', 'whats up', 'wassup'])) {
      const name = ctx.userName ? `, ${esc(ctx.userName)}` : '';
      const replies = [
        `${timeGreeting()}${name}! 👋 How can I help you today?`,
        `Hey there${name}! 🎉 Welcome to SwiftChow! What can I do for you?`,
        `${timeGreeting()}${name}! 😊 Ready to serve you. Ask me anything about orders, our menu, or delivery!`,
        `Hi${name}! 🍔 I'm your SwiftChow assistant. Need to track an order, browse the menu, or something else?`,
      ];
      botSay(pick(replies));
      defaultQuickActions();
      return;
    }

    // --- How are you ---
    if (match(text, [/how are you/, /how you doing/, /hows it going/, /how do you do/, /you okay/])) {
      const replies = [
        "I'm great, thanks for asking! 😊 Ready to help you get your food fast!",
        "Doing awesome! 🎉 I've been helping customers order delicious food all day. What can I do for you?",
        "I'm fantastic! 💪 Running on good vibes and great food. How can I help?",
        "Never better! 🔥 SwiftChow keeps me energised. What do you need?",
      ];
      botSay(pick(replies));
      return;
    }

    // --- Time ---
    if (match(text, [/what time/, /current time/, /tell me the time/, /whats the time/, /what is the time/]) || lower === 'time') {
      const now = new Date();
      botSay(`🕐 It's currently <b>${formatTime(now)}</b> (${Intl.DateTimeFormat().resolvedOptions().timeZone}). ${now.getHours() >= 20 || now.getHours() < 8 ? 'Getting late! Our delivery hours are 8 AM – 10 PM.' : 'We\'re open and ready to deliver! 🚴'}`);
      return;
    }

    // --- Day ---
    if (match(text, [/what day/, /which day/, /todays day/, /whats today/, /day of the week/, /day is it/])) {
      const now = new Date();
      botSay(`📅 Today is <b>${now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</b>. ${pick(["Hope you're having a great one!", "Perfect day for some SwiftChow! 🍔", "Make it a delicious day!"])}`);
      return;
    }

    // --- Date ---
    if (match(text, [/what is the date/, /whats the date/, /todays date/, /current date/]) || lower === 'date') {
      const now = new Date();
      botSay(`📅 Today's date is <b>${now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</b>.`);
      return;
    }

    // --- Jokes ---
    if (match(text, ['joke', 'funny', 'make me laugh', 'tell me something funny', 'humor'])) {
      botSay(pick(jokes));
      return;
    }

    // --- Weather (generic) ---
    if (match(text, ['weather', 'temperature', 'is it raining', 'sunny', 'forecast'])) {
      const replies = [
        "I hope it's sunny where you are! ☀️ Either way, our riders deliver rain or shine! 🚴",
        "I can't check the weather, but I can guarantee hot food delivered to your door! 🍕🌧️",
        "Whether it's sunny or rainy, SwiftChow has you covered! Perfect weather for some comfort food 🍔",
      ];
      botSay(pick(replies));
      return;
    }

    // --- Thank you ---
    if (match(text, ['thank', 'thanks', 'thx', 'appreciate', 'grateful', 'cheers'])) {
      const replies = [
        "You're welcome! 😊 Happy to help anytime!",
        "No problem at all! 🎉 That's what I'm here for!",
        "Anytime! 💛 Enjoy your SwiftChow experience!",
        "My pleasure! Don't hesitate to ask if you need anything else 🤗",
      ];
      botSay(pick(replies));
      return;
    }

    // --- Goodbye ---
    if (match(text, ['bye', 'goodbye', 'see you', 'later', 'take care', 'gotta go', 'cya'])) {
      const name = ctx.userName ? ` ${esc(ctx.userName)}` : '';
      const replies = [
        `Goodbye${name}! 👋 Enjoy your meal and see you next time!`,
        `See you later${name}! 🍔 Have an amazing day!`,
        `Take care${name}! 😊 Come back whenever you're hungry!`,
        `Bye${name}! 🎉 Remember, SwiftChow is just a click away!`,
      ];
      botSay(pick(replies));
      return;
    }

    // --- Who are you / about bot ---
    if (match(text, [/who are you/, /what are you/, /your name/, /about you/, /introduce yourself/])) {
      botSay("I'm the <b>SwiftChow Assistant</b> 🤖 — your friendly guide to everything food! I can help you track orders, browse the menu, answer questions about delivery, and even tell you a joke or two! 😄");
      return;
    }

    // --- Who made you / who built you ---
    if (match(text, [/who made you/, /who built you/, /who created you/, /who developed you/, /who designed you/, /your creator/, /your developer/])) {
      const replies = [
        "I was built right inside <b>SwiftChow</b> to help customers with orders and questions! 🛠️ The team put a lot of love into making me useful.",
        "The brilliant SwiftChow engineering team created me! 🤖 I'm 100% homegrown — no external AI APIs needed.",
        "I was crafted by the SwiftChow developers to be your personal food ordering assistant! 👨‍💻🍔",
      ];
      botSay(pick(replies));
      return;
    }

    // --- What can you eat / do you eat ---
    if (match(text, [/do you eat/, /what do you eat/, /are you hungry/, /you eat food/])) {
      const replies = [
        "I don't eat, but I live and breathe food orders! 🍕 I can help YOU get something delicious though!",
        "I run on code and good vibes! 🤖 But if I could eat, I'd definitely go for our Chicken Burger. Want to order one?",
        "I wish I could taste food! 😄 For now, I'll settle for helping you find the perfect meal.",
      ];
      botSay(pick(replies));
      return;
    }

    // --- How old are you ---
    if (match(text, [/how old are you/, /your age/, /when were you born/, /your birthday/])) {
      botSay("I'm as fresh as today's menu! 🎂 Age is just a number — what matters is I'm here to help you 24/7!");
      return;
    }

    // --- Are you real / human ---
    if (match(text, [/are you real/, /are you human/, /are you a robot/, /are you a bot/, /are you ai/, /are you artificial/])) {
      const replies = [
        "I'm a chatbot — but a very friendly one! 🤖 I may not be human, but I know food! 🍔",
        "I'm 100% bot, 100% helpful! Think of me as your digital waiter. 😄",
        "Not human, but I've got great taste in food recommendations! 🍕 How can I help?",
      ];
      botSay(pick(replies));
      return;
    }

    // --- Bored ---
    if (match(text, [/im bored/, /i am bored/, /nothing to do/, /entertain me/])) {
      const replies = [
        `Bored? Let me fix that! 🎉 ${pick(funFacts)}`,
        `Nothing a good meal can't fix! 🍔 Check out our <a href="/menu.html" style="color:var(--primary);font-weight:600;">menu</a> for inspiration!`,
        `Here's something fun: ${pick(jokes)}`,
      ];
      botSay(pick(replies));
      return;
    }

    // --- Delivery hours ---
    if (match(text, [/delivery hour/, /opening hour/, /what time.*open/, /what time.*close/, /when.*open/, /when.*close/, /business hour/, /operating hour/, /working hour/])) {
      botSay("🕐 Our delivery hours are <b>8:00 AM – 10:00 PM</b> daily.<br><br>Orders placed after 10 PM will be delivered the next morning. Early bird? We start taking orders from 8 AM! 🌅");
      return;
    }

    // --- Contact info ---
    if (match(text, [/contact/, /email/, /phone/, /call/, /reach/, /support/, /customer service/, /help line/])) {
      botSay("📞 Here's how to reach us:<br><br>📧 Email: <b>orders@swiftchow.me</b><br>📱 Phone: <b>+233 50 507 0941</b><br>🌐 Website: <b>swiftchow.me</b><br><br>We respond within minutes during delivery hours! ⚡");
      return;
    }

    // --- Menu navigation ---
    if (match(text, [/show menu/, /see menu/, /browse menu/, /view menu/, /food menu/, /what.*sell/, /what.*offer/, /menu/])) {
      const categories = ['🍔 Burgers', '🍕 Pizza', '🥪 Sandwiches', '🥤 Shakes', '🍦 Ice Cream', '🍰 Desserts', '🥐 Pastries', '🎂 Cakes'];
      botSay(`🍽️ Our menu has <b>40+ delicious items</b> across these categories:<br><br>${categories.join('<br>')}<br><br>👉 <a href="/menu.html" style="color:var(--primary);font-weight:600;">Browse the full menu here</a><br><br>Want me to recommend something? Just ask! 😋`);
      setQuickActions([
        { label: '🍔 Burgers', value: 'recommend burgers' },
        { label: '🍕 Pizza', value: 'recommend pizza' },
        { label: '🍰 Desserts', value: 'recommend desserts' },
        { label: '🥤 Shakes', value: 'recommend shakes' },
      ]);
      return;
    }

    // --- Recommend food ---
    if (match(text, [/recommend/, /suggest/, /popular/, /best seller/, /what.*good/, /what should i/])) {
      let category = null;
      if (match(text, ['burger'])) category = 'burgers';
      else if (match(text, ['pizza'])) category = 'pizza';
      else if (match(text, ['sandwich'])) category = 'sandwiches';
      else if (match(text, ['shake', 'drink', 'beverage'])) category = 'shakes';
      else if (match(text, ['ice cream', 'icecream'])) category = 'ice-cream';
      else if (match(text, ['dessert', 'sweet'])) category = 'desserts';
      else if (match(text, ['pastry', 'pastries'])) category = 'pastries';
      else if (match(text, ['cake'])) category = 'cakes';

      if (typeof foodItems !== 'undefined' && foodItems.length) {
        let pool = category ? foodItems.filter(f => f.category === category) : foodItems.filter(f => f.isPopular);
        if (!pool.length) pool = foodItems;
        const picks = [];
        const used = new Set();
        while (picks.length < 3 && picks.length < pool.length) {
          const item = pool[Math.floor(Math.random() * pool.length)];
          if (!used.has(item.id)) { picks.push(item); used.add(item.id); }
        }
        const list = picks.map(f => `🍽️ <b>${esc(f.name)}</b> — GH₵${f.price} ⭐${f.rating}`).join('<br>');
        botSay(`Here are some ${category ? category : 'popular'} picks for you:<br><br>${list}<br><br>👉 <a href="/menu.html" style="color:var(--primary);font-weight:600;">View full menu</a> to order!`);
      } else {
        botSay(`Check out our full menu for the best picks! 👉 <a href="/menu.html" style="color:var(--primary);font-weight:600;">Browse Menu</a>`);
      }
      return;
    }

    // --- Follow-up: "when will it arrive" / "how long" referencing last order ---
    if (ctx.lastTopic === 'order' && ctx.lastOrderData && match(text, [/when.*arrive/, /how long.*left/, /will it arrive/, /is it coming/, /still coming/, /where is it now/, /any update/])) {
      const o = ctx.lastOrderData;
      if (o.status === 'delivered') {
        botSay(`Your order <b>#${esc(o.orderId)}</b> was already delivered at ${formatTime(o.deliveredAt)}! 🎉 Enjoy!`);
      } else if (o.status === 'cancelled') {
        botSay(`Order <b>#${esc(o.orderId)}</b> was cancelled. Need to place a new one?`);
      } else {
        const eta = o.estimatedDeliveryAt ? relativeTime(o.estimatedDeliveryAt) : (o.estimatedDeliveryTime ? `~${o.estimatedDeliveryTime} min` : 'soon');
        botSay(`Order <b>#${esc(o.orderId)}</b> is currently ${statusLabel(o.status)}.<br>⏱️ Estimated arrival: <b>${eta}</b>.<br><br>${statusProgress(o.status)}`);
      }
      return;
    }

    // --- Track / order status ---
    if (match(text, [/track/, /order status/, /my order/, /where.*order/, /my delivery/, /order update/, /delivery status/, /wheres my food/, /where is my food/, /show.*last order/, /latest order/, /recent order/])) {
      if (typeof isAuthenticated !== 'function' || !isAuthenticated()) {
        botSay("🔐 You need to be logged in to track your orders.<br><br>👉 <a href='/login.html' style='color:var(--primary);font-weight:600;'>Login here</a> and come back to check your order status!");
        return;
      }
      showTyping();
      const order = await fetchLatestOrder();
      hideTyping();
      if (!order) {
        botSay("You don't have any orders yet! 🛒<br><br>Ready to place one? 👉 <a href='/menu.html' style='color:var(--primary);font-weight:600;'>Browse our menu</a>");
        return;
      }
      ctx.selectedOrderId = order.orderId;
      ctx.lastOrderData = order;
      ctx.lastTopic = 'order';
      ctx.lastKnownStatuses[order.orderId] = order.status;
      botSay(`Here's your latest order:<br><br>${orderSummary(order)}`);
      // Start 15-second active tracking for this order
      if (order.status !== 'delivered' && order.status !== 'cancelled') {
        startActiveTracking(order.orderId);
      }
      setQuickActions([
        { label: 'All Orders', icon: 'fas fa-list', value: 'my orders' },
        { label: 'Refresh', icon: 'fas fa-sync', value: 'refresh order' },
        { label: 'Track Live', icon: 'fas fa-map-marker-alt', value: 'track live' },
      ]);
      return;
    }

    // --- Show delivered orders ---
    if (match(text, [/delivered order/, /completed order/, /which.*delivered/, /orders.*delivered/, /show delivered/])) {
      if (typeof isAuthenticated !== 'function' || !isAuthenticated()) {
        botSay("🔐 Please <a href='/login.html' style='color:var(--primary);font-weight:600;'>log in</a> to view your orders.");
        return;
      }
      showTyping();
      const orders = await fetchOrders();
      hideTyping();
      ctx.allOrders = orders;
      ctx.lastTopic = 'order';
      const delivered = filterOrders(orders, 'delivered');
      if (!delivered.length) {
        botSay("You don't have any delivered orders yet. Your current orders are still on the way! 🚴");
      } else {
        botSay(`🎉 You have <b>${delivered.length}</b> delivered order(s):<br><br>${orderListBrief(delivered)}`);
      }
      return;
    }

    // --- Show pending / active orders ---
    if (match(text, [/pending order/, /active order/, /in progress order/, /current order/, /orders.*pending/, /show pending/, /orders in progress/])) {
      if (typeof isAuthenticated !== 'function' || !isAuthenticated()) {
        botSay("🔐 Please <a href='/login.html' style='color:var(--primary);font-weight:600;'>log in</a> to view your orders.");
        return;
      }
      showTyping();
      const orders = await fetchOrders();
      hideTyping();
      ctx.allOrders = orders;
      ctx.lastTopic = 'order';
      const active = filterOrders(orders, 'active');
      if (!active.length) {
        botSay("You don't have any active orders right now. 🎉 All done!<br><br>Ready to place a new one? 👉 <a href='/menu.html' style='color:var(--primary);font-weight:600;'>Browse menu</a>");
      } else {
        botSay(`📦 You have <b>${active.length}</b> active order(s):<br><br>${orderListBrief(active)}`);
        const btns = active.slice(0, 4).map(o => ({ label: `#${o.orderId}`, value: `order ${o.orderId}` }));
        setQuickActions(btns);
      }
      return;
    }

    // --- My orders list ---
    if (match(text, [/my orders/, /order history/, /all orders/, /past orders/, /previous orders/, /show.*orders/, /list.*orders/])) {
      if (typeof isAuthenticated !== 'function' || !isAuthenticated()) {
        botSay("🔐 Please <a href='/login.html' style='color:var(--primary);font-weight:600;'>log in</a> to view your orders.");
        return;
      }
      showTyping();
      const orders = await fetchOrders();
      hideTyping();
      ctx.allOrders = orders;
      ctx.lastTopic = 'order';
      if (!orders.length) {
        botSay("You haven't placed any orders yet! 🍔<br><br>👉 <a href='/menu.html' style='color:var(--primary);font-weight:600;'>Start ordering now!</a>");
        return;
      }
      const summary = orderCountSummary(orders);
      botSay(`📦 You have <b>${orders.length}</b> order(s) — ${summary}.<br><br>${orderListBrief(orders)}<br><br>Type an order number (e.g. <b>#${esc(orders[0].orderId)}</b>) to see details.`);
      // Build quick actions for first few orders + filters
      const btns = [
        { label: 'Delivered', icon: 'fas fa-check-circle', value: 'show delivered orders' },
        { label: 'Active', icon: 'fas fa-spinner', value: 'show active orders' },
      ];
      orders.slice(0, 2).forEach(o => btns.push({ label: `#${o.orderId}`, value: `order ${o.orderId}` }));
      setQuickActions(btns);
      // Seed known statuses
      orders.forEach(o => { ctx.lastKnownStatuses[o.orderId] = o.status; });
      return;
    }

    // --- Specific order by ID ---
    const orderIdMatch = text.match(/(?:order\s*#?\s*|#)(SC\w+)/i) || text.match(/^(SC\w+)$/i);
    if (orderIdMatch) {
      if (typeof isAuthenticated !== 'function' || !isAuthenticated()) {
        botSay("🔐 Please <a href='/login.html' style='color:var(--primary);font-weight:600;'>log in</a> first.");
        return;
      }
      const id = orderIdMatch[1];
      showTyping();
      const order = await fetchOrder(id);
      hideTyping();
      if (!order) {
        botSay(`❌ I couldn't find order <b>#${esc(id)}</b>. Please double-check the order ID and try again.`);
        return;
      }
      ctx.selectedOrderId = order.orderId;
      ctx.lastOrderData = order;
      ctx.lastTopic = 'order';
      ctx.lastKnownStatuses[order.orderId] = order.status;
      botSay(orderSummary(order));
      if (order.status !== 'delivered' && order.status !== 'cancelled') {
        startActiveTracking(order.orderId);
      }
      setQuickActions([
        { label: 'Refresh', icon: 'fas fa-sync', value: 'refresh order' },
        { label: 'All Orders', icon: 'fas fa-list', value: 'my orders' },
      ]);
      return;
    }

    // --- Refresh current order ---
    if (match(text, [/refresh order/, /update order/, /check again/, /order again/])) {
      if (!ctx.selectedOrderId) {
        botSay("I don't have an order selected. Try saying <b>\"track my order\"</b> first! 📦");
        return;
      }
      showTyping();
      const order = await fetchOrder(ctx.selectedOrderId);
      hideTyping();
      if (!order) {
        botSay("❌ Couldn't find that order anymore. It may have been removed.");
        ctx.selectedOrderId = null;
        return;
      }
      ctx.lastOrderData = order;
      ctx.lastTopic = 'order';
      const prevStatus = ctx.lastKnownStatuses[order.orderId];
      ctx.lastKnownStatuses[order.orderId] = order.status;
      let extra = '';
      if (prevStatus && prevStatus !== order.status) {
        extra = `<br><br>🔔 Status changed: ${statusLabel(prevStatus)} → ${statusLabel(order.status)}`;
      }
      botSay(`${orderSummary(order)}${extra}`);
      return;
    }

    // --- Track live (redirect to tracking page) ---
    if (match(text, [/track live/, /live track/, /real.?time track/])) {
      if (ctx.selectedOrderId) {
        botSay(`🗺️ Opening live tracking for order <b>#${esc(ctx.selectedOrderId)}</b>...<br><br>👉 <a href="/tracking.html?order=${encodeURIComponent(ctx.selectedOrderId)}" style="color:var(--primary);font-weight:600;">View Tracking Page</a>`);
      } else {
        botSay(`👉 <a href="/tracking.html" style="color:var(--primary);font-weight:600;">Go to Tracking Page</a> to track your delivery in real-time! 🚴`);
      }
      return;
    }

    // --- Promotions / deals ---
    if (match(text, [/promo/, /deal/, /discount/, /coupon/, /offer/, /sale/])) {
      botSay("🎉 Current promotions:<br><br>🔥 <b>30% OFF</b> your first order — use code <b>SWIFT30</b><br>🍕 <b>Buy 2 Get 1 Free</b> on pizzas every Friday<br>🍔 <b>Combo deals</b> starting at GH₵39<br><br>👉 <a href='/menu.html' style='color:var(--primary);font-weight:600;'>See all deals on the menu page!</a>");
      return;
    }

    // --- Delivery areas ---
    if (match(text, [/delivery area/, /deliver to/, /do you deliver/, /delivery location/, /which city/, /what city/, /coverage/])) {
      const cities = typeof ghanaCities !== 'undefined' ? ghanaCities.filter(c => c.available).map(c => c.name).join(', ') : 'Accra, Kumasi, Tema, Tamale, Cape Coast, Takoradi, Ho, Koforidua, Sunyani, Bolgatanga';
      botSay(`🚴 We deliver across Ghana! Available cities:<br><br><b>${esc(cities)}</b><br><br>Delivery fees vary by location. Check at checkout for exact pricing!`);
      return;
    }

    // --- Payment methods ---
    if (match(text, [/payment/, /pay.*method/, /how.*pay/, /mobile money/, /momo/, /card/, /cash on delivery/, /cod/])) {
      botSay("💳 We accept multiple payment methods:<br><br>📱 <b>Mobile Money</b> (MTN, Vodafone, AirtelTigo)<br>💳 <b>Card Payment</b> (Visa, Mastercard)<br>💵 <b>Cash on Delivery</b><br><br>All online payments are secured by Flutterwave 🔒");
      return;
    }

    // --- Delivery time ---
    if (match(text, [/how long/, /delivery time/, /how fast/, /when.*arrive/, /eta/, /estimated time/])) {
      botSay("⚡ Average delivery times:<br><br>🏙️ Within city: <b>25-40 minutes</b><br>🌆 Suburb areas: <b>40-60 minutes</b><br><br>After placing an order, you'll get a real-time ETA! Track it live on the Tracking page 🗺️");
      return;
    }

    // --- Account / login help ---
    if (match(text, [/create account/, /sign up/, /register/, /how.*register/, /new account/])) {
      botSay("📝 Creating an account is easy!<br><br>👉 <a href='/signup.html' style='color:var(--primary);font-weight:600;'>Sign Up Here</a><br><br>You can also sign up with Google for a one-click experience! 🚀");
      return;
    }

    if (match(text, [/login/, /log in/, /sign in/, /cant login/, /forgot password/])) {
      botSay("🔐 Need to sign in?<br><br>👉 <a href='/login.html' style='color:var(--primary);font-weight:600;'>Login Page</a><br>🔑 <a href='/forgot-password.html' style='color:var(--primary);font-weight:600;'>Forgot Password?</a><br><br>You can also use Google Sign-In for quick access!");
      return;
    }

    // --- About SwiftChow ---
    if (match(text, [/about swift/, /about you.*company/, /what is swift/, /tell.*about/])) {
      botSay("🏢 <b>SwiftChow</b> is Ghana's #1 fast food delivery platform!<br><br>🍔 Premium burgers, 🍕 authentic pizzas, 🍰 irresistible desserts<br>🚴 Fast delivery across 10+ cities<br>⭐ 15,000+ happy customers<br>🏆 Top-rated on all review platforms<br><br>👉 <a href='/about.html' style='color:var(--primary);font-weight:600;'>Learn more about us</a>");
      return;
    }

    // --- Reviews ---
    if (match(text, [/review/, /rating/, /feedback/, /testimonial/])) {
      botSay("⭐ We're rated <b>4.8/5</b> by our customers!<br><br>👉 <a href='/reviews.html' style='color:var(--primary);font-weight:600;'>Read all reviews</a><br><br>Had a recent order? You can rate it from your <a href='/account.html' style='color:var(--primary);font-weight:600;'>Account page</a>!");
      return;
    }

    // --- Blog ---
    if (match(text, [/blog/, /article/, /news/, /whats new/])) {
      botSay("📰 Check out our blog for food stories, tips, and news!<br><br>👉 <a href='/blog.html' style='color:var(--primary);font-weight:600;'>Read the Blog</a>");
      return;
    }

    // --- Privacy / terms ---
    if (match(text, [/privacy/, /terms/, /policy/, /data protect/])) {
      botSay("📋 You can review our policies here:<br><br>🔒 <a href='/privacy.html' style='color:var(--primary);font-weight:600;'>Privacy Policy</a><br>📜 <a href='/terms.html' style='color:var(--primary);font-weight:600;'>Terms & Conditions</a><br><br>Your data is always safe with us! 🛡️");
      return;
    }

    // --- Compliments ---
    if (match(text, [/great/, /awesome/, /amazing/, /love it/, /love this/, /cool/, /nice/, /wonderful/, /excellent/, /fantastic/])) {
      const replies = [
        "Thank you so much! 😊🎉 That really means a lot to us!",
        "You're awesome too! 💛 We work hard to make SwiftChow the best!",
        "That's so kind! 🙏 We're here to keep delivering happiness!",
        "Aww, thank you! 😊 You just made our day!",
      ];
      botSay(pick(replies));
      return;
    }

    // --- Complaints ---
    if (match(text, [/complain/, /problem/, /issue/, /not happy/, /disappointed/, /wrong order/, /cold food/, /late delivery/])) {
      botSay("😔 I'm sorry to hear that! We take every concern seriously.<br><br>Please reach out to our support team:<br>📧 <b>orders@swiftchow.me</b><br>📱 <b>+233 50 507 0941</b><br><br>Or use our <a href='/contact.html' style='color:var(--primary);font-weight:600;'>Contact Form</a> — we'll resolve it ASAP! 💪");
      return;
    }

    // --- Cart ---
    if (match(text, [/my cart/, /view cart/, /whats in my cart/, /cart items/, /checkout/])) {
      botSay("🛒 Check your cart and proceed to checkout!<br><br>👉 <a href='/cart.html' style='color:var(--primary);font-weight:600;'>View Cart</a><br>💳 <a href='/checkout.html' style='color:var(--primary);font-weight:600;'>Go to Checkout</a>");
      return;
    }

    // --- Help ---
    if (match(text, [/help/, /what can you do/, /commands/, /features/, /options/])) {
      botSay("Here's what I can help with:<br><br>" +
        "📦 <b>Order Tracking</b> — \"track my order\", \"show my orders\", \"delivered orders\"<br>" +
        "🍽️ <b>Menu & Recommendations</b> — \"show menu\", \"recommend burgers\"<br>" +
        "🕐 <b>Delivery Info</b> — \"delivery hours\", \"delivery time\"<br>" +
        "📞 <b>Contact</b> — \"contact info\", \"support\"<br>" +
        "💳 <b>Payment</b> — \"payment methods\"<br>" +
        "🎉 <b>Deals</b> — \"promotions\", \"deals\"<br>" +
        "🕐 <b>Time & Date</b> — \"what time is it?\", \"what day?\"<br>" +
        "😄 <b>Fun</b> — \"tell me a joke\", \"who made you?\"<br><br>" +
        "Just type naturally — I understand lots of variations! 🤖");
      defaultQuickActions();
      return;
    }

    // --- Name detection (e.g., "my name is John") ---
    const nameMatch = text.match(/(?:my name is|i am|i'm|call me)\s+(\w+)/i);
    if (nameMatch) {
      ctx.userName = nameMatch[1];
      botSay(`Nice to meet you, <b>${esc(ctx.userName)}</b>! 😊 How can I help you today?`);
      return;
    }

    // --- Numbers (possible order selection from list) ---
    if (/^\d+$/.test(lower)) {
      // If user types a number, check if it could be selecting from an order list
      botSay(`If you're trying to select an order, please type the full order ID (e.g. <b>#SC123ABC</b>). Or try saying <b>"my orders"</b> to see your recent orders! 📦`);
      return;
    }

    // --- Fallback ---
    const fallbacks = [
      "I'm not sure about that, but I can help you with orders, tracking, or delivery info! 📦 Try typing <b>help</b> to see what I can do.",
      "Hmm, I didn't quite catch that 🤔 I'm great with order tracking, menu browsing, and delivery questions! Type <b>help</b> for options.",
      "I don't have an answer for that yet, but I'm always learning! 🤖 Can I help with your order, our menu, or delivery info?",
      "That's a bit outside my area! 😅 I specialise in SwiftChow orders, menu, and delivery. Type <b>help</b> to see everything I can do!",
    ];
    botSay(pick(fallbacks));
    defaultQuickActions();
  }

  // ─── Welcome message ────────────────────────────────────
  function showWelcome() {
    if (ctx.greeted) return;
    ctx.greeted = true;

    // Try to get user name
    try {
      const stored = localStorage.getItem('swiftChowUser');
      if (stored) {
        const user = JSON.parse(stored);
        ctx.userName = user.firstName || user.fullName || null;
      }
    } catch { /* ignore */ }

    const name = ctx.userName ? `, ${esc(ctx.userName)}` : '';
    setTimeout(() => {
      botSay(`${timeGreeting()}${name}! 👋 I'm your <b>SwiftChow Assistant</b>.<br><br>I can help you track orders, browse the menu, find deals, and more!<br><br>${pick(funFacts)}`, 500);
      defaultQuickActions();
    }, 300);
  }

  // ─── Order placement notification (global hook) ──────
  function notifyOrderPlaced(orderId, total, eta) {
    const msg = `🎉 Your order <b>#${esc(orderId)}</b> has been placed successfully!<br><br>💰 Total: GH₵${Number(total).toFixed(2)}<br>⏱️ Expected delivery in <b>${eta || 30} minutes</b>.<br><br>I'll keep you updated on its progress! 🚴`;
    botSay(msg, 400);
    if (orderId) {
      ctx.selectedOrderId = orderId;
      ctx.lastKnownStatuses[orderId] = 'confirmed';
    }
    showBadge();
  }

  // ─── Event wiring ──────────────────────────────────────
  function init() {
    injectHTML();

    const fab = document.getElementById('chatbot-fab');
    const win = document.getElementById('chatbot-window');
    const closeBtn = win ? win.querySelector('.chatbot-close') : null;
    const inputEl = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');

    // Toggle window
    fab.addEventListener('click', () => {
      const isOpen = win.classList.toggle('open');
      fab.classList.toggle('active', isOpen);
      const icon = document.getElementById('chatbot-fab-icon');
      if (icon) icon.className = isOpen ? 'fas fa-times' : 'fas fa-comments';
      if (isOpen) {
        hideBadge();
        showWelcome();
        if (inputEl) inputEl.focus();
        startOrderPolling();
      }
    });

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        win.classList.remove('open');
        fab.classList.remove('active');
        const icon = document.getElementById('chatbot-fab-icon');
        if (icon) icon.className = 'fas fa-comments';
      });
    }

    // Send message
    function send() {
      const val = inputEl ? inputEl.value.trim() : '';
      if (val) handleInput(val);
    }
    if (sendBtn) sendBtn.addEventListener('click', send);
    if (inputEl) inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

    // Expose global hook for order placement
    window.swiftChowChatbot = { notifyOrderPlaced };

    // Cleanup polling on page unload to prevent memory leaks
    window.addEventListener('beforeunload', () => {
      if (ctx.orderPollTimer) clearInterval(ctx.orderPollTimer);
      stopActiveTracking();
    });

    // If user is authenticated, seed known statuses in background
    if (typeof isAuthenticated === 'function' && isAuthenticated()) {
      setTimeout(async () => {
        try {
          const orders = await fetchOrders();
          orders.forEach(o => { ctx.lastKnownStatuses[o.orderId] = o.status; });
        } catch { /* silent */ }
      }, 3000);
    }
  }

  // ─── Boot ──────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
