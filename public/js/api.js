/* ============================================
   API Configuration and Client
   Handles all backend API communication
   ============================================ */

// ============================================
// SECURITY: HTML Sanitization Utility
// Escapes HTML special characters to prevent XSS when
// interpolating dynamic data into innerHTML templates.
// Loaded early (api.js) so cart.js, auth.js, main.js can use it.
// ============================================
function escapeHTML(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Sanitize a URL: only allow http(s) and data:image URIs.
// Blocks javascript: URIs that could execute code via <img src> or <a href>.
function sanitizeURL(url) {
  if (!url) return '';
  const str = String(url).trim();
  if (/^https?:\/\//i.test(str) || /^data:image\//i.test(str) || str.startsWith('/') || str.startsWith('./')) {
    return str;
  }
  return '';
}

// Validate that a value matches an expected format (alphanumeric + hyphens)
// Used for order IDs, user IDs, etc. before interpolating into URL paths.
function sanitizeId(id) {
  return String(id).replace(/[^a-zA-Z0-9_\-]/g, '');
}

// API Base URL — relative path since frontend and API share the same Vercel domain
const API_BASE_URL = '/api';

// Get stored JWT token
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Store JWT token
function setAuthToken(token) {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

// Clear authentication
function clearAuth() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
}

// API request wrapper
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle 401 - token expired or invalid (skip for auth endpoints to show proper errors)
      if (response.status === 401 && !endpoint.startsWith('/auth/')) {
        clearAuth();
        window.location.href = '/login.html';
        throw new Error('Session expired. Please login again.');
      }
      // SECURITY: Sanitize error messages — don't expose raw server errors
      // to the UI (could reveal stack traces, DB details, etc.)
      const rawMsg = data.error?.message || data.message || '';
      const safeMsg = rawMsg.length > 200 ? rawMsg.substring(0, 200) : rawMsg;
      throw new Error(safeMsg || `Request failed (${response.status})`);
    }
    
    return data;
  } catch (error) {
    if (error.message && !error._sanitized) {
      console.error('API Error:', error.message);
    }
    throw error;
  }
}

/* ============================================
   AUTHENTICATION ENDPOINTS
   ============================================ */

// Register new user
async function apiRegister(email, password, firstName, lastName, phone = '') {
  return apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      firstName: firstName || email.split('@')[0],
      lastName: lastName || '',
      phone: phone || '',
    }),
  });
}

// Login with email and password
async function apiLogin(email, password) {
  try {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  } catch (error) {
    console.error('apiLogin error:', error);
    throw error;
  }
}

// Logout
async function apiLogout() {
  try {
    await apiCall('/auth/logout', { method: 'POST' });
  } finally {
    clearAuth();
  }
}

/* ============================================
   CART ENDPOINTS
   ============================================ */

// Get cart
async function apiGetCart() {
  return apiCall('/cart');
}

// Add to cart
async function apiAddToCart(foodId, quantity = 1, price = 0, name = '', category = '', image = '') {
  return apiCall('/cart/add', {
    method: 'POST',
    body: JSON.stringify({ 
      foodId, 
      quantity,
      price,
      name,
      category,
      image,
    }),
  });
}

// Clear cart
async function apiClearCart() {
  return apiCall('/cart/clear', { method: 'DELETE' });
}

// Remove item from cart
async function apiRemoveFromCart(foodId) {
  return apiCall(`/cart/remove/${foodId}`, { method: 'DELETE' });
}

// Update cart item quantity
async function apiUpdateCartItem(foodId, quantity) {
  return apiCall('/cart/update', {
    method: 'PUT',
    body: JSON.stringify({ foodId, quantity }),
  });
}

/* ============================================
   ORDER ENDPOINTS
   ============================================ */

// Create order
async function apiCreateOrder(orderData) {
  return apiCall('/orders/create', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

// Get user's orders
async function apiGetOrders() {
  return apiCall('/orders');
}

// Get user's latest order
async function apiGetLatestOrder() {
  return apiCall('/orders/latest');
}

// Get specific order
async function apiGetOrder(orderId) {
  // SECURITY: Sanitize orderId to prevent path traversal (e.g., ../../admin)
  const safeId = sanitizeId(orderId);
  return apiCall(`/orders/${safeId}`);
}



/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

// Check if user is authenticated
function isAuthenticated() {
  return !!getAuthToken();
}

console.log('API Client loaded. Base URL:', API_BASE_URL);
