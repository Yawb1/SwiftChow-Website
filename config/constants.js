/**
 * SWIFT CHOW - Shared Configuration Constants
 * Centralizes secrets and configuration used across the backend
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN
};
