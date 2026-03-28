/**
 * utils/whatsapp.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Formats the cart into a clean WhatsApp order message and generates the wa.me link.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * formatOrderMessage — converts cart items into a readable WhatsApp message.
 *
 * Example output:
 *   Hi! I'd like to place an order from Smash Kitchen 🍔
 *
 *   🛒 My Order:
 *   • Classic Smash Burger × 2 — SAR 70
 *   • Loaded Cheese Fries × 1 — SAR 25
 *
 *   💰 Total: SAR 95
 *
 *   Please confirm my order. Thank you! 🙏
 *
 * @param {Object} params
 * @param {string} params.restaurantName
 * @param {string} params.restaurantEmoji
 * @param {Array}  params.items  — array of { name, price, qty }
 * @returns {string}
 */
export function formatOrderMessage({ restaurantName, restaurantEmoji, items }) {
  if (!items || items.length === 0) return "";

  const lines = items
    .map((item) => {
      const lineTotal = item.price * item.qty;
      return `• ${item.name} × ${item.qty} — SAR ${lineTotal}`;
    })
    .join("\n");

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const message = [
    `Hi! I'd like to place an order from ${restaurantName} ${restaurantEmoji}`,
    ``,
    `🛒 My Order:`,
    lines,
    ``,
    `💰 Total: SAR ${total}`,
    ``,
    `Please confirm my order. Thank you! 🙏`,
  ].join("\n");

  return message;
}

/**
 * buildWhatsAppLink — creates the wa.me deep link with encoded message.
 *
 * @param {string} phone   — WhatsApp number, e.g. "966501234567"
 * @param {string} message — plain text message
 * @returns {string}       — full wa.me URL
 */
export function buildWhatsAppLink(phone, message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}

/**
 * getOrderTotal — sums up cart items.
 * @param {Array} items — { price, qty }[]
 * @returns {number}
 */
export function getOrderTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

/**
 * getItemCount — total number of individual items in cart.
 * @param {Array} items
 * @returns {number}
 */
export function getItemCount(items) {
  return items.reduce((sum, item) => sum + item.qty, 0);
}
