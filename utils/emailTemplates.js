'use strict';

/**
 * SWIFT CHOW — Email Template System
 * Consistent, branded email templates for all transactional emails
 */

const CLIENT_URL = process.env.CLIENT_URL || 'https://swiftchow.me';

// ============================================
// BASE TEMPLATE WRAPPER
// ============================================

function baseTemplate({ title, preheader, body, footerExtra }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  ${preheader ? `<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${preheader}</span>` : ''}
  <title>${title || 'SWIFT CHOW'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <!-- HEADER -->
        <tr>
          <td style="background: linear-gradient(135deg, #DC2626 0%, #991b1b 100%); padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0 0 4px 0; font-size: 28px; color: #ffffff; font-weight: 800; letter-spacing: -0.5px;">SWIFT CHOW</h1>
            ${title ? `<p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.85); font-weight: 400;">${title}</p>` : ''}
          </td>
        </tr>
        <!-- BODY -->
        <tr>
          <td style="background-color: #ffffff; padding: 36px 32px;">
            ${body}
          </td>
        </tr>
        <!-- FOOTER -->
        <tr>
          <td style="background-color: #1a1a1a; padding: 24px 32px; text-align: center;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="text-align: center; padding-bottom: 16px;">
                <a href="${CLIENT_URL}" style="color: #DC2626; font-weight: 700; font-size: 16px; text-decoration: none;">SWIFT CHOW</a>
              </td></tr>
              ${footerExtra ? `<tr><td style="text-align: center; padding-bottom: 12px;">${footerExtra}</td></tr>` : ''}
              <tr><td style="text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                  &copy; ${new Date().getFullYear()} SWIFT CHOW. All rights reserved.<br>
                  <a href="${CLIENT_URL}/privacy.html" style="color: #9ca3af; text-decoration: underline;">Privacy Policy</a> &bull;
                  <a href="${CLIENT_URL}/terms.html" style="color: #9ca3af; text-decoration: underline;">Terms of Service</a> &bull;
                  <a href="mailto:orders@swiftchow.me" style="color: #9ca3af; text-decoration: underline;">Contact</a>
                </p>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ============================================
// REUSABLE COMPONENTS
// ============================================

function ctaButton(text, url) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px auto;">
      <tr><td style="background: linear-gradient(135deg, #DC2626, #B91C1C); border-radius: 8px;">
        <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 40px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; letter-spacing: 0.3px;">${text}</a>
      </td></tr>
    </table>`;
}

function infoBox(content) {
  return `
    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      ${content}
    </div>`;
}

function greeting(name) {
  return `<p style="font-size: 16px; color: #1f2937; margin: 0 0 16px 0;">Hi ${name || 'there'},</p>`;
}

function paragraph(text) {
  return `<p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">${text}</p>`;
}

function signature() {
  return `
    <p style="font-size: 15px; color: #4b5563; margin: 24px 0 0 0;">
      Cheers,<br>
      <strong style="color: #1f2937;">The SWIFT CHOW Team</strong> 🍔
    </p>`;
}

// ============================================
// EMAIL TEMPLATES
// ============================================

const templates = {

  // 1. Welcome email (after registration)
  welcome: ({ firstName }) => baseTemplate({
    title: 'Welcome to SWIFT CHOW!',
    preheader: `Welcome aboard, ${firstName}! Your account is ready.`,
    body: `
      ${greeting(firstName)}
      ${paragraph('Welcome to SWIFT CHOW! 🎉 Your account has been created successfully.')}
      ${paragraph('Here\'s what you can do now:')}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 20px 0;">
        <tr><td style="padding: 8px 0; font-size: 15px; color: #4b5563;">🍔 &nbsp;Browse our delicious menu</td></tr>
        <tr><td style="padding: 8px 0; font-size: 15px; color: #4b5563;">📦 &nbsp;Place orders for fast delivery</td></tr>
        <tr><td style="padding: 8px 0; font-size: 15px; color: #4b5563;">📍 &nbsp;Track your orders in real-time</td></tr>
        <tr><td style="padding: 8px 0; font-size: 15px; color: #4b5563;">💰 &nbsp;Access exclusive deals and offers</td></tr>
      </table>
      ${ctaButton('Start Ordering', `${CLIENT_URL}/menu.html`)}
      ${signature()}
    `
  }),

  // 2. Email verification
  emailVerification: ({ firstName, verifyUrl }) => baseTemplate({
    title: 'Verify Your Email',
    preheader: `${firstName}, please verify your email to get started.`,
    body: `
      ${greeting(firstName)}
      ${paragraph('Thanks for signing up! Please verify your email address to activate your account and start ordering.')}
      ${ctaButton('Verify My Email', verifyUrl)}
      ${infoBox(`
        <p style="margin: 0; font-size: 13px; color: #6b7280;">
          <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
          <a href="${verifyUrl}" style="color: #DC2626; word-break: break-all; font-size: 12px;">${verifyUrl}</a>
        </p>
      `)}
      ${paragraph('This verification link expires in <strong>24 hours</strong>. If you didn\'t create this account, you can safely ignore this email.')}
      ${signature()}
    `
  }),

  // 3. Email verified confirmation
  emailVerified: ({ firstName }) => baseTemplate({
    title: 'Email Verified!',
    preheader: 'Your email is now verified. Start ordering!',
    body: `
      ${greeting(firstName)}
      ${paragraph('Your email has been verified successfully! ✅')}
      ${paragraph('You now have full access to all SWIFT CHOW features including order tracking, saved addresses, and exclusive deals.')}
      ${ctaButton('Browse Menu', `${CLIENT_URL}/menu.html`)}
      ${signature()}
    `
  }),

  // 4. Login notification
  loginNotification: ({ firstName, loginTime }) => baseTemplate({
    title: 'New Login to Your Account',
    preheader: 'A new login was detected on your account.',
    body: `
      ${greeting(firstName)}
      ${paragraph('Your SWIFT CHOW account was just accessed.')}
      ${infoBox(`
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #374151;"><strong>Time:</strong> ${loginTime}</p>
      `)}
      ${paragraph('If this was you, no action is needed. If you don\'t recognize this login, please <a href="' + CLIENT_URL + '/account.html" style="color: #DC2626; font-weight: 600;">change your password</a> immediately.')}
      ${signature()}
    `
  }),

  // 5. Password reset
  passwordReset: ({ firstName, resetUrl }) => baseTemplate({
    title: 'Reset Your Password',
    preheader: 'You requested a password reset for your SWIFT CHOW account.',
    body: `
      ${greeting(firstName)}
      ${paragraph('You requested to reset your password. Click the button below to set a new password:')}
      ${ctaButton('Reset Password', resetUrl)}
      ${infoBox(`
        <p style="margin: 0; font-size: 13px; color: #6b7280;">
          <strong>Can't click the button?</strong> Copy this link:<br>
          <a href="${resetUrl}" style="color: #DC2626; word-break: break-all; font-size: 12px;">${resetUrl}</a>
        </p>
      `)}
      ${paragraph('This link will expire in <strong>1 hour</strong>. If you didn\'t request this, please ignore this email — your password will remain unchanged.')}
      ${signature()}
    `
  }),

  // 6. Password changed confirmation
  passwordChanged: ({ firstName }) => baseTemplate({
    title: 'Password Changed',
    preheader: 'Your SWIFT CHOW password has been updated.',
    body: `
      ${greeting(firstName)}
      ${paragraph('Your password has been successfully changed. ✅')}
      ${paragraph('If you did not make this change, please contact us immediately at <a href="mailto:orders@swiftchow.me" style="color: #DC2626;">orders@swiftchow.me</a>.')}
      ${ctaButton('Go to My Account', `${CLIENT_URL}/account.html`)}
      ${signature()}
    `
  }),

  // 7. Order confirmation
  orderConfirmation: ({ firstName, orderId, items, subtotal, deliveryFee, total }) => {
    const itemRows = (items || []).map(i => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151;">${i.name} x${i.quantity}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151; text-align: right;">GHS ${(i.price * i.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    return baseTemplate({
      title: 'Order Confirmed!',
      preheader: `Your order ${orderId} has been confirmed.`,
      body: `
        ${greeting(firstName)}
        ${paragraph('Great news! Your order has been confirmed and is being prepared. 🎉')}
        ${infoBox(`<p style="margin: 0; font-size: 16px; color: #1f2937; text-align: center;"><strong>Order ID:</strong> ${orderId}</p>`)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
          ${itemRows}
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Subtotal</td>
            <td style="padding: 8px 0; font-size: 14px; color: #6b7280; text-align: right;">GHS ${(subtotal || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Delivery</td>
            <td style="padding: 8px 0; font-size: 14px; color: #6b7280; text-align: right;">GHS ${(deliveryFee || 15).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0 0; font-size: 18px; color: #DC2626; font-weight: 700; border-top: 2px solid #e5e7eb;">Total</td>
            <td style="padding: 12px 0 0; font-size: 18px; color: #DC2626; font-weight: 700; border-top: 2px solid #e5e7eb; text-align: right;">GHS ${(total || 0).toFixed(2)}</td>
          </tr>
        </table>
        ${ctaButton('Track Your Order', `${CLIENT_URL}/tracking.html?orderId=${orderId}`)}
        ${signature()}
      `
    });
  },

  // 8. Newsletter welcome
  newsletterWelcome: ({ email }) => baseTemplate({
    title: 'Newsletter Subscription Confirmed',
    preheader: 'Welcome to the SWIFT CHOW newsletter!',
    body: `
      <p style="font-size: 16px; color: #1f2937; margin: 0 0 16px 0;">Hello!</p>
      ${paragraph('Thank you for subscribing to the SWIFT CHOW newsletter! 📧')}
      ${paragraph('You\'ll now receive:')}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 20px 0;">
        <tr><td style="padding: 6px 0; font-size: 15px; color: #4b5563;">🔥 &nbsp;Exclusive deals and promo codes</td></tr>
        <tr><td style="padding: 6px 0; font-size: 15px; color: #4b5563;">🍕 &nbsp;New menu item announcements</td></tr>
        <tr><td style="padding: 6px 0; font-size: 15px; color: #4b5563;">📰 &nbsp;Food tips and blog posts</td></tr>
      </table>
      ${ctaButton('Browse Our Menu', `${CLIENT_URL}/menu.html`)}
      ${paragraph('<em style="font-size: 13px; color: #9ca3af;">You can unsubscribe at any time from your account settings.</em>')}
      ${signature()}
    `
  }),

  // 9. Contact form auto-reply
  contactReply: ({ firstName, subject, message }) => baseTemplate({
    title: 'We Received Your Message',
    preheader: `Re: ${subject}`,
    body: `
      ${greeting(firstName)}
      ${paragraph('Thank you for reaching out to SWIFT CHOW! We\'ve received your message and our team will get back to you within <strong>24 hours</strong>.')}
      ${infoBox(`
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;"><strong>Subject:</strong> ${subject}</p>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">${message}</p>
      `)}
      ${paragraph('In the meantime, you might find answers on our website or by chatting with our AI assistant.')}
      ${signature()}
    `
  }),

  // 10. Review thank you
  reviewThankYou: ({ name, rating }) => {
    const stars = '★'.repeat(Number(rating)) + '☆'.repeat(5 - Number(rating));
    return baseTemplate({
      title: 'Thank You for Your Review!',
      preheader: 'We appreciate your feedback.',
      body: `
        ${greeting(name)}
        ${paragraph('Thank you for taking the time to review SWIFT CHOW! Your feedback helps us improve. 💛')}
        ${infoBox(`<p style="margin: 0; text-align: center; font-size: 24px; letter-spacing: 4px; color: #F59E0B;">${stars}</p>`)}
        ${paragraph('We value every review and use your feedback to make our service even better.')}
        ${ctaButton('Order Again', `${CLIENT_URL}/menu.html`)}
        ${signature()}
      `
    });
  }
};

module.exports = templates;
