/* ============================================
   SWIFT CHOW - Personalized Recommendations Engine
   Smart food recommendations based on user behavior
   ============================================ */

(function() {
  'use strict';

  // ============================================
  // RECOMMENDATION ALGORITHMS
  // ============================================

  function getItems() {
    return (typeof foodItems !== 'undefined') ? foodItems : [];
  }

  function getUserData() {
    try {
      const raw = localStorage.getItem('swiftChowUser');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function getOrderHistory() {
    try {
      const raw = localStorage.getItem('swiftChowOrderHistory');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function getViewHistory() {
    try {
      const raw = localStorage.getItem('swiftChowViewHistory');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function getCartItems() {
    try {
      const raw = localStorage.getItem('swiftChowCart');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  // Track item views
  window.trackItemView = function(itemId) {
    const history = getViewHistory();
    history.push({ id: itemId, timestamp: Date.now() });
    // Keep last 50 views
    const trimmed = history.slice(-50);
    localStorage.setItem('swiftChowViewHistory', JSON.stringify(trimmed));
  };

  // ============================================
  // RECOMMENDATION STRATEGIES
  // ============================================

  // 1. Based on order history — "Order Again"
  function getOrderAgainItems() {
    const orders = getOrderHistory();
    if (!orders.length) return [];

    const items = getItems();
    const orderedIds = {};

    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          orderedIds[item.foodId || item.id] = (orderedIds[item.foodId || item.id] || 0) + 1;
        });
      }
    });

    return Object.entries(orderedIds)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id]) => items.find(i => i.id === parseInt(id)))
      .filter(Boolean);
  }

  // 2. Based on browsing history — "Recently Viewed"
  function getRecentlyViewed() {
    const views = getViewHistory();
    if (!views.length) return [];

    const items = getItems();
    const seen = new Set();
    const recent = [];

    // Reverse to get most recent first
    for (let i = views.length - 1; i >= 0; i--) {
      const id = views[i].id;
      if (!seen.has(id)) {
        seen.add(id);
        const item = items.find(it => it.id === parseInt(id));
        if (item) recent.push(item);
      }
      if (recent.length >= 6) break;
    }

    return recent;
  }

  // 3. Category affinity — "Because You Like [Category]"
  function getCategoryRecommendations() {
    const views = getViewHistory();
    const orders = getOrderHistory();
    const items = getItems();

    // Count category interactions
    const catScores = {};

    views.forEach(v => {
      const item = items.find(i => i.id === parseInt(v.id));
      if (item) catScores[item.category] = (catScores[item.category] || 0) + 1;
    });

    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(oi => {
          const item = items.find(i => i.id === parseInt(oi.foodId || oi.id));
          if (item) catScores[item.category] = (catScores[item.category] || 0) + 3; // Orders weigh more
        });
      }
    });

    if (!Object.keys(catScores).length) return { category: null, items: [] };

    // Find top category
    const topCategory = Object.entries(catScores).sort((a, b) => b[1] - a[1])[0][0];

    // Get items from that category the user hasn't ordered
    const orderedIds = new Set();
    orders.forEach(o => {
      if (o.items) o.items.forEach(i => orderedIds.add(parseInt(i.foodId || i.id)));
    });

    const recs = items
      .filter(i => i.category === topCategory && !orderedIds.has(i.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);

    return { category: topCategory, items: recs };
  }

  // 4. Complementary items — "Goes Well With" (based on cart)
  function getComplementaryItems() {
    const cart = getCartItems();
    if (!cart.length) return [];

    const items = getItems();
    const cartCategories = new Set();
    const cartIds = new Set();

    cart.forEach(ci => {
      const item = items.find(i => i.id === parseInt(ci.foodId || ci.id));
      if (item) {
        cartCategories.add(item.category);
        cartIds.add(item.id);
      }
    });

    // Suggest items from complementary categories
    const complements = {
      'burgers': ['shakes', 'desserts', 'ice-cream'],
      'pizza': ['shakes', 'desserts'],
      'sandwiches': ['shakes', 'pastries'],
      'shakes': ['burgers', 'pizza', 'sandwiches'],
      'ice-cream': ['cakes', 'pastries'],
      'desserts': ['shakes', 'ice-cream'],
      'pastries': ['shakes', 'ice-cream'],
      'cakes': ['ice-cream', 'shakes']
    };

    const suggestedCategories = new Set();
    cartCategories.forEach(cat => {
      if (complements[cat]) {
        complements[cat].forEach(c => suggestedCategories.add(c));
      }
    });

    return items
      .filter(i => suggestedCategories.has(i.category) && !cartIds.has(i.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }

  // 5. Time-based suggestions
  function getTimeBasedSuggestions() {
    const items = getItems();
    const hour = new Date().getHours();

    let categories;
    let label;

    if (hour >= 6 && hour < 11) {
      categories = ['pastries', 'sandwiches'];
      label = '🌅 Good Morning! Try These for Breakfast';
    } else if (hour >= 11 && hour < 15) {
      categories = ['burgers', 'pizza', 'sandwiches'];
      label = '☀️ Lunch Picks';
    } else if (hour >= 15 && hour < 18) {
      categories = ['shakes', 'ice-cream', 'pastries'];
      label = '🍦 Afternoon Treats';
    } else if (hour >= 18 && hour < 22) {
      categories = ['burgers', 'pizza'];
      label = '🌙 Dinner Favorites';
    } else {
      categories = ['desserts', 'ice-cream', 'shakes'];
      label = '🌃 Late Night Cravings';
    }

    const suggestions = items
      .filter(i => categories.includes(i.category))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);

    return { label, items: suggestions };
  }

  // 6. Trending / Most popular
  function getTrendingItems() {
    const items = getItems();
    return items
      .filter(i => i.isPopular)
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, 6);
  }

  // ============================================
  // RENDERING
  // ============================================

  function createItemCard(item, compact) {
    const safeAlt = typeof escapeHTML === 'function' ? escapeHTML(item.name) : item.name;
    const safeImg = typeof sanitizeURL === 'function' ? sanitizeURL(item.image) : item.image;

    if (compact) {
      return `
        <div class="rec-item-compact" data-item-id="${item.id}">
          <img src="${safeImg}" alt="${safeAlt}" loading="lazy">
          <div class="rec-item-info">
            <span class="rec-item-name">${safeAlt}</span>
            <span class="rec-item-price">GHS ${item.price}</span>
          </div>
          <button class="rec-add-btn" onclick="addToCart(${item.id})" aria-label="Add ${safeAlt} to cart">+</button>
        </div>`;
    }

    return `
      <div class="rec-item-card" data-item-id="${item.id}">
        <img src="${safeImg}" alt="${safeAlt}" loading="lazy">
        <div class="rec-card-body">
          <div class="rec-item-meta">
            <span class="rec-rating"><i class="fas fa-star"></i> ${item.rating}</span>
            <span class="rec-category">${item.category.replace('-', ' ')}</span>
          </div>
          <h4 class="rec-item-name">${safeAlt}</h4>
          <div class="rec-card-footer">
            <span class="rec-item-price">GHS ${item.price}</span>
            <button class="rec-add-btn" onclick="addToCart(${item.id})" aria-label="Add ${safeAlt} to cart">
              <i class="fas fa-plus"></i> Add
            </button>
          </div>
        </div>
      </div>`;
  }

  function renderSection(container, title, items, compact) {
    if (!items || !items.length) return;

    const section = document.createElement('div');
    section.className = 'rec-section';
    section.innerHTML = `
      <div class="rec-section-header">
        <h3 class="rec-section-title">${title}</h3>
        <div class="rec-scroll-controls">
          <button class="rec-scroll-btn rec-scroll-left" aria-label="Scroll left">&lsaquo;</button>
          <button class="rec-scroll-btn rec-scroll-right" aria-label="Scroll right">&rsaquo;</button>
        </div>
      </div>
      <div class="rec-scroll-container">
        ${items.map(item => createItemCard(item, compact)).join('')}
      </div>
    `;

    container.appendChild(section);

    // Scroll buttons
    const scrollContainer = section.querySelector('.rec-scroll-container');
    section.querySelector('.rec-scroll-left').addEventListener('click', () => {
      scrollContainer.scrollBy({ left: -280, behavior: 'smooth' });
    });
    section.querySelector('.rec-scroll-right').addEventListener('click', () => {
      scrollContainer.scrollBy({ left: 280, behavior: 'smooth' });
    });
  }

  // ============================================
  // PUBLIC API
  // ============================================

  window.SwiftRecommendations = {
    /**
     * Render recommendations into a container element.
     * @param {string} containerId - DOM element ID
     * @param {object} options - { showOrderAgain, showRecentlyViewed, showCategoryRecs, showTimeBased, showTrending, showComplementary, compact }
     */
    render: function(containerId, options) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const opts = Object.assign({
        showOrderAgain: true,
        showRecentlyViewed: true,
        showCategoryRecs: true,
        showTimeBased: true,
        showTrending: true,
        showComplementary: false,
        compact: false
      }, options || {});

      container.innerHTML = '';

      // 1. Order Again (only for logged-in users with history)
      if (opts.showOrderAgain) {
        const orderAgain = getOrderAgainItems();
        if (orderAgain.length) {
          renderSection(container, '🔄 Order Again', orderAgain, opts.compact);
        }
      }

      // 2. Recently Viewed
      if (opts.showRecentlyViewed) {
        const recent = getRecentlyViewed();
        if (recent.length) {
          renderSection(container, '👀 Recently Viewed', recent, opts.compact);
        }
      }

      // 3. Category affinity
      if (opts.showCategoryRecs) {
        const catRecs = getCategoryRecommendations();
        if (catRecs.items.length) {
          const catName = catRecs.category.charAt(0).toUpperCase() + catRecs.category.slice(1);
          renderSection(container, `❤️ Because You Like ${catName}`, catRecs.items, opts.compact);
        }
      }

      // 4. Complementary (cart page)
      if (opts.showComplementary) {
        const complementary = getComplementaryItems();
        if (complementary.length) {
          renderSection(container, '🍟 Goes Well With Your Order', complementary, opts.compact);
        }
      }

      // 5. Time-based
      if (opts.showTimeBased) {
        const timeBased = getTimeBasedSuggestions();
        if (timeBased.items.length) {
          renderSection(container, timeBased.label, timeBased.items, opts.compact);
        }
      }

      // 6. Trending (fallback / always show)
      if (opts.showTrending) {
        const trending = getTrendingItems();
        if (trending.length) {
          renderSection(container, '📈 Trending Now', trending, opts.compact);
        }
      }
    },

    // Render compact recommendations for checkout/cart sidebar
    renderCompact: function(containerId) {
      this.render(containerId, {
        showOrderAgain: false,
        showRecentlyViewed: false,
        showCategoryRecs: false,
        showTimeBased: false,
        showTrending: false,
        showComplementary: true,
        compact: true
      });
    },

    trackView: function(itemId) {
      if (typeof window.trackItemView === 'function') {
        window.trackItemView(itemId);
      }
    }
  };

  // ============================================
  // AUTO-SAVE ORDER HISTORY (hook into checkout)
  // ============================================

  // Listen for successful orders to save history
  window.addEventListener('orderCompleted', function(e) {
    if (e.detail && e.detail.items) {
      const history = getOrderHistory();
      history.push({
        items: e.detail.items,
        timestamp: Date.now()
      });
      // Keep last 20 orders
      localStorage.setItem('swiftChowOrderHistory', JSON.stringify(history.slice(-20)));
    }
  });

})();
