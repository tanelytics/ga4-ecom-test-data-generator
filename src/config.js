// Product catalog, session weights, and constants

export const CURRENCY = 'EUR';
export const SESSIONS_MIN = 100;
export const SESSIONS_MAX = 200;
export const EVENT_DELAY_MIN_SEC = 10;
export const EVENT_DELAY_MAX_SEC = 120;
export const MP_BATCH_SIZE = 25;
export const MP_REQUEST_DELAY_MS = 150;

export const SESSION_WEIGHTS = {
  browse: 0.50,
  addToCart: 0.25,
  wishlist: 0.05,
  checkoutAbandon: 0.08,
  purchase: 0.10,
  refund: 0.02,
};

export const COUPONS = ['WELCOME10', 'SPRING20', 'VIP15', null, null, null];
export const PAYMENT_TYPES = ['credit_card', 'paypal', 'google_pay', 'bank_transfer'];
export const SHIPPING_TIERS = ['standard', 'express', 'next_day'];

export const PRODUCTS = [
  // Apparel
  { item_id: 'SKU_APP_001', item_name: 'Classic Cotton T-Shirt', item_brand: 'BasicWear', item_variant: 'Blue / M', item_category: 'Apparel', item_category2: 'Tops', item_category3: 'T-Shirts', price: 29.99, affiliation: 'Online Store' },
  { item_id: 'SKU_APP_002', item_name: 'Slim Fit Jeans', item_brand: 'DenimCo', item_variant: 'Dark Wash / 32', item_category: 'Apparel', item_category2: 'Bottoms', item_category3: 'Jeans', price: 79.99, affiliation: 'Online Store' },
  { item_id: 'SKU_APP_003', item_name: 'Waterproof Jacket', item_brand: 'OutdoorPro', item_variant: 'Green / L', item_category: 'Apparel', item_category2: 'Outerwear', item_category3: 'Jackets', price: 149.99, affiliation: 'Online Store' },
  { item_id: 'SKU_APP_004', item_name: 'Canvas Sneakers', item_brand: 'StreetStep', item_variant: 'White / 42', item_category: 'Apparel', item_category2: 'Footwear', item_category3: 'Sneakers', price: 64.99, affiliation: 'Online Store' },
  { item_id: 'SKU_APP_005', item_name: 'Wool Beanie', item_brand: 'CozyKnit', item_variant: 'Charcoal', item_category: 'Apparel', item_category2: 'Accessories', item_category3: 'Hats', price: 24.99, affiliation: 'Online Store' },

  // Electronics
  { item_id: 'SKU_ELC_001', item_name: 'Wireless Headphones', item_brand: 'SoundMax', item_variant: 'Black', item_category: 'Electronics', item_category2: 'Audio', item_category3: 'Headphones', price: 89.99, affiliation: 'Online Store' },
  { item_id: 'SKU_ELC_002', item_name: 'Silicone Phone Case', item_brand: 'ShieldTech', item_variant: 'Clear / iPhone 15', item_category: 'Electronics', item_category2: 'Accessories', item_category3: 'Phone Cases', price: 19.99, affiliation: 'Online Store' },
  { item_id: 'SKU_ELC_003', item_name: 'USB-C Braided Cable', item_brand: 'ConnectPro', item_variant: '2m', item_category: 'Electronics', item_category2: 'Cables', item_category3: 'USB-C', price: 14.99, affiliation: 'Online Store' },
  { item_id: 'SKU_ELC_004', item_name: 'Portable Power Bank', item_brand: 'JuicePack', item_variant: '10000mAh', item_category: 'Electronics', item_category2: 'Power', item_category3: 'Chargers', price: 39.99, affiliation: 'Online Store' },
  { item_id: 'SKU_ELC_005', item_name: 'Fitness Smart Watch', item_brand: 'PulseTrack', item_variant: 'Silver', item_category: 'Electronics', item_category2: 'Wearables', item_category3: 'Watches', price: 199.99, affiliation: 'Online Store' },

  // Home & Garden
  { item_id: 'SKU_HG_001', item_name: 'Ceramic Plant Pot', item_brand: 'GreenHome', item_variant: 'Terracotta / Large', item_category: 'Home & Garden', item_category2: 'Garden', item_category3: 'Pots', price: 34.99, affiliation: 'Online Store' },
  { item_id: 'SKU_HG_002', item_name: 'Adjustable LED Desk Lamp', item_brand: 'BrightSpace', item_variant: 'Matte Black', item_category: 'Home & Garden', item_category2: 'Lighting', item_category3: 'Lamps', price: 49.99, affiliation: 'Online Store' },
  { item_id: 'SKU_HG_003', item_name: 'Knitted Throw Blanket', item_brand: 'CozyNest', item_variant: 'Cream / 150x200cm', item_category: 'Home & Garden', item_category2: 'Textiles', item_category3: 'Blankets', price: 59.99, affiliation: 'Online Store' },
  { item_id: 'SKU_HG_004', item_name: 'Soy Candle Set', item_brand: 'AmberGlow', item_variant: 'Vanilla & Cedar / 3-pack', item_category: 'Home & Garden', item_category2: 'Decor', item_category3: 'Candles', price: 27.99, affiliation: 'Online Store' },
  { item_id: 'SKU_HG_005', item_name: 'Minimalist Wall Clock', item_brand: 'TimeLine', item_variant: 'Oak / 30cm', item_category: 'Home & Garden', item_category2: 'Decor', item_category3: 'Clocks', price: 44.99, affiliation: 'Online Store' },

  // Books
  { item_id: 'SKU_BK_001', item_name: 'The Silent Horizon', item_brand: 'Penguin', item_variant: 'Paperback', item_category: 'Books', item_category2: 'Fiction', item_category3: 'Literary Fiction', price: 14.99, affiliation: 'Online Store' },
  { item_id: 'SKU_BK_002', item_name: 'Mediterranean Kitchen', item_brand: 'DK Publishing', item_variant: 'Hardcover', item_category: 'Books', item_category2: 'Non-Fiction', item_category3: 'Cookbooks', price: 32.99, affiliation: 'Online Store' },
  { item_id: 'SKU_BK_003', item_name: 'Systems Design Handbook', item_brand: 'OReilly', item_variant: 'Paperback', item_category: 'Books', item_category2: 'Non-Fiction', item_category3: 'Technology', price: 49.99, affiliation: 'Online Store' },
  { item_id: 'SKU_BK_004', item_name: 'Wanderlust: Europe Edition', item_brand: 'Lonely Planet', item_variant: 'Paperback', item_category: 'Books', item_category2: 'Non-Fiction', item_category3: 'Travel', price: 22.99, affiliation: 'Online Store' },
  { item_id: 'SKU_BK_005', item_name: 'Adventures of Astro Cat', item_brand: 'Scholastic', item_variant: 'Hardcover', item_category: 'Books', item_category2: 'Children', item_category3: 'Picture Books', price: 12.99, affiliation: 'Online Store' },

  // Sports
  { item_id: 'SKU_SP_001', item_name: 'Non-Slip Yoga Mat', item_brand: 'FlexFit', item_variant: 'Purple / 6mm', item_category: 'Sports', item_category2: 'Yoga', item_category3: 'Mats', price: 39.99, affiliation: 'Online Store' },
  { item_id: 'SKU_SP_002', item_name: 'Insulated Water Bottle', item_brand: 'HydroCore', item_variant: 'Steel / 750ml', item_category: 'Sports', item_category2: 'Hydration', item_category3: 'Bottles', price: 29.99, affiliation: 'Online Store' },
  { item_id: 'SKU_SP_003', item_name: 'Resistance Band Set', item_brand: 'PowerLoop', item_variant: '5-pack / Mixed', item_category: 'Sports', item_category2: 'Strength', item_category3: 'Bands', price: 24.99, affiliation: 'Online Store' },
  { item_id: 'SKU_SP_004', item_name: 'Compression Running Socks', item_brand: 'StridePro', item_variant: 'Black / M', item_category: 'Sports', item_category2: 'Running', item_category3: 'Socks', price: 18.99, affiliation: 'Online Store' },
  { item_id: 'SKU_SP_005', item_name: 'Speed Jump Rope', item_brand: 'SkipFast', item_variant: 'Adjustable / 3m', item_category: 'Sports', item_category2: 'Cardio', item_category3: 'Ropes', price: 16.99, affiliation: 'Online Store' },
];

export const CATEGORIES = [...new Set(PRODUCTS.map(p => p.item_category))];
