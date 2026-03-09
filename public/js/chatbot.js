/* ============================================
   SWIFT CHOW - AI Chatbot Widget (v2)
   Professional food ordering assistant
   ============================================ */

(function() {
  'use strict';

  // ============================================
  // CHATBOT CONFIGURATION
  // ============================================

  const CHATBOT_CONFIG = {
    botName: 'ChowBot',
    tagline: 'SWIFT CHOW AI Assistant',
    typingDelay: 500,
    maxHistory: 20
  };

  // Conversation memory
  const conversationCtx = {
    history: [],
    userName: null,
    lastTopic: null,
    messageCount: 0
  };

  function getTimeGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function getGreeting() {
    const name = conversationCtx.userName;
    const greet = getTimeGreeting();
    const nameStr = name ? `, ${name}` : '';
    return `${greet}${nameStr}! 👋 I'm **ChowBot**, your SWIFT CHOW assistant.\n\nI can help you with:\n🍔 Menu browsing & recommendations\n📦 Order tracking & status\n🕐 Delivery info & hours\n💳 Payment options\n🎉 Deals & promotions\n\nHow can I help you today?`;
  }

  // FAQ knowledge base (with topics for context)
  const FAQ_DATABASE = [
    {
      keywords: ['hour', 'open', 'close', 'time', 'when', 'schedule'],
      topic: 'hours',
      answer: "🕐 **Operating Hours**\nWe're open daily from **8:00 AM – 11:00 PM** (GMT).\n\nOrders placed after 10:30 PM may be scheduled for next-day delivery."
    },
    {
      keywords: ['deliver', 'delivery', 'how long', 'wait', 'eta', 'time to deliver'],
      topic: 'delivery',
      answer: "🚗 **Delivery Times**\nStandard delivery takes **25–45 minutes** depending on your location in Accra.\n\nTrack your order in real-time on the [Tracking page](tracking.html)!"
    },
    {
      keywords: ['delivery fee', 'delivery cost', 'shipping', 'delivery charge'],
      topic: 'delivery',
      answer: "💰 **Delivery Fees**\n• Standard: **GHS 15.00** within Accra\n• **FREE** on orders above GHS 200\n\nGreat savings on bigger orders!"
    },
    {
      keywords: ['pay', 'payment', 'momo', 'mobile money', 'card', 'cash', 'method'],
      topic: 'payment',
      answer: "💳 **Payment Methods**\n\n• 📱 **Mobile Money** — MTN, Vodafone, AirtelTigo\n• 💳 **Cards** — Visa & Mastercard\n• 💵 **Cash on Delivery**\n\nAll online payments are processed securely via Flutterwave."
    },
    {
      keywords: ['location', 'where', 'area', 'city', 'deliver to', 'address', 'coverage'],
      topic: 'location',
      answer: "📍 **Delivery Coverage**\nWe deliver across **Accra** including:\nEast Legon, Cantonments, Osu, Airport Residential, Labone, Dansoman, Tema & more.\n\nExpanding to other cities soon!"
    },
    {
      keywords: ['cancel', 'refund', 'return'],
      topic: 'orders',
      answer: "❌ **Cancellations & Refunds**\n\n• Cancel within **5 minutes** of placing your order\n• After preparation begins, cancellation isn't possible\n• Refund requests: **orders@swiftchow.me**"
    },
    {
      keywords: ['contact', 'support', 'help', 'email', 'phone', 'call'],
      topic: 'support',
      answer: "📧 **Contact Us**\n\n• **Email:** orders@swiftchow.me\n• **Phone:** +233 30 000 0000\n• **Live Chat:** You're using it right now! 😊\n• **Contact Page:** [Get in touch](contact.html)\n\nWe respond within 24 hours."
    },
    {
      keywords: ['account', 'sign up', 'register', 'login', 'password'],
      topic: 'account',
      answer: "👤 **Your Account**\n\nCreate a free account to:\n• Save delivery addresses\n• Track orders in real-time\n• Get personalized recommendations\n• Access exclusive deals\n\n[Sign Up Now](signup.html) — it takes 30 seconds!"
    },
    {
      keywords: ['track', 'tracking', 'order status', 'where is my order'],
      topic: 'tracking',
      answer: "📦 **Track Your Order**\n\n1. Go to the [Tracking page](tracking.html)\n2. Select your order from the list\n3. See live status, bike animation & ETA!\n\nYou'll also get email updates at each delivery stage."
    },
    {
      keywords: ['allergen', 'allergy', 'gluten', 'nut', 'vegan', 'vegetarian', 'dietary'],
      topic: 'dietary',
      answer: "🥗 **Dietary & Allergen Info**\n\nWe take dietary needs seriously! Add any allergies or preferences in the **Special Instructions** at checkout.\n\nFor specific ingredient details, email us at **orders@swiftchow.me**."
    },
    {
      keywords: ['deal', 'offer', 'discount', 'promo', 'coupon', 'save'],
      topic: 'deals',
      answer: "🎉 **Deals & Offers**\n\n• Check our **Deals section** on the homepage\n• Free delivery on orders above GHS 200\n• Subscribe to our newsletter for exclusive promos!\n\nNew deals added weekly!"
    },
    {
      keywords: ['minimum', 'min order'],
      topic: 'orders',
      answer: "📋 **No Minimum Order!**\n\nOrder as much or as little as you'd like. Orders above **GHS 200** get **free delivery**!"
    }
  ];

  // ============================================
  // MENU INTELLIGENCE
  // ============================================

  function getMenuItems() {
    return (typeof foodItems !== 'undefined') ? foodItems : [];
  }

  function findMenuMatch(query) {
    const items = getMenuItems();
    if (!items.length) return null;

    const q = query.toLowerCase();

    // Check for category match
    const categories = ['burger', 'pizza', 'sandwich', 'shake', 'ice cream', 'ice-cream', 'dessert', 'pastry', 'pastries', 'cake'];
    const matchedCategory = categories.find(c => q.includes(c));

    if (matchedCategory) {
      const catKey = matchedCategory.replace('ice cream', 'ice-cream').replace('pastries', 'pastry');
      const catItems = items.filter(i => i.category.includes(catKey) || i.category === catKey + 's');
      if (catItems.length) {
        return {
          type: 'category',
          category: matchedCategory,
          items: catItems
        };
      }
    }

    // Check for specific item match
    const itemMatch = items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      q.includes(i.name.toLowerCase().split(' ')[0])
    );
    if (itemMatch.length === 1) {
      return { type: 'item', item: itemMatch[0] };
    }
    if (itemMatch.length > 1) {
      return { type: 'multiple', items: itemMatch.slice(0, 5) };
    }

    // Check for price-related queries
    const cheapMatch = q.match(/cheap|affordable|budget|under (\d+)/);
    if (cheapMatch) {
      const maxPrice = cheapMatch[1] ? parseInt(cheapMatch[1]) : 30;
      const affordable = items.filter(i => i.price <= maxPrice).sort((a, b) => a.price - b.price);
      if (affordable.length) {
        return { type: 'price', label: `under GHS ${maxPrice}`, items: affordable.slice(0, 5) };
      }
    }

    // Check for popular/best/top items
    if (/popular|best|top|recommend|suggestion|favourite|favorite|what should/i.test(q)) {
      const popular = items.filter(i => i.isPopular).sort((a, b) => b.rating - a.rating);
      return { type: 'popular', items: popular.slice(0, 5) };
    }

    // Check for new items
    if (/new|latest|recent|fresh/i.test(q)) {
      const newItems = items.filter(i => i.isNew);
      if (newItems.length) {
        return { type: 'new', items: newItems.slice(0, 5) };
      }
    }

    return null;
  }

  function formatMenuResponse(match) {
    if (!match) return null;

    switch (match.type) {
      case 'item': {
        const i = match.item;
        return `🍽️ **${escapeHTML(i.name)}**\n${escapeHTML(i.description)}\n\n💰 **GHS ${i.price}** | ⭐ ${i.rating} | ⏱️ ${escapeHTML(i.prepTime)}\n🔥 ${i.calories} cal\n\nWant to add it to your cart? Head to our [Menu](menu.html)!`;
      }
      case 'category': {
        let resp = `Here are our **${escapeHTML(match.category)}** options:\n\n`;
        match.items.forEach(i => {
          resp += `• **${escapeHTML(i.name)}** — GHS ${i.price} (⭐ ${i.rating})\n`;
        });
        resp += `\nCheck them all on our [Menu page](menu.html)!`;
        return resp;
      }
      case 'multiple': {
        let resp = `I found a few matches:\n\n`;
        match.items.forEach(i => {
          resp += `• **${escapeHTML(i.name)}** — GHS ${i.price} (⭐ ${i.rating})\n`;
        });
        resp += `\nWant details on any of these?`;
        return resp;
      }
      case 'price': {
        let resp = `💰 Affordable picks (${escapeHTML(match.label)}):\n\n`;
        match.items.forEach(i => {
          resp += `• **${escapeHTML(i.name)}** — GHS ${i.price}\n`;
        });
        resp += `\nGreat value! Check our [Menu](menu.html) for more.`;
        return resp;
      }
      case 'popular': {
        let resp = `🔥 Our most popular items:\n\n`;
        match.items.forEach(i => {
          resp += `• **${escapeHTML(i.name)}** — GHS ${i.price} (⭐ ${i.rating}, ${i.reviews} reviews)\n`;
        });
        resp += `\nYou can't go wrong with any of these!`;
        return resp;
      }
      case 'new': {
        let resp = `✨ New on the menu:\n\n`;
        match.items.forEach(i => {
          resp += `• **${escapeHTML(i.name)}** — GHS ${i.price} (⭐ ${i.rating})\n`;
        });
        resp += `\nTry something new today!`;
        return resp;
      }
      default:
        return null;
    }
  }

  // ============================================
  // RESPONSE ENGINE (Enhanced)
  // ============================================

  function getResponse(userMessage) {
    const msg = userMessage.toLowerCase().trim();
    conversationCtx.messageCount++;

    // Check for name introduction
    const nameMatch = msg.match(/(?:i'm|i am|my name is|call me|this is)\s+([a-z]+)/i);
    if (nameMatch) {
      conversationCtx.userName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
      return `Nice to meet you, **${escapeHTML(conversationCtx.userName)}**! 😊 How can I help you today?`;
    }

    // Greetings (context-aware)
    if (/^(hi|hello|hey|yo|sup|greetings|good morning|good afternoon|good evening|howdy)\b/.test(msg)) {
      conversationCtx.lastTopic = 'greeting';
      if (conversationCtx.messageCount > 1) {
        return `Welcome back! 😊 What else can I help with?`;
      }
      const greetings = [
        `${getTimeGreeting()}! 😊 What can I help you find today?`,
        `Hello! 🍔 Hungry? Let me help you find something delicious!`,
        `Hey there! 👋 Browse our menu, track an order, or ask me anything!`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Thanks (varied)
    if (/^(thanks|thank you|thx|ty|cheers|appreciated)\b/.test(msg)) {
      conversationCtx.lastTopic = null;
      const thanks = [
        "You're welcome! 😊 Anything else I can help with?",
        "Happy to help! 🌟 Let me know if you need anything else.",
        "Anytime! 😄 Enjoy your meal!"
      ];
      return thanks[Math.floor(Math.random() * thanks.length)];
    }

    // Bye
    if (/^(bye|goodbye|see you|later|cya|gotta go)\b/.test(msg)) {
      conversationCtx.lastTopic = null;
      return "Goodbye! 👋 Thanks for chatting with ChowBot. Enjoy your food! 🌟";
    }

    // Menu-related queries
    const menuMatch = findMenuMatch(msg);
    const menuResponse = formatMenuResponse(menuMatch);
    if (menuResponse) {
      conversationCtx.lastTopic = 'menu';
      return menuResponse;
    }

    // FAQ matching (score-weighted)
    let bestFaq = null;
    let bestScore = 0;
    for (const faq of FAQ_DATABASE) {
      const matchScore = faq.keywords.filter(kw => msg.includes(kw)).length;
      if (matchScore > bestScore) {
        bestScore = matchScore;
        bestFaq = faq;
      }
    }
    if (bestFaq && bestScore >= 1) {
      conversationCtx.lastTopic = bestFaq.topic || 'faq';
      return bestFaq.answer;
    }

    // Follow-up context
    if (conversationCtx.lastTopic === 'menu' && /^(yes|yeah|sure|ok|yep|show me|more)/i.test(msg)) {
      return "Great! Head to our [Menu page](menu.html) to browse everything and add items to your cart. 🛒";
    }

    // Fallback (professional)
    const fallbacks = [
      "I'm not sure I have that info yet. Here's what I can help with:\n\n• 🍔 **Menu** — browse items & prices\n• 📦 **Tracking** — check order status\n• 🚗 **Delivery** — times & areas\n• 💳 **Payments** — accepted methods\n• 🎉 **Deals** — current offers\n\nOr email us at **orders@swiftchow.me**!",
      "I don't have info on that, but I can help with menu recommendations, order tracking, delivery info, and more! Try asking about one of those. 😊",
      "Hmm, that's outside my expertise. 🤖 Try asking about our **menu**, **delivery areas**, **payment options**, or **current deals**!"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // ============================================
  // SIMPLE MARKDOWN RENDERER
  // ============================================

  function renderMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: var(--primary); text-decoration: underline;">$1</a>')
      .replace(/\n/g, '<br>');
  }

  // ============================================
  // CHATBOT UI (Professional v2)
  // ============================================

  let chatOpen = false;
  let chatInitialized = false;

  function createChatWidget() {
    if (chatInitialized) return;
    chatInitialized = true;

    // Try to get user name from localStorage
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.name) conversationCtx.userName = u.name.split(' ')[0];
    } catch(e) {}

    // FAB
    const fab = document.createElement('button');
    fab.id = 'chatbot-fab';
    fab.setAttribute('aria-label', 'Open chat assistant');
    fab.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg><span class="chatbot-fab-badge" id="chatbot-badge" style="display:none">1</span>`;

    // Chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chatbot-window';
    chatWindow.innerHTML = `
      <div class="chatbot-header">
        <div class="chatbot-header-info">
          <div class="chatbot-avatar"><i class="fas fa-headset"></i></div>
          <div>
            <div class="chatbot-name">${CHATBOT_CONFIG.botName}</div>
            <div class="chatbot-status"><span class="chatbot-status-dot"></span> Online — typically replies instantly</div>
          </div>
        </div>
        <button class="chatbot-close" aria-label="Close chat">&times;</button>
      </div>
      <div class="chatbot-messages" id="chatbot-messages"></div>
      <div class="chatbot-quick-actions" id="chatbot-quick-actions">
        <button class="chatbot-quick-btn" data-msg="What's popular?"><i class="fas fa-fire"></i> Popular</button>
        <button class="chatbot-quick-btn" data-msg="Show me deals"><i class="fas fa-tags"></i> Deals</button>
        <button class="chatbot-quick-btn" data-msg="Delivery info"><i class="fas fa-truck"></i> Delivery</button>
        <button class="chatbot-quick-btn" data-msg="Track my order"><i class="fas fa-box"></i> Track Order</button>
        <button class="chatbot-quick-btn" data-msg="Payment methods"><i class="fas fa-credit-card"></i> Payments</button>
      </div>
      <form class="chatbot-input-area" id="chatbot-form">
        <input type="text" id="chatbot-input" placeholder="Ask me anything..." autocomplete="off" maxlength="500">
        <button type="submit" class="chatbot-send" aria-label="Send message">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </form>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(chatWindow);

    // Events
    fab.addEventListener('click', toggleChat);
    chatWindow.querySelector('.chatbot-close').addEventListener('click', toggleChat);

    document.getElementById('chatbot-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const input = document.getElementById('chatbot-input');
      const msg = input.value.trim();
      if (!msg) return;
      input.value = '';
      handleUserMessage(msg);
    });

    chatWindow.querySelectorAll('.chatbot-quick-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const msg = this.getAttribute('data-msg');
        handleUserMessage(msg);
      });
    });

    // Show notification badge after 5s if chat hasn't been opened
    setTimeout(() => {
      if (!chatOpen) {
        const badge = document.getElementById('chatbot-badge');
        if (badge) badge.style.display = 'flex';
      }
    }, 5000);
  }

  function toggleChat() {
    chatOpen = !chatOpen;
    const fab = document.getElementById('chatbot-fab');
    const win = document.getElementById('chatbot-window');
    const badge = document.getElementById('chatbot-badge');

    if (chatOpen) {
      win.classList.add('open');
      fab.classList.add('active');
      if (badge) badge.style.display = 'none';
      fab.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      // Greeting on first open
      const msgContainer = document.getElementById('chatbot-messages');
      if (msgContainer && !msgContainer.children.length) {
        addBotMessage(getGreeting());
      }
      document.getElementById('chatbot-input').focus();
    } else {
      win.classList.remove('open');
      fab.classList.remove('active');
      fab.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg><span class="chatbot-fab-badge" id="chatbot-badge" style="display:none">1</span>`;
    }
  }

  function handleUserMessage(text) {
    addUserMessage(text);
    showTyping();

    const delay = CHATBOT_CONFIG.typingDelay + Math.random() * 400;
    setTimeout(() => {
      hideTyping();
      const response = getResponse(text);
      addBotMessage(response);
    }, delay);
  }

  function getTimeStamp() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function addUserMessage(text) {
    const container = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.className = 'chatbot-msg user';
    div.innerHTML = `<div class="chatbot-bubble user">${escapeHTML(text)}<span class="chatbot-time">${getTimeStamp()}</span></div>`;
    container.appendChild(div);
    scrollToBottom();
  }

  function addBotMessage(text) {
    const container = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.className = 'chatbot-msg bot';
    div.innerHTML = `<div class="chatbot-msg-avatar"><i class="fas fa-headset"></i></div><div class="chatbot-bubble bot">${renderMarkdown(text)}<span class="chatbot-time">${getTimeStamp()}</span></div>`;
    container.appendChild(div);
    scrollToBottom();
  }

  function showTyping() {
    const container = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.className = 'chatbot-msg bot chatbot-typing';
    div.innerHTML = `<div class="chatbot-bubble bot"><span class="typing-dots"><span></span><span></span><span></span></span></div>`;
    container.appendChild(div);
    scrollToBottom();
  }

  function hideTyping() {
    const el = document.querySelector('.chatbot-typing');
    if (el) el.remove();
  }

  function scrollToBottom() {
    const container = document.getElementById('chatbot-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  // ============================================
  // INITIALIZE
  // ============================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatWidget);
  } else {
    createChatWidget();
  }

})();
