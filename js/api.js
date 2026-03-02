/* ============================================
   API Configuration and Client
   Handles all backend API communication
   ============================================ */

// API Base URL - Update this when you deploy to Render
const API_BASE_URL = localStorage.getItem('apiUrl') || 'https://swift-chow-backend.onrender.com/api';

// Set API URL dynamically (useful for development vs production)
function setApiUrl(url) {
  localStorage.setItem('apiUrl', url);
  location.reload();
}

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
      // Handle 401 - token expired or invalid
      if (response.status === 401) {
        clearAuth();
        window.location.href = '/login.html';
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
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

// Get current user
async function apiGetCurrentUser() {
  return apiCall('/auth/me');
}

// Logout
async function apiLogout() {
  try {
    await apiCall('/auth/logout', { method: 'POST' });
  } finally {
    clearAuth();
  }
}

// Update user profile
async function apiUpdateProfile(updates) {
  return apiCall('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
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

// Update cart item
async function apiUpdateCartItem(foodId, quantity) {
  return apiCall('/cart/update', {
    method: 'PUT',
    body: JSON.stringify({ foodId, quantity }),
  });
}

// Remove from cart
async function apiRemoveFromCart(foodId) {
  return apiCall(`/cart/remove/${foodId}`, { method: 'DELETE' });
}

// Clear cart
async function apiClearCart() {
  return apiCall('/cart/clear', { method: 'DELETE' });
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

// Get specific order
async function apiGetOrder(orderId) {
  return apiCall(`/orders/${orderId}`);
}

// Update order status
async function apiUpdateOrderStatus(orderId, status) {
  return apiCall(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// Rate order
async function apiRateOrder(orderId, rating, review = '') {
  return apiCall(`/orders/${orderId}/rate`, {
    method: 'POST',
    body: JSON.stringify({ rating, review }),
  });
}

// Cancel order
async function apiCancelOrder(orderId) {
  return apiCall(`/orders/${orderId}/cancel`, { method: 'POST' });
}

/* ============================================
   ADDRESS ENDPOINTS
   ============================================ */

// Get user's addresses
async function apiGetAddresses() {
  return apiCall('/addresses');
}

// Create address
async function apiCreateAddress(addressData) {
  return apiCall('/addresses', {
    method: 'POST',
    body: JSON.stringify(addressData),
  });
}

// Update address
async function apiUpdateAddress(addressId, addressData) {
  return apiCall(`/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(addressData),
  });
}

// Delete address
async function apiDeleteAddress(addressId) {
  return apiCall(`/addresses/${addressId}`, { method: 'DELETE' });
}

// Set default address
async function apiSetDefaultAddress(addressId) {
  return apiCall(`/addresses/${addressId}/default`, { method: 'PUT' });
}

/* ============================================
   PAYMENT ENDPOINTS
   ============================================ */

// Get payment methods
async function apiGetPaymentMethods() {
  return apiCall('/payments');
}

// Add payment method
async function apiAddPaymentMethod(paymentData) {
  return apiCall('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
}

// Update payment method
async function apiUpdatePaymentMethod(paymentId, updates) {
  return apiCall(`/payments/${paymentId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// Delete payment method
async function apiDeletePaymentMethod(paymentId) {
  return apiCall(`/payments/${paymentId}`, { method: 'DELETE' });
}

// Set default payment
async function apiSetDefaultPayment(paymentId) {
  return apiCall(`/payments/${paymentId}/default`, { method: 'PUT' });
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

// Check if user is authenticated
function isAuthenticated() {
  return !!getAuthToken();
}

// Refresh authentication token
async function apiRefreshToken() {
  const response = await apiCall('/auth/refresh', { method: 'POST' });
  if (response.token) {
    setAuthToken(response.token);
  }
  return response;
}

console.log('API Client loaded. Base URL:', API_BASE_URL);
