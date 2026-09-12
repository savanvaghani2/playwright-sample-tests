/** @param {number} amount */
export function formatPrice(amount) {
  if (amount < 0) {
    return 'Invalid';
  }

  if (amount === 0) {
    return 'Free';
  }

  return `$${amount.toFixed(2)}`;
}

/** @param {string | undefined} email */
export function validateEmail(email) {
  if (!email) {
    return false;
  }

  return email.includes('@');
}

/** @param {number} price @param {'gold' | 'silver' | 'none'} tier */
export function calculateDiscount(price, tier) {
  if (tier === 'gold') {
    return price * 0.8;
  }

  if (tier === 'silver') {
    return price * 0.9;
  }

  return price;
}

/** @returns {number} */
export function add(a, b) {
  return a + b;
}

/** @param {string | undefined} name */
export function greet(name) {
  if (!name || name.trim() === '') {
    return 'Hello';
  }

  return `Hello, ${name.trim()}`;
}

/** @param {number} value */
export function isPositive(value) {
  if (value > 0) {
    return true;
  }

  return false;
}

/** @param {number} current */
export function incrementCounter(current) {
  return current + 1;
}
