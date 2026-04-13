import {
  PRODUCTS, CATEGORIES, COUPONS, PAYMENT_TYPES, SHIPPING_TIERS,
  EVENT_DELAY_MIN_SEC, EVENT_DELAY_MAX_SEC, CURRENCY,
} from './config.js';
import {
  generateClientId, generateUserId, generateSessionId,
  generateTransactionId, completedTransactions,
} from './userGenerator.js';
import * as events from './ecommerceEvents.js';

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function getProductsByCategory(category) {
  return PRODUCTS.filter(p => p.item_category === category);
}

function nextTimestamp(currentMicros) {
  const delaySec = randomBetween(EVENT_DELAY_MIN_SEC, EVENT_DELAY_MAX_SEC);
  return currentMicros + delaySec * 1_000_000;
}

export function generateSession(sessionType, startTimeMicros) {
  const clientId = generateClientId();
  const userId = Math.random() < 0.3 ? generateUserId() : null;
  const sessionId = generateSessionId();

  const ctx = { clientId, userId, sessionId };
  const timedEvents = [];
  let ts = startTimeMicros;

  function addEvent(event) {
    timedEvents.push({ event, timestampMicros: ts });
    ts = nextTimestamp(ts);
  }

  const category = pick(CATEGORIES);
  const categoryProducts = getProductsByCategory(category);
  const listProducts = pickN(categoryProducts, randomBetween(3, Math.min(categoryProducts.length, 8)));

  // All sessions start with browsing
  addEvent(events.buildViewItemList(ctx, listProducts, category));

  if (sessionType === 'refund') {
    return buildRefundSession(ctx, timedEvents, ts);
  }

  // View 1-2 products
  const viewedProducts = pickN(listProducts, randomBetween(1, 2));

  // Select items from the list (click)
  for (const product of viewedProducts) {
    const index = listProducts.indexOf(product);
    addEvent(events.buildSelectItem(ctx, product, category, index));
  }

  for (const product of viewedProducts) {
    addEvent(events.buildViewItem(ctx, product));
  }

  if (sessionType === 'browse') {
    return wrapSession(clientId, userId, timedEvents);
  }

  const primaryProduct = viewedProducts[0];

  if (sessionType === 'wishlist') {
    addEvent(events.buildAddToWishlist(ctx, primaryProduct));
    return wrapSession(clientId, userId, timedEvents);
  }

  // From here on, all paths involve add_to_cart
  const cartItems = [];
  const qty = randomBetween(1, 3);
  addEvent(events.buildAddToCart(ctx, primaryProduct, qty));
  cartItems.push({ product: primaryProduct, quantity: qty });

  // Sometimes add a second item
  if (viewedProducts.length > 1 && Math.random() < 0.4) {
    const secondProduct = viewedProducts[1];
    const qty2 = randomBetween(1, 2);
    addEvent(events.buildAddToCart(ctx, secondProduct, qty2));
    cartItems.push({ product: secondProduct, quantity: qty2 });
  }

  // Occasionally remove and re-add (20% chance)
  if (Math.random() < 0.2 && cartItems.length > 0) {
    const removeItem = cartItems[0];
    addEvent(events.buildRemoveFromCart(ctx, removeItem.product, 1));
    addEvent(events.buildAddToCart(ctx, removeItem.product, 1));
  }

  if (sessionType === 'addToCart') {
    return wrapSession(clientId, userId, timedEvents);
  }

  // Checkout flow
  const coupon = pick(COUPONS);
  addEvent(events.buildBeginCheckout(ctx, cartItems, coupon));

  if (sessionType === 'checkoutAbandon') {
    return wrapSession(clientId, userId, timedEvents);
  }

  // Purchase flow
  const shippingTier = pick(SHIPPING_TIERS);
  addEvent(events.buildAddShippingInfo(ctx, cartItems, coupon, shippingTier));

  const paymentType = pick(PAYMENT_TYPES);
  addEvent(events.buildAddPaymentInfo(ctx, cartItems, coupon, paymentType));

  const transactionId = generateTransactionId();
  const shipping = +(randomBetween(3, 15) + Math.random()).toFixed(2);
  const itemsTotal = cartItems.reduce((sum, ci) => sum + ci.product.price * ci.quantity, 0);
  const tax = +(itemsTotal * 0.21).toFixed(2); // 21% VAT
  addEvent(events.buildPurchase(ctx, cartItems, transactionId, coupon, shipping, tax));

  // Record for refund sessions
  completedTransactions.push({
    transaction_id: transactionId,
    items: cartItems.map(ci => ({
      item_id: ci.product.item_id,
      item_name: ci.product.item_name,
      price: ci.product.price,
      quantity: ci.quantity,
    })),
    value: +(itemsTotal + shipping + tax).toFixed(2),
  });

  return wrapSession(clientId, userId, timedEvents);
}

function buildRefundSession(ctx, timedEvents, ts) {
  if (completedTransactions.length === 0) {
    // No purchases to refund — downgrade to a purchase session
    return generateSession('purchase', timedEvents[0]?.timestampMicros || ts);
  }

  const txn = pick(completedTransactions);
  // Partial refund (1 item) or full refund
  const isPartial = Math.random() < 0.5 && txn.items.length > 1;
  const refundItems = isPartial ? [txn.items[0]] : txn.items;
  const refundValue = isPartial
    ? +(refundItems[0].price * refundItems[0].quantity).toFixed(2)
    : txn.value;

  timedEvents.push({
    event: events.buildRefund(ctx, txn.transaction_id, refundItems, refundValue),
    timestampMicros: ts,
  });

  return wrapSession(ctx.clientId, ctx.userId, timedEvents);
}

function wrapSession(clientId, userId, timedEvents) {
  return { clientId, userId, events: timedEvents };
}
