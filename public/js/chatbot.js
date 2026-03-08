/* ============================================
   SWIFT CHOW - AI Chatbot Widget
   Smart food ordering assistant with menu knowledge
   ============================================ */

(function() {
  'use strict';

  // ============================================
  // CHATBOT KNOWLEDGE BASE
  // ============================================

  const CHATBOT_CONFIG = {
    botName: 'ChowBot',
    greeting: "Hi there! 👋 I'm ChowBot, your SWIFT CHOW assistant. I can help you with:\n\n🍔 Menu & food recommendations\n📦 Order tracking\n🕐 Opening hours & delivery info\n💬 General questions\n\nWhat can I help you with?",
    typingDelay: 600
  };

  // FAQ knowledge base
  const FAQ_DATABASE = [
    {
      keywords: ['hour', 'open', 'close', 'time', 'when', 'schedule'],
      answer: "🕐 We're open daily from **8:00 AM to 11:00 PM** (GMT). Orders placed after 10:30 PM may be delivered the next day."
    },
    {
      keywords: ['deliver', 'delivery', 'how long', 'wait', 'eta', 'time to deliver'],
      answer: "🚗 Delivery typically takes **25-45 minutes** depending on your location in Accra. You can track your order in real-time on the tracking page!"
    },
    {
      keywords: ['delivery fee', 'delivery cost', 'shipping', 'delivery charge'],
      answer: "💰 Our standard delivery fee is **GHS 15.00** within Accra. Free delivery on orders above GHS 200!"
    },
    {
      keywords: ['pay', 'payment', 'momo', 'mobile money', 'card', 'cash', 'method'],
      answer: "💳 We accept:\n• **Mobile Money** (MTN, Vodafone, AirtelTigo)\n• **Credit/Debit Cards** (Visa, Mastercard)\n• **Cash on Delivery**\n\nAll online payments are secure and encrypted."
    },
    {
      keywords: ['location', 'where', 'area', 'city', 'deliver to', 'address', 'coverage'],
      answer: "📍 We currently deliver across **Accra**, including East Legon, Cantonments, Osu, Airport Residential, Labone, Dansoman, Tema, and more. We're expanding to other cities soon!"
    },
    {
      keywords: ['cancel', 'refund', 'return'],
      answer: "❌ You can cancel an order within **5 minutes** of placing it. After that, if your order is already being prepared, we can't cancel it. For refunds, please contact us at **orders@swiftchow.me**."
    },
    {
      keywords: ['contact', 'support', 'help', 'email', 'phone', 'call'],
      answer: "📧 You can reach us at:\n• **Email:** orders@swiftchow.me\n• **Phone:** +233 30 000 0000\n• Or use our **Contact page** for a quick message!\n\nWe respond within 24 hours."
    },
    {
      keywords: ['account', 'sign up', 'register', 'login', 'password'],
      answer: "👤 You can create a free account to:\n• Save delivery addresses\n• Track orders easily\n• Get personalized recommendations\n• Access exclusive deals\n\nHead to the **Sign Up** page to get started!"
    },
    {
      keywords: ['track', 'tracking', 'order status', 'where is my order'],
      answer: "📦 To track your order:\n1. Go to the **Tracking** page\n2. Enter your Order ID (starts with 'SC')\n3. See real-time status updates!\n\nYou'll also receive email updates at each step."
    },
    {
      keywords: ['allergen', 'allergy', 'gluten', 'nut', 'vegan', 'vegetarian', 'dietary'],
      answer: "🥗 We take dietary needs seriously! While our current menu focuses on standard items, please mention any allergies in the **Special Instructions** during checkout and our kitchen will accommodate you. Contact us for specific ingredient details."
    },
    {
      keywords: ['deal', 'offer', 'discount', 'promo', 'coupon', 'save'],
      answer: "🎉 Check out our **Deals section** on the homepage for amazing combo offers! We regularly update with new promotions. Subscribe to our newsletter for exclusive deals delivered to your inbox."
    },
    {
      keywords: ['minimum', 'min order'],
      answer: "📋 There's no minimum order amount! Order as much or as little as you'd like. However, orders above **GHS 200** get **free delivery**!"
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
  // RESPONSE ENGINE
  // ============================================

  function getResponse(userMessage) {
    const msg = userMessage.toLowerCase().trim();

    // Greetings
    if (/^(hi|hello|hey|yo|sup|greetings|good morning|good afternoon|good evening|howdy)\b/.test(msg)) {
      const greetings = [
        "Hey there! 😊 How can I help you today? Looking for something delicious?",
        "Hello! 🍔 Welcome to SWIFT CHOW! What are you craving today?",
        "Hi! 👋 I'm here to help. Want to explore our menu or need help with an order?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Thanks
    if (/^(thanks|thank you|thx|ty|cheers|appreciated)\b/.test(msg)) {
      return "You're welcome! 😊 Let me know if there's anything else I can help with. Enjoy your meal! 🍽️";
    }

    // Bye
    if (/^(bye|goodbye|see you|later|cya|gotta go)\b/.test(msg)) {
      return "Goodbye! 👋 Enjoy your food and come back anytime. Have a great day! 🌟";
    }

    // Menu-related queries
    const menuMatch = findMenuMatch(msg);
    const menuResponse = formatMenuResponse(menuMatch);
    if (menuResponse) return menuResponse;

    // FAQ matching
    for (const faq of FAQ_DATABASE) {
      const matchScore = faq.keywords.filter(kw => msg.includes(kw)).length;
      if (matchScore >= 1) {
        return faq.answer;
      }
    }

    // Fallback
    const fallbacks = [
      "I'm not sure I understand that. Could you try asking about:\n• Our **menu** items and prices\n• **Delivery** info and tracking\n• **Payment** methods\n• **Deals** and offers\n\nOr contact us at **orders@swiftchow.me** for detailed help!",
      "Hmm, I don't have info on that yet. But I can help with menu recommendations, order tracking, delivery info, and more! What would you like to know?",
      "I'm still learning! 🤖 Try asking me about our food menu, delivery areas, payment options, or current deals."
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
  // CHATBOT UI
  // ============================================

  let chatOpen = false;
  let chatInitialized = false;

  function createChatWidget() {
    if (chatInitialized) return;
    chatInitialized = true;

    // Floating button
    const fab = document.createElement('button');
    fab.id = 'chatbot-fab';
    fab.setAttribute('aria-label', 'Open chat assistant');
    fab.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;

    // Chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chatbot-window';
    chatWindow.innerHTML = `
      <div class="chatbot-header">
        <div class="chatbot-header-info">
          <div class="chatbot-avatar">🤖</div>
          <div>
            <div class="chatbot-name">${CHATBOT_CONFIG.botName}</div>
            <div class="chatbot-status">Online</div>
          </div>
        </div>
        <button class="chatbot-close" aria-label="Close chat">&times;</button>
      </div>
      <div class="chatbot-messages" id="chatbot-messages"></div>
      <div class="chatbot-quick-actions" id="chatbot-quick-actions">
        <button class="chatbot-quick-btn" data-msg="What's popular?">🔥 Popular</button>
        <button class="chatbot-quick-btn" data-msg="Show me deals">🎉 Deals</button>
        <button class="chatbot-quick-btn" data-msg="Delivery info">🚗 Delivery</button>
        <button class="chatbot-quick-btn" data-msg="Track my order">📦 Track Order</button>
      </div>
      <form class="chatbot-input-area" id="chatbot-form">
        <input type="text" id="chatbot-input" placeholder="Type a message..." autocomplete="off" maxlength="500">
        <button type="submit" class="chatbot-send" aria-label="Send message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </form>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(chatWindow);

    // Event listeners
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

    // Quick action buttons
    chatWindow.querySelectorAll('.chatbot-quick-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const msg = this.getAttribute('data-msg');
        handleUserMessage(msg);
        // Hide quick actions after first use
        document.getElementById('chatbot-quick-actions').style.display = 'none';
      });
    });
  }

  function toggleChat() {
    chatOpen = !chatOpen;
    const fab = document.getElementById('chatbot-fab');
    const win = document.getElementById('chatbot-window');

    if (chatOpen) {
      win.classList.add('open');
      fab.classList.add('active');
      fab.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      // Show greeting on first open
      const msgContainer = document.getElementById('chatbot-messages');
      if (msgContainer && !msgContainer.children.length) {
        addBotMessage(CHATBOT_CONFIG.greeting);
      }
      document.getElementById('chatbot-input').focus();
    } else {
      win.classList.remove('open');
      fab.classList.remove('active');
      fab.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
    }
  }

  function handleUserMessage(text) {
    addUserMessage(text);
    showTyping();

    setTimeout(() => {
      hideTyping();
      const response = getResponse(text);
      addBotMessage(response);
    }, CHATBOT_CONFIG.typingDelay + Math.random() * 400);
  }

  function addUserMessage(text) {
    const container = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.className = 'chatbot-msg user';
    div.innerHTML = `<div class="chatbot-bubble user">${escapeHTML(text)}</div>`;
    container.appendChild(div);
    scrollToBottom();
  }

  function addBotMessage(text) {
    const container = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.className = 'chatbot-msg bot';
    div.innerHTML = `<div class="chatbot-bubble bot">${renderMarkdown(text)}</div>`;
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
