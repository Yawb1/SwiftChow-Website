/* ============================================
   SWIFT CHOW - Main JavaScript
   Core functionality and UI interactions
   ============================================ */

// ============================================
// CLEAN .html FROM URLs (Pretty URLs)
// ============================================
(function() {
  const path = window.location.pathname;
  if (path.endsWith('.html') && path !== '/index.html') {
    const cleanPath = path.replace(/\.html$/, '');
    window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
  } else if (path === '/index.html') {
    window.history.replaceState(null, '', '/' + window.location.search + window.location.hash);
  }
})();

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
  const icons = document.querySelectorAll('.dark-mode-toggle i, .dark-mode-toggle svg');
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
  
  menuBtn.addEventListener('click', () => {
    const isOpen = menuBtn.classList.contains('active');
    
    menuBtn.classList.toggle('active');
    mobileNav.classList.toggle('active');
    body.classList.toggle('menu-open');
    
    // Animate hamburger
    menuBtn.setAttribute('aria-expanded', !isOpen);
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !mobileNav.contains(e.target)) {
      menuBtn.classList.remove('active');
      mobileNav.classList.remove('active');
      body.classList.remove('menu-open');
    }
  });
  
  // Close menu when clicking a link
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      mobileNav.classList.remove('active');
      body.classList.remove('menu-open');
    });
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      menuBtn.classList.remove('active');
      mobileNav.classList.remove('active');
      body.classList.remove('menu-open');
    }
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
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
  
  const totalDeals = 5; // Fixed number of deals in HTML or data
  
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
  
  container.innerHTML = items.map(item => `
    <article class="food-card" data-category="${item.category}" data-id="${item.id}">
      <div class="food-card-image">
        <img src="${item.image}" alt="${item.name}" loading="lazy" decoding="async" sizes="(max-width: 414px) 100vw, (max-width: 768px) 50vw, 33vw">
        ${item.isNew ? '<span class="food-card-badge badge-new">NEW</span>' : ''}
        ${item.isPopular ? '<span class="food-card-badge badge-popular">POPULAR</span>' : ''}
        <button class="food-card-wishlist" onclick="toggleWishlist(${item.id})" aria-label="Add to wishlist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      <div class="food-card-content">
        <span class="food-card-category">${item.category}</span>
        <h3 class="food-card-title">${item.name}</h3>
        <p class="food-card-desc">${item.description}</p>
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
  const container = document.querySelector('.blog-preview-grid');
  if (container) {
    renderBlogPosts(container, 3);
  }
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
    
    return `
      <div class="review-card animate-on-scroll">
        <div class="review-header">
          <div class="review-user">
            <div class="review-avatar">${review.avatar || getInitial(name)}</div>
            <div class="review-user-info">
              <h4 class="review-name">${name}</h4>
              ${review.location ? `<span class="review-location">${review.location}</span>` : ''}
            </div>
          </div>
          <div class="review-rating">
            <div class="stars-display">
              ${renderStarRating(rating)}
              <span class="rating-number">${rating}</span>
            </div>
          </div>
        </div>
        <p class="review-comment">${comment}</p>
        <div class="review-footer">
          <span class="review-date">${date}</span>
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
        console.log('Star rating selected:', selectedRating);
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
      
      // Send confirmation email
      try {
        await fetch('/api/send-review-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            rating,
            comment,
            date: newReview.date
          })
        });
      } catch (emailError) {
        console.warn('Could not send confirmation email:', emailError);
        // Don't block the submission if email fails
      }
      
      console.log('Review submitted:', newReview);
      showAdvancedToast('Thank you! Your review has been submitted. A confirmation email has been sent.', 'success');
      
      // Reset form
      reviewForm.reset();
      const starIcons = document.querySelectorAll('.star-rating-input i');
      starIcons.forEach(star => {
        star.classList.remove('fas');
        star.classList.add('far');
      });
      document.querySelector('.star-rating-input').dataset.rating = '0';
      
      // Refresh reviews display
      setTimeout(() => {
        if (typeof renderReviews === 'function') {
          renderReviews();
        }
      }, 500);
    } catch (error) {
      console.error('Error submitting review:', error);
      showAdvancedToast('Error submitting review. Please try again.', 'error');
    }
  });
}

// ============================================
// FORM VALIDATION
// ============================================

function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');
  
  // Clear previous errors
  form.querySelectorAll('.error-message').forEach(el => el.remove());
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      showFieldError(field, 'This field is required');
    }
    
    // Email validation
    if (field.type === 'email' && field.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        isValid = false;
        showFieldError(field, 'Please enter a valid email');
      }
    }
    
    // Phone validation
    if (field.type === 'tel' && field.value) {
      const phoneRegex = /^[\d\s+()-]{10,}$/;
      if (!phoneRegex.test(field.value)) {
        isValid = false;
        showFieldError(field, 'Please enter a valid phone number');
      }
    }
  });
  
  return isValid;
}

function showFieldError(field, message) {
  field.classList.add('error');
  const error = document.createElement('span');
  error.className = 'error-message';
  error.textContent = message;
  field.parentElement.appendChild(error);
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
    
    if (!validateForm(form)) {
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
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add shadow to header on scroll
    if (header) {
      if (currentScroll > 10) {
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
    
    if (!validateForm(form)) {
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
    if (selectedPaymentMethod === 'cod') {
      // Pay on Delivery - process immediately (async)
      processOrder(orderData).then(order => {
        if (order && order.id) {
          console.log('✅ Redirecting to order success with orderId:', order.id);
          window.location.href = `order-success.html?order=${order.id}`;
        } else {
          showToast('Failed to create order. Please try again.', 'error');
        }
      }).catch(error => {
        console.error('Order processing error:', error);
        showToast('Error creating order: ' + error.message, 'error');
      });
    } else if (selectedPaymentMethod === 'momo' || selectedPaymentMethod === 'card') {
      // Mobile Money or Card - show payment modal
      showPaymentModal(orderData);
    }
  });
}

function getDeliveryFee(city) {
  if (typeof ghanaCities === 'undefined') return 15;
  const cityData = ghanaCities.find(c => c.name === city);
  return cityData ? cityData.deliveryFee : 15;
}

// Payment Modal Handler
function showPaymentModal(orderData) {
  const paymentType = orderData.paymentMethod === 'momo' ? 'Mobile Money' : 'Card';
  
  const modal = document.createElement('div');
  modal.id = 'paymentModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
  `;
  
  const getPaymentFields = () => {
    if (orderData.paymentMethod === 'momo') {
      return `
        <div class="form-group">
          <label for="momoProvider">Provider *</label>
          <select id="momoProvider" name="momoProvider" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; font-family: inherit;">
            <option value="">Select Provider</option>
            <option value="mtn">MTN Mobile Money</option>
            <option value="vodafone">Vodafone Cash</option>
            <option value="airteltigo">AirtelTigo Money</option>
          </select>
        </div>
        <div class="form-group">
          <label for="momoNumber">Mobile Number *</label>
          <input type="tel" id="momoNumber" name="momoNumber" placeholder="0501234567" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; font-family: inherit; box-sizing: border-box;">
        </div>
        <div style="background: rgba(59, 130, 246, 0.1); padding: 0.75rem; border-radius: 0.5rem; margin-top: 1rem; border-left: 4px solid #3B82F6;">
          <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary);"><i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>You will receive a payment prompt on your phone to complete the transaction.</p>
        </div>
      `;
    } else {
      return `
        <div class="form-group">
          <label for="cardName">Cardholder Name *</label>
          <input type="text" id="cardName" name="cardName" placeholder="Full name on card" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; font-family: inherit; box-sizing: border-box;">
        </div>
        <div class="form-group">
          <label for="cardNumber">Card Number *</label>
          <input type="text" id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; font-family: inherit; box-sizing: border-box;">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label for="cardExpiry">Expiry Date *</label>
            <input type="text" id="cardExpiry" name="cardExpiry" placeholder="MM/YY" maxlength="5" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; font-family: inherit; box-sizing: border-box;">
          </div>
          <div class="form-group">
            <label for="cardCVV">CVV *</label>
            <input type="text" id="cardCVV" name="cardCVV" placeholder="123" maxlength="3" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; font-family: inherit; box-sizing: border-box;">
          </div>
        </div>
      `;
    }
  };
  
  modalContent.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
      <h2 style="margin: 0; font-size: 1.5rem; color: var(--text-primary);"><i class="fas fa-${orderData.paymentMethod === 'momo' ? 'mobile-alt' : 'credit-card'}"></i> ${paymentType} Payment</h2>
      <button onclick="document.getElementById('paymentModal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-secondary);">&times;</button>
    </div>
    
    <div style="background: rgba(220, 38, 38, 0.05); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; border-left: 4px solid var(--primary);">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="color: var(--text-secondary);">Total Amount:</span>
        <span style="font-weight: 700; font-size: 1.1rem; color: var(--primary);">GHS ${parseFloat(orderData.deliveryFee || 0).toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: var(--text-secondary);">Delivery Location:</span>
        <span style="font-weight: 600;">${orderData.city}</span>
      </div>
    </div>
    
    <form id="paymentForm" style="display: flex; flex-direction: column; gap: 1rem;">
      ${getPaymentFields()}
      <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
        <button type="button" onclick="document.getElementById('paymentModal').remove()" class="btn btn-outline" style="flex: 1;">Cancel</button>
        <button type="submit" class="btn btn-primary" style="flex: 1;">Confirm Payment</button>
      </div>
    </form>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Handle form submission
  document.getElementById('paymentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Show processing message
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Processing...';
    
    // Process payment and create order (async)
    setTimeout(() => {
      processOrder(orderData).then(order => {
        document.getElementById('paymentModal').remove();
        
        if (order && order.id) {
          showToast('Payment successful! Order confirmed.', 'success');
          setTimeout(() => {
            console.log('✅ Redirecting to order success with orderId:', order.id);
            window.location.href = `order-success.html?order=${order.id}`;
          }, 1000);
        } else {
          btn.disabled = false;
          btn.textContent = originalText;
          showToast('Failed to create order. Please try again.', 'error');
        }
      }).catch(error => {
        document.getElementById('paymentModal').remove();
        btn.disabled = false;
        btn.textContent = originalText;
        console.error('Order processing error:', error);
        showToast('Error creating order: ' + error.message, 'error');
      });
    }, 2000);
  });
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
  console.log('🔍 displayOrderTracking called with orderId:', orderId);
  
  // First, try to fetch from API (database)
  let order = null;
  
  const fetchAndDisplay = async () => {
    try {
      console.log('📍 fetchAndDisplay started, authenticated:', isAuthenticated());
      
      // Try to fetch from API if user is authenticated
      if (isAuthenticated() && typeof apiGetOrder === 'function') {
        try {
          console.log('📡 Fetching order from API:', orderId);
          const response = await apiGetOrder(orderId);
          console.log('📦 API Response:', response);
          
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
            console.log('✅ Order fetched from API:', order);
          } else {
            console.warn('⚠️ API response invalid:', { success: response?.success, hasOrder: !!response?.order });
          }
        } catch (apiError) {
          console.warn('❌ API fetch failed, checking localStorage:', apiError.message);
          order = getOrderById(orderId);
          console.log('📦 Order from localStorage:', order);
        }
      } else {
        // Fallback to localStorage if not authenticated
        console.log('📌 Not authenticated or apiGetOrder not available, using localStorage');
        order = getOrderById(orderId);
        console.log('📦 Order from localStorage:', order);
      }
      
      console.log('🎯 About to display UI with order:', order);
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
            console.log('Fetching success page order from API:', orderId);
            const response = await apiGetOrder(orderId);
            
            if (response && response.success && response.order) {
              order = {
                id: response.order.orderId || response.order._id,
                items: response.order.items,
                total: response.order.total,
                subtotal: response.order.subtotal,
                deliveryFee: response.order.deliveryFee
              };
              console.log('✅ Order fetched from API for success page');
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
      console.log('Nav UI: User found:', currentUser.email);
    } catch (e) {
      console.error('Nav UI: Error parsing user:', e);
      currentUser = null;
    }
  } else {
    console.log('Nav UI: No user logged in');
  }
  
  // Find login buttons and user menu elements
  const loginBtns = document.querySelectorAll('#loginBtn, .nav-login-btn');
  console.log('updateNavAuthUI: Found', loginBtns.length, 'login buttons');
  
  const userMenus = document.querySelectorAll('.nav-user-menu');
  const navActions = document.querySelectorAll('.nav-actions');
  
  console.log('updateNavAuthUI: Found', navActions.length, 'nav-actions');
  
  navActions.forEach((navAction, index) => {
    console.log('updateNavAuthUI: Processing nav-action', index);
    
    // Check if already has user menu
    let userMenu = navAction.querySelector('.nav-user-dropdown');
    let loginBtn = navAction.querySelector('#loginBtn, .nav-login-btn');
    let userProfile = navAction.querySelector('.user-profile');
    
    console.log('  - Found loginBtn:', !!loginBtn);
    console.log('  - Found userMenu:', !!userMenu);
    console.log('  - Found userProfile:', !!userProfile);
    
    if (currentUser) {
      // User is logged in - hide login button
      console.log('  - User logged in, hiding button');
      if (loginBtn) {
        loginBtn.style.display = 'none';
        console.log('  - Button hidden');
      }
      
      // Avatar is now handled by updateAuthUI() function instead
      // Skip creating nav-user-dropdown here
      
    } else {
      // User is not logged in - show login button and remove avatar
      console.log('  - User not logged in, preparing to show button');
      
      if (userMenu) {
        console.log('  - Removing old userMenu');
        userMenu.remove();
      }
      if (userProfile) {
        console.log('  - Removing old userProfile');
        userProfile.remove();
      }
      
      if (loginBtn) {
        console.log('  - Found loginBtn, showing it');
        loginBtn.style.display = 'inline-flex';
        loginBtn.style.visibility = 'visible';
        loginBtn.style.opacity = '1';
        
        // Re-attach click handler to existing button
        loginBtn.onclick = function(e) {
          console.log('  - loginBtn onclick triggered');
          e.preventDefault();
          e.stopPropagation();
          const loginModal = document.getElementById('loginModal');
          if (loginModal) {
            console.log('  - Opening login modal via openModal');
            openModal(loginModal);
          } else {
            console.warn('  - Login modal not found, redirecting to login page');
            window.location.href = 'login.html';
          }
        };
        
        console.log('  - Button is now visible with handlers attached');
      } else {
        console.log('  - loginBtn not found, creating one');
        // If login button doesn't exist, create it
        const newLoginBtn = document.createElement('button');
        newLoginBtn.id = 'loginBtn';
        newLoginBtn.className = 'btn btn-primary btn-sm';
        newLoginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
        newLoginBtn.onclick = function(e) {
          console.log('  - NEW loginBtn onclick triggered');
          e.preventDefault();
          const loginModal = document.getElementById('loginModal');
          if (loginModal) {
            console.log('  - Opening login modal from NEW button');
            openModal(loginModal);
          } else {
            console.warn('  - Login modal not found from NEW button, redirecting to login page');
            window.location.href = 'login.html';
          }
        };
        
        const mobileMenuBtn = navAction.querySelector('.mobile-menu-btn');
        if (mobileMenuBtn) {
          navAction.insertBefore(newLoginBtn, mobileMenuBtn);
          console.log('  - NEW button created and inserted');
        } else {
          navAction.appendChild(newLoginBtn);
          console.log('  - NEW button created and appended');
        }
      }
    }
  });
  
  console.log('=== updateNavAuthUI complete ===');
}

function toggleUserMenu(btn) {
  const menu = btn.nextElementSibling;
  menu.classList.toggle('show');
  
  // Close when clicking outside
  document.addEventListener('click', function closeMenu(e) {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('show');
      document.removeEventListener('click', closeMenu);
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
    console.log('=== Page initialization started for page:', page, '===');
    
    // Page-specific initialization - with try-catch for each
    try {
      switch (page) {
        case 'home':
          console.log('Initializing HOME page - carousel will load');
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
  
  addressesContainer.innerHTML = user.addresses.map((addr, idx) => `
    <div class="address-card" style="padding: 1.5rem; border: 1px solid var(--border-color); border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
        <div>
          <h4 style="margin: 0 0 0.5rem 0; text-transform: capitalize;">${addr.type}</h4>
          <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">${addr.street}, ${addr.city}</p>
          <p style="margin: 0; color: var(--text-secondary); font-size: 0.85rem;">${addr.postalCode}, ${addr.country}</p>
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
          ${payment.type === 'card' ? 'Card ending in ' + payment.lastFour : payment.type === 'momo' ? payment.network + ' ' + payment.lastFour : 'Bank Account'}
        </h4>
        <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">${payment.cardholderName}</p>
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
      console.log('API orders fetch failed, falling back to localStorage');
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
    const status = (order.status || 'confirmed').toLowerCase();
    const statusLabels = { confirmed: 'Confirmed', preparing: 'Preparing', 'on-the-way': 'On the Way', delivered: 'Delivered', cancelled: 'Cancelled' };
    const statusLabel = statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);
    const statusColors = { confirmed: '#3b82f6', preparing: '#f59e0b', 'on-the-way': '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444' };
    const statusColor = statusColors[status] || 'var(--primary)';
    const statusIcons = { confirmed: 'check-circle', preparing: 'fire', 'on-the-way': 'motorcycle', delivered: 'check-double', cancelled: 'times-circle' };
    const statusIcon = statusIcons[status] || 'circle';
    const items = order.items || [];
    const total = order.total || 0;
    const itemNames = items.slice(0, 3).map(i => i.name).join(', ');
    const moreItems = items.length > 3 ? ` +${items.length - 3} more` : '';
    
    return `
      <div class="order-card" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 1rem; padding: 1.25rem; margin-bottom: 1rem; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <div>
            <h4 style="font-size: 1rem; font-weight: 700; margin: 0 0 0.25rem 0; color: var(--text-primary);">${orderId}</h4>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;"><i class="fas fa-calendar-alt" style="margin-right: 0.25rem;"></i>${dateStr} at ${timeStr}</p>
          </div>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.75rem; border-radius: 2rem; font-size: 0.75rem; font-weight: 600; background: ${statusColor}15; color: ${statusColor}; border: 1px solid ${statusColor}30;">
            <i class="fas fa-${statusIcon}"></i> ${statusLabel}
          </span>
        </div>
        <div style="padding: 0.5rem 0; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); margin-bottom: 0.75rem;">
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.25rem 0;"><i class="fas fa-shopping-bag" style="color: var(--primary); margin-right: 0.35rem; width: 14px;"></i>${itemNames}${moreItems}</p>
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
        
        user.password = newPassword; // In production, hash this!
        localStorage.setItem('swiftChowUser', JSON.stringify(user));
        
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
        const finalConfirm = confirm('This will delete your account permanently. Type DELETE to confirm.');
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
    
    // Clear all user data
    localStorage.removeItem('swiftChowUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('swiftChowCart');
    
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

// ============================================
// BACK TO TOP
// ============================================
function initBackToTop() {
  // Create button if it doesn't exist
  if (!document.getElementById('back-to-top')) {
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>`;
    document.body.appendChild(btn);
    
    // Add click event
    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Handle scroll
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });
}

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
      initBackToTop();
    } catch (e) {
      console.warn('Error in initBackToTop:', e);
    }
    
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

// Also try to initialize immediately if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(() => {
    try {
      init();
      initBackToTop();
      initAccountNavigation();
      initTrackingNavigation();
      initEnhancements();
    } catch (e) {
      console.error('Error in immediate init:', e);
    }
  }, 1);
}

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
  
  toast.innerHTML = `
    <i class="toast-icon ${iconMap[type]}"></i>
    <span class="toast-message">${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('hidden');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function initScrollAnimations() {
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
  
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// ============================================
// ANIMATED COUNTERS
// ============================================

function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.textContent = target + (element.textContent.includes('+') ? '+' : '');
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(start) + (element.textContent.includes('+') ? '+' : '');
    }
  }, 16);
}

function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        const target = parseInt(entry.target.textContent) || 100;
        animateCounter(entry.target, target);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => counterObserver.observe(counter));
}

// ============================================
// FORM VALIDATION
// ============================================

function validateForm(form) {
  let isValid = true;
  
  form.querySelectorAll('input, textarea, select').forEach(field => {
    const value = field.value.trim();
    const type = field.type;
    const name = field.name;
    const parentGroup = field.closest('.form-group');
    
    // Reset state
    parentGroup.classList.remove('has-error', 'has-success');
    const feedback = parentGroup.querySelector('.form-feedback');
    if (feedback) feedback.textContent = '';
    
    // Validation rules
    let isFieldValid = true;
    let errorMessage = '';
    
    if (!value && field.hasAttribute('required')) {
      isFieldValid = false;
      errorMessage = `${name} is required`;
    } else if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isFieldValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    } else if (type === 'tel' && value) {
      const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
      if (!phoneRegex.test(value)) {
        isFieldValid = false;
        errorMessage = 'Please enter a valid phone number';
      }
    } else if (type === 'password' && value) {
      if (value.length < 6) {
        isFieldValid = false;
        errorMessage = 'Password must be at least 6 characters';
      }
    }
    
    if (isFieldValid) {
      parentGroup.classList.add('has-success');
      if (feedback) {
        feedback.innerHTML = '<i class="fas fa-check-circle form-feedback-icon"></i>Looks good!';
        feedback.classList.remove('error');
        feedback.classList.add('success');
      }
    } else {
      parentGroup.classList.add('has-error');
      if (feedback) {
        feedback.innerHTML = `<i class="fas fa-exclamation-circle form-feedback-icon"></i>${errorMessage}`;
        feedback.classList.remove('success');
        feedback.classList.add('error');
      }
      isValid = false;
    }
  });
  
  return isValid;
}

function initFormValidation() {
  document.querySelectorAll('form').forEach(form => {
    // Real-time validation
    form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('blur', () => {
        validateForm(form);
      });
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
      if (!validateForm(form)) {
        e.preventDefault();
        showAdvancedToast('Please fix the errors in the form', 'error');
      }
    });
  });
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
      
      console.log('Login form submitted:', { email, password: password ? '***' : 'missing', remember });
      
      if (email && password) {
        const result = await login(email, password, remember);
        console.log('Login result:', result);
        
        if (result.success) {
          showAdvancedToast('Login successful! Welcome back!', 'success');
          closeModal(loginModal);
          loginForm.reset();
          updateAuthUI();
          updateNavAuthUI();
          setTimeout(() => location.reload(), 1000);
        } else {
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
  console.log('Setting up signup form handler. signupForm found:', !!signupForm);
  
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Signup form submitted!');
      
      const fullName = signupForm.querySelector('#signup-fullname')?.value || signupForm.querySelector('input[name="fullName"]')?.value;
      const email = signupForm.querySelector('#signup-email')?.value || signupForm.querySelector('input[name="email"]')?.value;
      const phone = signupForm.querySelector('#signup-phone')?.value || signupForm.querySelector('input[name="phone"]')?.value;
      const password = signupForm.querySelector('#signup-password')?.value || signupForm.querySelector('input[name="password"]')?.value;
      const confirmPassword = signupForm.querySelector('#signup-confirm')?.value || signupForm.querySelector('input[name="confirmPassword"]')?.value;
      const terms = signupForm.querySelector('input[name="terms"]')?.checked;
      
      console.log('Signup form values:', { fullName, email, phone, passwordLength: password?.length, confirmPasswordLength: confirmPassword?.length, terms });
      
      if (!fullName || !email || !phone || !password || !confirmPassword || !terms) {
        console.error('Signup validation failed. Missing:', { fullName: !fullName, email: !email, phone: !phone, password: !password, confirmPassword: !confirmPassword, terms: !terms });
        showAdvancedToast('Please fill in all fields and accept terms', 'error');
        return;
      }
      
      console.log('Signup validation passed, calling register()...');
      const result = await register(fullName, email, phone, password, confirmPassword);
      console.log('Register result:', result);
      
      if (result.success) {
        showAdvancedToast('Account created! Welcome to SWIFT CHOW!', 'success');
        closeModal(signupModal);
        signupForm.reset();
        updateAuthUI();
        updateNavAuthUI();
        setTimeout(() => location.reload(), 1000);
      } else {
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
          <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 0.5rem; flex-shrink: 0;" loading="lazy" decoding="async">
          <div style="flex: 1; min-width: 0;">
            <h4 style="margin: 0 0 0.15rem 0; font-size: 0.9rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</h4>
            <p style="margin: 0 0 0.4rem 0; font-size: 0.8rem; color: var(--text-secondary);">GHS ${item.price.toFixed(2)} each</p>
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <button class="btn btn-sm" style="padding: 0.15rem 0.45rem; font-size: 0.8rem; border-radius: 0.35rem; line-height: 1;" onclick="decrementQuantity(${item.id})">−</button>
              <span style="width: 24px; text-align: center; font-weight: 600; font-size: 0.85rem;">${item.quantity}</span>
              <button class="btn btn-sm" style="padding: 0.15rem 0.45rem; font-size: 0.8rem; border-radius: 0.35rem; line-height: 1;" onclick="incrementQuantity(${item.id})">+</button>
              <button class="btn btn-sm" style="padding: 0.15rem 0.45rem; font-size: 0.8rem; margin-left: auto; color: #dc2626; border-radius: 0.35rem;" onclick="removeFromCart(${item.id})" title="Remove"><i class="fas fa-trash-alt"></i></button>
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
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modal) {
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// ============================================
// USER AUTHENTICATION UI
// ============================================

function updateAuthUI() {
  const user = getCurrentUser();
  const navActions = document.querySelector('.nav-actions');
  
  if (!navActions) {
    console.log('updateAuthUI: nav-actions not found, retrying in 100ms...');
    // Retry after a brief delay in case page is still loading
    setTimeout(() => updateAuthUI(), 100);
    return;
  }
  
  console.log('updateAuthUI: Processing user state', user ? user.email : 'not logged in');
  
  // Remove old avatar
  const oldUserProfile = navActions.querySelector('.user-profile');
  if (oldUserProfile) {
    console.log('updateAuthUI: Removing old avatar');
    oldUserProfile.remove();
  }
  
  // Check if user is logged in - trust currentUser if it exists, or check token
  const isUserLoggedIn = user || isLoggedIn();
  
  if (isUserLoggedIn) {
    console.log('updateAuthUI: User is logged in, showing avatar');
    
    // Hide login button when user is logged in
    const loginBtn = navActions.querySelector('#loginBtn');
    if (loginBtn) {
      loginBtn.style.display = 'none';
      console.log('updateAuthUI: Login button hidden');
    }
    
    // If user object is null but authenticated, use token to proceed
    if (!user) {
      console.log('updateAuthUI: User object is null but authenticated. Showing generic avatar.');
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
          min-width: 250px;
          z-index: 10000;
          overflow: hidden;
        ">
          <div style="padding: 1rem; border-bottom: 1px solid var(--border-color);">
            <p style="margin: 0; font-weight: 600; color: var(--text-primary);">${userName}</p>
            <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: var(--text-secondary);">${user && user.email ? user.email : 'User'}</p>
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
    console.log('updateAuthUI: User is NOT logged in');
    
    // Show login button when user is not logged in
    const loginBtn = navActions.querySelector('#loginBtn');
    if (loginBtn) {
      loginBtn.style.display = 'inline-flex';
      console.log('updateAuthUI: Login button shown');
    }
  }
}

function generateUserColor(email) {
  const colors = [
    { light: '#fee2e2', dark: '#fca5a5' },
    { light: '#ccfbf1', dark: '#67e8f9' },
    { light: '#dbeafe', dark: '#7dd3fc' },
    { light: '#fef3c7', dark: '#fcd34d' },
    { light: '#f3e8ff', dark: '#d8b4fe' },
    { light: '#fce7f3', dark: '#f472b6' },
    { light: '#dcfce7', dark: '#86efac' },
    { light: '#fae8ff', dark: '#e9d5ff' }
  ];
  const index = email.charCodeAt(0) % colors.length;
  return colors[index];
}

// Social login handlers
function googleLogin() {
  showAdvancedToast('Google login demo - using demo credentials', 'info');
  const email = 'demo.google@swift.com';
  const password = 'demo1234';
  if (login(email, password)) {
    const loginModal = document.getElementById('loginModal');
    closeModal(loginModal);
    setTimeout(() => updateAuthUI(), 100);
  }
}

function facebookLogin() {
  showAdvancedToast('Facebook login demo - using demo credentials', 'info');
  const email = 'demo.facebook@swift.com';
  const password = 'demo1234';
  if (login(email, password)) {
    const loginModal = document.getElementById('loginModal');
    closeModal(loginModal);
    setTimeout(() => updateAuthUI(), 100);
  }
}

function googleSignup() {
  // Use real Google OAuth flow for signup (same as login)
  googleSignIn();
}

function facebookSignup() {
  // Use real Facebook OAuth flow for signup (same as login)
  facebookSignIn();
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
  // Update cart modal when localStorage changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'swiftChowCart') {
      updateCartModal();
    }
  });
  
  // Also hook into saveCart to update modal
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    originalSetItem.call(this, key, value);
    if (key === 'swiftChowCart') {
      updateCartModal();
    }
  };
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
  
  console.log('Newsletter signup:', email);
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
  initScrollAnimations();
  initCounters();
  initLightbox();
  // initFloatingActionButton(); // Disabled
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
// FORM VALIDATION & FEEDBACK
// ============================================
function setupFormValidation() {
  const forms = document.querySelectorAll('form');
  
  if (!forms || forms.length === 0) return;
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      // Real-time validation
      input.addEventListener('blur', () => {
        try {
          validateField(input);
        } catch (e) {
          console.warn('Error validating field:', e);
        }
      });
      input.addEventListener('change', () => {
        try {
          validateField(input);
        } catch (e) {
          console.warn('Error validating field:', e);
        }
      });
      
      // Clear error on input
      input.addEventListener('input', () => {
        try {
          const feedback = input.parentElement.querySelector('.form-feedback.error');
          if (feedback) {
            feedback.style.display = 'none';
          }
        } catch (e) {
          console.warn('Error clearing feedback:', e);
        }
      });
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
      try {
        const isValid = validateForm(form);
        if (!isValid) {
          e.preventDefault();
        }
      } catch (e) {
        console.warn('Error validating form:', e);
      }
    });
  });
}

function validateField(input) {
  if (!input) return true;
  
  const value = input.value ? input.value.trim() : '';
  const type = input.type;
  const name = input.name;
  let isValid = true;
  let message = '';
  
  // Required validation
  if (input.hasAttribute('required') && !value) {
    isValid = false;
    message = 'This field is required';
  }
  
  // Email validation
  if (type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      message = 'Please enter a valid email address';
    }
  }
  
  // Password validation
  if (name === 'password' && value) {
    if (value.length < 6) {
      isValid = false;
      message = 'Password must be at least 6 characters';
    }
  }
  
  // Confirm password validation
  if (name === 'confirmPassword' && value) {
    const passwordField = input.form ? input.form.querySelector('input[name="password"]') : null;
    if (passwordField && value !== passwordField.value) {
      isValid = false;
      message = 'Passwords do not match';
    }
  }
  
  // Phone validation
  if (type === 'tel' && value) {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(value)) {
      isValid = false;
      message = 'Please enter a valid phone number';
    }
  }
  
  // Show/hide feedback
  if (input.parentElement) {
    const errorFeedback = input.parentElement.querySelector('.form-feedback.error');
    const successFeedback = input.parentElement.querySelector('.form-feedback.success');
    
    if (errorFeedback) {
      if (!isValid) {
        errorFeedback.textContent = message;
        errorFeedback.style.display = 'block';
      } else {
        errorFeedback.style.display = 'none';
      }
    }
    
    if (successFeedback) {
      if (isValid && value) {
        successFeedback.style.display = 'flex';
      } else {
        successFeedback.style.display = 'none';
      }
    }
  }
  
  return isValid;
}

function validateForm(form) {
  const inputs = form.querySelectorAll('input, textarea, select');
  let isFormValid = true;
  
  inputs.forEach(input => {
    if (!validateField(input)) {
      isFormValid = false;
    }
  });
  
  return isFormValid;
}

// ============================================
// PRODUCT SEARCH & FILTERING
// ============================================
function initProductSearch() {
  const searchInput = document.querySelector('.search-input');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productsGrid = document.querySelector('.products-grid');
  
  if (!searchInput || !productsGrid) return;
  
  let currentCategory = 'all';
  let searchTerm = '';
  
  // Search functionality
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase();
    filterProducts();
  });
  
  // Category filtering
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      filterProducts();
      
      // Show feedback
      showToast(`Showing ${currentCategory === 'all' ? 'all items' : currentCategory}`, 'info', 2000);
    });
  });
  
  function filterProducts() {
    const products = productsGrid.querySelectorAll('[data-product]');
    let visibleCount = 0;
    
    products.forEach(product => {
      const category = product.dataset.category;
      const name = product.dataset.product.toLowerCase();
      
      const matchesCategory = currentCategory === 'all' || category === currentCategory;
      const matchesSearch = name.includes(searchTerm);
      
      if (matchesCategory && matchesSearch) {
        product.style.display = '';
        product.style.animation = 'fadeInUp 0.3s ease';
        visibleCount++;
      } else {
        product.style.display = 'none';
      }
    });
    
    // Show no results message
    let noResults = productsGrid.querySelector('.no-results');
    if (visibleCount === 0) {
      if (!noResults) {
        noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
            <i class="fas fa-search" style="font-size: 2.5rem; opacity: 0.3; margin-bottom: 1rem;"></i>
            <p style="font-size: 1.1rem;">No products found matching your search</p>
            <button class="btn btn-secondary" onclick="document.querySelector('.search-input').value = ''; document.querySelector('.search-input').dispatchEvent(new Event('input'));" style="margin-top: 1rem;">
              Clear Search
            </button>
          </div>
        `;
        productsGrid.appendChild(noResults);
      }
    } else if (noResults) {
      noResults.remove();
    }
  }
}

// ============================================
// QUANTITY SELECTOR ENHANCEMENT
// ============================================
function setupQuantitySelectors() {
  const quantityControls = document.querySelectorAll('.quantity-control');
  
  quantityControls.forEach(control => {
    const input = control.querySelector('input[type="number"]');
    const minusBtn = control.querySelector('.qty-minus');
    const plusBtn = control.querySelector('.qty-plus');
    
    if (!input || !minusBtn || !plusBtn) return;
    
    minusBtn.addEventListener('click', () => {
      if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
        input.dispatchEvent(new Event('change'));
      }
    });
    
    plusBtn.addEventListener('click', () => {
      input.value = parseInt(input.value) + 1;
      input.dispatchEvent(new Event('change'));
    });
  });
}

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
// PAGE TRANSITION ANIMATIONS
// ============================================
function initPageTransitions() {
  // Disabled - was interfering with page navigation
  // This function was preventing proper page loads
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
        <div class="empty-state-message">We couldn't find any items matching "${query}"</div>
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
      <div class="products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;">
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
// NOTIFICATION ENHANCEMENTS
// ============================================

function createToastContainer() {
  if (!document.querySelector('.toast-container')) {
    const container = document.createElement('div');
    container.className = 'toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    `;
    document.body.appendChild(container);
  }
  return document.querySelector('.toast-container');
}

function showToastEnhanced(message, type = 'info', duration = 4000) {
  const container = createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.style.cssText = `
    padding: 16px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.4s ease, slideOut 0.4s ease ${duration}ms forwards;
  `;

  const icons = {
    success: '<i class="fas fa-check-circle"></i>',
    error: '<i class="fas fa-exclamation-circle"></i>',
    info: '<i class="fas fa-info-circle"></i>',
    warning: '<i class="fas fa-warning"></i>'
  };

  toast.innerHTML = `${icons[type] || icons.info} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration + 400);
}
// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

// Intersection Observer for lazy loading and scroll animations
if ('IntersectionObserver' in window) {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '50px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add animation class when element comes into view
        entry.target.classList.add('in-view');
        
        // Lazy load images if needed
        if (entry.target.dataset.src && !entry.target.src) {
          entry.target.src = entry.target.dataset.src;
        }
        
        // Stop observing once loaded
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with data-observe attribute
  document.querySelectorAll('[data-observe]').forEach(el => {
    observer.observe(el);
  });
}

// Performance API monitoring
if ('PerformanceObserver' in window) {
  try {
    const perfObserver = new PerformanceObserver((list) => {
      // Performance metrics available for debugging if needed
    });

    perfObserver.observe({ entryTypes: ['paint', 'navigation', 'largest-contentful-paint'] });
  } catch (e) {
    // Performance monitoring not available
  }
}

// Request Idle Callback for non-critical tasks
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // Non-critical initialization
  });
}

// Visibility change handler for pause/resume
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden - pause animations/videos
    document.querySelectorAll('video').forEach(video => {
      if (!video.paused) video.pause();
    });
  }
});

// Network status monitoring
if ('connection' in navigator) {
  const connection = navigator.connection;
  
  const updateNetworkStatus = () => {
    const saveData = connection.saveData;
    
    if (saveData) {
      // Could disable animations or reduce image quality
    }
  };
  
  updateNetworkStatus();
  connection.addEventListener('change', updateNetworkStatus);
}

// Memory pressure handling
if ('deviceMemory' in navigator) {
  const memory = navigator.deviceMemory;
  
  if (memory < 4) {
    // Low memory device - optimize accordingly
  }
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
    initRatingDistribution();
    initAuthParticles();
    initTypingEffect();
    initSmoothAnchorScroll();
    initStaggerGrids();
    initContactFormSuccess();
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
    const origUpdateCount = window.updateCartCount;
    if (typeof origUpdateCount !== 'function') return;

    window.updateCartCount = function() {
      origUpdateCount.apply(this, arguments);
      const badges = document.querySelectorAll('.cart-count');
      badges.forEach(badge => {
        if (badge.textContent !== '0' && badge.style.display !== 'none') {
          badge.classList.remove('bump');
          void badge.offsetWidth; // trigger reflow
          badge.classList.add('bump');
        }
      });
    };
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
    if (hour < 12) { greeting = 'Good morning'; emoji = '☀️'; }
    else if (hour < 17) { greeting = 'Good afternoon'; emoji = '🌤️'; }
    else { greeting = 'Good evening'; emoji = '🌙'; }

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
    let completedFields = 0;
    const totalFields = 6;
    if (user.fullName || user.name) completedFields++;
    if (user.email) completedFields++;
    if (user.phone) completedFields++;
    if (user.dob) completedFields++;
    if (user.gender) completedFields++;
    if (user.avatar || user.profilePic) completedFields++;

    const percent = Math.round((completedFields / totalFields) * 100);

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
  function initRatingDistribution() {
    if (document.body.dataset.page !== 'reviews') return;

    const heroCard = document.querySelector('.reviews-hero-card') || document.querySelector('.reviews-hero');
    if (!heroCard) return;

    // Calculate from stored reviews
    const reviews = JSON.parse(localStorage.getItem('swiftChowReviews') || '[]');
    const dist = [0, 0, 0, 0, 0]; // 1-5 stars
    reviews.forEach(r => {
      const stars = r.rating || r.stars || 5;
      if (stars >= 1 && stars <= 5) dist[stars - 1]++;
    });
    const total = reviews.length || 1;

    // Check if distribution already exists
    if (heroCard.querySelector('.rating-distribution')) return;

    const distHTML = document.createElement('div');
    distHTML.className = 'rating-distribution';
    distHTML.style.maxWidth = '300px';
    distHTML.style.margin = '1.5rem auto';
    for (let i = 5; i >= 1; i--) {
      const count = dist[i - 1];
      const pct = Math.round((count / total) * 100);
      distHTML.innerHTML += `
        <div class="rating-bar-row">
          <span class="stars">${i}★</span>
          <div class="rating-bar-track">
            <div class="rating-bar-fill" data-width="${pct}%" style="width:0%"></div>
          </div>
          <span class="count">${count}</span>
        </div>
      `;
    }
    heroCard.appendChild(distHTML);

    // Animate bars on visibility
    const obsRating = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.rating-bar-fill').forEach(bar => {
            setTimeout(() => { bar.style.width = bar.dataset.width; }, 300);
          });
          obsRating.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    obsRating.observe(distHTML);
  }

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
  function initContactFormSuccess() {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const btn = contactForm.querySelector('button[type="submit"]');
      const originalHTML = btn.innerHTML;

      // Show loading
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      btn.disabled = true;

      setTimeout(() => {
        // Success state
        btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        btn.style.background = 'linear-gradient(135deg, #10B981, #059669)';

        // Show toast
        if (typeof showToast === 'function') {
          showToast('Your message has been sent! We\'ll get back to you within 24 hours.', 'success');
        }

        // Reset form
        contactForm.reset();

        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }, 1500);
    });
  }

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
    initNewsletterEnhancement();
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
    
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 50) {
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

  // 4. Newsletter success animation
  function initNewsletterEnhancement() {
    const forms = document.querySelectorAll('.newsletter-form, .newsletter-form-wrapper');
    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const input = this.querySelector('input[type="email"]');
        const btn = this.querySelector('button');
        if (!input || !input.value) return;
        
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;
        
        setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
          btn.style.background = '#22c55e';
          input.value = '';
          input.placeholder = 'You\'re subscribed! 🎉';
          
          if (window.showToast) {
            window.showToast('Successfully subscribed! Welcome aboard! 🎉', 'success');
          }
          
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.disabled = false;
            input.placeholder = 'Enter your email address';
          }, 3000);
        }, 1200);
      });
    });
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
   MINDBLOWING ENHANCEMENTS & ANIMATIONS
   (Injected Globally)
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    // 1. Toast Notification Setup
    var toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    window.showToast = function(message, type) {
        type = type || 'success';
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;

        var icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        if (type === 'info') icon = 'fa-info-circle';

        toast.innerHTML = '<i class="fas ' + icon + '"></i><span>' + message + '</span>';
        toastContainer.appendChild(toast);

        setTimeout(function() { toast.remove(); }, 3500);
    };

    // Replace native alerts with toasts globally
    window.alert = function(msg) {
        window.showToast(msg, 'info');
    };

    // 2. Back to Top Button
    var backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 3. Scroll Reveal Animations (Intersection Observer)
    var observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section-title, .about-content, .contact-content, .blog-card, .menu-item, .category-btn').forEach(function(el, index) {
        if (!el.classList.contains('reveal') && !el.classList.contains('reveal-left') && !el.classList.contains('reveal-right') && !el.classList.contains('reveal-scale')) {
            el.classList.add('reveal');
            el.style.transitionDelay = ((index % 5) * 0.1) + 's';
        }
        observer.observe(el);
    });

    // 4. Hero Enhancements (Particles & Typing)
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
        if (parent.querySelector('.password-toggle-btn, .btn-icon[onclick*="togglePassword"]')) return;

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

    // 8. Reading Progress Bar
    var progressBar = document.createElement('div');
    progressBar.id = 'reading-progress-bar';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        var scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        progressBar.style.width = scrolled + '%';
    });

    // 9. Confetti for order success
    if (window.location.pathname.indexOf('order-success') !== -1) {
        var colors = ['#DC2626', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'];
        for (var c = 0; c < 100; c++) {
            var confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = (Math.random() * 100) + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.animationDelay = (Math.random() * 2) + 's';
            if (Math.random() > 0.5) confetti.style.borderRadius = '50%';
            document.body.appendChild(confetti);
        }
    }

    // 10. Free delivery progress injection
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

// 14. Magic Cursor (desktop only)
if (window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener('DOMContentLoaded', function() {
        var cursor = document.createElement('div');
        cursor.className = 'magic-cursor';
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', function(e) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        document.querySelectorAll('a, button, input, .food-card, .btn').forEach(function(el) {
            el.addEventListener('mouseenter', function() { cursor.classList.add('hovering'); });
            el.addEventListener('mouseleave', function() { cursor.classList.remove('hovering'); });
        });
    });
}
