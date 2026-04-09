import { CURRENCY } from './config.js';

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toItemPayload(product, quantity = 1, index = undefined) {
  const item = {
    item_id: product.item_id,
    item_name: product.item_name,
    item_brand: product.item_brand,
    item_variant: product.item_variant,
    item_category: product.item_category,
    item_category2: product.item_category2,
    item_category3: product.item_category3,
    price: product.price,
    quantity,
    affiliation: product.affiliation,
  };
  if (index !== undefined) item.index = index;
  return item;
}

function baseParams(sessionCtx) {
  return {
    session_id: sessionCtx.sessionId,
    engagement_time_msec: randomBetween(100, 5000),
  };
}

export function buildViewItemList(sessionCtx, products, listName) {
  return {
    name: 'view_item_list',
    params: {
      ...baseParams(sessionCtx),
      item_list_id: listName.toLowerCase().replace(/\s+/g, '_'),
      item_list_name: listName,
      items: products.map((p, i) => toItemPayload(p, 1, i)),
    },
  };
}

export function buildViewItem(sessionCtx, product) {
  return {
    name: 'view_item',
    params: {
      ...baseParams(sessionCtx),
      currency: CURRENCY,
      value: product.price,
      items: [toItemPayload(product)],
    },
  };
}

export function buildAddToCart(sessionCtx, product, quantity = 1) {
  return {
    name: 'add_to_cart',
    params: {
      ...baseParams(sessionCtx),
      currency: CURRENCY,
      value: +(product.price * quantity).toFixed(2),
      items: [toItemPayload(product, quantity)],
    },
  };
}

export function buildRemoveFromCart(sessionCtx, product, quantity = 1) {
  return {
    name: 'remove_from_cart',
    params: {
      ...baseParams(sessionCtx),
      currency: CURRENCY,
      value: +(product.price * quantity).toFixed(2),
      items: [toItemPayload(product, quantity)],
    },
  };
}

export function buildAddToWishlist(sessionCtx, product) {
  return {
    name: 'add_to_wishlist',
    params: {
      ...baseParams(sessionCtx),
      currency: CURRENCY,
      value: product.price,
      items: [toItemPayload(product)],
    },
  };
}

export function buildBeginCheckout(sessionCtx, cartItems, coupon) {
  const value = cartItems.reduce((sum, ci) => sum + ci.product.price * ci.quantity, 0);
  const params = {
    ...baseParams(sessionCtx),
    currency: CURRENCY,
    value: +value.toFixed(2),
    items: cartItems.map((ci, i) => toItemPayload(ci.product, ci.quantity, i)),
  };
  if (coupon) params.coupon = coupon;
  return { name: 'begin_checkout', params };
}

export function buildAddShippingInfo(sessionCtx, cartItems, coupon, shippingTier) {
  const value = cartItems.reduce((sum, ci) => sum + ci.product.price * ci.quantity, 0);
  const params = {
    ...baseParams(sessionCtx),
    currency: CURRENCY,
    value: +value.toFixed(2),
    shipping_tier: shippingTier,
    items: cartItems.map((ci, i) => toItemPayload(ci.product, ci.quantity, i)),
  };
  if (coupon) params.coupon = coupon;
  return { name: 'add_shipping_info', params };
}

export function buildAddPaymentInfo(sessionCtx, cartItems, coupon, paymentType) {
  const value = cartItems.reduce((sum, ci) => sum + ci.product.price * ci.quantity, 0);
  const params = {
    ...baseParams(sessionCtx),
    currency: CURRENCY,
    value: +value.toFixed(2),
    payment_type: paymentType,
    items: cartItems.map((ci, i) => toItemPayload(ci.product, ci.quantity, i)),
  };
  if (coupon) params.coupon = coupon;
  return { name: 'add_payment_info', params };
}

export function buildPurchase(sessionCtx, cartItems, transactionId, coupon, shipping, tax) {
  const itemsTotal = cartItems.reduce((sum, ci) => sum + ci.product.price * ci.quantity, 0);
  const value = itemsTotal + shipping + tax;
  const params = {
    ...baseParams(sessionCtx),
    transaction_id: transactionId,
    currency: CURRENCY,
    value: +value.toFixed(2),
    shipping: +shipping.toFixed(2),
    tax: +tax.toFixed(2),
    items: cartItems.map((ci, i) => toItemPayload(ci.product, ci.quantity, i)),
  };
  if (coupon) params.coupon = coupon;
  return { name: 'purchase', params };
}

export function buildRefund(sessionCtx, transactionId, items, value) {
  return {
    name: 'refund',
    params: {
      ...baseParams(sessionCtx),
      transaction_id: transactionId,
      currency: CURRENCY,
      value: +value.toFixed(2),
      items,
    },
  };
}
