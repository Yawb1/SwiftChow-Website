/**
 * SWIFT CHOW - Shared Configuration Constants
 * Centralizes secrets and configuration used across the backend
 */

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is not set');
const JWT_EXPIRES_IN = '7d';

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN
};
