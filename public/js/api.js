/* ============================================
   API Configuration and Client
   Handles all backend API communication
   ============================================ */

// API Base URL - Update this when you deploy to Render
const API_BASE_URL = localStorage.getItem('apiUrl') || 'https://swift-chow-backend.onrender.com/api';

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
      throw new Error(data.error?.message || data.message || `API Error: ${response.status}`);
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



/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

// Check if user is authenticated
function isAuthenticated() {
  return !!getAuthToken();
}

console.log('API Client loaded. Base URL:', API_BASE_URL);
