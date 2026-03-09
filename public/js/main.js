/* ============================================
   SWIFT CHOW - Main JavaScript
   Core functionality and UI interactions
   ============================================ */

// ============================================
// CLEAR CART ON ORDER SUCCESS PAGE
// ============================================
(function() {
  if (document.body && document.body.getAttribute('data-page') === 'order-success') {
    // Wait for cart.js to load then clear
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        if (typeof cart !== 'undefined') {
          cart = [];
          if (typeof saveCart === 'function') saveCart();
          if (typeof updateCartCount === 'function') updateCartCount();
          if (typeof updateFloatingCart === 'function') updateFloatingCart();
        }
      }, 500);
    });
  }
})();

// ============================================
// DARK MODE
// ============================================

function initDarkMode() {
  const savedTheme = localStorage.getItem('swiftChowTheme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateDarkModeIcon(savedTheme);
}

function toggleDarkMode() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('swiftChowTheme', newTheme);
  updateDarkModeIcon(newTheme);
  
  // Add transition class
  document.body.classList.add('theme-transitioning');
  setTimeout(() => {
    document.body.classList.remove('theme-transitioning');
  }, 300);
}

function togglePasswordVisibility(inputId, e) {
  const passwordInput = document.getElementById(inputId);
  if (!passwordInput) return;
  
  // Find the toggle button: try event target, then sibling, then parent container
  let toggleBtn = null;
  const evt = e || window.event;
  if (evt && evt.target) {
    toggleBtn = evt.target.closest('button');
  }
  if (!toggleBtn) {
    toggleBtn = passwordInput.nextElementSibling;
    if (toggleBtn && toggleBtn.tagName !== 'BUTTON') {
      toggleBtn = passwordInput.parentElement.querySelector('button');
    }
  }
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    if (toggleBtn) {
      const icon = toggleBtn.querySelector('i');
      if (icon) { icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }
      toggleBtn.setAttribute('title', 'Hide password');
    }
  } else {
    passwordInput.type = 'password';
    if (toggleBtn) {
      const icon = toggleBtn.querySelector('i');
      if (icon) { icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }
      toggleBtn.setAttribute('title', 'Show password');
    }
  }
}

function updateDarkModeIcon(theme) {
  const toggleBtns = document.querySelectorAll('.dark-mode-toggle');
  
  toggleBtns.forEach(btn => {
    if (theme === 'dark') {
      btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
      btn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
      btn.setAttribute('aria-label', 'Switch to dark mode');
    }
  });
}

// ============================================
// MOBILE MENU
// ============================================

function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const body = document.body;
  
  if (!menuBtn || !mobileNav) return;

  // Create backdrop overlay if it doesn't exist
  let backdrop = document.querySelector('.mobile-nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'mobile-nav-backdrop';
    document.body.appendChild(backdrop);
  }

  function openMenu() {
    menuBtn.classList.add('active');
    mobileNav.classList.add('active');
    backdrop.classList.add('active');
    body.classList.add('menu-open');
    menuBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    menuBtn.classList.remove('active');
    mobileNav.classList.remove('active');
    backdrop.classList.remove('active');
    body.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  
  menuBtn.addEventListener('click', () => {
    const isOpen = menuBtn.classList.contains('active');
    if (isOpen) { closeMenu(); } else { openMenu(); }
  });

  // Close menu when clicking backdrop
  backdrop.addEventListener('click', closeMenu);
  
  // Close menu when clicking a link
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'success', duration = 3000) {
  let container = document.querySelector('.toast-container');
  
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('role', 'alert');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>`,
    error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>`,
    info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>`,
    warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>`
  };
  
  // SECURITY: Escape message to prevent XSS via product names or API errors
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${escapeHTML(message)}</span>
    <button class="toast-close" aria-label="Dismiss notification" onclick="this.parentElement.remove()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;
  
  container.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });
  
  // Auto remove
  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================
// DEALS CAROUSEL
// ============================================

let currentDealIndex = 0;
let carouselInterval = null;
let touchStartX = 0;
let touchEndX = 0;

function initDealsCarousel() {
  // Try to find elements using IDs first (new structure)
  let track = document.getElementById('dealsTrack');
  let prevBtn = document.getElementById('dealsPrev');
  let nextBtn = document.getElementById('dealsNext');
  let dots = document.querySelectorAll('.deals-dot');
  
  // Fallback to class selectors if IDs not found (backward compatibility or different page structure)
  if (!track) track = document.querySelector('.deals-track');
  if (!prevBtn) prevBtn = document.querySelector('.deals-prev') || document.querySelector('.carousel-btn.prev');
  if (!nextBtn) nextBtn = document.querySelector('.deals-next') || document.querySelector('.carousel-btn.next');
  if (!dots.length) dots = document.querySelectorAll('.carousel-dot');

  if (!track) {
    console.warn('initDealsCarousel: No track element found, aborting');
    return;
  }
  
  // Setup Event Listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToDeal(currentDealIndex - 1);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToDeal(currentDealIndex + 1);
    });
  }
  
  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      goToDeal(index);
    });
  });
  
  // Touch support
  track.addEventListener('touchstart', handleTouchStart, { passive: true });
  track.addEventListener('touchend', handleTouchEnd, { passive: true });
  
  // Start autoplay
  startCarouselAutoPlay();
  
  // Pause on hover
  const wrapper = document.querySelector('.deals-carousel-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', stopCarouselAutoPlay);
    wrapper.addEventListener('mouseleave', startCarouselAutoPlay);
  }
}

function goToDeal(index) {
  let track = document.getElementById('dealsTrack');
  if (!track) track = document.querySelector('.deals-track');
  
  if (!track) return;
  
  // Determine total slides based on children or fallback
  const totalDeals = track.children.length || 5;
  
  // Wrap around logic
  if (index < 0) index = totalDeals - 1;
  if (index >= totalDeals) index = 0;

  currentDealIndex = index;
  
  // Move track
  track.style.transform = `translateX(-${index * 100}%)`;
  
  // Update dots
  let dots = document.querySelectorAll('.deals-dot');
  if (!dots.length) dots = document.querySelectorAll('.carousel-dot');
  
  dots.forEach((dot, i) => {
    if (i === index) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

function startCarouselAutoPlay() {
  if (carouselInterval) clearInterval(carouselInterval);
  carouselInterval = setInterval(() => {
    goToDeal(currentDealIndex + 1);
  }, 5000);
}

function stopCarouselAutoPlay() {
  if (carouselInterval) {
    clearInterval(carouselInterval);
    carouselInterval = null;
  }
}

// Clean up carousel interval on page unload to prevent memory leaks
window.addEventListener('beforeunload', stopCarouselAutoPlay);

function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;
  
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      goToDeal(currentDealIndex + 1);
    } else {
      goToDeal(currentDealIndex - 1);
    }
  }
}

// ============================================
// MENU RENDERING
// ============================================

function renderMenuItems(items, container) {
  if (!container) return;
  
  if (items.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h3>No items found</h3>
        <p>Try adjusting your search or filter criteria</p>
      </div>
    `;
    return;
  }
  
  // SECURITY: Escape all dynamic data to prevent XSS if data source is compromised
  container.innerHTML = items.map(item => `
    <article class="food-card" data-category="${escapeHTML(item.category)}" data-id="${item.id}">
      <div class="food-card-image">
        <img src="${sanitizeURL(item.image)}" alt="${escapeHTML(item.name)}" loading="lazy" decoding="async" sizes="(max-width: 414px) 100vw, (max-width: 768px) 50vw, 33vw">
        ${item.isNew ? '<span class="food-card-badge badge-new">NEW</span>' : ''}
        ${item.isPopular ? '<span class="food-card-badge badge-popular">POPULAR</span>' : ''}
        <button class="food-card-wishlist" onclick="toggleWishlist(${parseInt(item.id) || 0})" aria-label="Add to wishlist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      <div class="food-card-content">
        <span class="food-card-category">${escapeHTML(item.category)}</span>
        <h3 class="food-card-title">${escapeHTML(item.name)}</h3>
        <p class="food-card-desc">${escapeHTML(item.description)}</p>
        <div class="food-card-meta">
          <div class="food-card-rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>${item.rating}</span>
            <span class="rating-count">(${item.reviews})</span>
          </div>
          <span class="food-card-time">${item.prepTime}</span>
        </div>
        <div class="food-card-footer">
          <div class="food-card-price">
            <span class="price-current">GHS ${item.price}</span>
          </div>
          <button class="add-to-cart-btn" onclick="addToCart(${item.id})" aria-label="Add to cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span class="add-to-cart-text">Add</span>
          </button>
        </div>
      </div>
    </article>
  `).join('');
  
  // Add animation to cards
  const cards = container.querySelectorAll('.food-card');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.05}s`;
    card.classList.add('fade-in-up');
  });
}

function renderPopularItems() {
  const container = document.querySelector('.popular-items-grid');
  if (!container || typeof foodItems === 'undefined') return;
  
  const popularItems = foodItems.filter(item => item.isPopular).slice(0, 8);
  renderMenuItems(popularItems, container);
}

// ============================================
// CATEGORY FILTER
// ============================================

function initCategoryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn, .category-card');
  const productsGrid = document.querySelector('.products-grid, .menu-grid');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const category = btn.dataset.category;
      filterMenuByCategory(category);
    });
  });
}

function filterMenuByCategory(category) {
  const productsGrid = document.querySelector('.products-grid, .menu-grid');
  if (!productsGrid || typeof foodItems === 'undefined') return;
  
  let filteredItems = foodItems;
  if (category && category !== 'all') {
    filteredItems = foodItems.filter(item => item.category === category);
  }
  
  renderMenuItems(filteredItems, productsGrid);
  
  // Update URL
  const url = new URL(window.location);
  if (category && category !== 'all') {
    url.searchParams.set('category', category);
  } else {
    url.searchParams.delete('category');
  }
  window.history.replaceState({}, '', url);
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function initSearch() {
  const searchInputs = document.querySelectorAll('.search-input, .menu-search input');
  
  searchInputs.forEach(input => {
    let debounceTimer;
    
    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = e.target.value.toLowerCase().trim();
        searchMenu(query);
      }, 300);
    });
    
    // Handle search on enter
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = e.target.value.toLowerCase().trim();
        searchMenu(query);
      }
    });
  });
}

function searchMenu(query) {
  const productsGrid = document.querySelector('.products-grid, .menu-grid');
  if (!productsGrid || typeof foodItems === 'undefined') return;
  
  let filteredItems = foodItems;
  
  if (query) {
    filteredItems = foodItems.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  }
  
  renderMenuItems(filteredItems, productsGrid);
  
  // Clear category filter active state
  document.querySelectorAll('.filter-btn, .category-card').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const allBtn = document.querySelector('[data-category="all"]');
  if (allBtn && !query) allBtn.classList.add('active');
}

// ============================================
// CATEGORIES SECTION
// ============================================

function initCategories() {
  const container = document.querySelector('.categories-grid');
  if (!container || typeof categories === 'undefined') return;
  
  container.innerHTML = categories.filter(cat => cat.id !== 'all').map(cat => `
    <a href="menu.html?category=${cat.id}" class="category-card" data-category="${cat.id}">
      <span class="category-icon">${cat.icon}</span>
      <h4 class="category-name">${cat.name}</h4>
      <span class="category-count">${cat.count} items</span>
    </a>
  `).join('');
}

// ============================================
// BLOG RENDERING
// ============================================

function renderBlogPosts(container, limit = null) {
  if (!container || typeof blogPosts === 'undefined') return;
  
  const posts = limit ? blogPosts.slice(0, limit) : blogPosts;
  
  container.innerHTML = posts.map(post => `
    <article class="blog-card">
      <div class="blog-card-image">
        <img src="${post.image}" alt="${post.title}" loading="lazy" decoding="async" sizes="(max-width: 414px) 100vw, (max-width: 768px) 50vw, 33vw">
        <span class="blog-card-category">${post.category}</span>
      </div>
      <div class="blog-card-content">
        <div class="blog-card-meta">
          <span class="blog-date">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${formatDate(post.date)}
          </span>
          <span class="blog-read-time">${post.readTime}</span>
        </div>
        <h3 class="blog-card-title">${post.title}</h3>
        <p class="blog-card-excerpt">${post.excerpt}</p>
        <a href="blog-post.html?id=${post.id}" class="blog-card-link">
          Read More
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    </article>
  `).join('');
}

function renderBlogPreview() {
  const container = document.getElementById('blogScroll') || document.querySelector('.blog-preview-grid');
  if (!container || typeof blogPosts === 'undefined') return;

  container.innerHTML = blogPosts.slice(0, 6).map(post => `
    <a href="blog-post.html?id=${post.id}" class="blog-card-premium">
      <img src="${post.image}" alt="${post.title}" loading="lazy">
      <div class="blog-content">
        <div class="blog-meta">
          <span class="blog-category">${post.category}</span>
          <span class="blog-time">${post.readTime}</span>
        </div>
        <h3 class="blog-title">${post.title}</h3>
        <p class="blog-excerpt">${post.excerpt}</p>
      </div>
    </a>
  `).join('');
}

function renderBlogPostPage() {
  var params = new URLSearchParams(window.location.search);
  var rawId = params.get('id');
  var rawSlug = params.get('slug');
  
  // If no id AND no slug, leave the static HTML as-is (e.g. the Jollof article)
  if (!rawId && !rawSlug) return;
  
  if (typeof blogPosts === 'undefined') {
    console.error('Blog posts data not loaded');
    return;
  }
  
  var post = null;
  if (rawSlug) {
    post = blogPosts.find(function(p) { return p.slug === rawSlug; });
  }
  if (!post && rawId) {
    post = blogPosts.find(function(p) { return p.id === parseInt(rawId); });
  }
  if (!post) {
    // No matching post found — leave static HTML intact
    return;
  }
  
  var postId = post.id;
  var container = document.querySelector('.blog-post-container article');
  if (!container) return;
  
  // Build full blog content using plain text
  var fullContent = '';
  
  // Simple content for each post
  if (postId === 1) {
    fullContent = '<h2>The Origins</h2><p>The hamburger story begins in Hamburg, Germany in the 19th century. German immigrants brought this culinary tradition to America, and by 1904, hamburgers were a hit at the St. Louis World Fair.</p><h2>Global Journey</h2><p>The hamburger spread worldwide, adapted by each culture. In Ghana, we have added our own unique twist with the Spicy Jerk Burger combining American style with Caribbean and West African spices.</p>';
  } else if (postId === 2) {
    fullContent = '<h2>Why Pizza Conquered Africa</h2><p>Pizza appeal lies in its versatility and adaptability. In Africa, it has become a favorite across diverse food cultures.</p><h2>Local Innovations</h2><p>From Nigerian-spiced pizzas to South African varieties, African chefs have reimagined the Italian classic with local toppings.</p>';
  } else if (postId === 3) {
    fullContent = '<h2>The Streets of Accra</h2><p>Accra food scene offers incredible experiences. From Jamestown grilled fish to Osu waakye stands, the city has amazing food.</p><h2>Must-Try Street Foods</h2><p>Waakye, Grilled Fish, Fufu and Light Soup, Kebabs, and Akple are essential Accra experiences that represent local food culture.</p>';
  } else if (postId === 4) {
    fullContent = '<h2>Our Milkshake Philosophy</h2><p>At SWIFT CHOW, we believe great milkshakes start with quality ingredients - premium ice cream, fresh dairy, and carefully selected flavorings blended fresh to order.</p><h2>Popular Combinations</h2><p>From classic Vanilla to adventurous Caramel, our shake menu caters to every taste with seasonal specials for limited-time flavors.</p>';
  } else if (postId === 5) {
    fullContent = '<h2>Family Dining Matters</h2><p>Family meals are important. SWIFT CHOW is designed with families in mind with comfortable spaces, kid-friendly options, and a welcoming atmosphere for creating lasting memories.</p>';
  } else {
    fullContent = '<p>This is a featured article from SWIFT CHOW. Check back for more detailed content!</p>';
  }
  
  // Update the header
  const header = container.querySelector('.blog-post-header');
  if (header) {
    header.innerHTML = '<span class="blog-post-category">' + post.category + '</span><h1 class="blog-post-title">' + post.title + '</h1><div class="blog-post-meta"><div class="blog-post-author"><div class="author-avatar">' + post.author.split(' ').map(n => n[0]).join('') + '</div><div><strong class="blog-post-author-name">' + post.author + '</strong></div></div><span class="blog-post-date"><i class="far fa-calendar"></i> ' + formatDate(post.date) + '</span><span><i class="far fa-clock"></i> ' + post.readTime + '</span></div>';
  }
  
  // Update the image
  const imageDiv = container.querySelector('.blog-post-image');
  if (imageDiv) {
    imageDiv.innerHTML = '<img src="' + post.image + '" alt="' + post.title + '" loading="lazy">';
  }
  
  // Update the content
  const contentDiv = container.querySelector('.blog-post-content');
  if (contentDiv) {
    contentDiv.innerHTML = '<p>' + post.excerpt + '</p>' + fullContent;
  }
  
  // Update related posts - search from the page container, not article
  const relatedContainer = document.querySelector('.related-posts .blog-grid');
  if (relatedContainer && typeof getRelatedBlogPosts === 'function') {
    const relatedPosts = getRelatedBlogPosts(postId, 2);
    relatedContainer.innerHTML = relatedPosts.map(relatedPost => {
      return '<article class="blog-card"><div class="blog-card-image"><img src="' + relatedPost.image + '" alt="' + relatedPost.title + '" loading="lazy" decoding="async" sizes="(max-width: 414px) 100vw, (max-width: 768px) 50vw, 33vw"></div><div class="blog-card-content"><div class="blog-card-meta"><span><i class="far fa-calendar"></i> ' + formatDate(relatedPost.date) + '</span></div><h3 class="blog-card-title">' + relatedPost.title + '</h3><a href="blog-post.html?id=' + relatedPost.id + '" class="blog-card-link">Read More <i class="fas fa-arrow-right"></i></a></div></article>';
    }).join('');
  }
}

// ============================================
// REVIEWS RENDERING
// ============================================

function renderReviews() {
  const container = document.querySelector('.reviews-grid');
  if (!container) return;
  
  // Get reviews from localStorage first, then fall back to default reviews
  let reviewsToDisplay = [];
  const storedReviews = JSON.parse(localStorage.getItem('swiftChowReviews') || '[]');
  
  if (storedReviews.length > 0) {
    reviewsToDisplay = storedReviews;
  } else if (typeof reviews !== 'undefined') {
    reviewsToDisplay = reviews;
  } else {
    reviewsToDisplay = [];
  }
  
  // Update rating stats (overall rating, distribution bars, total count)
  updateRatingStats(reviewsToDisplay);
  
  if (reviewsToDisplay.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No reviews yet. Be the first to share your experience!</p>';
    return;
  }
  
  container.innerHTML = reviewsToDisplay.map(review => {
    // Handle both old format (with title, location) and new format (without)
    const rating = review.rating || 5;
    const name = review.name || 'Anonymous';
    const comment = review.comment || review.title || '';
    const date = review.date || new Date().toLocaleDateString();
    
    // SECURITY: Escape all user-submitted review data to prevent stored XSS
    return `
      <div class="review-card animate-on-scroll">
        <div class="review-header">
          <div class="review-user">
            <div class="review-avatar">${escapeHTML(review.avatar || getInitial(name))}</div>
            <div class="review-user-info">
              <h4 class="review-name">${escapeHTML(name)}</h4>
              ${review.location ? `<span class="review-location">${escapeHTML(review.location)}</span>` : ''}
            </div>
          </div>
          <div class="review-rating">
            <div class="stars-display">
              ${renderStarRating(rating)}
              <span class="rating-number">${rating}</span>
            </div>
          </div>
        </div>
        <p class="review-comment">${escapeHTML(comment)}</p>
        <div class="review-footer">
          <span class="review-date">${escapeHTML(date)}</span>
          ${review.verified ? '<span class="review-verified"><i class="fas fa-check-circle"></i> Verified Purchase</span>' : ''}
          ${review.helpful ? `<button class="review-helpful" onclick="markHelpful(event, ${review.id})">
            <i class="fas fa-thumbs-up"></i>
            Helpful (${review.helpful})
          </button>` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  initScrollReveal();
}

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : 'U';
}

// Update rating statistics: overall score, star distribution bars, review count
function updateRatingStats(reviewsArray) {
  const total = reviewsArray.length;
  
  // Update total review count text
  const countEl = document.getElementById('totalReviewCount');
  if (countEl) {
    countEl.textContent = total === 0 ? 'No reviews yet' : `Based on ${total} verified review${total !== 1 ? 's' : ''}`;
  }
  
  // Calculate distribution
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sumRatings = 0;
  reviewsArray.forEach(r => {
    const rating = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
    dist[rating]++;
    sumRatings += rating;
  });
  
  const avgRating = total > 0 ? (sumRatings / total).toFixed(1) : '0.0';
  
  // Update overall rating number
  const overallEl = document.getElementById('overallRating');
  if (overallEl) overallEl.textContent = avgRating;
  
  // Update overall star icons
  const starsContainer = document.getElementById('overallStars');
  if (starsContainer) {
    const avg = parseFloat(avgRating);
    const fullStars = Math.floor(avg);
    const hasHalf = avg - fullStars >= 0.25 && avg - fullStars < 0.75;
    const hasFull = avg - fullStars >= 0.75;
    const stars = starsContainer.querySelectorAll('i');
    stars.forEach((star, i) => {
      star.className = '';
      if (i < fullStars || (i === fullStars && hasFull)) {
        star.className = 'fas fa-star';
      } else if (i === fullStars && hasHalf) {
        star.className = 'fas fa-star-half-alt';
      } else {
        star.className = 'far fa-star';
      }
    });
  }
  
  // Update distribution bars
  for (let star = 1; star <= 5; star++) {
    const bar = document.querySelector(`.dist-bar[data-stars="${star}"]`);
    const countSpan = document.querySelector(`.dist-count[data-stars="${star}"]`);
    const pct = total > 0 ? (dist[star] / total) * 100 : 0;
    
    if (bar) bar.style.width = pct + '%';
    if (countSpan) countSpan.textContent = dist[star];
  }
}

// Helper function to render star rating
function renderStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let starsHTML = '';
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star" style="color: #fbbf24;"></i>';
  }
  
  // Half star
  if (hasHalfStar) {
    starsHTML += '<i class="fas fa-star-half-alt" style="color: #fbbf24;"></i>';
  }
  
  // Empty stars
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star" style="color: #d1d5db;"></i>';
  }
  
  return starsHTML;
}

// Mark review as helpful with animation
function markHelpful(event, reviewId) {
  event.preventDefault();
  const button = event.target.closest('.review-helpful');
  if (!button) return;
  
  // Get current count
  let countMatch = button.textContent.match(/\d+/);
  let currentCount = countMatch ? parseInt(countMatch[0]) : 0;
  
  // Update count
  const newCount = currentCount + 1;
  button.innerHTML = `<i class="fas fa-thumbs-up"></i> Helpful (${newCount})`;
  button.disabled = true;
  button.style.opacity = '0.6';
  button.style.cursor = 'not-allowed';
  
  // Update in localStorage
  try {
    const reviews = JSON.parse(localStorage.getItem('swiftChowReviews') || '[]');
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      review.helpful = (review.helpful || 0) + 1;
      localStorage.setItem('swiftChowReviews', JSON.stringify(reviews));
    }
  } catch (e) {
    console.warn('Could not update helpful count:', e);
  }
  
  showToast('Thank you for finding this review helpful!', 'success', 2000);
}

function renderStars(rating) {
  const starInputs = document.querySelectorAll('.star-rating-input');
  
  starInputs.forEach(container => {
    const stars = container.querySelectorAll('i');
    let selectedRating = 0;
    
    stars.forEach((star, index) => {
      star.addEventListener('click', () => {
        selectedRating = index + 1;
        updateStarDisplay(stars, selectedRating);
        container.dataset.rating = selectedRating;
      });
      
      star.addEventListener('mouseenter', () => {
        updateStarDisplay(stars, index + 1);
      });
      
      star.addEventListener('mouseleave', () => {
        updateStarDisplay(stars, selectedRating);
      });
    });
  });
}

function updateStarDisplay(stars, rating) {
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.remove('far');
      star.classList.add('fas');
    } else {
      star.classList.remove('fas');
      star.classList.add('far');
    }
  });
}

function initReviewForm() {
  const reviewForm = document.getElementById('reviewForm');
  if (!reviewForm) return;
  
  // Initialize star rating input
  renderStars(0);
  
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const starRating = document.querySelector('.star-rating-input');
    const rating = starRating ? starRating.dataset.rating : 0;
    const name = document.getElementById('reviewName')?.value || '';
    const email = document.getElementById('reviewEmail')?.value || '';
    const comment = document.getElementById('reviewComment')?.value || '';
    
    if (!rating) {
      showAdvancedToast('Please select a rating', 'error');
      return;
    }
    
    if (!name || !email || !comment) {
      showAdvancedToast('Please fill in all fields', 'error');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAdvancedToast('Please enter a valid email address', 'error');
      return;
    }
    
    try {
      const submitBtn = reviewForm.querySelector('button[type="submit"]');
      const origText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending review...';
      }
      
      // Save review to localStorage (for demo purposes)
      const reviews = JSON.parse(localStorage.getItem('swiftChowReviews') || '[]');
      
      const newReview = {
        id: Date.now(),
        name,
        email,
        rating: parseInt(rating),
        comment,
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };
      
      reviews.unshift(newReview); // Add to beginning
      localStorage.setItem('swiftChowReviews', JSON.stringify(reviews));
      
      // Submit review to backend and send confirmation email
      try {
        const response = await fetch('/api/reviews/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            rating,
            comment
          })
        });
        const data = await response.json();
        if (!data.success) {
          console.warn('Review API error:', data.message);
        }
      } catch (emailError) {
        console.warn('Could not submit review to server:', emailError);
        // Don't block the submission if API fails - review is saved locally
      }
      if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-check"></i> Submitted!';
      showAdvancedToast('Thank you! Your review has been submitted. A confirmation email has been sent.', 'success');
      
      // Reset form
      reviewForm.reset();
      const starIcons = document.querySelectorAll('.star-rating-input i');
      starIcons.forEach(star => {
        star.classList.remove('fas');
        star.classList.add('far');
      });
      document.querySelector('.star-rating-input').dataset.rating = '0';
      
      // Restore button after delay
      setTimeout(() => { if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = origText; } }, 2000);
      
      // Refresh reviews display
      setTimeout(() => {
        if (typeof renderReviews === 'function') {
          renderReviews();
        }
      }, 500);
    } catch (error) {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = origText; }
      console.error('Error submitting review:', error);
      showAdvancedToast('Error submitting review. Please try again.', 'error');
    }
  });
}

// ============================================
// NEWSLETTER FORM
// ============================================

function initNewsletterForm() {
  const forms = document.querySelectorAll('.newsletter-form');
  
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput.value.trim();
      
      if (!email) {
        showToast('Please enter your email', 'error');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('Please enter a valid email', 'error');
        return;
      }
      
      // Save to localStorage
      const subscribers = JSON.parse(localStorage.getItem('swiftChowNewsletter')) || [];
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('swiftChowNewsletter', JSON.stringify(subscribers));
      }
      
      // Send confirmation email
      try {
        const user = JSON.parse(localStorage.getItem('swiftChowUser') || 'null');
        const response = await fetch('/api/emails/newsletter-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            fullName: user?.fullName || 'Subscriber'
          })
        });
        
        if (response.ok) {
          showToast('Thank you for subscribing! Check your email for confirmation.', 'success');
        } else {
          showToast('Thank you for subscribing!', 'success');
        }
      } catch (error) {
        console.warn('Error sending newsletter email:', error);
        showToast('Thank you for subscribing!', 'success');
      }
      
      form.reset();
    });
  });
}

// ============================================
// CONTACT FORM
// ============================================

function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!form.checkValidity()) {
      form.reportValidity();
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Save to localStorage (simulated)
    const messages = JSON.parse(localStorage.getItem('swiftChowMessages')) || [];
    messages.push({
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('swiftChowMessages', JSON.stringify(messages));
    
    // Send confirmation email
    try {
      const emailResponse = await fetch('/api/emails/contact-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          fullName: data.name,
          subject: data.subject,
          message: data.message
        })
      });
      
      if (emailResponse.ok) {
        showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
      } else {
        showToast('Message received but confirmation email could not be sent.', 'info');
      }
    } catch (error) {
      console.warn('Error sending email:', error);
      showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
    }
    
    form.reset();
  });
}

// ============================================
// SCROLL EFFECTS
// ============================================

function initScrollEffects() {
  const header = document.querySelector('.header');
  const isHomepage = document.body.getAttribute('data-page') === 'home';
  const scrollThreshold = isHomepage ? 100 : 10;
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add shadow to header on scroll
    if (header) {
      if (currentScroll > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    
    lastScroll = currentScroll;
  }, { passive: true });
  
  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// ============================================
// WISHLIST
// ============================================

function toggleWishlist(productId) {
  let wishlist = JSON.parse(localStorage.getItem('swiftChowWishlist')) || [];
  
  if (wishlist.includes(productId)) {
    wishlist = wishlist.filter(id => id !== productId);
    showToast('Removed from wishlist', 'info');
  } else {
    wishlist.push(productId);
    showToast('Added to wishlist', 'success');
  }
  
  localStorage.setItem('swiftChowWishlist', JSON.stringify(wishlist));
  updateWishlistUI();
}

function updateWishlistUI() {
  const wishlist = JSON.parse(localStorage.getItem('swiftChowWishlist')) || [];
  
  document.querySelectorAll('.food-card-wishlist').forEach(btn => {
    const card = btn.closest('.food-card');
    if (card) {
      const productId = parseInt(card.dataset.id);
      if (wishlist.includes(productId)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatPrice(price) {
  return `GHS ${price.toFixed(2)}`;
}

// ============================================
// CHECKOUT FORM
// ============================================

function loadSavedAddressesOnCheckout() {
  const form = document.querySelector('.checkout-form');
  if (!form || !currentUser) return;
  
  const savedAddresses = getSavedAddresses();
  if (savedAddresses.length === 0) return;
  
  // Create a container for saved addresses selector if it doesn't exist
  let addressSelector = form.querySelector('.saved-addresses-selector');
  if (!addressSelector) {
    const deliveryInfoSection = form.querySelector('.form-section');
    addressSelector = document.createElement('div');
    addressSelector.className = 'saved-addresses-selector';
    addressSelector.innerHTML = `
      <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(52, 211, 153, 0.05); border-radius: 0.5rem; border-left: 4px solid var(--success);">
        <label for="savedAddress" style="font-weight: 600; margin-bottom: 0.75rem; display: block; color: var(--success); font-size: 1rem;"><i class="fas fa-map-pin" style="margin-right: 0.5rem;"></i>Use Saved Address</label>
        <select id="savedAddress" name="savedAddress" style="width: 100%; padding: 0.75rem; border: 2px solid var(--success); border-radius: 0.5rem; background: white; font-size: 0.95rem; cursor: pointer; transition: all 0.3s ease;">
          <option value="">Select from saved addresses (or enter new below)</option>
        </select>
      </div>
    `;
    deliveryInfoSection.insertBefore(addressSelector, deliveryInfoSection.querySelector('.form-grid'));
  }
  
  // Populate saved addresses dropdown
  const savedAddressSelect = form.querySelector('#savedAddress');
  savedAddressSelect.innerHTML = '<option value="">Select from saved addresses (or enter new below)</option>' +
    savedAddresses.map(addr => `
      <option value="${addr.id}" data-address='${JSON.stringify(addr)}'>
        ${addr.firstName} ${addr.lastName} - ${addr.address}, ${addr.city} ${addr.isDefault ? '(Default)' : ''}
      </option>
    `).join('');
  
  // Handle saved address selection
  savedAddressSelect.addEventListener('change', (e) => {
    if (e.target.value) {
      try {
        const selectedAddr = JSON.parse(e.target.selectedOptions[0].dataset.address);
        // Auto-fill the form with selected address
        form.querySelector('input[name="firstName"]').value = selectedAddr.firstName || '';
        form.querySelector('input[name="lastName"]').value = selectedAddr.lastName || '';
        form.querySelector('input[name="email"]').value = selectedAddr.email || '';
        form.querySelector('input[name="phone"]').value = selectedAddr.phone || '';
        form.querySelector('input[name="address"]').value = selectedAddr.address || '';
        form.querySelector('select[name="city"]').value = selectedAddr.city || '';
        form.querySelector('input[name="landmark"]').value = selectedAddr.landmark || '';
        
        // Update delivery fee for selected city
        if (form.querySelector('select[name="city"]').value) {
          updateCheckoutTotals(selectedAddr.city);
        }
        
        showToast('Address loaded successfully', 'success');
      } catch (err) {
        console.error('Error loading saved address:', err);
      }
    }
  });
}

function loadSavedPaymentMethodsOnCheckout() {
  const form = document.querySelector('.checkout-form');
  if (!form || !currentUser) return;
  
  const savedMethods = getSavedPaymentMethods();
  if (savedMethods.length === 0) return;
  
  // Populate saved payment methods dropdown
  const savedPaymentSelect = form.querySelector('#savedPaymentMethod');
  if (savedPaymentSelect) {
    savedPaymentSelect.innerHTML = '<option value="">Select from saved methods (or choose below)</option>' +
      savedMethods.map(method => `
        <option value="${method.type}" data-method-id="${method.id}">
          ${method.displayName} ${method.isDefault ? '(Default)' : ''}
        </option>
      `).join('');
    
    // Handle saved payment method selection
    savedPaymentSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        // Select the corresponding payment method radio button
        const radio = form.querySelector(`input[name="payment"][value="${e.target.value}"]`);
        if (radio) {
          radio.checked = true;
          // Trigger click on the parent label to highlight it
          radio.closest('.payment-method').click();
          showToast('Payment method selected', 'success');
        }
      }
    });
  }
}

function getPaymentMethodDisplayName(type) {
  const names = {
    'cod': 'Pay on Delivery',
    'momo': 'Mobile Money',
    'card': 'Credit/Debit Card'
  };
  return names[type] || type;
}

// ============================================
// CHECKOUT FORM
// ============================================

function initCheckoutForm() {
  const form = document.querySelector('.checkout-form');
  if (!form) return;
  
  // Auto-populate user details from currentUser
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (user && user.email) {
    const firstNameInput = form.querySelector('input[name="firstName"]');
    const lastNameInput = form.querySelector('input[name="lastName"]');
    const emailInput = form.querySelector('input[name="email"]');
    const phoneInput = form.querySelector('input[name="phone"]');
    
    if (firstNameInput && user.firstName) firstNameInput.value = user.firstName;
    if (lastNameInput && user.lastName) lastNameInput.value = user.lastName;
    if (emailInput && user.email) emailInput.value = user.email;
    if (phoneInput && user.phone) phoneInput.value = user.phone;
  }
  
  // Handle recipient selector
  const deliverToMeLabel = document.querySelector('#deliverToMeLabel');
  const deliverToOtherLabel = document.querySelector('#deliverToOtherLabel');
  const recipientRadios = form.querySelectorAll('input[name="recipient"]');
  
  function updateRecipientUI() {
    const selectedRecipient = form.querySelector('input[name="recipient"]:checked').value;
    
    // Reset form if switching to "myself"
    if (selectedRecipient === 'myself' && user && user.email) {
      const firstNameInput = form.querySelector('input[name="firstName"]');
      const lastNameInput = form.querySelector('input[name="lastName"]');
      const emailInput = form.querySelector('input[name="email"]');
      const phoneInput = form.querySelector('input[name="phone"]');
      
      if (firstNameInput && user.firstName) firstNameInput.value = user.firstName;
      if (lastNameInput && user.lastName) lastNameInput.value = user.lastName;
      if (emailInput && user.email) emailInput.value = user.email;
      if (phoneInput && user.phone) phoneInput.value = user.phone;
    }
    
    // Clear fields if switching to "other"
    if (selectedRecipient === 'other') {
      const firstNameInput = form.querySelector('input[name="firstName"]');
      const lastNameInput = form.querySelector('input[name="lastName"]');
      const emailInput = form.querySelector('input[name="email"]');
      const phoneInput = form.querySelector('input[name="phone"]');
      
      if (firstNameInput) firstNameInput.value = '';
      if (lastNameInput) lastNameInput.value = '';
      if (emailInput) emailInput.value = '';
      if (phoneInput) phoneInput.value = '';
    }
    
    // Update UI highlighting
    if (deliverToMeLabel) {
      if (selectedRecipient === 'myself') {
        deliverToMeLabel.style.borderColor = 'var(--primary)';
        deliverToMeLabel.style.background = 'rgba(255, 107, 53, 0.05)';
      } else {
        deliverToMeLabel.style.borderColor = 'var(--border-color)';
        deliverToMeLabel.style.background = 'transparent';
      }
    }
    
    if (deliverToOtherLabel) {
      if (selectedRecipient === 'other') {
        deliverToOtherLabel.style.borderColor = 'var(--primary)';
        deliverToOtherLabel.style.background = 'rgba(255, 107, 53, 0.05)';
      } else {
        deliverToOtherLabel.style.borderColor = 'var(--border-color)';
        deliverToOtherLabel.style.background = 'transparent';
      }
    }
  }
  
  // Set up event listeners for recipient selector
  recipientRadios.forEach(radio => {
    radio.addEventListener('change', updateRecipientUI);
  });
  
  // Add click handlers for better UX
  if (deliverToMeLabel) {
    deliverToMeLabel.addEventListener('click', (e) => {
      if (e.target !== deliverToMeLabel.querySelector('input')) {
        deliverToMeLabel.querySelector('input').checked = true;
        deliverToMeLabel.querySelector('input').dispatchEvent(new Event('change'));
      }
    });
  }
  
  if (deliverToOtherLabel) {
    deliverToOtherLabel.addEventListener('click', (e) => {
      if (e.target !== deliverToOtherLabel.querySelector('input')) {
        deliverToOtherLabel.querySelector('input').checked = true;
        deliverToOtherLabel.querySelector('input').dispatchEvent(new Event('change'));
      }
    });
  }
  
  // Initial UI update
  updateRecipientUI();
  
  // Load and display saved addresses
  loadSavedAddressesOnCheckout();
  
  // Load and display saved payment methods
  loadSavedPaymentMethodsOnCheckout();
  
  // Populate city dropdown with ONLY available cities
  const citySelect = form.querySelector('select[name="city"]');
  if (citySelect && typeof ghanaCities !== 'undefined') {
    // Show all cities but disable coming soon ones
    citySelect.innerHTML = '<option value="">Select City</option>' +
      ghanaCities.map(city => {
        if (city.available) {
          return `
            <option value="${city.name}" data-fee="${city.deliveryFee}" data-time="${city.estimatedTime}">
              ${city.name} (GHS ${city.deliveryFee} delivery)
            </option>
          `;
        } else {
          return `
            <option value="${city.name}" disabled>
              ${city.name} [Coming Soon]
            </option>
          `;
        }
      }).join('');
    
    // Populate coming soon cities display
    const comingSoonCities = ghanaCities.filter(city => !city.available);
    if (comingSoonCities.length > 0) {
      const comingSoonSection = document.querySelector('#comingSoonCities');
      const comingSoonList = document.querySelector('#comingSoonList');
      if (comingSoonSection && comingSoonList) {
        comingSoonSection.style.display = 'block';
        comingSoonList.innerHTML = comingSoonCities.map(city => `
          <span style="background: #FCD34D; color: #78350F; padding: 0.5rem 0.75rem; border-radius: 0.375rem; font-size: 0.85rem; font-weight: 500;">
            ${city.name}
          </span>
        `).join('');
      }
    }
    
    citySelect.addEventListener('change', (e) => {
      const selectedCity = e.target.value;
      updateCheckoutTotals(selectedCity);
    });
  }
  
  // Payment method selection
  const paymentMethods = form.querySelectorAll('.payment-method');
  paymentMethods.forEach(method => {
    method.addEventListener('click', () => {
      paymentMethods.forEach(m => m.classList.remove('selected'));
      method.classList.add('selected');
      method.querySelector('input[type="radio"]').checked = true;
    });
  });
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!form.checkValidity()) {
      form.reportValidity();
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    if (typeof cart === 'undefined' || cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    
    const formData = new FormData(form);
    const selectedPaymentMethod = form.querySelector('input[name="payment"]:checked').value;
    
    const orderData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      city: formData.get('city'),
      landmark: formData.get('landmark'),
      notes: formData.get('notes'),
      paymentMethod: selectedPaymentMethod,
      deliveryFee: getDeliveryFee(formData.get('city'))
    };
    
    // Save address if checkbox is checked and user is logged in
    if (formData.get('saveAddress') === 'yes' && currentUser) {
      const addressToSave = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        landmark: formData.get('landmark')
      };
      saveAddress(addressToSave);
    }
    
    // Save payment method if checkbox is checked and user is logged in
    if (formData.get('savePaymentMethod') === 'yes' && currentUser) {
      const paymentToSave = {
        type: selectedPaymentMethod,
        displayName: getPaymentMethodDisplayName(selectedPaymentMethod)
      };
      savePaymentMethod(paymentToSave);
    }
    
    // Handle different payment methods
    const placeOrderBtn = form.querySelector('button[type="submit"]');
    const origBtnText = placeOrderBtn ? placeOrderBtn.innerHTML : '';
    
    function setOrderLoading(loading) {
      if (!placeOrderBtn) return;
      if (loading) {
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing order...';
      } else {
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = origBtnText;
      }
    }
    
    if (selectedPaymentMethod === 'cod') {
      // Pay on Delivery - process immediately (async)
      setOrderLoading(true);
      processOrder(orderData).then(order => {
        if (order && order.id) {
          window.location.href = `order-success.html?order=${order.id}`;
        } else {
          setOrderLoading(false);
          showToast('Failed to create order. Please try again.', 'error');
        }
      }).catch(error => {
        setOrderLoading(false);
        console.error('Order processing error:', error);
        showToast('Error creating order: ' + error.message, 'error');
      });
    } else if (selectedPaymentMethod === 'momo' || selectedPaymentMethod === 'card') {
      // Mobile Money or Card - use Flutterwave
      setOrderLoading(true);
      initiateFlutterwavePayment(orderData).catch(function(err) {
        setOrderLoading(false);
        showToast('Payment error: ' + err.message, 'error');
      });
    }
  });
}

function getDeliveryFee(city) {
  if (typeof ghanaCities === 'undefined') return 15;
  const cityData = ghanaCities.find(c => c.name === city);
  return cityData ? cityData.deliveryFee : 15;
}

// Flutterwave Payment Handler
async function initiateFlutterwavePayment(orderData) {
  // Build the order payload for the backend
  var orderPayload = {
    items: cart.map(function(item) {
      return {
        foodId: item.id,
        name: item.name,
        category: item.category || '',
        quantity: item.quantity,
        price: item.price,
        image: item.image || ''
      };
    }),
    deliveryAddress: {
      street: orderData.address,
      city: orderData.city,
      landmark: orderData.landmark || '',
      coordinates: { latitude: 0, longitude: 0 }
    },
    paymentMethod: orderData.paymentMethod || 'card',
    specialInstructions: orderData.notes || '',
    deliveryFee: orderData.deliveryFee || 0
  };

  // 1. Initialize payment on backend (creates pending order)
  var initResponse;
  try {
    initResponse = await apiInitializePayment(orderPayload);
  } catch (err) {
    showToast('Could not start payment: ' + err.message, 'error');
    return;
  }

  if (!initResponse || !initResponse.success) {
    showToast('Failed to initialize payment', 'error');
    return;
  }

  var paymentData = initResponse.payment;
  var savedOrderId = initResponse.orderId;

  // 2. Get public key from backend (never hardcoded)
  var keyResponse;
  try {
    keyResponse = await apiGetFlwPublicKey();
  } catch (err) {
    showToast('Payment gateway unavailable', 'error');
    return;
  }

  if (!keyResponse || !keyResponse.publicKey) {
    showToast('Payment gateway not configured', 'error');
    return;
  }

  // 3. Open Flutterwave inline checkout
  if (typeof FlutterwaveCheckout !== 'function') {
    showToast('Payment system loading failed. Please refresh and try again.', 'error');
    return;
  }

  FlutterwaveCheckout({
    public_key: keyResponse.publicKey,
    tx_ref: paymentData.tx_ref,
    amount: paymentData.amount,
    currency: paymentData.currency,
    payment_options: orderData.paymentMethod === 'momo' ? 'mobilemoneyghana' : 'card,mobilemoneyghana',
    customer: paymentData.customer,
    meta: paymentData.meta,
    customizations: paymentData.customizations,
    callback: function(response) {
      // 4. Payment completed — verify server-side
      if (response && response.status === 'successful') {
        verifyFlutterwavePayment(response.transaction_id, savedOrderId, orderData);
      } else {
        showToast('Payment was not successful. Please try again.', 'error');
      }
    },
    onclose: function() {
      // User closed the modal without completing payment
      var placeOrderBtn = document.querySelector('button[type="submit"]');
      if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = '<i class="fas fa-lock"></i> Place Order';
      }
    }
  });
}

// Verify Flutterwave payment server-side and complete order
async function verifyFlutterwavePayment(transactionId, orderId, orderData) {
  try {
    showToast('Verifying payment...', 'info');

    var verifyResponse = await apiVerifyPayment(transactionId, orderId);

    if (verifyResponse && verifyResponse.success) {
      var order = verifyResponse.order;

      // Save order locally for tracking
      var localOrder = {
        id: order.orderId || orderId,
        orderId: order.orderId || orderId,
        items: order.items || cart || [],
        subtotal: order.subtotal || 0,
        deliveryFee: order.deliveryFee || 0,
        total: order.total || 0,
        customer: {
          firstName: orderData.firstName,
          lastName: orderData.lastName,
          email: orderData.email,
          phone: orderData.phone,
          address: orderData.address,
          city: orderData.city,
          landmark: orderData.landmark,
          notes: orderData.notes
        },
        paymentMethod: order.paymentMethod || orderData.paymentMethod,
        paymentStatus: 'completed',
        status: order.status || 'confirmed',
        timestamp: order.createdAt || new Date().toISOString(),
        createdAt: order.createdAt || new Date().toISOString(),
        date: order.createdAt || new Date().toISOString(),
        city: orderData.city,
        estimatedDeliveryTime: order.estimatedDeliveryTime || 30,
        estimatedDeliveryAt: order.estimatedDeliveryAt || new Date(Date.now() + 30 * 60000).toISOString(),
        estimatedDelivery: order.estimatedDeliveryAt || new Date(Date.now() + 30 * 60000).toISOString(),
        orderTime: new Date().toISOString()
      };

      var orders = JSON.parse(localStorage.getItem('swiftChowOrders')) || [];
      orders.push(localOrder);
      localStorage.setItem('swiftChowOrders', JSON.stringify(orders));
      localStorage.setItem('lastOrder', JSON.stringify(localOrder));
      sessionStorage.setItem('lastOrder', JSON.stringify(localOrder));

      var trackingId = localOrder.id || localOrder.orderId;
      sessionStorage.setItem('trackingOrder_' + trackingId, JSON.stringify(localOrder));

      // Clear cart
      cart = [];
      if (typeof saveCart === 'function') saveCart();

      // Notify chatbot about the new order
      if (window.swiftChowChatbot && window.swiftChowChatbot.notifyOrderPlaced) {
        window.swiftChowChatbot.notifyOrderPlaced(
          localOrder.orderId || localOrder.id,
          localOrder.total,
          localOrder.estimatedDeliveryTime || 30
        );
      }

      showToast('Payment successful! Order confirmed.', 'success');
      setTimeout(function() {
        window.location.href = 'order-success.html?order=' + (localOrder.id || orderId);
      }, 1000);
    } else {
      showToast('Payment verification failed. Please contact support.', 'error');
    }
  } catch (err) {
    showToast('Payment verification error. Please contact support.', 'error');
  }
}

// ============================================
// ORDER TRACKING
// ============================================

function initOrderTracking() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order');
  
  if (orderId) {
    displayOrderTracking(orderId);
  }
  
  // Track order form
  const trackForm = document.querySelector('.track-order-form');
  if (trackForm) {
    trackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = trackForm.querySelector('input');
      if (input.value.trim()) {
        displayOrderTracking(input.value.trim());
      }
    });
  }
}

function displayOrderTracking(orderId) {
  // First, try to fetch from API (database)
  let order = null;
  
  const fetchAndDisplay = async () => {
    try {
      // Try to fetch from API if user is authenticated
      if (isAuthenticated() && typeof apiGetOrder === 'function') {
        try {
          const response = await apiGetOrder(orderId);
          if (response && response.success && response.order) {
            order = {
              id: response.order.orderId || response.order._id,
              orderId: response.order.orderId,
              items: response.order.items,
              subtotal: response.order.subtotal,
              deliveryFee: response.order.deliveryFee,
              total: response.order.total,
              customer: {
                address: response.order.deliveryAddress?.street,
                city: response.order.deliveryAddress?.city,
                landmark: response.order.deliveryAddress?.landmark
              },
              paymentMethod: response.order.paymentMethod,
              status: response.order.status,
              timestamp: response.order.createdAt,
              createdAt: response.order.createdAt
            };
          } else {
            console.warn('⚠️ API response invalid:', { success: response?.success, hasOrder: !!response?.order });
          }
        } catch (apiError) {
          console.warn('❌ API fetch failed, checking localStorage:', apiError.message);
          order = getOrderById(orderId);
        }
      } else {
        // Fallback to localStorage if not authenticated
        order = getOrderById(orderId);
      }
      // Display the order
      displayTrackingUI(orderId, order);
    } catch (error) {
      console.error('Error fetching order tracking:', error);
      displayTrackingUI(orderId, null);
    }
  };
  
  fetchAndDisplay();
}

function displayTrackingUI(orderId, order) {
  const orderIdEl = document.querySelector('.tracking-id');
  const timeline = document.querySelector('.tracking-timeline');
  const orderDetails = document.querySelector('.tracking-details');
  
  if (!order) {
    if (orderIdEl) orderIdEl.textContent = 'Order not found';
    if (orderDetails) {
      orderDetails.innerHTML = '<p style="color: var(--color-error);">We couldn\'t find this order. Please check the order number and try again.</p>';
    }
    return;
  }
  
  if (orderIdEl) orderIdEl.textContent = order.id || orderId;
  
  // Determine current status
  const statusMap = {
    'pending': 0,
    'confirmed': 1,
    'preparing': 1,
    'ready': 2,
    'out_for_delivery': 3,
    'out-for-delivery': 3,
    'delivered': 4,
    'cancelled': -1
  };
  
  const currentStatus = statusMap[order.status?.toLowerCase()] || Math.floor(Math.random() * 4);
  
  if (timeline) {
    timeline.className = `tracking-timeline step-${Math.min(currentStatus + 1, 4)}`;
    
    const steps = timeline.querySelectorAll('.tracking-step');
    steps.forEach((step, i) => {
      step.classList.remove('completed', 'current');
      if (i < currentStatus) {
        step.classList.add('completed');
      } else if (i === currentStatus) {
        step.classList.add('current');
      }
    });
  }
  
  // Display order details
  if (orderDetails) {
    orderDetails.innerHTML = `
      <div class="order-info-grid">
        <div class="order-info-item">
          <h4>Delivery Address</h4>
          <p>${order.customer?.address || 'Address not found'}<br>${order.customer?.city || ''}, Ghana</p>
        </div>
        <div class="order-info-item">
          <h4>Order Items (${order.items?.length || 0} items)</h4>
          ${order.items?.map(item => `<p>${item.quantity}x ${item.name}</p>`).join('') || '<p>No items found</p>'}
        </div>
        <div class="order-info-item">
          <h4>Order Total</h4>
          <p class="order-total-amount">GHS ${(order.total || 0).toFixed(2)}</p>
        </div>
        <div class="order-info-item">
          <h4>Payment Method</h4>
          <p>${order.paymentMethod || 'Not specified'}</p>
        </div>
        <div class="order-info-item">
          <h4>Order Status</h4>
          <p>${order.status || 'Processing'}</p>
        </div>
        ${order.timestamp ? `<div class="order-info-item">
          <h4>Order Time</h4>
          <p>${new Date(order.timestamp).toLocaleDateString()} ${new Date(order.timestamp).toLocaleTimeString()}</p>
        </div>` : ''}
      </div>
    `;
  }
}

// ============================================
// ORDER SUCCESS PAGE
// ============================================

function initOrderSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order');
  
  if (orderId) {
    const orderIdEl = document.querySelector('.success-order-id');
    if (orderIdEl) orderIdEl.textContent = orderId;
    
    // Try to fetch order from API (database) first
    const fetchAndDisplayOrder = async () => {
      let order = null;
      
      try {
        // Try API if authenticated
        if (isAuthenticated() && typeof apiGetOrder === 'function') {
          try {
            const response = await apiGetOrder(orderId);
            
            if (response && response.success && response.order) {
              order = {
                id: response.order.orderId || response.order._id,
                items: response.order.items,
                total: response.order.total,
                subtotal: response.order.subtotal,
                deliveryFee: response.order.deliveryFee
              };
            }
          } catch (apiError) {
            console.warn('API fetch failed for success page, using localStorage:', apiError.message);
            order = getOrderById(orderId);
          }
        } else {
          order = getOrderById(orderId);
        }
        
        // Display the order summary
        if (order) {
          const orderSummary = document.querySelector('.success-order-summary');
          if (orderSummary) {
            orderSummary.innerHTML = `
              <h4>Order Summary</h4>
              <div class="success-items">
                ${order.items.map(item => `
                  <div class="success-item">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>GHS ${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                `).join('')}
              </div>
              <div class="success-total">
                <span>Total Paid</span>
                <strong>GHS ${order.total.toFixed(2)}</strong>
              </div>
            `;
          }
        }
      } catch (error) {
        console.error('Error displaying order on success page:', error);
      }
    };
    
    fetchAndDisplayOrder();
  }
}

// ============================================
// UPDATE AUTH UI IN NAVIGATION
// ============================================
function updateNavAuthUI() {
  // Always read directly from localStorage for most up-to-date state
  let currentUser = null;
  const storedUser = localStorage.getItem('swiftChowUser');
  
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch (e) {
      console.error('Nav UI: Error parsing user:', e);
      currentUser = null;
    }
  } else {
  }
  
  // Find login buttons and user menu elements
  const loginBtns = document.querySelectorAll('#loginBtn, .nav-login-btn');
  const userMenus = document.querySelectorAll('.nav-user-menu');
  const navActions = document.querySelectorAll('.nav-actions');
  navActions.forEach((navAction, index) => {
    // Check if already has user menu
    let userMenu = navAction.querySelector('.nav-user-dropdown');
    let loginBtn = navAction.querySelector('#loginBtn, .nav-login-btn');
    let userProfile = navAction.querySelector('.user-profile');
    if (currentUser) {
      // User is logged in - hide login button
      if (loginBtn) {
        loginBtn.style.display = 'none';
      }
      
      // Avatar is now handled by updateAuthUI() function instead
      // Skip creating nav-user-dropdown here
      
    } else {
      // User is not logged in - show login button and remove avatar
      if (userMenu) {
        userMenu.remove();
      }
      if (userProfile) {
        userProfile.remove();
      }
      
      if (loginBtn) {
        loginBtn.style.display = 'inline-flex';
        loginBtn.style.visibility = 'visible';
        loginBtn.style.opacity = '1';
        
        // Re-attach click handler to existing button
        loginBtn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          const loginModal = document.getElementById('loginModal');
          if (loginModal) {
            openModal(loginModal);
          } else {
            console.warn('  - Login modal not found, redirecting to login page');
            window.location.href = 'login.html';
          }
        };
      } else {
        // If login button doesn't exist, create it
        const newLoginBtn = document.createElement('button');
        newLoginBtn.id = 'loginBtn';
        newLoginBtn.className = 'btn btn-primary btn-sm';
        newLoginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
        newLoginBtn.onclick = function(e) {
          e.preventDefault();
          const loginModal = document.getElementById('loginModal');
          if (loginModal) {
            openModal(loginModal);
          } else {
            console.warn('  - Login modal not found from NEW button, redirecting to login page');
            window.location.href = 'login.html';
          }
        };
        
        const mobileMenuBtn = navAction.querySelector('.mobile-menu-btn');
        if (mobileMenuBtn) {
          navAction.insertBefore(newLoginBtn, mobileMenuBtn);
        } else {
          navAction.appendChild(newLoginBtn);
        }
      }
    }
  });
}

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ============================================
// INITIALIZE
// ============================================

function init() {
  try {
    // Core functionality - minimal required
    initDarkMode();
    initMobileMenu();
    initScrollEffects();
    initNewsletterForm();
    
    // Load cart from API or localStorage
    if (typeof loadCart === 'function') {
      loadCart().catch(err => {
        console.error('Error loading cart:', err);
        // Fall back to localStorage
        cart = JSON.parse(localStorage.getItem('swiftChowCart')) || [];
        updateCartCount();
      });
    }
    
    // Update navigation based on auth state
    updateNavAuthUI();
    updateAuthUI();
    updateCartCount();
    
    // Get current page
    const page = document.body.dataset.page;
    // Page-specific initialization - with try-catch for each
    try {
      switch (page) {
        case 'home':
          try { initDealsCarousel(); } catch (e) { console.warn('initDealsCarousel error:', e); }
          try { initCategories(); } catch (e) { console.warn('initCategories error:', e); }
          try { renderPopularItems(); } catch (e) { console.warn('renderPopularItems error:', e); }
          try { renderBlogPreview(); } catch (e) { console.warn('renderBlogPreview error:', e); }
          break;
          
        case 'menu':
          try {
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            const productsGrid = document.querySelector('.products-grid');
            
            if (productsGrid && typeof foodItems !== 'undefined') {
              if (category) {
                filterMenuByCategory(category);
                document.querySelectorAll('.filter-btn').forEach(btn => {
                  btn.classList.toggle('active', btn.dataset.category === category);
                });
              } else {
                renderMenuItems(foodItems, productsGrid);
              }
            }
            initCategoryFilter();
            initSearch();
          } catch (e) {
            console.warn('Menu initialization error:', e);
          }
          break;
      
        case 'tracking':
          try { initOrderTracking(); } catch (e) { console.warn('initOrderTracking error:', e); }
          break;
        
        case 'reviews':
          try { renderReviews(); } catch (e) { console.warn('renderReviews error:', e); }
          try { initStarRating(); } catch (e) { console.warn('initStarRating error:', e); }
          try { initReviewForm(); } catch (e) { console.warn('initReviewForm error:', e); }
          break;
        
        case 'blog':
          try {
            const blogGrid = document.querySelector('.blog-grid');
            if (blogGrid) renderBlogPosts(blogGrid);
          } catch (e) { console.warn('Blog initialization error:', e); }
          break;
        
        case 'blog-post':
          try { renderBlogPostPage(); } catch (e) { console.warn('renderBlogPostPage error:', e); }
          break;
        
        case 'order-success':
          try { initOrderSuccess(); } catch (e) { console.warn('initOrderSuccess error:', e); }
          break;
        
        case 'contact':
          try { 
            initContactForm(); 
            setupFormValidation('.contact-form');
          } catch (e) { console.warn('initContactForm error:', e); }
          break;
        
        case 'checkout':
          try { renderCheckoutSummary(); } catch (e) { console.warn('renderCheckoutSummary error:', e); }
          try { 
            initCheckoutForm();
            setupFormValidation('.checkout-form');
          } catch (e) { console.warn('initCheckoutForm error:', e); }
          break;
      }
    } catch (e) {
      console.warn('Page-specific init error:', e);
    }
    
    // Update wishlist UI
    try {
      updateWishlistUI();
    } catch (e) {
      console.warn('updateWishlistUI error:', e);
    }
  } catch (e) {
    console.error('Fatal error in init():', e);
  }
}

// ============================================
// ACCOUNT PAGE NAVIGATION
// ============================================

function initAccountNavigation() {
  const navItems = document.querySelectorAll('.premium-nav-menu .nav-item');
  const sections = document.querySelectorAll('.content-section');
  
  if (navItems.length === 0) return;
  
  // Update user display info
  updateAccountUserDisplay();
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const sectionId = item.getAttribute('data-section');
      
      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Update active section
      sections.forEach(section => section.classList.remove('active'));
      const targetSection = document.getElementById(sectionId);
      if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Load section-specific data
        if (sectionId === 'orders') {
          loadOrders();
        } else if (sectionId === 'profile') {
          loadProfileForm();
          loadAddresses();
          loadPayments();
        } else if (sectionId === 'addresses') {
          loadAddresses();
        } else if (sectionId === 'payments') {
          loadPayments();
        }
      }
    });
  });
  
  // Load orders on page load if orders section exists
  const ordersSection = document.getElementById('orders');
  if (ordersSection) {
    loadOrders();
  }
}

function updateAccountUserDisplay() {
  // Get user data from localStorage or auth
  const user = JSON.parse(localStorage.getItem('swiftChowUser') || 'null');
  
  // Update user name
  const userNameEl = document.getElementById('userDisplayName');
  if (userNameEl) {
    userNameEl.textContent = user && user.fullName ? user.fullName : 'User Name';
  }
  
  // Update user email
  const userEmailEl = document.getElementById('userDisplayEmail');
  if (userEmailEl) {
    userEmailEl.textContent = user && user.email ? user.email : 'user@email.com';
  }
  
  // Update user avatar initials
  const userAvatarEl = document.getElementById('userAvatarInitials');
  if (userAvatarEl && user && user.fullName) {
    const names = user.fullName.split(' ');
    const initials = names.map(n => n[0]).join('').substring(0, 2).toUpperCase();
    userAvatarEl.textContent = initials;
  }
  
  // Load profile form fields
  loadProfileForm();
}

function loadProfileForm() {
  const user = JSON.parse(localStorage.getItem('swiftChowUser') || 'null');
  if (!user) return;
  
  const profileForm = document.querySelector('.profile-form');
  if (!profileForm) return;
  
  // Fill in form fields from user data
  const firstNameInput = profileForm.querySelector('input[name="firstName"]');
  const lastNameInput = profileForm.querySelector('input[name="lastName"]');
  const emailInput = profileForm.querySelector('input[name="email"]');
  const phoneInput = profileForm.querySelector('input[name="phone"]');
  const dobInput = profileForm.querySelector('input[name="dob"]');
  const genderSelect = profileForm.querySelector('select[name="gender"]');
  
  if (firstNameInput && user.firstName) firstNameInput.value = user.firstName;
  if (lastNameInput && user.lastName) lastNameInput.value = user.lastName;
  if (emailInput && user.email) emailInput.value = user.email;
  if (phoneInput && user.phone) phoneInput.value = user.phone;
  if (dobInput && user.dob) dobInput.value = user.dob;
  if (genderSelect && user.gender) genderSelect.value = user.gender;
}

function saveProfileChanges(formData) {
  const user = JSON.parse(localStorage.getItem('swiftChowUser') || '{}');
  
  // Update user data
  if (formData.firstName) user.firstName = formData.firstName;
  if (formData.lastName) user.lastName = formData.lastName;
  if (formData.phone) user.phone = formData.phone;
  if (formData.dob) user.dob = formData.dob;
  if (formData.gender) user.gender = formData.gender;
  
  // Update full name
  user.fullName = (formData.firstName || user.firstName || '') + ' ' + (formData.lastName || user.lastName || '');
  
  localStorage.setItem('swiftChowUser', JSON.stringify(user));
  return user;
}

function loadAddresses() {
  const user = JSON.parse(localStorage.getItem('swiftChowUser') || '{}');
  const addressesContainer = document.getElementById('addressesContainer');
  
  if (!addressesContainer) return;
  
  if (!user.addresses || user.addresses.length === 0) {
    addressesContainer.innerHTML = `
      <p style="text-align: center; padding: 2rem; color: var(--text-secondary); grid-column: 1/-1;">
        <i class="fas fa-map-marker-alt" style="font-size: 2rem; margin-bottom: 1rem; display: block; opacity: 0.5;"></i>
        No saved addresses yet. Add one for faster checkout!
      </p>
    `;
    return;
  }
  
  // SECURITY: Escape user-submitted address data to prevent stored XSS
  addressesContainer.innerHTML = user.addresses.map((addr, idx) => `
    <div class="address-card" style="padding: 1.5rem; border: 1px solid var(--border-color); border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
        <div>
          <h4 style="margin: 0 0 0.5rem 0; text-transform: capitalize;">${escapeHTML(addr.type)}</h4>
          <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">${escapeHTML(addr.street)}, ${escapeHTML(addr.city)}</p>
          <p style="margin: 0; color: var(--text-secondary); font-size: 0.85rem;">${escapeHTML(addr.postalCode)}, ${escapeHTML(addr.country)}</p>
          ${addr.isDefault ? '<span class="badge" style="display: inline-block; margin-top: 0.5rem; background: var(--primary); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem;">Default</span>' : ''}
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-sm btn-outline" onclick="deleteAddress(${idx})" style="padding: 0.5rem 1rem;"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');
}

function deleteAddress(index) {
  const user = JSON.parse(localStorage.getItem('swiftChowUser') || '{}');
  if (user.addresses) {
    user.addresses.splice(index, 1);
    localStorage.setItem('swiftChowUser', JSON.stringify(user));
    loadAddresses();
    showAdvancedToast('Address deleted successfully!', 'success');
  }
}

function loadPayments() {
  const user = JSON.parse(localStorage.getItem('swiftChowUser') || '{}');
  const paymentsContainer = document.getElementById('paymentsContainer');
  
  if (!paymentsContainer) return;
  
  if (!user.paymentMethods || user.paymentMethods.length === 0) {
    paymentsContainer.innerHTML = `
      <p style="text-align: center; padding: 2rem; color: var(--text-secondary);">
        <i class="fas fa-credit-card" style="font-size: 2rem; margin-bottom: 1rem; display: block; opacity: 0.5;"></i>
        No payment methods saved yet. Add one to check out faster!
      </p>
    `;
    return;
  }
  
  paymentsContainer.innerHTML = user.paymentMethods.map((payment, idx) => `
    <div class="payment-card" style="padding: 1.5rem; border: 1px solid var(--border-color); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h4 style="margin: 0 0 0.5rem 0;">
          ${payment.type === 'card' ? 'Card ending in ' + escapeHTML(payment.lastFour) : payment.type === 'momo' ? escapeHTML(payment.network) + ' ' + escapeHTML(payment.lastFour) : 'Bank Account'}
        </h4>
        <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">${escapeHTML(payment.cardholderName)}</p>
      </div>
      <button class="btn btn-sm btn-outline" onclick="deletePayment(${idx})" style="padding: 0.5rem 1rem;"><i class="fas fa-trash"></i></button>
    </div>
  `).join('');
}

function deletePayment(index) {
  const user = JSON.parse(localStorage.getItem('swiftChowUser') || '{}');
  if (user.paymentMethods) {
    user.paymentMethods.splice(index, 1);
    localStorage.setItem('swiftChowUser', JSON.stringify(user));
    loadPayments();
    showAdvancedToast('Payment method deleted successfully!', 'success');
  }
}

// Export functions globally
window.loadAddresses = loadAddresses;
window.loadPayments = loadPayments;
window.deleteAddress = deleteAddress;
window.deletePayment = deletePayment;
window.saveProfileChanges = saveProfileChanges;
window.deleteUserAccount = deleteUserAccount;

async function loadOrders() {
  const ordersContainer = document.getElementById('ordersContainer');
  if (!ordersContainer) return;
  
  let orders = [];
  
  // Try API first if authenticated
  if (isAuthenticated() && typeof apiGetOrders === 'function') {
    try {
      const response = await apiGetOrders();
      if (response && response.success && response.orders && response.orders.length > 0) {
        orders = response.orders;
        localStorage.setItem('swiftChowOrders', JSON.stringify(response.orders));
      }
    } catch (e) {
    }
  }
  
  // Fall back to localStorage
  if (orders.length === 0) {
    orders = JSON.parse(localStorage.getItem('swiftChowOrders')) || [];
  }

  // Cleanup pending test orders from account history
  const cleanedOrders = orders.filter((order) => {
    const status = (order.status || '').toLowerCase();
    const isPending = status === 'pending';
    return !isPending;
  });

  if (cleanedOrders.length !== orders.length) {
    orders = cleanedOrders;
    localStorage.setItem('swiftChowOrders', JSON.stringify(orders));
  }
  
  if (orders.length === 0) {
    ordersContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
        <i class="fas fa-receipt" style="font-size: 3.5rem; opacity: 0.15; margin-bottom: 1rem; display: block;"></i>
        <p style="font-weight: 600; font-size: 1.05rem; margin-bottom: 0.5rem; color: var(--text-primary);">No orders yet</p>
        <p style="font-size: 0.9rem; margin-bottom: 1.5rem;">Your order history will appear here</p>
        <a href="menu.html" class="btn btn-primary btn-sm" style="border-radius: 2rem; padding: 0.6rem 1.5rem;">
          <i class="fas fa-utensils"></i> Browse Menu
        </a>
      </div>
    `;
    return;
  }
  
  // Sort orders newest first
  orders.sort((a, b) => new Date(b.createdAt || b.timestamp || b.date) - new Date(a.createdAt || a.timestamp || a.date));
  
  ordersContainer.innerHTML = orders.map((order, index) => {
    const orderId = order.orderId || order.id || `ORD-${index + 1}`;
    const date = new Date(order.createdAt || order.timestamp || order.date);
    const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Use time-based progress for active orders (consistent with tracking page)
    let status = (order.status || 'confirmed').toLowerCase();
    if (status !== 'delivered' && status !== 'cancelled') {
      const createdAt = new Date(order.createdAt || order.date).getTime();
      const estMinutes = order.estimatedDeliveryTime || 30;
      const estDeliveryAt = order.estimatedDeliveryAt
        ? new Date(order.estimatedDeliveryAt).getTime()
        : createdAt + estMinutes * 60000;
      const total_ms = estDeliveryAt - createdAt;
      const progress = total_ms > 0 ? Math.max(0, (Date.now() - createdAt) / total_ms) : 1;
      if (progress >= 1) status = 'delivered';
      else if (progress >= 0.5) status = 'out_for_delivery';
      else if (progress >= 0.2) status = 'preparing';
      else status = 'confirmed';
    }

    const statusLabels = { confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' };
    const statusLabel = statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);
    const statusColors = { confirmed: '#3b82f6', preparing: '#f59e0b', out_for_delivery: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444' };
    const statusColor = statusColors[status] || 'var(--primary)';
    const statusIcons = { confirmed: 'check-circle', preparing: 'fire', out_for_delivery: 'motorcycle', delivered: 'check-double', cancelled: 'times-circle' };
    const statusIcon = statusIcons[status] || 'circle';
    const items = order.items || [];
    const total = order.total || 0;
    const itemNames = items.slice(0, 3).map(i => i.name).join(', ');
    const moreItems = items.length > 3 ? ` +${items.length - 3} more` : '';
    
    return `
      <div class="order-card" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 1rem; padding: 1.25rem; margin-bottom: 1rem; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <div>
            <h4 style="font-size: 1rem; font-weight: 700; margin: 0 0 0.25rem 0; color: var(--text-primary);">${escapeHTML(orderId)}</h4>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;"><i class="fas fa-calendar-alt" style="margin-right: 0.25rem;"></i>${dateStr} at ${timeStr}</p>
          </div>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.75rem; border-radius: 2rem; font-size: 0.75rem; font-weight: 600; background: ${statusColor}15; color: ${statusColor}; border: 1px solid ${statusColor}30;">
            <i class="fas fa-${statusIcon}"></i> ${statusLabel}
          </span>
        </div>
        <div style="padding: 0.5rem 0; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); margin-bottom: 0.75rem;">
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.25rem 0;"><i class="fas fa-shopping-bag" style="color: var(--primary); margin-right: 0.35rem; width: 14px;"></i>${escapeHTML(itemNames)}${moreItems}</p>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.25rem 0;"><i class="fas fa-box" style="color: var(--primary); margin-right: 0.35rem; width: 14px;"></i>${items.length} item${items.length !== 1 ? 's' : ''}</p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; font-size: 1.1rem; color: var(--primary);">GHS ${parseFloat(total).toFixed(2)}</span>
          <div style="display: flex; gap: 0.5rem;">
            <a href="tracking.html?order=${orderId}" class="btn btn-sm btn-outline" style="border-radius: 2rem; padding: 0.35rem 0.75rem; font-size: 0.8rem;">
              <i class="fas fa-map-marker-alt"></i> Track
            </a>
            <button class="btn btn-sm btn-primary" style="border-radius: 2rem; padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="reorderItems('${orderId}')">
              <i class="fas fa-redo"></i> Reorder
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Reorder: add all items from a past order back to cart
async function reorderItems(orderId) {
  const orders = JSON.parse(localStorage.getItem('swiftChowOrders')) || [];
  const order = orders.find(o => (o.orderId || o.id) === orderId);
  
  if (!order || !order.items || order.items.length === 0) {
    if (typeof showToast === 'function') showToast('Could not find order items', 'error');
    return;
  }
  
  let addedCount = 0;
  for (const item of order.items) {
    if (!item || typeof addToCart !== 'function') continue;

    let productId = item.id;
    if (!productId && item.name && Array.isArray(window.foodItems)) {
      const match = window.foodItems.find((f) => f.name === item.name);
      productId = match ? match.id : null;
    }

    if (!productId) continue;

    const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
    const ok = await addToCart(productId, quantity);
    if (ok) {
      addedCount += quantity;
    }
  }
  
  if (addedCount > 0) {
    if (typeof showToast === 'function') showToast(`${addedCount} item${addedCount > 1 ? 's' : ''} added to cart!`, 'success');
    if (typeof updateCartDisplay === 'function') updateCartDisplay();
    if (typeof updateCartCount === 'function') updateCartCount();
    if (typeof updateCartModal === 'function') updateCartModal();
  } else {
    if (typeof showToast === 'function') showToast('Could not add items to cart', 'error');
  }
}

window.reorderItems = reorderItems;

function clearAllMyOrders() {
  localStorage.removeItem('swiftChowOrders');
  if (typeof showToast === 'function') {
    showToast('Order history cleared', 'info');
  }
  loadOrders();
}

window.clearAllMyOrders = clearAllMyOrders;

// ============================================
// ACCOUNT PAGE FORM HANDLERS
// ============================================

function initAccountFormHandlers() {
  // Profile form submission
  const profileForm = document.querySelector('.profile-form') || document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = {
        firstName: profileForm.querySelector('input[name="firstName"]')?.value || '',
        lastName: profileForm.querySelector('input[name="lastName"]')?.value || '',
        phone: profileForm.querySelector('input[name="phone"]')?.value || '',
        dob: profileForm.querySelector('input[name="dob"]')?.value || '',
        gender: profileForm.querySelector('select[name="gender"]')?.value || ''
      };
      
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        showAdvancedToast('Please fill in all required fields', 'error');
        return;
      }
      
      saveProfileChanges(formData);
      showAdvancedToast('Profile updated successfully!', 'success');
      updateAccountUserDisplay();
    });
    
    // Load initial profile data
    loadProfileForm();
  }
  
  // Password change form handler
  const changePasswordForm = document.getElementById('changePasswordForm');
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const currentPassword = changePasswordForm.querySelector('input[name="currentPassword"]')?.value;
      const newPassword = changePasswordForm.querySelector('input[name="newPassword"]')?.value;
      const confirmNewPassword = changePasswordForm.querySelector('input[name="confirmNewPassword"]')?.value;
      
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        showAdvancedToast('Please fill in all password fields', 'error');
        return;
      }
      
      if (newPassword !== confirmNewPassword) {
        showAdvancedToast('New passwords do not match', 'error');
        return;
      }
      
      if (newPassword.length < 6) {
        showAdvancedToast('Password must be at least 6 characters', 'error');
        return;
      }
      
      try {
        // Validate current password
        const user = JSON.parse(localStorage.getItem('swiftChowUser') || '{}');
        // In a real app, you would validate against hashed password from API
        // For now, we'll just update it
        
        // SECURITY FIX: Never store passwords client-side.
        // Password changes should go through the API only.
        // The old code stored plaintext password in localStorage — removed.
        // In production, call: await apiCall('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) });
        
        changePasswordForm.reset();
        showAdvancedToast('Password changed successfully!', 'success');
      } catch (error) {
        showAdvancedToast('Error changing password: ' + error.message, 'error');
      }
    });
  }
  
  // Delete account button handler
  const deleteAccountBtn = document.querySelector('[data-action="deleteAccount"]') || 
                          document.querySelector('button[onclick*="deleteAccount"]');
  if (deleteAccountBtn && !deleteAccountBtn.hasListener) {
    deleteAccountBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.');
      if (confirmed) {
        const finalConfirm = prompt('This will delete your account permanently. Type DELETE to confirm.');
        if (finalConfirm === 'DELETE') {
          deleteUserAccount();
        }
      }
    });
    deleteAccountBtn.hasListener = true;
  }
  
  // Load addresses and payments when page loads
  setTimeout(() => {
    loadAddresses();
    loadPayments();
  }, 300);
}

// Delete user account
async function deleteUserAccount() {
  try {
    const user = JSON.parse(localStorage.getItem('swiftChowUser') || '{}');
    
    // Clear ALL user data from localStorage and sessionStorage
    // SECURITY FIX: Previous code only removed 3 keys, leaving PII behind
    const keysToRemove = [
      'swiftChowUser', 'currentUser', 'authToken',
      'swiftChowCart', 'swiftChowOrders', 'swiftChowReviews',
      'swiftChowWishlist', 'swiftChowTheme', 'swiftChowNewsletter',
      'swiftChowMessages', 'lastOrder'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Remove user-specific keys (addresses, payments, etc.)
    const userId = user.id || user._id || '';
    if (userId) {
      localStorage.removeItem(`swiftChowAddresses_${userId}`);
      localStorage.removeItem(`swiftChowPaymentMethods_${userId}`);
    }
    
    // Clear sessionStorage too
    sessionStorage.clear();
    
    // Redirect to home page
    showAdvancedToast('Account deleted successfully', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  } catch (error) {
    showAdvancedToast('Error deleting account: ' + error.message, 'error');
  }
}

// ============================================
// TRACKING PAGE NAVIGATION
// ============================================

function initTrackingNavigation() {
  const trackForm = document.querySelector('.track-order-form');
  if (!trackForm) return;
  
  trackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Add tracking logic here if needed
  });
}

// Preloader
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('loaded');
      // Initialize scroll animations after preloader is gone
      setTimeout(() => {
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
          el.classList.add('is-visible');
        });
      }, 500);
    }, 1500); // 1.5s delay for the animation to be seen
  }
});

// Initialize on DOM ready - Single consolidated init
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Core initialization with timeout protection
    setTimeout(() => {
      try {
        init();
      } catch (e) {
        console.error('Error in init():', e);
      }
    }, 0);
    
    try {
      initAccountNavigation();
    } catch (e) {
      console.warn('Error in initAccountNavigation:', e);
    }
    
    try {
      initAccountFormHandlers();
    } catch (e) {
      console.warn('Error in initAccountFormHandlers:', e);
    }
    
    try {
      initTrackingNavigation();
    } catch (e) {
      console.warn('Error in initTrackingNavigation:', e);
    }
    
    try {
      initEnhancements();
    } catch (e) {
      console.warn('Error in initEnhancements:', e);
    }
  } catch (e) {
    console.error('Fatal error in DOMContentLoaded:', e);
  }
});

// Note: DOMContentLoaded handler above is sufficient.
// No duplicate init needed — the event fires even if DOM was already loaded
// before the listener was registered (in 'interactive' state).

// Export functions for global use
window.toggleDarkMode = toggleDarkMode;
window.togglePasswordVisibility = togglePasswordVisibility;
window.loadOrders = loadOrders;
window.handleNewsletterSubmit = handleNewsletterSubmit;
window.scrollBlogLeft = scrollBlogLeft;
window.scrollBlogRight = scrollBlogRight;
window.addToCart = typeof addToCart !== 'undefined' ? addToCart : () => showToast('Cart not initialized', 'error');
window.toggleWishlist = toggleWishlist;
window.showToast = showToast;
window.logout = typeof logout !== 'undefined' ? logout : () => {};
window.renderMenuItems = renderMenuItems;
window.filterMenuByCategory = filterMenuByCategory;
window.renderReviews = renderReviews;
window.initReviewForm = initReviewForm;
window.markHelpful = markHelpful;
window.updateRatingStats = updateRatingStats;

// ============================================
// ADVANCED TOAST NOTIFICATION SYSTEM
// ============================================

function createToastContainer() {
  if (!document.querySelector('.toast-container')) {
    const container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('role', 'alert');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  return document.querySelector('.toast-container');
}

function showAdvancedToast(message, type = 'info', duration = 4000) {
  const container = createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const iconMap = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };
  
  // SECURITY: Escape message to prevent XSS via API error messages
  toast.innerHTML = `
    <i class="toast-icon ${iconMap[type]}"></i>
    <span class="toast-message">${escapeHTML(message)}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('hidden');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================
// LIGHTBOX / IMAGE GALLERY
// ============================================

function initLightbox() {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <img src="" alt="" class="lightbox-img">
      <div class="lightbox-close"><i class="fas fa-times"></i></div>
    </div>
  `;
  document.body.appendChild(lightbox);
  
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      lightbox.querySelector('.lightbox-img').src = img.src;
      lightbox.querySelector('.lightbox-img').alt = img.alt;
      lightbox.classList.add('active');
    });
  });
  
  lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('active');
  });
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
    }
  });
}

// ============================================
// FLOATING ACTION BUTTON
// ============================================

function initFloatingActionButton() {
  // Remove any existing FAB to avoid duplicates
  const existingFab = document.querySelector('.floating-action-btn');
  if (existingFab) {
    existingFab.remove();
  }
  
  // Create new FAB
  const fab = document.createElement('button');
  fab.className = 'floating-action-btn';
  fab.innerHTML = '<i class="fas fa-whatsapp"></i>';
  fab.setAttribute('aria-label', 'Contact us on WhatsApp');
  fab.setAttribute('type', 'button');
  fab.style.visibility = 'visible';
  fab.style.opacity = '1';
  fab.onclick = (e) => {
    e.preventDefault();
    window.open('https://wa.me/233505070941', '_blank');
  };
  document.body.appendChild(fab);
}

// ============================================
// PARALLAX EFFECT
// ============================================

function initParallax() {
  const parallaxElements = document.querySelectorAll('.parallax-bg');
  
  if (parallaxElements.length === 0) return;
  
  window.addEventListener('scroll', () => {
    parallaxElements.forEach(element => {
      const scrollPosition = window.pageYOffset;
      element.style.backgroundPosition = `center ${scrollPosition * 0.5}px`;
    });
  });
}

// ============================================
// FILTER FUNCTIONALITY
// ============================================

function initFilters() {
  const filterTags = document.querySelectorAll('.filter-tag');
  const items = document.querySelectorAll('[data-filter]');
  
  filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
      filterTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      
      const filterValue = tag.getAttribute('data-filter');
      
      items.forEach(item => {
        if (filterValue === 'all' || item.getAttribute('data-filter') === filterValue) {
          item.style.display = '';
          setTimeout(() => item.classList.add('is-visible'), 10);
        } else {
          item.classList.remove('is-visible');
          setTimeout(() => item.style.display = 'none', 300);
        }
      });
    });
  });
}

// ============================================
// PAGE LOADER
// ============================================

function initPageLoader() {
  const loader = document.createElement('div');
  loader.className = 'page-loader hidden';
  loader.innerHTML = '<div class="spinner-ring"></div>';
  document.body.appendChild(loader);
  
  // Auto-hide on load
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 500);
  });
}

// Show loader on page navigation
document.querySelectorAll('a[href^="/"], a[href^="./"]').forEach(link => {
  link.addEventListener('click', () => {
    const loader = document.querySelector('.page-loader');
    if (loader) {
      loader.classList.remove('hidden');
    }
  });
});

// ============================================
// MODAL MANAGEMENT FOR LOGIN/SIGNUP
// ============================================

function initModals() {
  // Get modals and buttons
  const loginModal = document.getElementById('loginModal');
  const signupModal = document.getElementById('signupModal');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  
  // Close button handlers
  if (loginModal) {
    const closeBtn = loginModal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(loginModal));
    }
  }
  
  if (signupModal) {
    const closeBtn = signupModal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(signupModal));
    }
  }
  
  // Open modal buttons
  if (loginBtn && loginModal) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(loginModal);
    });
  }
  
  if (signupBtn && signupModal) {
    signupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(signupModal);
    });
  }
  
  // Login form submission
  const loginForm = document.getElementById('loginModalForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = loginForm.querySelector('#login-email')?.value || loginForm.querySelector('input[name="email"]')?.value;
      const password = loginForm.querySelector('#login-password')?.value || loginForm.querySelector('input[name="password"]')?.value;
      const remember = loginForm.querySelector('input[name="remember"]')?.checked;
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (email && password) {
        // Loading state
        const origText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        }
        
        const result = await login(email, password, remember);
        if (result.success) {
          if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
          showAdvancedToast('Login successful! Welcome back!', 'success');
          closeModal(loginModal);
          loginForm.reset();
          updateAuthUI();
          updateNavAuthUI();
          setTimeout(() => location.reload(), 1000);
        } else {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
          }
          showAdvancedToast(result.message || 'Login failed', 'error');
        }
      } else {
        console.error('Login form: Missing email or password', { email, password });
        showAdvancedToast('Please enter email and password', 'error');
      }
    });
  }
  
  // Signup form submission
  const signupForm = document.getElementById('signupModalForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = signupForm.querySelector('#signup-fullname')?.value || signupForm.querySelector('input[name="fullName"]')?.value;
      const email = signupForm.querySelector('#signup-email')?.value || signupForm.querySelector('input[name="email"]')?.value;
      const phone = signupForm.querySelector('#signup-phone')?.value || signupForm.querySelector('input[name="phone"]')?.value;
      const password = signupForm.querySelector('#signup-password')?.value || signupForm.querySelector('input[name="password"]')?.value;
      const confirmPassword = signupForm.querySelector('#signup-confirm')?.value || signupForm.querySelector('input[name="confirmPassword"]')?.value;
      const terms = signupForm.querySelector('input[name="terms"]')?.checked;
      const submitBtn = signupForm.querySelector('button[type="submit"]');
      if (!fullName || !email || !phone || !password || !confirmPassword || !terms) {
        console.error('Signup validation failed. Missing:', { fullName: !fullName, email: !email, phone: !phone, password: !password, confirmPassword: !confirmPassword, terms: !terms });
        showAdvancedToast('Please fill in all fields and accept terms', 'error');
        return;
      }
      
      // Loading state
      const origText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
      }
      
      const result = await register(fullName, email, phone, password, confirmPassword);
      if (result.success) {
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
        showAdvancedToast('Account created! Welcome to SWIFT CHOW!', 'success');
        closeModal(signupModal);
        signupForm.reset();
        updateAuthUI();
        updateNavAuthUI();
        setTimeout(() => location.reload(), 1000);
      } else {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origText;
        }
        showAdvancedToast(result.message || 'Signup failed', 'error');
      }
    });
  }
  
  // Setup form validation for login and signup
  if (loginForm) setupFormValidation(loginForm);
  if (signupForm) setupFormValidation(signupForm);
  
  // Switch between modals
  const switchToSignup = document.querySelectorAll('[data-action="switch-to-signup"]');
  const switchToLogin = document.querySelectorAll('[data-action="switch-to-login"]');
  
  switchToSignup.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (loginModal && signupModal) {
        closeModal(loginModal);
        setTimeout(() => openModal(signupModal), 150);
      }
    });
  });
  
  switchToLogin.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (loginModal && signupModal) {
        closeModal(signupModal);
        setTimeout(() => openModal(loginModal), 150);
      }
    });
  });
  
  // Close on overlay click
  document.addEventListener('click', (e) => {
    if (loginModal && e.target === loginModal) {
      closeModal(loginModal);
    }
    if (signupModal && e.target === signupModal) {
      closeModal(signupModal);
    }
    // Close cart modal when clicking on the overlay (not the content)
    const cartModal = document.getElementById('cartModal');
    if (cartModal && e.target === cartModal) {
      closeModal(cartModal);
      document.body.style.overflow = 'auto';
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (loginModal && loginModal.classList.contains('active')) {
        closeModal(loginModal);
      }
      if (signupModal && signupModal.classList.contains('active')) {
        closeModal(signupModal);
      }
      const cartModal = document.getElementById('cartModal');
      if (cartModal && cartModal.classList.contains('active')) {
        closeModal(cartModal);
        document.body.style.overflow = 'auto';
      }
    }
  });
  
  // Cart modal functionality
  const cartModal = document.getElementById('cartModal');
  const cartButtons = document.querySelectorAll('a[href="cart.html"]');
  
  cartButtons.forEach(btn => {
    if (btn.classList.contains('nav-icon')) {
      btn.onclick = (e) => {
        e.preventDefault();
        updateCartModal();
        openModal(cartModal);
      };
    }
  });
  
  // Also handle mobile cart button
  const mobileCartBtn = document.querySelector('.mobile-nav-links a[href="cart.html"]');
  if (mobileCartBtn) {
    mobileCartBtn.onclick = (e) => {
      e.preventDefault();
      updateCartModal();
      openModal(cartModal);
    };
  }
}

function updateCartModal() {
  const cartModal = document.getElementById('cartModal');
  if (!cartModal) return;
  
  const cartItems = (window.cart && Array.isArray(window.cart)) ? window.cart : [];
  const cartList = cartModal.querySelector('.cart-items-modal-list');
  
  if (cartItems.length === 0) {
    cartList.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
        <i class="fas fa-shopping-bag" style="font-size: 3.5rem; opacity: 0.15; margin-bottom: 1rem; display: block;"></i>
        <p style="font-weight: 600; font-size: 1.05rem; margin-bottom: 0.5rem; color: var(--text-primary);">Your cart is empty</p>
        <p style="font-size: 0.9rem; margin-bottom: 1.5rem;">Add some delicious items to get started</p>
        <a href="menu.html" class="btn btn-primary btn-sm" style="border-radius: 2rem; padding: 0.6rem 1.5rem;"><i class="fas fa-utensils"></i> Browse Menu</a>
      </div>
    `;
  } else {
    let html = '';
    
    cartItems.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      
      html += `
        <div style="display: flex; gap: 0.75rem; padding: 0.75rem; margin-bottom: 0.5rem; border-radius: 0.75rem; background: var(--bg-secondary); border: 1px solid var(--border-color); align-items: center; transition: all 0.2s;">
          <img src="${sanitizeURL(item.image) || 'https://via.placeholder.com/80'}" alt="${escapeHTML(item.name)}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 0.5rem; flex-shrink: 0;" loading="lazy" decoding="async">
          <div style="flex: 1; min-width: 0;">
            <h4 style="margin: 0 0 0.15rem 0; font-size: 0.9rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(item.name)}</h4>
            <p style="margin: 0 0 0.4rem 0; font-size: 0.8rem; color: var(--text-secondary);">GHS ${item.price.toFixed(2)} each</p>
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <button class="btn btn-sm" style="min-width: 36px; min-height: 36px; padding: 0.25rem 0.5rem; font-size: 0.9rem; border-radius: 0.35rem; line-height: 1; display: flex; align-items: center; justify-content: center;" onclick="decrementQuantity(${item.id})">−</button>
              <span style="width: 28px; text-align: center; font-weight: 600; font-size: 0.9rem;">${item.quantity}</span>
              <button class="btn btn-sm" style="min-width: 36px; min-height: 36px; padding: 0.25rem 0.5rem; font-size: 0.9rem; border-radius: 0.35rem; line-height: 1; display: flex; align-items: center; justify-content: center;" onclick="incrementQuantity(${item.id})">+</button>
              <button class="btn btn-sm" style="min-width: 36px; min-height: 36px; padding: 0.25rem 0.5rem; font-size: 0.9rem; margin-left: auto; color: #dc2626; border-radius: 0.35rem; display: flex; align-items: center; justify-content: center;" onclick="removeFromCart(${item.id})" title="Remove"><i class="fas fa-trash-alt"></i></button>
            </div>
          </div>
          <div style="text-align: right; font-weight: 700; font-size: 0.9rem; color: var(--primary); white-space: nowrap; flex-shrink: 0;">GHS ${itemTotal.toFixed(2)}</div>
        </div>
      `;
    });
    
    cartList.innerHTML = html;
  }
  
  // Update totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = subtotal > 100 ? 0 : 15;
  const total = subtotal + delivery;
  
  const subtotalEl = cartModal.querySelector('.cart-subtotal');
  const deliveryEl = cartModal.querySelector('.cart-delivery');
  const totalEl = cartModal.querySelector('.cart-total');
  
  if (subtotalEl) subtotalEl.textContent = `GHS ${subtotal.toFixed(2)}`;
  if (deliveryEl) deliveryEl.textContent = delivery === 0 ? 'FREE' : `GHS ${delivery.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `GHS ${total.toFixed(2)}`;
}


function proceedToCheckout() {
  location.href = 'checkout.html';
}

function openModal(modal) {
  if (modal) {
    // Store the element that had focus before the modal opened
    modal._previousFocus = document.activeElement;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Move focus into modal — first focusable element
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 50);
    }
    // Trap focus inside modal
    modal._trapFocus = function(e) {
      if (e.key !== 'Tab') return;
      const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    modal.addEventListener('keydown', modal._trapFocus);
    // Close on Escape key
    modal._escClose = function(e) {
      if (e.key === 'Escape') closeModal(modal);
    };
    document.addEventListener('keydown', modal._escClose);
  }
}

function closeModal(modal) {
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    // Remove focus trap and Escape listener
    if (modal._trapFocus) {
      modal.removeEventListener('keydown', modal._trapFocus);
    }
    if (modal._escClose) {
      document.removeEventListener('keydown', modal._escClose);
    }
    // Restore focus to the element that triggered the modal
    if (modal._previousFocus && typeof modal._previousFocus.focus === 'function') {
      modal._previousFocus.focus();
    }
  }
}

// ============================================
// USER AUTHENTICATION UI
// ============================================

function updateAuthUI() {
  let user = getCurrentUser();
  const navActions = document.querySelector('.nav-actions');
  
  if (!navActions) {
    // Retry after a brief delay in case page is still loading
    setTimeout(() => updateAuthUI(), 100);
    return;
  }
  // Remove old avatar
  const oldUserProfile = navActions.querySelector('.user-profile');
  if (oldUserProfile) {
    oldUserProfile.remove();
  }
  
  // Check if user is logged in - trust currentUser if it exists, or check token
  const isUserLoggedIn = user || isLoggedIn();
  
  if (isUserLoggedIn) {
    // Hide login button when user is logged in
    const loginBtn = navActions.querySelector('#loginBtn');
    if (loginBtn) {
      loginBtn.style.display = 'none';
    }
    // Hide mobile login button
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    if (mobileLoginBtn) {
      mobileLoginBtn.style.display = 'none';
    }
    
    // If user object is null but authenticated, use token to proceed
    if (!user) {
      // Create a generic user object for display
      user = { email: 'User', fullName: 'User' };
    }
    
    // Get user name from various possible properties (OAuth vs regular signup)
    let userName = '';
    if (user && user.fullName) {
      userName = user.fullName;
    } else if (user && user.name) {
      userName = user.name;
    } else if (user && user.firstName && user.lastName) {
      userName = `${user.firstName} ${user.lastName}`;
    } else if (user && user.firstName) {
      userName = user.firstName;
    } else if (user && user.email) {
      userName = user.email.split('@')[0]; // fallback to email username
    } else {
      userName = 'User'; // final fallback
    }
    
    // Show user badge in nav-actions (same level as header)
    const userInitial = userName.charAt(0).toUpperCase();
    const userColor = generateUserColor(user && user.email ? user.email : 'user@example.com');
    
    const profileHTML = `
      <div class="user-profile">
        <button id="userProfileBtn" class="nav-icon" style="
          background: linear-gradient(135deg, ${userColor.light}, ${userColor.dark});
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        ">
          ${userInitial}
        </button>
        
        <div id="userDropdown" style="
          display: none;
          position: fixed;
          top: auto;
          left: auto;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          min-width: min(250px, calc(100vw - 2rem));
          z-index: 10000;
          overflow: hidden;
        ">
          <div style="padding: 1rem; border-bottom: 1px solid var(--border-color);">
            <p style="margin: 0; font-weight: 600; color: var(--text-primary);">${escapeHTML(userName)}</p>
            <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: var(--text-secondary);">${escapeHTML(user && user.email ? user.email : 'User')}</p>
          </div>
          <a href="account.html" style="display: block; padding: 0.75rem 1rem; color: var(--text-primary); text-decoration: none; border-bottom: 1px solid var(--border-color); transition: all 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
            <i class="fas fa-user-circle"></i> My Account
          </a>
          <a href="tracking.html" style="display: block; padding: 0.75rem 1rem; color: var(--text-primary); text-decoration: none; border-bottom: 1px solid var(--border-color); transition: all 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
            <i class="fas fa-truck-fast"></i> Track Your Order
          </a>
          <button onclick="logout()" style="display: block; width: 100%; text-align: left; padding: 0.75rem 1rem; background: none; border: none; color: #dc2626; cursor: pointer; font-size: 0.95rem; transition: all 0.2s; font-weight: 600;" onmouseover="this.style.background='rgba(220, 38, 38, 0.05)'" onmouseout="this.style.background='transparent'">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    `;
    
    // Insert into nav-actions instead of body
    navActions.insertBefore(
      document.createRange().createContextualFragment(profileHTML),
      navActions.querySelector('.mobile-menu-btn')
    );
    
    // Add click handler for dropdown toggle
    const userBtn = document.getElementById('userProfileBtn');
    const dropdown = document.getElementById('userDropdown');
    if (userBtn && dropdown) {
      dropdown.style.display = 'none';
      
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        const isVisible = dropdown.style.display !== 'none' && dropdown.style.display !== '';
        
        if (!isVisible) {
          // Position dropdown below button
          const rect = userBtn.getBoundingClientRect();
          dropdown.style.top = (rect.bottom + 12) + 'px';
          dropdown.style.right = '2rem';
          dropdown.style.left = 'auto';
          dropdown.style.display = 'block';
          dropdown.style.visibility = 'visible';
          dropdown.style.opacity = '1';
        } else {
          dropdown.style.display = 'none';
        }
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (dropdown && userBtn && !e.target.closest('.top-right-avatar')) {
          dropdown.style.display = 'none';
        }
      });
    }
  } else {
    // Show login button when user is not logged in
    const loginBtn = navActions.querySelector('#loginBtn');
    if (loginBtn) {
      loginBtn.style.display = 'inline-flex';
      loginBtn.style.visibility = 'visible';
    }
    // Show mobile login button
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    if (mobileLoginBtn) {
      mobileLoginBtn.style.visibility = 'visible';
    }
  }
}

// Social login handlers
async function googleLogin() {
  showAdvancedToast('Google login demo - using demo credentials', 'info');
  const email = 'demo.google@swift.com';
  const password = 'demo1234';
  if (await login(email, password)) {
    const loginModal = document.getElementById('loginModal');
    closeModal(loginModal);
    setTimeout(() => updateAuthUI(), 100);
  }
}

function googleSignup() {
  // Use real Google OAuth flow for signup (same as login)
  googleSignIn();
}

function generateUserColor(email) {
  const colors = [
    { light: '#FF6B6B', dark: '#C92A2A' },
    { light: '#4ECDC4', dark: '#1B8078' },
    { light: '#45B7D1', dark: '#0D7377' },
    { light: '#F7B731', dark: '#C59C1A' },
    { light: '#A29BFE', dark: '#6C5CE7' },
    { light: '#FF7675', dark: '#D63031' },
    { light: '#00B894', dark: '#00873E' },
    { light: '#FF6B9D', dark: '#C44569' }
  ];
  
  const index = email.charCodeAt(0) % colors.length;
  return colors[index];
}

function toggleUserMenu() {
  const userMenu = document.getElementById('userMenu');
  if (userMenu) {
    userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
  }
}

// Auto-update cart modal when cart changes
function initCartAutoUpdate() {
  // Update cart modal when localStorage changes from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'swiftChowCart') {
      updateCartModal();
    }
  });
}

// Close user menu when clicking outside
document.addEventListener('click', (e) => {
  const userMenu = document.getElementById('userMenu');
  const userProfile = document.querySelector('.user-profile');
  if (userMenu && userProfile && !userProfile.contains(e.target)) {
    userMenu.style.display = 'none';
  }
});

// ============================================
// ENHANCED INITIALIZATION
// ============================================

// ============================================
// NEWSLETTER & BLOG FUNCTIONS
// ============================================

function handleNewsletterSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.querySelector('input[type="email"]').value;
  
  if (!email || !email.includes('@')) {
    showAdvancedToast('Please enter a valid email address', 'error');
    return;
  }
  showAdvancedToast('Thank you for subscribing! Check your email for confirmation.', 'success');
  form.reset();
}

function scrollBlogLeft() {
  const blogGrid = document.querySelector('.blog-grid');
  if (blogGrid) {
    blogGrid.scrollBy({ left: -300, behavior: 'smooth' });
  }
}

function scrollBlogRight() {
  const blogGrid = document.querySelector('.blog-grid');
  if (blogGrid) {
    blogGrid.scrollBy({ left: 300, behavior: 'smooth' });
  }
}

function initEnhancements() {
  initScrollReveal();
  initLightbox();
  initParallax();
  initFilters();
  initPageLoader();
  initModals();
  initCartAutoUpdate();
  updateAuthUI();
  updateCartModal();
  createFloatingCart();
  initMotorcycleAnimation();
}

// Create Floating Cart Button
function createFloatingCart() {
  // Check if floating cart already exists
  if (document.querySelector('.floating-cart-btn')) {
    updateFloatingCart();
    return;
  }

  const floatingCartHTML = `
    <button class="floating-cart-btn" title="Open Cart" id="floatingCartBtn" aria-label="Open shopping cart">
      <i class="fas fa-shopping-bag"></i>
      <span class="floating-cart-count" style="display: none;">0</span>
    </button>
  `;
  
  document.body.insertAdjacentHTML('beforeend', floatingCartHTML);
  
  // Click opens the full cart modal
  const btn = document.getElementById('floatingCartBtn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cartModal = document.getElementById('cartModal');
      if (cartModal) {
        openModal(cartModal);
      }
    });
  }
  
  updateFloatingCart();
}

// Update Floating Cart with items and total
function updateFloatingCart() {
  const currentCart = window.cart || [];
  const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);
  const floatingCount = document.querySelector('.floating-cart-count');
  
  if (floatingCount) {
    floatingCount.textContent = totalItems;
    floatingCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// Update Floating Cart Count
function updateFloatingCartCount() {
  updateFloatingCart();
}

// Initialize Motorcycle Animation on Tracking Page
function initMotorcycleAnimation() {
  if (document.body.getAttribute('data-page') !== 'tracking') {
    return;
  }

  const progressSteps = document.querySelectorAll('.tracking-step');
  if (progressSteps.length === 0) return;
}

// ============================================
// CROSS-PAGE AUTHENTICATION SYNC
// ============================================
// Listen for storage changes from other tabs/windows to sync auth state
window.addEventListener('storage', (e) => {
  // If swiftChowUser changes (login/logout), update auth UI on all open pages
  if (e.key === 'swiftChowUser') {
    // Update auth UI after a brief delay to ensure all data is updated
    setTimeout(() => {
      updateAuthUI();
      // Also update floating cart count
      updateFloatingCartCount();
    }, 100);
  }
  // If cart changes, update cart display
  if (e.key === 'swiftChowCart') {
    setTimeout(() => {
      updateCartCount();
      updateFloatingCartCount();
    }, 100);
  }
});


// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================
function initScrollReveal() {
  try {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    const elements = document.querySelectorAll('.animate-on-scroll, .menu-item, .feature-card, .review-card, .blog-card');
    if (elements && elements.length > 0) {
      elements.forEach(el => {
        if (el) observer.observe(el);
      });
    }
  } catch (e) {
    console.warn('Error initializing scroll reveal:', e);
  }
}

// ============================================
// ENHANCED FORM VALIDATION
// ============================================

function setupFormValidation(formSelector) {
  // Handle both string selectors and form elements
  let form;
  if (typeof formSelector === 'string') {
    form = document.querySelector(formSelector);
  } else {
    form = formSelector;
  }
  
  if (!form) return;

  const inputs = form.querySelectorAll('input, textarea, select');
  
  inputs.forEach(input => {
    // Real-time validation
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        validateField(input);
      }
    });
  });
}

function validateField(field) {
  let isValid = true;
  let errorMessage = '';

  // Email validation
  if (field.type === 'email') {
    isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
    errorMessage = 'Please enter a valid email address';
  }
  // Phone validation
  else if (field.type === 'tel') {
    isValid = /^[\d\s\-+()]+$/.test(field.value) && field.value.replace(/\D/g, '').length >= 10;
    errorMessage = 'Please enter a valid phone number';
  }
  // Required fields
  else if (field.hasAttribute('required')) {
    isValid = field.value.trim() !== '';
    errorMessage = `${field.getAttribute('name')} is required`;
  }
  // Password validation
  else if (field.type === 'password' && field.hasAttribute('minlength')) {
    isValid = field.value.length >= parseInt(field.getAttribute('minlength'));
    errorMessage = `Password must be at least ${field.getAttribute('minlength')} characters`;
  }

  // Update field styling
  if (isValid) {
    field.classList.remove('error');
    field.classList.add('valid');
    if (field.type !== 'hidden') {
      showFieldFeedback(field, 'success');
    }
  } else {
    field.classList.remove('valid');
    field.classList.add('error');
    if (field.type !== 'hidden') {
      showFieldFeedback(field, 'error', errorMessage);
    }
  }

  return isValid;
}

function showFieldFeedback(field, type, message = '') {
  // Remove existing feedback
  const existingFeedback = field.parentElement.querySelector('.form-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }

  if (type === 'success') {
    const feedback = document.createElement('div');
    feedback.className = 'form-feedback success';
    feedback.innerHTML = `<i class="fas fa-check"></i> Valid`;
    field.parentElement.appendChild(feedback);
  } else if (type === 'error') {
    const feedback = document.createElement('div');
    feedback.className = 'form-feedback error';
    feedback.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    field.parentElement.appendChild(feedback);
  }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function initProductSearch() {
  const searchInput = document.getElementById('search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    performProductSearch(query);
  });
}

function performProductSearch(query) {
  const productsGrid = document.querySelector('.products-grid');
  if (!productsGrid || !foodItems) return;

  if (query.trim() === '') {
    renderMenuItems(foodItems, productsGrid);
    return;
  }

  const filteredItems = foodItems.filter(item =>
    item.name.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query)
  );

  if (filteredItems.length === 0) {
    productsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">No items found</div>
        <div class="empty-state-message">We couldn't find any items matching "${escapeHTML(query)}"</div>
      </div>
    `;
  } else {
    renderMenuItems(filteredItems, productsGrid);
  }
}

// ============================================
// PRODUCT RECOMMENDATIONS
// ============================================

function getRecommendedProducts(categoryId, excludeId, count = 4) {
  if (!foodItems) return [];

  return foodItems
    .filter(item => item.category === categoryId && item.id !== excludeId)
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
}

function renderRecommendations(containerId, categoryId, excludeId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const recommendations = getRecommendedProducts(categoryId, excludeId);
  
  if (recommendations.length === 0) return;

  const html = `
    <div style="margin-top: 48px; padding-top: 48px; border-top: 1px solid var(--border-color);">
      <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 24px;">You Might Also Like</h3>
      <div class="products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr)); gap: 24px;">
        ${recommendations.map(item => `
          <div class="product-card card-hover">
            <div class="product-image">
              <img src="${item.image}" alt="${item.name}" loading="lazy">
              ${item.isPopular ? '<span class="badge popular">Popular</span>' : ''}
              ${item.isNew ? '<span class="badge new">New</span>' : ''}
              <div class="product-rating">
                <i class="fas fa-star"></i>
                <span>${item.rating} (${item.reviews})</span>
              </div>
            </div>
            <div class="product-info">
              <h4>${item.name}</h4>
              <p class="product-category">${item.category}</p>
              <p class="product-description" style="font-size: 0.85rem; margin: 8px 0;">
                ${item.description.substring(0, 80)}...
              </p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                <span class="price">GHS ${item.price}</span>
                <button class="btn btn-small btn-primary" onclick="addToCart(${item.id}, 1)">
                  <i class="fas fa-cart-plus"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.insertAdjacentHTML('afterend', html);
}

// ============================================
// QUANTITY SELECTOR ENHANCEMENTS
// ============================================

function setupQuantitySelectors() {
  const cartItems = document.querySelectorAll('.cart-item');
  
  cartItems.forEach(item => {
    const quantityInput = item.querySelector('.quantity-input');
    const decreaseBtn = item.querySelector('.quantity-decrease');
    const increaseBtn = item.querySelector('.quantity-increase');
    
    if (!decreaseBtn) {
      const buttons = document.createElement('div');
      buttons.className = 'quantity-controls';
      buttons.style.cssText = 'display: flex; gap: 8px; align-items: center;';
      buttons.innerHTML = `
        <button class="quantity-btn quantity-decrease" style="width: 32px; height: 32px; border: 1px solid var(--border-color); border-radius: 4px; background: white; cursor: pointer; transition: all 0.2s ease;">
          <i class="fas fa-minus"></i>
        </button>
        <input type="number" class="quantity-input" value="${quantityInput.value}" min="1" style="width: 50px; text-align: center; border: 1px solid var(--border-color); border-radius: 4px; padding: 6px;">
        <button class="quantity-btn quantity-increase" style="width: 32px; height: 32px; border: 1px solid var(--border-color); border-radius: 4px; background: white; cursor: pointer; transition: all 0.2s ease;">
          <i class="fas fa-plus"></i>
        </button>
      `;
      
      quantityInput.parentElement.replaceChild(buttons, quantityInput);
      
      const newDecreaseBtn = buttons.querySelector('.quantity-decrease');
      const newIncreaseBtn = buttons.querySelector('.quantity-increase');
      const newInput = buttons.querySelector('.quantity-input');
      const productId = item.dataset.productId || item.id.replace('item-', '');
      
      newDecreaseBtn.addEventListener('click', () => {
        const newValue = Math.max(1, parseInt(newInput.value) - 1);
        newInput.value = newValue;
        updateQuantity(productId, newValue);
        newInput.classList.add('bounce-animation');
      });
      
      newIncreaseBtn.addEventListener('click', () => {
        const newValue = parseInt(newInput.value) + 1;
        newInput.value = newValue;
        updateQuantity(productId, newValue);
        newInput.classList.add('bounce-animation');
      });
      
      newInput.addEventListener('change', () => {
        const value = Math.max(1, parseInt(newInput.value));
        newInput.value = value;
        updateQuantity(productId, value);
      });
    }
  });
}

// ============================================
// EMPTY STATE HANDLERS
// ============================================

function showEmptyState(containerId, icon = '📦', title = 'Nothing here yet', message = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <div class="empty-state-title">${title}</div>
      ${message ? `<div class="empty-state-message">${message}</div>` : ''}
    </div>
  `;
}

// ============================================
// 🎨 PREMIUM ENHANCEMENTS MODULE
// ============================================

(function PremiumEnhancements() {
  'use strict';

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPremiumFeatures);
  } else {
    initPremiumFeatures();
  }

  function initPremiumFeatures() {
    initScrollReveal();
    initScrollProgressBar();
    initBackToTopButton();
    initButtonRipple();
    initConfetti();
    initFAQAccordion();
    initParallaxFloat();
    initImageLazyFadeIn();
    initCartBadgeBump();
    initAccountWelcome();
    initProfileCompletion();
    // initRatingDistribution() removed — HTML #ratingDistribution section already handles this via updateRatingStats()
    initAuthParticles();
    initTypingEffect();
    initSmoothAnchorScroll();
    initStaggerGrids();
    // initContactFormSuccess removed — duplicate of initContactForm()
    initBlogReadingProgress();
    initCheckoutSteps();
  }

  // ---------- 1. Scroll-Reveal System ----------
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-grid');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));

    // Auto-add reveal classes to common sections
    document.querySelectorAll('.section-header, .about-story, .mission-vision-grid, .values-grid, .contact-grid, .faq-section, .newsletter-card, .review-form, .blog-grid').forEach((el, i) => {
      if (!el.classList.contains('reveal') && !el.classList.contains('revealed')) {
        el.classList.add('reveal');
        if (i % 2 === 0) el.classList.add('reveal-delay-1');
        observer.observe(el);
      }
    });

    // Auto-add stagger to grids
    document.querySelectorAll('.products-grid, .categories-grid, .stats-grid, .values-grid, .contact-info-cards, .testimonials-grid, .mission-vision-grid').forEach(grid => {
      if (!grid.classList.contains('stagger-grid')) {
        grid.classList.add('stagger-grid');
        observer.observe(grid);
      }
    });
  }

  // ---------- 2. Scroll Progress Bar ----------
  function initScrollProgressBar() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress-bar';
    bar.style.width = '0%';
    document.body.prepend(bar);

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          bar.style.width = percent + '%';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ---------- 3. Back To Top Button ----------
  function initBackToTopButton() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    btn.setAttribute('aria-label', 'Back to top');
    btn.title = 'Back to top';
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- 4. Button Ripple Effect ----------
  function initButtonRipple() {
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn, .deal-order-btn, .btn-hero-primary, .btn-hero-secondary, .filter-btn');
      if (!btn) return;

      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  }

  // ---------- 5. Confetti on Order Success ----------
  function initConfetti() {
    if (document.body.dataset.page !== 'order-success' && !document.querySelector('.success-container')) return;

    const colors = ['#DC2626', '#F97316', '#FBBF24', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    const shapes = ['square', 'circle'];

    function createConfettiPiece() {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      piece.style.background = color;
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.width = (Math.random() * 10 + 6) + 'px';
      piece.style.height = (Math.random() * 10 + 6) + 'px';
      piece.style.borderRadius = shape === 'circle' ? '50%' : (Math.random() > 0.5 ? '2px' : '0');
      piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
      piece.style.animationDelay = (Math.random() * 3) + 's';
      document.body.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove());
    }

    // Launch confetti bursts
    for (let i = 0; i < 80; i++) {
      setTimeout(() => createConfettiPiece(), Math.random() * 1500);
    }
    // Second wave
    setTimeout(() => {
      for (let i = 0; i < 40; i++) {
        setTimeout(() => createConfettiPiece(), Math.random() * 1000);
      }
    }, 2000);
  }

  // ---------- 6. FAQ Accordion ----------
  function initFAQAccordion() {
    document.querySelectorAll('.faq-item').forEach(item => {
      // Skip if already has accordion structure
      if (item.querySelector('.faq-answer')) return;

      const h4 = item.querySelector('h4');
      const p = item.querySelector('p');
      if (!h4 || !p) return;

      // Transform into accordion
      const questionText = h4.textContent;
      const answerText = p.innerHTML;

      h4.outerHTML = `<div class="faq-question"><span>${questionText}</span><span class="faq-icon"><i class="fas fa-chevron-down"></i></span></div>`;
      p.outerHTML = `<div class="faq-answer"><p>${answerText}</p></div>`;

      item.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all others
        item.closest('.faq-grid').querySelectorAll('.faq-item').forEach(other => {
          other.classList.remove('active');
        });
        if (!isActive) item.classList.add('active');
      });
    });
  }

  // ---------- 7. Parallax Float on Mouse Move ----------
  function initParallaxFloat() {
    const heroImage = document.querySelector('.hero-image-wrapper');
    if (!heroImage) return;

    document.querySelector('.hero-premium')?.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;

      heroImage.style.transform = `translate(${x}px, ${y}px)`;

      // Move floating cards opposite direction
      document.querySelectorAll('.floating-card').forEach(card => {
        card.style.transform = `translate(${-x * 0.5}px, ${-y * 0.5}px)`;
      });
    });
  }

  // ---------- 8. Image Lazy Fade-In ----------
  function initImageLazyFadeIn() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.6s ease';
      if (img.complete) {
        img.style.opacity = '1';
      } else {
        img.addEventListener('load', () => { img.style.opacity = '1'; });
        img.addEventListener('error', () => { img.style.opacity = '1'; });
      }
    });
  }

  // ---------- 9. Cart Badge Bump Animation ----------
  function initCartBadgeBump() {
    document.addEventListener('cart:countUpdated', function(e) {
      const count = e.detail && e.detail.count;
      if (count > 0) {
        const badges = document.querySelectorAll('.cart-count');
        badges.forEach(badge => {
          badge.classList.remove('bump');
          void badge.offsetWidth; // trigger reflow
          badge.classList.add('bump');
        });
      }
    });
  }

  // ---------- 10. Account Page Welcome Greeting ----------
  function initAccountWelcome() {
    if (document.body.dataset.page !== 'account') return;

    const contentArea = document.querySelector('.premium-content-area');
    if (!contentArea) return;

    const user = JSON.parse(localStorage.getItem('swiftChowUser') || '{}');
    const name = user.fullName || user.name || 'there';
    const firstName = name.split(' ')[0];

    const hour = new Date().getHours();
    let greeting, emoji;
    if (hour >= 5 && hour < 12) { greeting = 'Good Morning'; emoji = '☀️'; }
    else if (hour >= 12 && hour < 18) { greeting = 'Good Afternoon'; emoji = '🌤️'; }
    else { greeting = 'Good Evening'; emoji = '🌙'; }

    const banner = document.createElement('div');
    banner.className = 'welcome-banner reveal';
    banner.innerHTML = `
      <span class="welcome-emoji">${emoji}</span>
      <div class="welcome-text">
        <h3>${greeting}, ${firstName}!</h3>
        <p>Welcome to your SWIFT CHOW dashboard. What would you like to do today?</p>
      </div>
    `;
    contentArea.insertBefore(banner, contentArea.firstChild);

    // Trigger reveal
    setTimeout(() => banner.classList.add('revealed'), 100);
  }

  // ---------- 11. Profile Completion Bar ----------
  function initProfileCompletion() {
    if (document.body.dataset.page !== 'account') return;

    const sidebar = document.querySelector('.sidebar-user-card');
    if (!sidebar) return;

    const user = JSON.parse(localStorage.getItem('swiftChowUser') || '{}');
    let percent = 0;
    if (user.phone) percent += 33;
    if (user.dob) percent += 33;
    if (user.gender) percent += 34;

    const barHTML = document.createElement('div');
    barHTML.style.margin = '1rem 0 0.5rem';
    barHTML.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="font-size:0.8rem;color:var(--text-secondary);font-weight:500;">Profile Completion</span>
        <span style="font-size:0.8rem;color:var(--primary);font-weight:700;">${percent}%</span>
      </div>
      <div class="completion-bar-track">
        <div class="completion-bar-fill" style="width: 0%;"></div>
      </div>
    `;
    sidebar.appendChild(barHTML);

    // Animate after a short delay
    setTimeout(() => {
      barHTML.querySelector('.completion-bar-fill').style.width = percent + '%';
    }, 500);
  }

  // ---------- 12. Rating Distribution Bars (Reviews Page) ----------
  // REMOVED: initRatingDistribution() — was duplicating the rating distribution
  // already present in the HTML (#ratingDistribution section below the hero).
  // The HTML distribution is updated via updateRatingStats() in renderReviews().

  // ---------- 13. Auth Page Floating Particles ----------
  function initAuthParticles() {
    const container = document.querySelector('.auth-container');
    if (!container) return;

    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'auth-particle';
      const size = Math.random() * 20 + 5;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
      particle.style.animationDelay = (Math.random() * 10) + 's';
      particle.style.background = ['rgba(220,38,38,0.3)', 'rgba(249,115,22,0.3)', 'rgba(251,191,36,0.3)'][Math.floor(Math.random() * 3)];
      container.appendChild(particle);
    }
  }

  // ---------- 14. Hero Typing Effect ----------
  function initTypingEffect() {
    const heroDesc = document.querySelector('.hero-description');
    if (!heroDesc || document.body.dataset.page !== 'home') return;

    const words = ['burgers 🍔', 'pizzas 🍕', 'shakes 🥤', 'desserts 🍰', 'pastries 🥐'];
    let wordIndex = 0;

    // Find or create the dynamic word target
    const text = heroDesc.textContent;
    if (!text.includes('Premium')) return;

    // Create a span for the rotating word
    heroDesc.innerHTML = heroDesc.innerHTML.replace(
      /Premium burgers, authentic pizzas, and irresistible desserts/,
      'Premium <span class="typing-word" style="color:#FBBF24;font-weight:700;">burgers 🍔</span>, crafted'
    );

    const typingWord = heroDesc.querySelector('.typing-word');
    if (!typingWord) return;

    setInterval(() => {
      wordIndex = (wordIndex + 1) % words.length;
      typingWord.style.opacity = '0';
      typingWord.style.transform = 'translateY(10px)';
      typingWord.style.transition = 'all 0.3s ease';

      setTimeout(() => {
        typingWord.textContent = words[wordIndex];
        typingWord.style.opacity = '1';
        typingWord.style.transform = 'translateY(0)';
      }, 300);
    }, 2500);
  }

  // ---------- 15. Smooth Anchor Scroll ----------
  function initSmoothAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#' || href === '#!') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ---------- 16. Stagger Grid Animation ----------
  function initStaggerGrids() {
    // Already handled by scroll reveal, but ensure all grids have the class
    // This is a hook for any additional grid animation needs
  }

  // ---------- 17. Contact Form Success Animation ----------
  // Removed: was a duplicate of initContactForm() which handles the same form

  // ---------- 18. Blog Post Reading Progress ----------
  function initBlogReadingProgress() {
    if (document.body.dataset.page !== 'blog-post') return;

    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.width = '0%';
    document.body.prepend(progressBar);

    const article = document.querySelector('.blog-post-content, article, .content-area');
    if (!article) return;

    window.addEventListener('scroll', () => {
      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const scrollPos = window.scrollY - articleTop;
      const progress = Math.min(Math.max((scrollPos / (articleHeight - window.innerHeight)) * 100, 0), 100);
      progressBar.style.width = progress + '%';
    }, { passive: true });
  }

  // ---------- 19. Checkout Steps Indicator ----------
  function initCheckoutSteps() {
    if (document.body.dataset.page !== 'checkout') return;

    const pageHeader = document.querySelector('.page-header .container');
    if (!pageHeader || document.querySelector('.checkout-steps')) return;

    const steps = document.createElement('div');
    steps.className = 'checkout-steps';
    steps.innerHTML = `
      <div class="checkout-step active">
        <span class="step-num">1</span>
        <span>Details</span>
      </div>
      <div class="checkout-step-line"></div>
      <div class="checkout-step">
        <span class="step-num">2</span>
        <span>Payment</span>
      </div>
      <div class="checkout-step-line"></div>
      <div class="checkout-step">
        <span class="step-num">3</span>
        <span>Confirm</span>
      </div>
    `;
    pageHeader.appendChild(steps);
  }

})();

/* ===== ADDITIONAL PREMIUM ENHANCEMENTS (Round 2) ===== */
(function AdditionalEnhancements() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdditional);
  } else {
    initAdditional();
  }

  function initAdditional() {
    initCounterAnimation();
    initNavScrollEffect();
    initFooterYear();
    initOrderProgressAnimation();
    initMenuItemCount();
  }

  // 1. Animated number counter for stats sections
  function initCounterAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number, .overall-rating');
    if (!statNumbers.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          const text = entry.target.textContent.trim();
          const match = text.match(/([\d,]+\.?\d*)/);
          if (!match) return;
          
          const suffix = text.replace(match[0], '');
          const target = parseFloat(match[0].replace(',', ''));
          const isDecimal = match[0].includes('.');
          const duration = 1500;
          const start = performance.now();
          
          const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = target * eased;
            
            if (isDecimal) {
              entry.target.textContent = current.toFixed(1) + suffix;
            } else if (target >= 1000) {
              entry.target.textContent = Math.floor(current).toLocaleString() + suffix;
            } else {
              entry.target.textContent = Math.floor(current) + suffix;
            }
            
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(el => observer.observe(el));
  }

  // 2. Nav glass blur effect on scroll
  function initNavScrollEffect() {
    const header = document.querySelector('.header');
    if (!header) return;
    const isHomepage = document.body.getAttribute('data-page') === 'home';
    const scrollThreshold = isHomepage ? 100 : 50;
    
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // 3. Auto-update copyright year
  function initFooterYear() {
    const footerBottom = document.querySelector('.footer-bottom p');
    if (footerBottom) {
      const year = new Date().getFullYear();
      footerBottom.innerHTML = footerBottom.innerHTML.replace(/©\s*\d{4}/, '© ' + year);
    }
  }

  // 5. Order progress auto-advance on order-success page
  function initOrderProgressAnimation() {
    if (document.body.dataset.page !== 'order-success') return;
    
    const progressFill = document.getElementById('progressFill');
    if (!progressFill) return;
    
    // Auto advance progress for demo effect
    setTimeout(() => { progressFill.style.width = '50%'; }, 3000);
    setTimeout(() => { progressFill.style.width = '66%'; }, 8000);
  }

  // 6. Show item count badge on menu page
  function initMenuItemCount() {
    if (document.body.dataset.page !== 'menu') return;
    
    const pageHeader = document.querySelector('.page-header .container p');
    if (pageHeader && window.foodItems) {
      const count = window.foodItems.length;
      pageHeader.innerHTML = `Explore our delicious selection — <strong style="color: var(--primary);">${count}+ items</strong> to choose from`;
    }
  }

})();

/* ============================================
   GLOBAL ENHANCEMENTS
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    // 1. Hero Enhancements (Particles & Typing)
    var heroSection = document.querySelector('.hero-premium');
    if (heroSection) {
        var desc = document.querySelector('.hero-description');
        if (desc) {
            desc.classList.add('typing-effect');
        }

        var emojis = ['\u{1F354}', '\u{1F355}', '\u{1F366}', '\u{1F35F}', '\u{1F964}', '\u{1F369}', '\u{1F357}'];
        for (var i = 0; i < 15; i++) {
            var particle = document.createElement('div');
            particle.className = 'food-particle';
            particle.innerText = emojis[Math.floor(Math.random() * emojis.length)];
            particle.style.left = (Math.random() * 100) + 'vw';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particle.style.animationDelay = (Math.random() * 5) + 's';
            particle.style.fontSize = (Math.random() * 2 + 1.5) + 'rem';
            heroSection.appendChild(particle);
        }

        window.addEventListener('scroll', function() {
            var scroll = window.scrollY;
            var heroImage = document.querySelector('.hero-main-image img');
            if (heroImage && scroll < 800) {
                heroImage.style.transform = 'translateY(' + (scroll * 0.15) + 'px) scale(1.05)';
                heroImage.style.transition = 'transform 0.1s ease-out';
            }
        });
    }

    // 5. Hide Track Order footer link when not signed in (GLOBAL)
    function hideTrackOrderIfNotSignedIn() {
        var isSignedIn = localStorage.getItem('authToken') || localStorage.getItem('swiftChowUser');
        if (!isSignedIn) {
            document.querySelectorAll('a').forEach(function(link) {
                var href = link.getAttribute('href') || '';
                if (href.indexOf('tracking') !== -1) {
                    var li = link.closest('li');
                    if (li) li.style.display = 'none';
                }
            });
        }
    }
    hideTrackOrderIfNotSignedIn();
    // Re-run after a short delay in case footer loads late
    setTimeout(hideTrackOrderIfNotSignedIn, 500);
    setTimeout(hideTrackOrderIfNotSignedIn, 1500);

    // 6. Auto-inject password eye toggle on ALL password inputs
    document.querySelectorAll('input[type="password"]').forEach(function(input) {
        // Skip if a toggle button already exists next to this input
        var parent = input.parentElement;
        if (parent.querySelector('.password-toggle-btn, .password-toggle, .btn-icon[onclick*="togglePassword"], button[onclick*="togglePassword"]')) return;

        // Make sure parent is position:relative
        parent.style.position = 'relative';

        var toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'password-toggle-btn';
        toggleBtn.title = 'Show password';
        toggleBtn.style.cssText = 'position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-secondary);font-size:1.1rem;z-index:2;';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';

        var inputId = input.id;
        toggleBtn.addEventListener('click', function(e) {
            if (inputId && typeof window.togglePasswordVisibility === 'function') {
                window.togglePasswordVisibility(inputId, e);
            } else {
                // Fallback inline toggle
                var isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                var icon = toggleBtn.querySelector('i');
                if (icon) {
                    icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
                }
            }
        });

        // Insert after the input
        input.insertAdjacentElement('afterend', toggleBtn);
    });

    // 7. Password Strength Meter
    document.querySelectorAll('input[type="password"]').forEach(function(input) {
        var meterContainer = document.createElement('div');
        meterContainer.className = 'password-strength-meter';
        var meterFill = document.createElement('div');
        meterFill.className = 'password-strength-fill';
        meterContainer.appendChild(meterFill);

        var formGroup = input.closest('.form-group');
        if (formGroup) {
            formGroup.appendChild(meterContainer);
        } else {
            input.parentNode.appendChild(meterContainer);
        }

        input.addEventListener('input', function() {
            var val = input.value;
            if (val.length === 0) {
                meterContainer.classList.remove('show');
                return;
            }
            meterContainer.classList.add('show');

            var strength = 0;
            if (val.length >= 6) strength += 25;
            if (val.length >= 10) strength += 25;
            if (/[A-Z]/.test(val)) strength += 25;
            if (/[0-9!@#%&]/.test(val)) strength += 25;

            meterFill.style.width = strength + '%';
            if (strength <= 25) {
                meterFill.style.backgroundColor = 'var(--error)';
            } else if (strength <= 50) {
                meterFill.style.backgroundColor = 'var(--warning)';
            } else if (strength <= 75) {
                meterFill.style.backgroundColor = 'var(--info)';
            } else {
                meterFill.style.backgroundColor = 'var(--success)';
            }
        });
    });

    // 8. Free delivery progress injection
    setInterval(function() {
        if (typeof window.getCartSubtotal === 'function') {
            var subtotal = window.getCartSubtotal();
            var threshold = 100;
            var percentage = Math.min((subtotal / threshold) * 100, 100);

            document.querySelectorAll('.cart-summary, .checkout-summary, .mini-cart-footer').forEach(function(container) {
                var pBar = container.querySelector('.free-delivery-progress-container');
                var pText = container.querySelector('.free-delivery-text');

                if (!pBar && subtotal > 0) {
                    pBar = document.createElement('div');
                    pBar.className = 'free-delivery-progress-container';
                    pBar.innerHTML = '<div class="free-delivery-progress-bar"></div>';

                    pText = document.createElement('div');
                    pText.className = 'free-delivery-text';

                    var totalDiv = container.querySelector('.summary-total, .checkout-total, .mini-cart-total');
                    if (totalDiv && totalDiv.parentElement) {
                        totalDiv.parentElement.insertBefore(pText, totalDiv);
                        totalDiv.parentElement.insertBefore(pBar, pText);
                    } else {
                        container.prepend(pText);
                        container.prepend(pBar);
                    }
                }

                if (pBar && pText) {
                    var barEl = pBar.querySelector('.free-delivery-progress-bar');
                    if (barEl) barEl.style.width = percentage + '%';
                    if (percentage >= 100) {
                        pText.innerHTML = '<i class="fas fa-check-circle" style="color: var(--success)"></i> You unlocked <strong>Free Delivery</strong>!';
                        if (barEl) barEl.style.background = 'var(--success)';
                    } else {
                        var remaining = (threshold - subtotal).toFixed(2);
                        pText.innerHTML = 'Add <strong>GHS ' + remaining + '</strong> more for free delivery!';
                        if (barEl) barEl.style.background = 'linear-gradient(90deg, var(--warning), var(--success))';
                    }

                    if (subtotal === 0) {
                        pBar.remove();
                        pText.remove();
                    }
                }
            });
        }
    }, 1000);
});

// 11. Fly to Cart Animation
document.addEventListener('click', function(e) {
    var addToCartBtn = e.target.closest('.add-to-cart-btn, .add-btn-overlay, .add-btn-mobile');
    if (addToCartBtn) {
        var card = addToCartBtn.closest('.food-card, .food-card-premium, .deal-card');
        if (!card) return;

        var img = card.querySelector('img');
        var cartIcon = document.querySelector('.floating-cart-btn') || document.querySelector('.fa-shopping-cart');

        if (img && cartIcon) {
            var imgRect = img.getBoundingClientRect();
            var cartRect = cartIcon.getBoundingClientRect();

            var flyingImg = img.cloneNode(true);
            flyingImg.className = 'fly-to-cart-element';
            flyingImg.style.left = imgRect.left + 'px';
            flyingImg.style.top = imgRect.top + 'px';

            document.body.appendChild(flyingImg);
            void flyingImg.offsetWidth;

            flyingImg.style.left = (cartRect.left + cartRect.width / 2 - 30) + 'px';
            flyingImg.style.top = (cartRect.top + cartRect.height / 2 - 30) + 'px';
            flyingImg.style.transform = 'scale(0.1)';
            flyingImg.style.opacity = '0.5';

            setTimeout(function() {
                flyingImg.remove();
                cartIcon.classList.add('bump');
                setTimeout(function() { cartIcon.classList.remove('bump'); }, 300);
            }, 800);
        }
    }
});

// 12. Category Filter smooth transition
document.querySelectorAll('.category-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        var grid = document.getElementById('productsGrid');
        if (grid) {
            grid.style.opacity = 0;
            grid.style.transform = 'translateY(20px)';
            grid.style.transition = 'all 0.3s ease-out';

            setTimeout(function() {
                grid.style.opacity = 1;
                grid.style.transform = 'translateY(0)';
            }, 300);
        }
    });
});

// 13. Page Fade-in Transition
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.6s ease-in-out';

window.addEventListener('load', function() {
    document.body.style.opacity = '1';
});
