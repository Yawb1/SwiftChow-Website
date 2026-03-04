/* ============================================
   SWIFT CHOW - Cart System
   Shopping cart with backend API integration
   ============================================ */

// ============================================
// CART STATE
// ============================================
let cart = [];
let cartLoaded = false;

function normalizeCartState(sourceCart = cart) {
  if (!Array.isArray(sourceCart)) return [];
  return sourceCart
    .filter(item => item && item.id != null)
    .map(item => ({
      ...item,
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
      price: Number(item.price) || 0,
    }));
}

// Load cart from API on page load
async function loadCart() {
  if (!isAuthenticated()) {
    // If not logged in, use localStorage
    cart = JSON.parse(localStorage.getItem('swiftChowCart')) || [];
    cartLoaded = true;
    window.cart = cart;
    updateCartDisplay();
    updateCartCount();
    return;
  }
  
  try {
    // Get API cart
    const response = await apiGetCart();
    const apiCart = response.cart || response.items || [];
    
    // Get localStorage cart (items added before login)
    const localCart = JSON.parse(localStorage.getItem('swiftChowCart')) || [];
    
    // Merge carts: prioritize API cart but add items from localStorage that aren't in API cart
    const mergedCart = [...apiCart];
    for (const localItem of localCart) {
      const existingItem = mergedCart.find(item => item.id === localItem.id);
      if (!existingItem) {
        // Item was added locally but not in API, add it
        mergedCart.push(localItem);
      }
    }
    
    cart = mergedCart;
    cartLoaded = true;
    
    // Sync merged cart items to API
    if (cart.length > 0) {
      try {
        // Add any items from localStorage that weren't in the API cart
        for (const localItem of localCart) {
          const inApiCart = apiCart.find(item => item.id === localItem.id);
          if (!inApiCart) {
            // Item was added locally but not in API, add it via API
            await apiAddToCart(
              localItem.id,
              localItem.quantity,
              localItem.price,
              localItem.name,
              localItem.category,
              localItem.image
            );
          }
        }
      } catch (syncError) {
        console.warn('Could not fully sync merged cart to API:', syncError);
      }
    }
    
    // Clear localStorage cart as it's now synced
    localStorage.removeItem('swiftChowCart');
    
    console.log('Cart loaded from API with localStorage merge:', cart.length, 'items');
    window.cart = cart; // Sync to window object
    updateCartDisplay();
    updateCartCount();
  } catch (error) {
    console.error('Error loading cart from API:', error);
    // Fallback to localStorage
    cart = JSON.parse(localStorage.getItem('swiftChowCart')) || [];
    cartLoaded = true;
    console.log('Cart loaded from localStorage (fallback):', cart.length, 'items');
    window.cart = cart; // Sync to window object
    updateCartDisplay();
    updateCartCount();
  }
}

// ============================================
// CART FUNCTIONS
// ============================================

// Save cart to localStorage (API sync happens in addToCart/removeFromCart)
function saveCart() {
  cart = normalizeCartState(cart);
  window.cart = cart;
  localStorage.setItem('swiftChowCart', JSON.stringify(cart));
  
  updateCartCount();
  updateCartDisplay();
  if (typeof updateCartModal === 'function') {
    updateCartModal();
  }
  if (typeof updateFloatingCart === 'function') {
    updateFloatingCart();
  }
}

// Update cart count in header
function updateCartCount() {
  const cartCountElements = document.querySelectorAll('.cart-count');

  // Use in-memory cart as single source of truth (already synced by loadCart/saveCart)
  const sourceCart = Array.isArray(cart) ? cart : [];
  const totalItems = sourceCart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  cartCountElements.forEach(el => {
    el.textContent = totalItems;
    if (totalItems > 0) {
      el.classList.add('has-items');
      el.style.display = 'flex';
    } else {
      el.classList.remove('has-items');
      el.style.display = 'none';
    }
  });

  // Also update floating cart count
  if (typeof updateFloatingCartCount === 'function') {
    updateFloatingCartCount();
  }

  // Dispatch event so main.js can run badge bump animation
  document.dispatchEvent(new CustomEvent('cart:countUpdated', { detail: { count: totalItems } }));
}

// Add item to cart
async function addToCart(productId, quantity = 1) {
  try {
    // Ensure productId is a number
    productId = parseInt(productId, 10);
    quantity = parseInt(quantity, 10);
    
    if (!cartLoaded) {
      await loadCart();
    }
    
    const product = foodItems.find(item => item.id === productId);
    if (!product) {
      if (typeof showToast === 'function') {
        showToast('Product not found', 'error');
      }
      return false;
    }

    // Helper: merge item into local cart array
    function mergeIntoLocalCart() {
      const existingItem = cart.find(item => item.id === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity: quantity
        });
      }
    }

    // Helper: post-add UI feedback
    function onItemAdded() {
      window.cart = cart;
      saveCart();
      if (typeof showToast === 'function') {
        showToast(product.name + ' added to cart!', 'success');
      }
      updateCartCount();
      try { if (typeof updateFloatingCart === 'function') updateFloatingCart(); } catch(e) {}
      try { if (typeof animateCartIcon === 'function') animateCartIcon(); } catch(e) {}
      document.querySelectorAll('.cart-count').forEach(el => {
        el.classList.remove('bump');
        void el.offsetWidth;
        el.classList.add('bump');
      });
    }
    
    if (isAuthenticated()) {
      try {
        const response = await apiAddToCart(
          productId, 
          quantity,
          product.price,
          product.name,
          product.category,
          product.image
        );
        cart = response.cart || response.items || cart;
      } catch (error) {
        console.error('API cart error, falling back to localStorage:', error);
        mergeIntoLocalCart();
      }
    } else {
      mergeIntoLocalCart();
    }

    onItemAdded();
    return true;
  } catch (error) {
    console.error('CRITICAL ERROR in addToCart:', error);
    return false;
  }
}

// Remove item from cart
function removeFromCart(productId) {
  productId = parseInt(productId, 10);
  const itemIndex = cart.findIndex(item => item.id === productId);
  
  if (itemIndex > -1) {
    const itemName = cart[itemIndex].name;
    cart.splice(itemIndex, 1);
    window.cart = cart;
    saveCart();
    if (typeof showToast === 'function') showToast(itemName + ' removed from cart', 'info');
    if (typeof updateFloatingCart === 'function') updateFloatingCart();
    updateCartCount();
    if (typeof updateCartModal === 'function') updateCartModal();

    // Sync removal with API for authenticated users
    if (isAuthenticated() && typeof apiRemoveFromCart === 'function') {
      apiRemoveFromCart(productId).catch(err => {
        console.warn('Could not sync cart removal to API:', err);
      });
    }
  }
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
  productId = parseInt(productId, 10);
  newQuantity = parseInt(newQuantity, 10);
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = newQuantity;
      window.cart = cart;
      saveCart();
      if (typeof updateFloatingCart === 'function') updateFloatingCart();
      updateCartCount();
      if (typeof updateCartModal === 'function') updateCartModal();

      // Sync quantity with API for authenticated users
      if (isAuthenticated() && typeof apiUpdateCartItem === 'function') {
        apiUpdateCartItem(productId, newQuantity).catch(err => {
          console.warn('Could not sync cart update to API:', err);
        });
      }
    }
  }
}

// Increment quantity
function incrementQuantity(productId) {
  productId = parseInt(productId, 10);
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity += 1;
    window.cart = cart;
    saveCart();
    if (typeof updateFloatingCart === 'function') updateFloatingCart();
    updateCartCount();
    if (typeof updateCartModal === 'function') updateCartModal();

    // Sync with API
    if (isAuthenticated() && typeof apiUpdateCartItem === 'function') {
      apiUpdateCartItem(productId, item.quantity).catch(err => {
        console.warn('Could not sync cart increment to API:', err);
      });
    }
  }
}

// Decrement quantity
function decrementQuantity(productId) {
  productId = parseInt(productId, 10);
  const item = cart.find(item => item.id === productId);
  if (item) {
    if (item.quantity > 1) {
      item.quantity -= 1;
      window.cart = cart;
      saveCart();
      if (typeof updateFloatingCart === 'function') updateFloatingCart();
      updateCartCount();
      if (typeof updateCartModal === 'function') updateCartModal();

      // Sync with API
      if (isAuthenticated() && typeof apiUpdateCartItem === 'function') {
        apiUpdateCartItem(productId, item.quantity).catch(err => {
          console.warn('Could not sync cart decrement to API:', err);
        });
      }
    } else {
      removeFromCart(productId);
    }
  }
}

// Get cart subtotal
function getCartSubtotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Get total items count
function getCartItemCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Clear entire cart
async function clearCart() {
  try {
    if (isAuthenticated() && typeof apiClearCart === 'function') {
      await apiClearCart();
    }
  } catch (error) {
    console.warn('Could not clear server cart, clearing local cart anyway:', error);
  }

  cart = [];
  window.cart = [];
  localStorage.setItem('swiftChowCart', JSON.stringify([]));
  updateCartCount();
  updateCartDisplay();
  if (typeof updateCartModal === 'function') updateCartModal();
  if (typeof updateFloatingCart === 'function') updateFloatingCart();
  showToast('Cart cleared', 'info');
}

// Animate cart icon when adding items
function animateCartIcon() {
  const cartIcons = document.querySelectorAll('.cart-icon, .nav-cart');
  cartIcons.forEach(icon => {
    icon.classList.add('cart-bounce');
    setTimeout(() => {
      icon.classList.remove('cart-bounce');
    }, 500);
  });
}

// ============================================
// CART DISPLAY FUNCTIONS
// ============================================

// Update cart display on cart page
function updateCartDisplay() {
  cart = normalizeCartState(cart);
  window.cart = cart;

  const cartItemsContainer = document.querySelector('.cart-items-list');
  const emptyCartMessage = document.querySelector('.empty-cart');
  const cartContent = document.querySelector('.cart-content');
  const cartSummary = document.querySelector('.cart-summary');
  
  if (!cartItemsContainer) return;
  
  if (cart.length === 0) {
    if (emptyCartMessage) emptyCartMessage.style.display = 'flex';
    if (cartContent) cartContent.style.display = 'none';
    return;
  }
  
  if (emptyCartMessage) emptyCartMessage.style.display = 'none';
  if (cartContent) cartContent.style.display = 'grid';
  
  // Render cart items
  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="cart-item-details">
        <span class="cart-item-category">${item.category}</span>
        <h4 class="cart-item-name">${item.name}</h4>
        <div class="cart-item-price">GHS ${item.price.toFixed(2)}</div>
      </div>
      <div class="cart-item-actions">
        <div class="quantity-controls">
          <button class="quantity-btn minus" onclick="decrementQuantity(${item.id})" aria-label="Decrease quantity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <span class="quantity-value">${item.quantity}</span>
          <button class="quantity-btn plus" onclick="incrementQuantity(${item.id})" aria-label="Increase quantity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
        <div class="cart-item-subtotal">GHS ${(item.price * item.quantity).toFixed(2)}</div>
        <button class="remove-item-btn" onclick="removeFromCart(${item.id})" aria-label="Remove item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
  
  // Update summary
  updateCartSummary();
}

// Update cart summary
function updateCartSummary() {
  const subtotal = getCartSubtotal();
  const deliveryFee = subtotal > 100 ? 0 : 15;
  const total = subtotal + deliveryFee;
  
  const subtotalEl = document.querySelector('.summary-subtotal');
  const deliveryEl = document.querySelector('.summary-delivery');
  const totalEl = document.querySelector('.summary-total');
  const itemCountEl = document.querySelector('.summary-item-count');
  
  if (subtotalEl) subtotalEl.textContent = `GHS ${subtotal.toFixed(2)}`;
  if (deliveryEl) {
    deliveryEl.textContent = deliveryFee === 0 ? 'FREE' : `GHS ${deliveryFee.toFixed(2)}`;
    if (deliveryFee === 0) {
      deliveryEl.classList.add('free-delivery');
    } else {
      deliveryEl.classList.remove('free-delivery');
    }
  }
  if (totalEl) totalEl.textContent = `GHS ${total.toFixed(2)}`;
  if (itemCountEl) itemCountEl.textContent = `${getCartItemCount()} item${getCartItemCount() !== 1 ? 's' : ''}`;
}

// Render mini cart in header
function renderMiniCart() {
  const miniCartContainer = document.querySelector('.mini-cart-items');
  if (!miniCartContainer) return;
  
  if (cart.length === 0) {
    miniCartContainer.innerHTML = `
      <div class="mini-cart-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1,1H5l2.68,13.39a2,2,0,0,0,2,1.61h9.72a2,2,0,0,0,2-1.61L23,6H6"></path>
        </svg>
        <p>Your cart is empty</p>
        <a href="menu.html" class="btn btn-primary btn-sm">Browse Menu</a>
      </div>
    `;
    return;
  }
  
  miniCartContainer.innerHTML = `
    <div class="mini-cart-list">
      ${cart.slice(0, 3).map(item => `
        <div class="mini-cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div class="mini-cart-item-info">
            <span class="mini-cart-item-name">${item.name}</span>
            <span class="mini-cart-item-price">${item.quantity} × GHS ${item.price}</span>
          </div>
        </div>
      `).join('')}
      ${cart.length > 3 ? `<p class="mini-cart-more">+${cart.length - 3} more items</p>` : ''}
    </div>
    <div class="mini-cart-footer">
      <div class="mini-cart-total">
        <span>Subtotal:</span>
        <strong>GHS ${getCartSubtotal().toFixed(2)}</strong>
      </div>
      <a href="cart.html" class="btn btn-primary btn-block">View Cart</a>
      <a href="checkout.html" class="btn btn-secondary btn-block">Checkout</a>
    </div>
  `;
}

// ============================================
// CHECKOUT FUNCTIONS
// ============================================

// Render checkout order summary
function renderCheckoutSummary() {
  const orderItemsContainer = document.querySelector('.order-items');
  if (!orderItemsContainer) return;
  
  orderItemsContainer.innerHTML = cart.map(item => `
    <div class="order-item">
      <div class="order-item-image">
        <img src="${item.image}" alt="${item.name}">
        <span class="order-item-qty">${item.quantity}</span>
      </div>
      <div class="order-item-details">
        <h4>${item.name}</h4>
        <span class="order-item-category">${item.category}</span>
      </div>
      <div class="order-item-price">GHS ${(item.price * item.quantity).toFixed(2)}</div>
    </div>
  `).join('');
  
  updateCheckoutTotals();
}

// Update checkout totals
function updateCheckoutTotals(selectedCity = null) {
  const subtotal = getCartSubtotal();
  let deliveryFee = 15;
  
  if (selectedCity) {
    const city = ghanaCities.find(c => c.name === selectedCity);
    if (city) {
      deliveryFee = city.deliveryFee;
    }
  }
  
  // Free delivery for orders over 100
  if (subtotal > 100) {
    deliveryFee = 0;
  }
  
  const total = subtotal + deliveryFee;
  
  const subtotalEl = document.querySelector('.checkout-subtotal');
  const deliveryEl = document.querySelector('.checkout-delivery');
  const totalEl = document.querySelector('.checkout-total');
  
  if (subtotalEl) subtotalEl.textContent = `GHS ${subtotal.toFixed(2)}`;
  if (deliveryEl) deliveryEl.textContent = deliveryFee === 0 ? 'FREE' : `GHS ${deliveryFee.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `GHS ${total.toFixed(2)}`;
}

// Process order - NOW SAVES TO DATABASE
async function processOrder(orderData) {
  try {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      console.error('User not authenticated for order');
      showToast('Please log in to place an order', 'error');
      return null;
    }
    
    // Prepare order data for API
    const orderPayload = {
      items: cart.map(item => ({
        foodId: item.id,
        name: item.name,
        category: item.category || '',
        quantity: item.quantity,
        price: item.price,
        image: item.image || ''
      })),
      deliveryAddress: {
        street: orderData.address,
        city: orderData.city,
        landmark: orderData.landmark || '',
        coordinates: { latitude: 0, longitude: 0 }
      },
      paymentMethod: orderData.paymentMethod || 'cod',
      specialInstructions: orderData.notes || ''
    };
    
    console.log('Sending order to backend:', orderPayload);
    
    // Call backend API to create order
    const response = await apiCreateOrder(orderPayload);
    
    if (response && response.success && response.order) {
      const order = response.order;
      
      // GENERATE A RELIABLE ORDER ID IF NOT PROVIDED
      const orderId = order.orderId || order._id || 'SWIFT-' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // Save to local storage as backup
      const localOrder = {
        id: orderId,
        orderId: orderId,
        items: order.items || cart || [],
        subtotal: order.subtotal || getCartSubtotal?.() || 0,
        deliveryFee: order.deliveryFee || (getCartSubtotal?.() > 100 ? 0 : 15) || 0,
        total: order.total || ((order.subtotal || getCartSubtotal?.() || 0) + (order.deliveryFee || (getCartSubtotal?.() > 100 ? 0 : 15) || 0)) || 0,
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
        paymentMethod: order.paymentMethod || orderData.paymentMethod || 'cod',
        status: order.status || 'confirmed',
        timestamp: order.createdAt || new Date().toISOString(),
        createdAt: order.createdAt || new Date().toISOString(),
        date: order.createdAt || new Date().toISOString(),
        city: orderData.city,
        estimatedDelivery: order.estimatedDeliveryTime || new Date(Date.now() + 30 * 60000).toISOString(),
        orderTime: new Date().toISOString()
      };
      
      const orders = JSON.parse(localStorage.getItem('swiftChowOrders')) || [];
      orders.push(localOrder);
      localStorage.setItem('swiftChowOrders', JSON.stringify(orders));
      localStorage.setItem('lastOrder', JSON.stringify(localOrder));
      sessionStorage.setItem('lastOrder', JSON.stringify(localOrder));
      
      // CRITICAL: Ensure sessionStorage has the order BEFORE redirect happens
      // This is what the tracking page will look for first
      const trackingOrderId = localOrder.id || localOrder.orderId || order.orderId || order._id;
      sessionStorage.setItem('trackingOrder_' + trackingOrderId, JSON.stringify(localOrder));
      
      console.log('✅ Order saved to database and local storage:', {
        id: localOrder.id,
        orderId: localOrder.orderId,
        trackingOrderId: trackingOrderId,
        timestamp: localOrder.timestamp,
        city: localOrder.city,
        totalItems: localOrder.items.length,
        status: localOrder.status
      });
      
      // Clear cart
      cart = [];
      saveCart();
      
      return localOrder;
    } else {
      console.error('Failed to create order on backend:', response);
      showToast('Failed to create order. Please try again.', 'error');
      return null;
    }
  } catch (error) {
    console.error('Error processing order:', error);
    showToast('Error creating order: ' + error.message, 'error');
    return null;
  }
}

// Get order by ID
function getOrderById(orderId) {
  const orders = JSON.parse(localStorage.getItem('swiftChowOrders')) || [];
  return orders.find(order => order.id === orderId);
}

// ============================================
// INITIALIZE CART
// ============================================
function initCart() {
  loadCart().then(() => {
    updateCartCount();
    
    // If on cart page, render cart
    if (document.body.dataset.page === 'cart') {
      updateCartDisplay();
    }
    
    // If on checkout page, render checkout - AFTER loadCart completes
    if (document.body.dataset.page === 'checkout') {
      renderCheckoutSummary();
      updateCheckoutTotals(); // Show totals immediately without needing city selection
    }
    
    // Render mini cart if it exists
    renderMiniCart();
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initCart);

// Export cart to global scope for cross-file access
window.cart = cart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.updateCartDisplay = updateCartDisplay;
window.loadCart = loadCart;
window.saveCart = saveCart;
window.incrementQuantity = incrementQuantity;
window.decrementQuantity = decrementQuantity;
window.getCartSubtotal = getCartSubtotal;
