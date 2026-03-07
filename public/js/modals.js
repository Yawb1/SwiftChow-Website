// Shared modal templates — injected dynamically to avoid duplication across pages
(function () {
  const loginModalHTML = `
  <div id="loginModal" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Sign in">
    <div class="modal-content" style="max-width: 440px; border-radius: 1rem; padding: 2rem;">
      <button class="modal-close" aria-label="Close modal"><i class="fas fa-times"></i></button>
      <div class="modal-header" style="text-align: center; margin-bottom: 1.5rem;">
        <a href="index.html" class="logo" style="display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; margin-bottom: 1rem;">
          <div class="logo-icon"><img loading="lazy" src="logo.png" alt="Swift Chow" style="height: 40px; width: auto;"></div>
          <div class="logo-text">SWIFT <span>CHOW</span></div>
        </a>
        <h2 style="margin: 0.5rem 0 0.25rem;">Welcome Back!</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Log in to your account to continue</p>
      </div>
      <div class="modal-body">
        <form id="loginModalForm" class="form">
          <div class="form-group">
            <label for="login-email">Email Address</label>
            <input type="email" id="login-email" name="email" placeholder="your@email.com" required maxlength="254">
            <div class="form-feedback error" style="display: none;"></div>
            <div class="form-feedback success" style="display: none;"><i class="fas fa-check"></i> Email verified</div>
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <div style="position: relative;">
              <input type="password" id="login-password" name="password" placeholder="Enter your password" required minlength="8">
              <button type="button" class="password-toggle-btn" aria-label="Toggle password visibility" onclick="togglePasswordVisibility('login-password', event)" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-secondary); font-size: 1.1rem;">
                <i class="fas fa-eye"></i>
              </button>
            </div>
            <div class="form-feedback error" style="display: none;"></div>
            <div class="form-feedback success" style="display: none;"><i class="fas fa-check"></i> Password valid</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin: 1rem 0;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" name="remember" style="width: 13px; height: 13px; flex-shrink: 0; accent-color: #DC2626;">
              <span>Remember me</span>
            </label>
            <a href="forgot-password.html" style="color: var(--primary); text-decoration: none; font-size: 0.9rem;">Forgot password?</a>
          </div>
          <button type="submit" class="btn btn-primary btn-block" style="margin-top: 1rem;">
            <i class="fas fa-sign-in-alt"></i> Sign In
          </button>
        </form>
        <div style="margin: 1.5rem 0; position: relative;">
          <div style="border-top: 1px solid var(--border-color);"></div>
          <span style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--bg-primary); padding: 0 1rem; color: var(--text-secondary); font-size: 0.85rem;">or continue with</span>
        </div>
        <div>
          <button type="button" class="google-signin-modal-btn" onclick="googleSignIn()">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
        <div style="margin-top: 1.25rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color); display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap;">
          <span style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; color: var(--text-secondary);"><i class="fas fa-lock" style="color: #22c55e;"></i> SSL Encrypted</span>
          <span style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; color: var(--text-secondary);"><i class="fas fa-shield-alt" style="color: #3b82f6;"></i> Secure Login</span>
        </div>
      </div>
      <div class="modal-footer" style="text-align: center; margin-top: 1rem;">
        Don't have an account? <a href="#" data-action="switch-to-signup">Sign up</a>
      </div>
    </div>
  </div>`;

  const signupModalHTML = `
  <div id="signupModal" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Create account">
    <div class="modal-content" style="max-width: 440px; border-radius: 1rem; padding: 2rem;">
      <button class="modal-close" aria-label="Close modal"><i class="fas fa-times"></i></button>
      <div class="modal-header" style="text-align: center; margin-bottom: 1.5rem;">
        <a href="index.html" class="logo" style="display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; margin-bottom: 1rem;">
          <div class="logo-icon"><img loading="lazy" src="logo.png" alt="Swift Chow" style="height: 40px; width: auto;"></div>
          <div class="logo-text">SWIFT <span>CHOW</span></div>
        </a>
        <h2 style="margin: 0.5rem 0 0.25rem;">Join Us!</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Create your account to start ordering</p>
      </div>
      <div class="modal-body">
        <form id="signupModalForm" class="form">
          <div class="form-group">
            <label for="signup-fullname">Full Name</label>
            <input type="text" id="signup-fullname" name="fullName" placeholder="Your full name" required minlength="2" maxlength="100">
            <div class="form-feedback error" style="display: none;"></div>
            <div class="form-feedback success" style="display: none;"><i class="fas fa-check"></i> Name valid</div>
          </div>
          <div class="form-group">
            <label for="signup-email">Email Address</label>
            <input type="email" id="signup-email" name="email" placeholder="your@email.com" required maxlength="254">
            <div class="form-feedback error" style="display: none;"></div>
            <div class="form-feedback success" style="display: none;"><i class="fas fa-check"></i> Email verified</div>
          </div>
          <div class="form-group">
            <label for="signup-phone">Phone Number</label>
            <input type="tel" id="signup-phone" name="phone" placeholder="+233 24 123 4567" required maxlength="20">
            <div class="form-feedback error" style="display: none;"></div>
            <div class="form-feedback success" style="display: none;"><i class="fas fa-check"></i> Phone valid</div>
          </div>
          <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label for="signup-password">Password</label>
              <div style="position: relative;">
                <input type="password" id="signup-password" name="password" placeholder="8+ chars, letter, number, symbol" required minlength="8">
                <button type="button" class="password-toggle-btn" aria-label="Toggle password visibility" onclick="togglePasswordVisibility('signup-password', event)" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-secondary); font-size: 1.1rem;">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
              <div class="form-feedback error" style="display: none;"></div>
              <div class="form-feedback success" style="display: none;"><i class="fas fa-check"></i> Password valid</div>
            </div>
            <div class="form-group">
              <label for="signup-confirm">Confirm Password</label>
              <div style="position: relative;">
                <input type="password" id="signup-confirm" name="confirmPassword" placeholder="Confirm password" required minlength="8">
                <button type="button" class="password-toggle-btn" aria-label="Toggle password visibility" onclick="togglePasswordVisibility('signup-confirm', event)" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-secondary); font-size: 1.1rem;">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
              <div class="form-feedback error" style="display: none;"></div>
              <div class="form-feedback success" style="display: none;"><i class="fas fa-check"></i> Passwords match</div>
            </div>
          </div>
          <label style="display: flex; align-items: flex-start; gap: 0.5rem; margin: 1rem 0; cursor: pointer;">
            <input type="checkbox" name="terms" required style="width: 13px; height: 13px; margin-top: 2px; flex-shrink: 0; accent-color: #DC2626;">
            <span style="font-size: 0.9rem;">I agree to the <a href="terms.html" style="color: var(--primary);">Terms & Conditions</a></span>
          </label>
          <button type="submit" class="btn btn-primary btn-block" style="margin-top: 1rem;">
            <i class="fas fa-user-plus"></i> Create Account
          </button>
        </form>
        <div style="margin: 1.5rem 0; position: relative;">
          <div style="border-top: 1px solid var(--border-color);"></div>
          <span style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--bg-primary); padding: 0 1rem; color: var(--text-secondary); font-size: 0.85rem;">or sign up with</span>
        </div>
        <div>
          <button type="button" class="google-signin-modal-btn" onclick="googleSignup()">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>
        </div>
        <div style="margin-top: 1.25rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color); display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap;">
          <span style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; color: var(--text-secondary);"><i class="fas fa-lock" style="color: #22c55e;"></i> SSL Encrypted</span>
          <span style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; color: var(--text-secondary);"><i class="fas fa-user-shield" style="color: #8b5cf6;"></i> Privacy Protected</span>
        </div>
      </div>
      <div class="modal-footer" style="text-align: center; margin-top: 1rem;">
        Already have an account? <a href="#" data-action="switch-to-login">Sign in</a>
      </div>
    </div>
  </div>`;

  // Inject modals — with defer, DOM is already parsed when this runs
  if (!document.getElementById('loginModal')) {
    document.body.insertAdjacentHTML('beforeend', loginModalHTML);
  }
  if (!document.getElementById('signupModal')) {
    document.body.insertAdjacentHTML('beforeend', signupModalHTML);
  }
})();
