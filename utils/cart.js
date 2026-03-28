/**
 * utils/cart.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure functions for cart state management.
 * The actual state lives in the page component via useState.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * addToCart — adds an item or increments quantity if already present.
 * @param {Array}  cart
 * @param {Object} item — { id, name, price, emoji, category }
 * @returns {Array}     — new cart array (immutable)
 */
export function addToCart(cart, item) {
  const existing = cart.find((c) => c.id === item.id);
  if (existing) {
    return cart.map((c) =>
      c.id === item.id ? { ...c, qty: c.qty + 1 } : c
    );
  }
  return [...cart, { ...item, qty: 1 }];
}

/**
 * removeFromCart — decrements qty by 1; removes item if qty reaches 0.
 * @param {Array}  cart
 * @param {number} itemId
 * @returns {Array}
 */
export function removeFromCart(cart, itemId) {
  return cart
    .map((c) => (c.id === itemId ? { ...c, qty: c.qty - 1 } : c))
    .filter((c) => c.qty > 0);
}

/**
 * deleteFromCart — removes an item entirely regardless of quantity.
 * @param {Array}  cart
 * @param {number} itemId
 * @returns {Array}
 */
export function deleteFromCart(cart, itemId) {
  return cart.filter((c) => c.id !== itemId);
}

/**
 * getItemQty — returns the quantity of a specific item in the cart (0 if absent).
 * @param {Array}  cart
 * @param {number} itemId
 * @returns {number}
 */
export function getItemQty(cart, itemId) {
  return cart.find((c) => c.id === itemId)?.qty ?? 0;
}

/**
 * clearCart — empties the cart.
 * @returns {Array}
 */
export function clearCart() {
  return [];
}
