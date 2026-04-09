import crypto from 'node:crypto';

// Pool of synthetic user IDs for simulating returning logged-in users
const USER_ID_POOL = Array.from({ length: 15 }, (_, i) =>
  `user_synth_${crypto.randomUUID().slice(0, 8)}`
);

// Accumulated purchases that refund sessions can reference
export const completedTransactions = [];

export function generateClientId() {
  const hash = crypto.randomUUID().replace(/-/g, '').slice(0, 10);
  return `synth_${hash}.${Date.now()}`;
}

export function generateUserId() {
  return USER_ID_POOL[Math.floor(Math.random() * USER_ID_POOL.length)];
}

export function generateSessionId() {
  return String(Math.floor(Math.random() * 2 ** 31));
}

export function generateTransactionId() {
  const rand = crypto.randomUUID().slice(0, 6);
  return `TXN_${Date.now()}_${rand}`;
}
