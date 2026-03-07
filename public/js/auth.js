/* ============================================
   SWIFT CHOW - Authentication System
   Real authentication with backend API
   ============================================ */

// ============================================
// USER STATE
// ============================================
let currentUser = null;

// User state is initialized in initAuth() called from main.js DOMContentLoaded

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

// Check if user is logged in
function isLoggedIn() {
  return isAuthenticated();
}

// Get current user
function getCurrentUser() {
  return currentUser;
}

// Login with email and password
async function login(email, password, remember = false) {
  if (!email || !validateEmail(email)) {
    return { success: false, message: 'Please enter a valid email address' };
  }
  
  if (!password || password.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters' };
  }
  
  try {
    const response = await apiLogin(email, password);
    
    if (response && response.user && response.token) {
      // Ensure fullName is set
      if (!response.user.fullName && response.user.firstName) {
        response.user.fullName = (response.user.firstName + ' ' + (response.user.lastName || '')).trim();
      }
      
      // Save user and token
      currentUser = response.user;
      localStorage.setItem('swiftChowUser', JSON.stringify(response.user));
      localStorage.setItem('authToken', response.token);
      
      // Update UI after short delay
      setTimeout(() => {
        if (typeof updateAuthUI === 'function') {
          updateAuthUI();
        }
        // Reload cart when user logs in
        if (typeof loadCart === 'function') {
          loadCart();
        }
      }, 100);
      
      return { success: true, message: 'Login successful!', user: response.user };
    }
    
    return { success: false, message: 'Login failed: No user data returned' };
  } catch (error) {
    console.error('Auth: Login error:', error);
    return { success: false, message: error.message || 'Login failed' };
  }
}

// Register new user
async function register(fullName = '', email = '', phone = '', password = '', confirmPassword = '') {
  if (!email || !validateEmail(email)) {
    console.error('register: Invalid email:', email);
    return { success: false, message: 'Please enter a valid email address' };
  }
  
  if (!password || password.length < 8) {
    console.error('register: Invalid password length:', password?.length);
    return { success: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { success: false, message: 'Password must contain at least one letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { success: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    return { success: false, message: 'Password must contain at least one symbol (!@#$%^&* etc.)' };
  }
  
  if (password !== confirmPassword) {
    console.error('register: Passwords do not match');
    return { success: false, message: 'Passwords do not match' };
  }
  
  try {
    // Split fullName into firstName and lastName
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const response = await apiRegister(email, password, firstName, lastName, phone);
    
    if (response && response.user && response.token) {
      // Ensure fullName is set
      if (!response.user.fullName && response.user.firstName) {
        response.user.fullName = (response.user.firstName + ' ' + (response.user.lastName || '')).trim();
      }
      
      // Save user and token
      currentUser = response.user;
      localStorage.setItem('swiftChowUser', JSON.stringify(response.user));
      localStorage.setItem('authToken', response.token);
      
      // Send signup confirmation email
      try {
        const emailResponse = await fetch('/api/emails/signup-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: response.user.email,
            fullName: response.user.fullName || `${firstName} ${lastName}`
          })
        });
        console.log('Signup confirmation email sent:', emailResponse.ok);
      } catch (error) {
        console.warn('Could not send signup confirmation email:', error);
      }
      
      // Update UI after short delay
      setTimeout(() => {
        if (typeof updateAuthUI === 'function') {
          updateAuthUI();
        }
        // Reload cart when user signs up/logs in
        if (typeof loadCart === 'function') {
          loadCart();
        }
      }, 100);
      
      return { success: true, message: 'Registration successful!', user: response.user };
    }
  } catch (error) {
    console.error('Auth: Register error:', error);
    return { success: false, message: error.message || 'Registration failed' };
  }
}

// Get the previous page URL (the page user was on before login)
function getPreviousPage() {
  const referrer = sessionStorage.getItem('redirectAfterLogin');
  if (referrer && !referrer.includes('login.html') && !referrer.includes('signup.html') && !referrer.includes('forgot-password.html')) {
    return referrer;
  }
  return 'index.html';
}

// Save current page before going to login
function saveCurrentPageForRedirect() {
  const currentPage = window.location.href;
  if (!currentPage.includes('login.html') && !currentPage.includes('signup.html') && !currentPage.includes('forgot-password.html')) {
    sessionStorage.setItem('redirectAfterLogin', currentPage);
  }
}

// Logout
async function logout() {
  try {
    await apiLogout();
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  // Clear all auth data from localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('swiftChowUser');
  localStorage.removeItem('currentUser');
  
  // Clear local auth state
  currentUser = null;
  
  // Call updateAuthUI immediately if available
  if (typeof updateAuthUI === 'function') {
    updateAuthUI();
  }
  
  // Reload cart when user logs out
  if (typeof loadCart === 'function') {
    loadCart();
  }
  
  // Remove any old user profile elements
  const oldProfile = document.querySelector('.user-profile');
  if (oldProfile) {
    oldProfile.remove();
  }
  
  // Show login button if it exists
  const loginBtn = document.querySelector('#loginBtn');
  if (loginBtn) {
    loginBtn.style.display = 'block';
  }
  
  // Redirect after UI update
  setTimeout(() => {
    window.location.href = '/index.html';
  }, 300);
}

// Google Sign In
function googleSignIn() {
  // Redirect to Google OAuth endpoint
  const redirectUrl = `${API_BASE_URL}/auth/google`;
  window.location.href = redirectUrl;
}

// Facebook Sign In removed - only Google OAuth + Email login supported

// Signup with API
async function signup(userData) {
  const { name, email, phone, password, confirmPassword } = userData;
  
  // Validation
  if (!name || name.length < 2) {
    return { success: false, message: 'Please enter your full name' };
  }
  
  if (!email || !validateEmail(email)) {
    return { success: false, message: 'Please enter a valid email address' };
  }
  
  if (!phone || !validatePhone(phone)) {
    return { success: false, message: 'Please enter a valid phone number' };
  }
  
  if (!password || password.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { success: false, message: 'Password must contain at least one letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { success: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    return { success: false, message: 'Password must contain at least one symbol (!@#$%^&* etc.)' };
  }
  
  if (password !== confirmPassword) {
    return { success: false, message: 'Passwords do not match' };
  }
  
  try {
    const response = await register(name, email, phone, password, confirmPassword);
    return response;
  } catch (error) {
    return { success: false, message: error.message || 'Signup failed' };
  }
}


// Protected pages list
const protectedPages = ['account.html', 'checkout.html', 'tracking.html', 'order-success.html'];

// Check if current page requires auth
function checkPageProtection() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  if (protectedPages.includes(currentPage) && !isLoggedIn()) {
    sessionStorage.setItem('redirectAfterLogin', window.location.href);
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Request password reset
async function requestPasswordReset(email) {
  if (!email || !validateEmail(email)) {
    return { success: false, message: 'Please enter a valid email address' };
  }

  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();

    if (data.success) {
      return { success: true, message: data.message || 'If an account with this email exists, a reset link has been sent.' };
    }
    return { success: false, message: data.error?.message || 'Failed to send reset email' };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { success: true, message: 'If an account with this email exists, a reset link has been sent.' };
  }
}

// ============================================
// ADDRESS MANAGEMENT
// ============================================

function getSavedAddresses() {
  if (!currentUser) return [];
  const addresses = JSON.parse(localStorage.getItem(`swiftChowAddresses_${currentUser.id}`)) || [];
  return addresses;
}

function saveAddress(address) {
  if (!currentUser) {
    return { success: false, message: 'You must be logged in to save addresses' };
  }
  
  const addresses = getSavedAddresses();
  const newAddress = {
    id: Date.now(),
    ...address,
    isDefault: addresses.length === 0
  };
  
  addresses.push(newAddress);
  localStorage.setItem(`swiftChowAddresses_${currentUser.id}`, JSON.stringify(addresses));
  
  return { success: true, message: 'Address saved!', address: newAddress };
}

function deleteAddress(addressId) {
  if (!currentUser) return { success: false };
  
  let addresses = getSavedAddresses();
  addresses = addresses.filter(a => a.id !== addressId);
  localStorage.setItem(`swiftChowAddresses_${currentUser.id}`, JSON.stringify(addresses));
  
  return { success: true, message: 'Address deleted' };
}

// ============================================
// PAYMENT METHODS
// ============================================

function getSavedPaymentMethods() {
  if (!currentUser) return [];
  const methods = JSON.parse(localStorage.getItem(`swiftChowPaymentMethods_${currentUser.id}`)) || [];
  return methods;
}

function savePaymentMethod(paymentDetails) {
  if (!currentUser) {
    return { success: false, message: 'You must be logged in to save payment methods' };
  }
  
  const methods = getSavedPaymentMethods();
  const newMethod = {
    id: Date.now(),
    ...paymentDetails,
    isDefault: methods.length === 0,
    savedAt: new Date().toISOString()
  };
  
  methods.push(newMethod);
  localStorage.setItem(`swiftChowPaymentMethods_${currentUser.id}`, JSON.stringify(methods));
  
  return { success: true, message: 'Payment method saved!', method: newMethod };
}

function deletePaymentMethod(methodId) {
  if (!currentUser) return { success: false };
  
  let methods = getSavedPaymentMethods();
  methods = methods.filter(m => m.id !== methodId);
  localStorage.setItem(`swiftChowPaymentMethods_${currentUser.id}`, JSON.stringify(methods));
  
  return { success: true, message: 'Payment method deleted' };
}

// ============================================
// VALIDATION HELPERS
// ============================================

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^[\d\s+()-]{10,}$/;
  return re.test(phone.replace(/\s/g, ''));
}

// ============================================
// UI FUNCTIONS
// ============================================

// Protect pages that require authentication
function requireAuth() {
  if (!isLoggedIn()) {
    // Save intended destination
    sessionStorage.setItem('redirectAfterLogin', window.location.href);
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Redirect logged in users away from auth pages
function redirectIfLoggedIn() {
  if (isLoggedIn()) {
    const redirect = sessionStorage.getItem('redirectAfterLogin') || 'account.html';
    sessionStorage.removeItem('redirectAfterLogin');
    window.location.href = redirect;
  }
}

// ============================================
// FORM HANDLERS
// ============================================

function initLoginForm() {
  const form = document.querySelector('.login-form');
  if (!form) return;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;
    const remember = form.querySelector('input[name="remember"]')?.checked || false;
    
    const result = await login(email, password, remember);
    
    if (result.success) {
      showToast(result.message, 'success');
      // Go back to the page user was on, or home if no previous page
      const redirect = getPreviousPage();
      sessionStorage.removeItem('redirectAfterLogin');
      setTimeout(() => window.location.href = redirect, 1000);
    } else {
      showToast(result.message, 'error');
    }
  };
  
  form.addEventListener('submit', handleSubmit);
  
  // Add Enter key support on input fields
  const inputs = form.querySelectorAll('input[type="email"], input[type="password"]');
  inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
      }
    });
  });
}

function initSignupForm() {
  const form = document.querySelector('.signup-form');
  if (!form) return;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userData = {
      name: form.querySelector('input[name="fullName"]').value,
      email: form.querySelector('input[name="email"]').value,
      phone: form.querySelector('input[name="phone"]').value,
      password: form.querySelector('input[name="password"]').value,
      confirmPassword: form.querySelector('input[name="confirmPassword"]').value
    };
    
    const termsAccepted = form.querySelector('input[name="terms"]')?.checked;
    
    if (!termsAccepted) {
      showToast('Please accept the terms and conditions', 'error');
      return;
    }
    
    const result = await signup(userData);
    
    if (result.success) {
      showToast(result.message, 'success');
      setTimeout(() => window.location.href = 'login.html', 1500);
    } else {
      showToast(result.message, 'error');
    }
  };
  
  form.addEventListener('submit', handleSubmit);
  
  // Add Enter key support on input fields
  const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="password"]');
  inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
      }
    });
  });
}

function initForgotPasswordForm() {
  const form = document.querySelector('.forgot-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = form.querySelector('input[name="email"]').value;
    const result = await requestPasswordReset(email);
    
    showToast(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
      form.reset();
    }
  });
}

// ============================================
// INITIALIZE AUTH
// ============================================

function initAuth() {
  // CHECK FOR OAUTH CALLBACK with token in URL
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');
  const userFromUrl = urlParams.get('user');
  
  if (tokenFromUrl) {
    try {
      // Save token
      localStorage.setItem('authToken', tokenFromUrl);
      
      if (userFromUrl) {
        try {
          const userData = JSON.parse(decodeURIComponent(userFromUrl));
          // SECURITY: Validate parsed user data has expected shape
          // Only allow known safe fields to prevent prototype pollution
          const safeUser = {
            id: userData.id || userData._id || '',
            email: String(userData.email || ''),
            firstName: String(userData.firstName || ''),
            lastName: String(userData.lastName || ''),
            fullName: String(userData.fullName || userData.firstName || ''),
            phone: String(userData.phone || ''),
            avatar: userData.avatar ? String(userData.avatar) : undefined
          };
          currentUser = safeUser;
          localStorage.setItem('swiftChowUser', JSON.stringify(safeUser));
        } catch (parseError) {
          console.error('Auth: Error parsing user data from URL:', parseError);
        }
      }
      
      // Clean up URL to remove token (for cleaner history)
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Update UI after a short delay to ensure all scripts are loaded
      setTimeout(() => {
        if (typeof updateAuthUI === 'function') {
          updateAuthUI();
        }
        if (typeof updateFloatingCart === 'function') {
          updateFloatingCart();
        }
      }, 100);
    } catch (e) {
      console.error('Auth: Error processing OAuth callback:', e);
    }
  }
  
  // Load user from localStorage on every page (single canonical key)
  const savedUser = localStorage.getItem('swiftChowUser');
  const savedToken = localStorage.getItem('authToken');
  
  // Migrate legacy 'currentUser' key if it exists
  const legacyUser = localStorage.getItem('currentUser');
  if (legacyUser && !savedUser) {
    localStorage.setItem('swiftChowUser', legacyUser);
  }
  localStorage.removeItem('currentUser'); // Clean up duplicate key
  
  if (savedUser || legacyUser) {
    try {
      currentUser = JSON.parse(savedUser || legacyUser);
      localStorage.setItem('swiftChowUser', JSON.stringify(currentUser));
    } catch (e) {
      console.error('Auth: Error parsing user data:', e);
      localStorage.removeItem('swiftChowUser');
      localStorage.removeItem('currentUser');
      currentUser = null;
    }
  } else {
    currentUser = null;
  }
  
  // If we're on a login/signup page, save the referrer for redirect after login
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage === 'login.html' || currentPage === 'signup.html') {
    // Check if we have a referrer and it's not already a login page
    const referrer = document.referrer;
    if (referrer && !referrer.includes('login.html') && !referrer.includes('signup.html') && !referrer.includes('forgot-password.html')) {
      // Only save if we don't already have a saved redirect
      if (!sessionStorage.getItem('redirectAfterLogin')) {
        sessionStorage.setItem('redirectAfterLogin', referrer);
      }
    }
  }
  
  // Check page protection first
  if (!checkPageProtection()) {
    return; // Stop if redirecting
  }
  
  // Update UI based on auth state (if main.js has loaded)
  if (typeof updateAuthUI === 'function') {
    updateAuthUI();
  } else {
    // main.js hasn't loaded yet, schedule it for later
    setTimeout(() => {
      if (typeof updateAuthUI === 'function') {
        updateAuthUI();
      }
    }, 100);
  }
  
  // Initialize forms if on auth pages
  initLoginForm();
  initSignupForm();
  initForgotPasswordForm();
  initGoogleSignIn();
  
  // Check page requirements
  if (document.querySelector('.auth-required-page') && !isLoggedIn()) {
    requireAuth();
  }
  
  if (document.querySelector('.guest-only-page') && isLoggedIn()) {
    redirectIfLoggedIn();
  }
}

// Initialize Google Sign In buttons
function initGoogleSignIn() {
  const googleBtns = document.querySelectorAll('.google-signin-btn, .social-btn');
  
  googleBtns.forEach(btn => {
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Show loading state
      btn.innerHTML = '<span class="spinner"></span> Connecting to Google...';
      btn.disabled = true;
      
      // Save current page for redirect after OAuth
      saveCurrentPageForRedirect();
      
      // Small delay for UX, then redirect to Google OAuth
      setTimeout(() => {
        googleSignIn();
      }, 500);
    });
  });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  // DOM is already loaded
  initAuth();
}
