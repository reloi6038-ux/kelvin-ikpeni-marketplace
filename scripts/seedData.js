/**
 * scripts/seedData.js
 * -------------------
 * Raw demo data for seeding. All products use realistic Nigerian naira
 * price ranges. Images are from Unsplash (free, hotlinked, no auth needed).
 *
 * Prices are ILLUSTRATIVE DEMO PRICES, not verified current market prices.
 */

export const DEMO_USERS = [
  // ─── Admin ───
  {
    name: 'Kelvin Ikpeni',
    email: 'admin@kelvinikpeni.com',
    phone: '08012345678',
    password: 'Admin@12345',
    role: 'admin',
    emailVerified: true,
  },
  // ─── Sellers (each gets a Seller profile) ───
  {
    name: 'Chidi Okonkwo',
    email: 'chidi@techhub.ng',
    phone: '08023456789',
    password: 'Seller@123',
    role: 'seller',
    emailVerified: true,
    store: {
      storeName: 'TechHub Lagos',
      description:
        'Premium electronics and gadgets from Lagos. Authentic products, fast delivery nationwide.',
      businessEmail: 'sales@techhub.ng',
      businessPhone: '08023456789',
      businessAddress: { street: '15 Adeola Odeku St', city: 'Lagos', state: 'Lagos' },
      status: 'approved',
      commissionPercent: 8,
    },
  },
  {
    name: 'Amara Nwosu',
    email: 'amara@fashionforward.ng',
    phone: '08034567890',
    password: 'Seller@123',
    role: 'seller',
    emailVerified: true,
    store: {
      storeName: 'Fashion Forward NG',
      description:
        'Contemporary Nigerian fashion. Ankara, agbada, kaftans, and modern streetwear.',
      businessEmail: 'hello@fashionforward.ng',
      businessPhone: '08034567890',
      businessAddress: { street: '8 Ozumba Mbadiwe Ave', city: 'Lagos', state: 'Lagos' },
      status: 'approved',
      commissionPercent: 12,
    },
  },
  {
    name: 'Emeka Obi',
    email: 'emeka@homeessentials.ng',
    phone: '08045678901',
    password: 'Seller@123',
    role: 'seller',
    emailVerified: true,
    store: {
      storeName: 'Home Essentials',
      description:
        'Furniture, appliances, and everything your home needs. Quality guaranteed.',
      businessEmail: 'orders@homeessentials.ng',
      businessPhone: '08045678901',
      businessAddress: { street: '22 Aminu Kano Cres', city: 'Abuja', state: 'FCT' },
      status: 'approved',
      commissionPercent: 10,
    },
  },
  {
    name: 'Blessing Adeyemi',
    email: 'blessing@beautybar.ng',
    phone: '08056789012',
    password: 'Seller@123',
    role: 'seller',
    emailVerified: true,
    store: {
      storeName: 'Beauty Bar',
      description:
        'Premium skincare, makeup, and wellness products. Authentic brands only.',
      businessEmail: 'care@beautybar.ng',
      businessPhone: '08056789012',
      businessAddress: { street: '10 Awolowo Rd', city: 'Ibadan', state: 'Oyo' },
      status: 'approved',
      commissionPercent: 15,
    },
  },
  {
    name: 'Tunde Bakare',
    email: 'tunde@bookworm.ng',
    phone: '08067890123',
    password: 'Seller@123',
    role: 'seller',
    emailVerified: true,
    store: {
      storeName: 'BookWorm Nigeria',
      description:
        'Books for every reader. Nigerian literature, textbooks, business, and children books.',
      businessEmail: 'info@bookworm.ng',
      businessPhone: '08067890123',
      businessAddress: { street: '3 Allen Ave', city: 'Lagos', state: 'Lagos' },
      status: 'approved',
      commissionPercent: 15,
    },
  },
  {
    name: 'Ngozi Eze',
    email: 'ngozi@gadgetgalaxy.ng',
    phone: '08078901234',
    password: 'Seller@123',
    role: 'seller',
    emailVerified: true,
    store: {
      storeName: 'Gadget Galaxy',
      description:
        'Latest gadgets, audio gear, smartwatches, and gaming. Genuine warranty on all items.',
      businessEmail: 'support@gadgetgalaxy.ng',
      businessPhone: '08078901234',
      businessAddress: { street: '45 Marina Rd', city: 'Port Harcourt', state: 'Rivers' },
      status: 'approved',
      commissionPercent: 10,
    },
  },
  // ─── Customers ───
  ...Array.from({ length: 20 }, (_, i) => ({
    name: [
      'Adebayo Johnson', 'Chiamaka Okafor', 'Ibrahim Musa', 'Fatima Bello',
      'Oluwaseun Adeyemi', 'Ngozi Okonkwo', 'Yusuf Abdullahi', 'Chinaza Eze',
      'Tola Ogundipe', 'Kelechi Nnamdi', 'Zainab Ibrahim', 'Bola Adekunle',
      'Nkem Ibeh', 'Seyi Ogunlana', 'Hauwa Mohammed', 'Uche Okorie',
      'Bukola Afolabi', 'Ifeanyi Uche', 'Rukayat Salami', 'Femi Akinwande',
    ][i],
    email: `customer${i + 1}@example.com`,
    phone: `080${String(90000000 + i * 12345).slice(-8)}`,
    password: 'Customer@123',
    role: 'customer',
    emailVerified: true,
  })),
];

// ─────────────────────────────────────────────────────────────
// PRODUCTS — grouped by category
// All prices in Nigerian naira (NGN). Demo prices only.
// ─────────────────────────────────────────────────────────────
export const DEMO_PRODUCTS = [
  // ─── SMARTPHONES ───
  { name: 'iPhone 15 Pro Max 256GB', brand: 'Apple', category: 'Phones & Tablets', seller: 'TechHub Lagos',
    price: 1850000, previousPrice: 2100000, stock: 15, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
    description: "The ultimate iPhone with titanium design, A17 Pro chip, and pro camera system. 6.7-inch Super Retina XDR display, 48MP main camera, USB-C, and all-day battery life.",
    tags: ['iphone', 'apple', 'smartphone', 'flagship', '5g'] },

  { name: 'Samsung Galaxy S24 Ultra 512GB', brand: 'Samsung', category: 'Phones & Tablets', seller: 'TechHub Lagos',
    price: 1650000, previousPrice: 1850000, stock: 22, featured: true, flashSale: true, flashHours: 72,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
    description: "Galaxy AI is here. Titanium frame, 200MP camera, S Pen included. Snapdragon 8 Gen 3, 5000mAh battery, and 6.8-inch QHD+ display.",
    tags: ['samsung', 'galaxy', 'android', 'flagship', 's-pen'] },

  { name: 'Google Pixel 8 Pro 128GB', brand: 'Google', category: 'Phones & Tablets', seller: 'Gadget Galaxy',
    price: 950000, previousPrice: 1050000, stock: 18, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
    description: "Google Tensor G3, best-in-class computational photography, 7 years of updates. 6.7-inch LTPO OLED display.",
    tags: ['google', 'pixel', 'android', 'camera'] },

  { name: 'Tecno Camon 30 Pro 5G', brand: 'Tecno', category: 'Phones & Tablets', seller: 'Gadget Galaxy',
    price: 385000, previousPrice: 420000, stock: 45, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    description: "Flagship 50MP Sony sensor camera, 6.78-inch AMOLED 120Hz display, 5000mAh battery with 70W fast charge.",
    tags: ['tecno', 'camon', 'android', 'budget', '5g'] },

  { name: 'Infinix Note 40 Pro', brand: 'Infinix', category: 'Phones & Tablets', seller: 'Gadget Galaxy',
    price: 285000, previousPrice: 320000, stock: 60, featured: false, flashSale: true, flashHours: 48,
    image: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&q=80',
    description: "108MP camera, 45W MagCharge wireless, 6.78-inch AMOLED, Helio G99 Ultimate processor. Perfect daily driver.",
    tags: ['infinix', 'note', 'android', 'value'] },

  { name: 'iPhone 13 128GB (Refurbished)', brand: 'Apple', category: 'Phones & Tablets', seller: 'TechHub Lagos',
    price: 685000, previousPrice: 780000, stock: 30, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&q=80',
    description: "Certified refurbished iPhone 13. A15 Bionic, dual 12MP cameras, 6.1-inch Super Retina XDR. 12-month warranty.",
    tags: ['iphone', 'apple', 'refurbished', 'value'] },

  // ─── LAPTOPS ───
  { name: 'MacBook Pro 14-inch M3 Pro 512GB', brand: 'Apple', category: 'Laptops', seller: 'TechHub Lagos',
    price: 2450000, previousPrice: 2750000, stock: 8, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    description: "M3 Pro chip, 14.2-inch Liquid Retina XDR, 18-hour battery, HDMI and SD card slot. The professional's choice.",
    tags: ['macbook', 'apple', 'laptop', 'professional', 'm3'] },

  { name: 'Dell XPS 15 (2024) Core i7', brand: 'Dell', category: 'Laptops', seller: 'TechHub Lagos',
    price: 1650000, previousPrice: 1850000, stock: 12, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
    description: "13th Gen Intel Core i7, RTX 4060, 32GB RAM, 1TB SSD, 15.6-inch OLED. Premium build, stunning display.",
    tags: ['dell', 'xps', 'laptop', 'windows', 'rtx'] },

  { name: 'HP Pavilion 15 Core i5 16GB', brand: 'HP', category: 'Laptops', seller: 'TechHub Lagos',
    price: 685000, previousPrice: 780000, stock: 35, featured: false, flashSale: true, flashHours: 96,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    description: "Reliable everyday laptop. 12th Gen i5, 16GB RAM, 512GB SSD, 15.6-inch FHD IPS. Great for work and study.",
    tags: ['hp', 'pavilion', 'laptop', 'budget', 'student'] },

  { name: 'Lenovo ThinkPad X1 Carbon Gen 11', brand: 'Lenovo', category: 'Laptops', seller: 'TechHub Lagos',
    price: 1450000, previousPrice: 1600000, stock: 10, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
    description: "Business ultrabook. 13th Gen i7 vPro, 32GB RAM, 1TB SSD, 1.12kg, MIL-SPEC durability. Legendary keyboard.",
    tags: ['lenovo', 'thinkpad', 'laptop', 'business', 'ultrabook'] },

  { name: 'ASUS ROG Strix G16 Gaming Laptop', brand: 'ASUS', category: 'Laptops', seller: 'Gadget Galaxy',
    price: 1850000, previousPrice: 2050000, stock: 14, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
    description: "RTX 4070, Intel i9-13980HX, 16GB DDR5, 1TB NVMe, 16-inch 240Hz QHD+. Dominate every game.",
    tags: ['asus', 'rog', 'gaming', 'laptop', 'rtx'] },

  { name: 'MacBook Air M2 13-inch 256GB', brand: 'Apple', category: 'Laptops', seller: 'TechHub Lagos',
    price: 1250000, previousPrice: 1400000, stock: 20, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80',
    description: "M2 chip, silent fanless design, 18-hour battery, 1.24kg. The perfect everyday laptop.",
    tags: ['macbook', 'air', 'apple', 'laptop', 'm2'] },

  // ─── SMART TVs ───
  { name: 'Samsung 65-inch QLED 4K Smart TV', brand: 'Samsung', category: 'Smart TVs', seller: 'Home Essentials',
    price: 1150000, previousPrice: 1350000, stock: 12, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80',
    description: "Quantum HDR, 120Hz, Tizen OS with all Nigerian apps. 4 HDMI ports. Cinematic experience at home.",
    tags: ['samsung', 'qled', 'tv', '4k', 'smart-tv'] },

  { name: 'LG 55-inch OLED B4 Series 4K', brand: 'LG', category: 'Smart TVs', seller: 'Home Essentials',
    price: 950000, previousPrice: 1100000, stock: 15, featured: true, flashSale: true, flashHours: 120,
    image: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&q=80',
    description: "Perfect blacks with OLED self-lit pixels. Dolby Vision IQ, Atmos, webOS. 120Hz for gaming.",
    tags: ['lg', 'oled', 'tv', '4k', 'cinema'] },

  { name: 'Hisense 50-inch UHD Smart TV', brand: 'Hisense', category: 'Smart TVs', seller: 'Home Essentials',
    price: 385000, previousPrice: 445000, stock: 40, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80',
    description: "Great value 4K TV. VIDAA OS, Netflix and YouTube built-in, DTS Virtual:X, Bluetooth audio.",
    tags: ['hisense', 'tv', '4k', 'budget', 'smart-tv'] },

  { name: 'Sony Bravia 55-inch X90L Full Array LED', brand: 'Sony', category: 'Smart TVs', seller: 'Home Essentials',
    price: 875000, previousPrice: 985000, stock: 18, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80',
    description: "Cognitive Processor XR, perfect for PS5 with HDMI 2.1 features. Google TV built-in.",
    tags: ['sony', 'bravia', 'tv', '4k', 'ps5'] },

  // ─── AUDIO / HEADPHONES ───
  { name: 'Apple AirPods Pro (2nd Gen, USB-C)', brand: 'Apple', category: 'Audio & Headphones', seller: 'Gadget Galaxy',
    price: 285000, previousPrice: 320000, stock: 50, featured: true, flashSale: true, flashHours: 24,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80',
    description: "Active Noise Cancellation, Adaptive Audio, USB-C, MagSafe case. Up to 6 hours listening.",
    tags: ['airpods', 'apple', 'earbuds', 'anc', 'wireless'] },

  { name: 'Sony WH-1000XM5 Wireless Headphones', brand: 'Sony', category: 'Audio & Headphones', seller: 'Gadget Galaxy',
    price: 425000, previousPrice: 485000, stock: 30, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
    description: "Industry-leading noise cancellation. 30-hour battery, multipoint, Hi-Res Audio, LDAC support.",
    tags: ['sony', 'headphones', 'anc', 'wireless', 'premium'] },

  { name: 'JBL Tune 770NC Wireless Headphones', brand: 'JBL', category: 'Audio & Headphones', seller: 'Gadget Galaxy',
    price: 95000, previousPrice: 125000, stock: 80, featured: false, flashSale: true, flashHours: 72,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
    description: "Adaptive Noise Cancelling, 70-hour battery, JBL Pure Bass sound. Great value ANC headphones.",
    tags: ['jbl', 'headphones', 'anc', 'bluetooth'] },

  { name: 'Oraimo FreePods 4 ANC Earbuds', brand: 'Oraimo', category: 'Audio & Headphones', seller: 'Gadget Galaxy',
    price: 32500, previousPrice: 42000, stock: 150, featured: false, flashSale: true, flashHours: 48,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
    description: "Active Noise Cancellation, 40-hour total playtime, transparency mode, IPX5 water resistant.",
    tags: ['oraimo', 'earbuds', 'anc', 'budget'] },

  { name: 'Beats Studio Pro Wireless', brand: 'Beats', category: 'Audio & Headphones', seller: 'Gadget Galaxy',
    price: 265000, previousPrice: 320000, stock: 25, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
    description: "Spatial Audio, lossless USB-C audio, 40-hour battery, Apple and Android compatible.",
    tags: ['beats', 'headphones', 'wireless', 'spatial'] },

  // ─── SMARTWATCHES ───
  { name: 'Apple Watch Series 9 GPS 45mm', brand: 'Apple', category: 'Smartwatches', seller: 'Gadget Galaxy',
    price: 485000, previousPrice: 545000, stock: 40, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
    description: "S9 chip, Double Tap gesture, brighter display, health sensors, crash detection. Aluminium case.",
    tags: ['apple-watch', 'smartwatch', 'fitness', 'ios'] },

  { name: 'Samsung Galaxy Watch 6 Classic 47mm', brand: 'Samsung', category: 'Smartwatches', seller: 'Gadget Galaxy',
    price: 385000, previousPrice: 445000, stock: 30, featured: true, flashSale: true, flashHours: 96,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    description: "Rotating bezel, BioActive sensor, sleep coaching, ECG, body composition. Stainless steel.",
    tags: ['samsung', 'galaxy-watch', 'smartwatch', 'android'] },

  { name: 'Fitbit Charge 6 Fitness Tracker', brand: 'Fitbit', category: 'Smartwatches', seller: 'Gadget Galaxy',
    price: 135000, previousPrice: 165000, stock: 55, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80',
    description: "Built-in GPS, heart rate on wrist, 40+ exercise modes, Google apps, 7-day battery.",
    tags: ['fitbit', 'fitness', 'tracker', 'health'] },

  { name: 'Garmin Forerunner 265 Running Watch', brand: 'Garmin', category: 'Smartwatches', seller: 'Gadget Galaxy',
    price: 425000, previousPrice: 475000, stock: 20, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    description: "AMOLED display, multi-band GPS, training readiness, morning report. The runner's choice.",
    tags: ['garmin', 'running', 'gps', 'fitness'] },

  // ─── FASHION ───
  { name: 'Premium Ankara Kaftan - Men', brand: 'Fashion Forward', category: 'Men', seller: 'Fashion Forward NG',
    price: 45000, previousPrice: 55000, stock: 60, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
    description: "Hand-tailored Ankara kaftan with premium finishing. 100% cotton wax print. Sizes M to 3XL.",
    tags: ['ankara', 'kaftan', 'men', 'traditional', 'nigerian'] },

  { name: 'Women Ankara Midi Dress', brand: 'Fashion Forward', category: 'Women', seller: 'Fashion Forward NG',
    price: 38500, previousPrice: 48000, stock: 75, featured: true, flashSale: true, flashHours: 120,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    description: "Vibrant Ankara print midi dress with modern silhouette. Perfect for owambe or casual.",
    tags: ['ankara', 'dress', 'women', 'african', 'fashion'] },

  { name: 'Agbada 3-Piece Set - Royal Blue', brand: 'Fashion Forward', category: 'Traditional Wear', seller: 'Fashion Forward NG',
    price: 120000, previousPrice: 145000, stock: 35, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
    description: "Complete agbada set with embroidery. Premium brocade fabric. Includes buba, sokoto, and agbada.",
    tags: ['agbada', 'traditional', 'men', 'yoruba', 'nigerian'] },

  { name: 'Slim-Fit Denim Jeans - Men', brand: 'Fashion Forward', category: 'Men', seller: 'Fashion Forward NG',
    price: 28000, previousPrice: 35000, stock: 100, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
    description: "Stretch denim with comfortable slim fit. Sizes 28 to 40. Machine washable.",
    tags: ['jeans', 'denim', 'men', 'casual'] },

  { name: 'Ladies Handbag - Leather Tote', brand: 'Fashion Forward', category: 'Bags & Accessories', seller: 'Fashion Forward NG',
    price: 55000, previousPrice: 68000, stock: 40, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    description: "Genuine leather tote bag with multiple compartments. Perfect for work and travel.",
    tags: ['handbag', 'leather', 'women', 'tote'] },

  { name: 'Silk Head Wrap - Ankara Print', brand: 'Fashion Forward', category: 'Bags & Accessories', seller: 'Fashion Forward NG',
    price: 12000, previousPrice: 18000, stock: 150, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    description: "Versatile silk head wrap with vibrant Ankara pattern. 200cm x 70cm. Hand wash.",
    tags: ['headwrap', 'ankara', 'women', 'accessory'] },

  // ─── SHOES ───
  { name: 'Nike Air Force 1 Low White', brand: 'Nike', category: 'Sneakers', seller: 'Fashion Forward NG',
    price: 145000, previousPrice: 165000, stock: 50, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
    description: "The classic Air Force 1. Timeless style, premium leather, Nike Air cushioning. Sizes 38 to 46.",
    tags: ['nike', 'air-force', 'sneakers', 'classic'] },

  { name: 'Adidas Ultraboost 22 Running', brand: 'Adidas', category: 'Sneakers', seller: 'Fashion Forward NG',
    price: 125000, previousPrice: 150000, stock: 40, featured: true, flashSale: true, flashHours: 72,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
    description: "BOOST midsole, Primeknit+ upper, Linear Energy Push system. Ultimate running comfort.",
    tags: ['adidas', 'ultraboost', 'running', 'sneakers'] },

  { name: 'Men Leather Oxford Shoes - Brown', brand: 'Fashion Forward', category: 'Formal Shoes', seller: 'Fashion Forward NG',
    price: 65000, previousPrice: 85000, stock: 60, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&q=80',
    description: "Genuine leather Oxford shoes with rubber sole. Business and formal occasions. Sizes 40 to 46.",
    tags: ['oxford', 'leather', 'formal', 'men'] },

  { name: 'Women Block Heel Sandals - Nude', brand: 'Fashion Forward', category: 'Sandals', seller: 'Fashion Forward NG',
    price: 42000, previousPrice: 55000, stock: 45, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
    description: "Elegant block heel sandals with comfortable 3-inch heel. Sizes 36 to 42.",
    tags: ['sandals', 'heels', 'women', 'elegant'] },

  // ─── HOME & FURNITURE ───
  { name: '3-Seater Fabric Sofa - Charcoal Grey', brand: 'Home Essentials', category: 'Furniture', seller: 'Home Essentials',
    price: 385000, previousPrice: 445000, stock: 15, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    description: "Premium fabric sofa with hardwood frame, pocket spring cushions. 220cm x 95cm. Assembly included in Lagos.",
    tags: ['sofa', 'furniture', 'living-room', '3-seater'] },

  { name: 'Queen Size Bed Frame - Wooden', brand: 'Home Essentials', category: 'Furniture', seller: 'Home Essentials',
    price: 285000, previousPrice: 345000, stock: 20, featured: true, flashSale: true, flashHours: 168,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
    description: "Solid wood queen bed frame with headboard. Slats included. 5-year warranty on frame.",
    tags: ['bed', 'furniture', 'bedroom', 'wood'] },

  { name: '6-Seater Dining Table Set', brand: 'Home Essentials', category: 'Furniture', seller: 'Home Essentials',
    price: 425000, previousPrice: 520000, stock: 12, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80',
    description: "Tempered glass top dining table with 6 upholstered chairs. 180cm x 90cm.",
    tags: ['dining', 'table', 'furniture', 'set'] },

  { name: 'Wardrobe 3-Door with Mirror', brand: 'Home Essentials', category: 'Furniture', seller: 'Home Essentials',
    price: 225000, previousPrice: 285000, stock: 18, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80',
    description: "Spacious 3-door wardrobe with full-length mirror, hanging space, and 4 shelves. 150cm x 60cm x 200cm.",
    tags: ['wardrobe', 'bedroom', 'storage', 'furniture'] },

  // ─── KITCHEN & APPLIANCES ───
  { name: 'LG 2-Door Fridge 420L Inverter', brand: 'LG', category: 'Large Appliances', seller: 'Home Essentials',
    price: 685000, previousPrice: 780000, stock: 15, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80',
    description: "Smart Inverter Compressor, Multi Air Flow, anti-bacterial filter. 2-year warranty. Free installation in Lagos.",
    tags: ['fridge', 'lg', 'inverter', 'appliance'] },

  { name: 'Samsung 8kg Front Load Washing Machine', brand: 'Samsung', category: 'Large Appliances', seller: 'Home Essentials',
    price: 585000, previousPrice: 665000, stock: 12, featured: true, flashSale: true, flashHours: 120,
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80',
    description: "EcoBubble technology, Digital Inverter Motor, 1400RPM. 8kg capacity. 10-year motor warranty.",
    tags: ['washing-machine', 'samsung', 'front-load'] },

  { name: 'Panasonic 1.5HP Split AC Inverter', brand: 'Panasonic', category: 'Large Appliances', seller: 'Home Essentials',
    price: 485000, previousPrice: 565000, stock: 25, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1631545806609-21a01d3d8f74?w=800&q=80',
    description: "Inverter compressor, nanoe-X air purification, 4-way swing. Save up to 60% energy. Install kit included.",
    tags: ['ac', 'panasonic', 'inverter', 'split'] },

  { name: 'Philips Air Fryer XXL 7.3L', brand: 'Philips', category: 'Small Appliances', seller: 'Home Essentials',
    price: 145000, previousPrice: 185000, stock: 40, featured: true, flashSale: true, flashHours: 48,
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80',
    description: "Patented Rapid Air technology. Fry with up to 90% less fat. 7.3L XXL capacity for family meals.",
    tags: ['air-fryer', 'philips', 'kitchen', 'healthy'] },

  { name: 'Binatone Blender 1.5L 500W', brand: 'Binatone', category: 'Small Appliances', seller: 'Home Essentials',
    price: 45000, previousPrice: 55000, stock: 80, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80',
    description: "500W motor, 1.5L jar, 2-speed plus pulse, stainless steel blades. Ideal for smoothies and pepper mix.",
    tags: ['blender', 'binatone', 'kitchen'] },

  { name: 'Microwave Oven 25L Digital', brand: 'Samsung', category: 'Small Appliances', seller: 'Home Essentials',
    price: 125000, previousPrice: 145000, stock: 30, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800&q=80',
    description: "25L capacity, digital controls, 900W power, eco mode, child lock. 10 power levels.",
    tags: ['microwave', 'samsung', 'kitchen'] },

  // ─── BEAUTY ───
  { name: 'Nivea Perfect and Radiant Skincare Set', brand: 'Nivea', category: 'Skincare', seller: 'Beauty Bar',
    price: 18500, previousPrice: 24000, stock: 120, featured: true, flashSale: true, flashHours: 72,
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80',
    description: "Complete 4-piece skincare set: cleanser, toner, day cream, night cream. For all skin types.",
    tags: ['nivea', 'skincare', 'set', 'beauty'] },

  { name: 'Organic Shea Butter 500g - Raw', brand: 'Beauty Bar', category: 'Skincare', seller: 'Beauty Bar',
    price: 8500, previousPrice: 12000, stock: 200, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
    description: "100% pure unrefined shea butter from Nigeria. Great for skin, hair, and stretch marks. 500g jar.",
    tags: ['shea-butter', 'natural', 'skincare', 'nigerian'] },

  { name: 'Maybelline Fit Me Foundation', brand: 'Maybelline', category: 'Makeup', seller: 'Beauty Bar',
    price: 12500, previousPrice: 16500, stock: 90, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&q=80',
    description: "Natural matte finish, oil-free, 24-hour wear. Available in 8 shades for African skin tones.",
    tags: ['maybelline', 'foundation', 'makeup'] },

  { name: 'Luxury Perfume - Oud Royal 100ml', brand: 'Beauty Bar', category: 'Fragrances', seller: 'Beauty Bar',
    price: 65000, previousPrice: 85000, stock: 40, featured: true, flashSale: true, flashHours: 96,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    description: "Long-lasting unisex oud fragrance with notes of amber, rose, and sandalwood. 100ml EDP.",
    tags: ['perfume', 'oud', 'unisex', 'luxury'] },

  { name: 'Cantu Shea Butter Leave-In Conditioner', brand: 'Cantu', category: 'Hair Care', seller: 'Beauty Bar',
    price: 9500, previousPrice: 12500, stock: 150, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
    description: "For natural hair. Deep conditioning with shea butter. 453g tub.",
    tags: ['cantu', 'hair', 'natural', 'conditioner'] },

  // ─── GROCERY ───
  { name: 'Premium Long Grain Rice 50kg', brand: 'Mama Gold', category: 'Rice & Grains', seller: 'Home Essentials',
    price: 85000, previousPrice: 92000, stock: 60, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
    description: "Premium long grain parboiled rice. 50kg bag. Stone-free, well-polished grains.",
    tags: ['rice', 'grocery', 'staple'] },

  { name: 'Golden Penny Semovita 10kg', brand: 'Golden Penny', category: 'Rice & Grains', seller: 'Home Essentials',
    price: 18500, previousPrice: 22000, stock: 100, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
    description: "Premium semolina flour. 10kg family pack. Perfect for swallow.",
    tags: ['semovita', 'grocery', 'flour'] },

  { name: 'Devon Kings Vegetable Oil 5L', brand: 'Devon Kings', category: 'Oils & Spices', seller: 'Home Essentials',
    price: 16500, previousPrice: 19500, stock: 150, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
    description: "Pure vegetable oil, cholesterol-free. 5L bottle. Ideal for cooking and frying.",
    tags: ['oil', 'vegetable', 'grocery'] },

  { name: 'Nescafe Gold Blend Coffee 200g', brand: 'Nescafe', category: 'Beverages', seller: 'Home Essentials',
    price: 12500, previousPrice: 15000, stock: 120, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
    description: "Premium instant coffee with rich aroma. 200g jar. Makes around 100 cups.",
    tags: ['nescafe', 'coffee', 'beverage'] },

  { name: 'Lipton Yellow Label Tea 100 Bags', brand: 'Lipton', category: 'Beverages', seller: 'Home Essentials',
    price: 5500, previousPrice: 7000, stock: 200, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800&q=80',
    description: "Classic Lipton black tea. 100 tea bags. Rich taste, refreshing.",
    tags: ['lipton', 'tea', 'beverage'] },

  { name: 'Indomie Instant Noodles (Carton of 40)', brand: 'Indomie', category: 'Snacks', seller: 'Home Essentials',
    price: 12500, previousPrice: 14500, stock: 180, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=800&q=80',
    description: "Chicken flavor instant noodles. Carton of 40 packs. Nigeria's favorite.",
    tags: ['indomie', 'noodles', 'snack'] },

  // ─── BOOKS ───
  { name: 'Things Fall Apart - Chinua Achebe', brand: 'Heinemann', category: 'Fiction', seller: 'BookWorm Nigeria',
    price: 6500, previousPrice: 8500, stock: 150, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
    description: "The classic Nigerian novel. Paperback. 209 pages. Required reading worldwide.",
    tags: ['achebe', 'nigerian', 'classic', 'novel'] },

  { name: 'Half of a Yellow Sun - Chimamanda Ngozi Adichie', brand: 'Knopf', category: 'Fiction', seller: 'BookWorm Nigeria',
    price: 8500, previousPrice: 11000, stock: 100, featured: true, flashSale: true, flashHours: 168,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
    description: "Award-winning novel about the Nigerian Civil War. Paperback. 433 pages.",
    tags: ['adichie', 'nigerian', 'fiction', 'war'] },

  { name: 'Python Crash Course (3rd Edition)', brand: 'No Starch Press', category: 'Textbooks', seller: 'BookWorm Nigeria',
    price: 18500, previousPrice: 24000, stock: 60, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',
    description: "Hands-on introduction to Python. Covers Django and data visualization. 552 pages.",
    tags: ['python', 'programming', 'textbook', 'coding'] },

  { name: 'Atomic Habits - James Clear', brand: 'Penguin', category: 'Business', seller: 'BookWorm Nigeria',
    price: 9500, previousPrice: 12500, stock: 120, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
    description: "An easy and proven way to build good habits and break bad ones. Bestseller. 320 pages.",
    tags: ['atomic-habits', 'business', 'self-help'] },

  { name: 'Rich Dad Poor Dad - Robert Kiyosaki', brand: 'Plata', category: 'Business', seller: 'BookWorm Nigeria',
    price: 7500, previousPrice: 9500, stock: 140, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80',
    description: "What the rich teach their kids about money. Updated 25th anniversary edition.",
    tags: ['rich-dad', 'finance', 'business'] },

  // ─── GAMING ───
  { name: 'PlayStation 5 Slim Disc Edition', brand: 'Sony', category: 'Consoles', seller: 'Gadget Galaxy',
    price: 785000, previousPrice: 850000, stock: 20, featured: true, flashSale: true, flashHours: 48,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80',
    description: "Slimmer PS5 with disc drive. 1TB SSD, DualSense controller, 4K gaming at 120fps.",
    tags: ['ps5', 'sony', 'console', 'gaming'] },

  { name: 'Xbox Series X 1TB', brand: 'Microsoft', category: 'Consoles', seller: 'Gadget Galaxy',
    price: 725000, previousPrice: 795000, stock: 15, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&q=80',
    description: "Most powerful Xbox. 4K at 120fps, 1TB SSD, Quick Resume, Game Pass ready.",
    tags: ['xbox', 'microsoft', 'console', 'gaming'] },

  { name: 'DualSense Wireless Controller - White', brand: 'Sony', category: 'Gaming Accessories', seller: 'Gadget Galaxy',
    price: 85000, previousPrice: 98000, stock: 60, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80',
    description: "Haptic feedback, adaptive triggers, built-in mic. Works with PS5 and PC.",
    tags: ['dualsense', 'controller', 'ps5', 'accessory'] },

  { name: 'Gaming Chair with Lumbar Support', brand: 'Gadget Galaxy', category: 'Gaming Accessories', seller: 'Gadget Galaxy',
    price: 185000, previousPrice: 225000, stock: 25, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&q=80',
    description: "Ergonomic racing-style gaming chair. PU leather, adjustable armrests, reclines 180 degrees.",
    tags: ['gaming-chair', 'ergonomic', 'furniture'] },

  // ─── TOYS & BABY ───
  { name: 'Pampers Baby Dry Diapers Size 3 (104 Count)', brand: 'Pampers', category: 'Diapers & Wipes', seller: 'Home Essentials',
    price: 28500, previousPrice: 34000, stock: 80, featured: true, flashSale: true, flashHours: 72,
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80',
    description: "Up to 12 hours dryness. Size 3 (6-10kg). 104 diapers. Soft, breathable.",
    tags: ['pampers', 'diapers', 'baby'] },

  { name: 'Wooden Building Blocks Set - 100 Pieces', brand: 'Melissa and Doug', category: 'Toys', seller: 'BookWorm Nigeria',
    price: 18500, previousPrice: 24000, stock: 50, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&q=80',
    description: "Natural wood building blocks. 100 pieces in various shapes and colors. Ages 3 and up.",
    tags: ['blocks', 'toys', 'wooden', 'kids'] },

  { name: 'Baby Stroller - 3-in-1 Travel System', brand: 'Chicco', category: 'Baby Care', seller: 'Home Essentials',
    price: 185000, previousPrice: 225000, stock: 20, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80',
    description: "Convertible stroller: car seat, bassinet, and toddler seat. One-hand fold. Includes rain cover.",
    tags: ['stroller', 'baby', 'travel', 'chicco'] },

  // ─── SPORTS ───
  { name: 'Adidas FIFA World Cup Match Ball', brand: 'Adidas', category: 'Football', seller: 'Fashion Forward NG',
    price: 45000, previousPrice: 55000, stock: 40, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&q=80',
    description: "Official size 5 match ball. Thermally bonded, FIFA Quality Pro certified.",
    tags: ['football', 'adidas', 'sports', 'ball'] },

  { name: 'Yoga Mat Premium 6mm Non-Slip', brand: 'Gadget Galaxy', category: 'Fitness', seller: 'Gadget Galaxy',
    price: 18500, previousPrice: 25000, stock: 80, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    description: "6mm thick TPE yoga mat with alignment lines. Non-slip, eco-friendly. Includes carry strap.",
    tags: ['yoga', 'mat', 'fitness', 'exercise'] },

  { name: 'Dumbbell Set 20kg Adjustable', brand: 'Gadget Galaxy', category: 'Fitness', seller: 'Gadget Galaxy',
    price: 65000, previousPrice: 82000, stock: 30, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    description: "Adjustable dumbbell set with chrome bars and plates. Total 20kg. Home gym essential.",
    tags: ['dumbbell', 'fitness', 'gym', 'strength'] },

  // ─── AUTOMOTIVE ───
  { name: 'Car Dash Cam 4K Front and Rear', brand: 'Gadget Galaxy', category: 'Car Accessories', seller: 'Gadget Galaxy',
    price: 85000, previousPrice: 105000, stock: 45, featured: true, flashSale: true, flashHours: 72,
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
    description: "4K front and 1080p rear dash cam. Night vision, GPS, WiFi, parking monitor. 32GB card included.",
    tags: ['dashcam', 'car', '4k', 'security'] },

  { name: 'Michelin Tyre 205/55R16', brand: 'Michelin', category: 'Tyres', seller: 'Home Essentials',
    price: 68000, previousPrice: 78000, stock: 60, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&q=80',
    description: "Primacy 4 tyre. Excellent wet grip, long tread life. Fits many sedans.",
    tags: ['tyre', 'michelin', 'car'] },

  { name: 'Car Phone Holder Magnetic Air Vent', brand: 'Gadget Galaxy', category: 'Car Accessories', seller: 'Gadget Galaxy',
    price: 6500, previousPrice: 9500, stock: 200, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
    description: "Strong magnetic phone holder. 360-degree rotation, air vent mount. Compatible with all phones.",
    tags: ['phone-holder', 'car', 'magnetic'] },

  // ─── HEALTH ───
  { name: 'Vitamin C 1000mg Effervescent (20 Tabs)', brand: 'Redoxon', category: 'Supplements', seller: 'Beauty Bar',
    price: 8500, previousPrice: 11000, stock: 100, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
    description: "Immune support with 1000mg Vitamin C and Zinc. Orange flavor effervescent tablets.",
    tags: ['vitamin-c', 'supplement', 'immune'] },

  { name: 'Digital Blood Pressure Monitor', brand: 'Omron', category: 'Medical Devices', seller: 'Beauty Bar',
    price: 45000, previousPrice: 55000, stock: 50, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80',
    description: "Clinically validated upper arm BP monitor. Stores 60 readings, irregular heartbeat detection.",
    tags: ['bp-monitor', 'health', 'omron'] },

  // ─── WATCHES ───
  { name: 'Casio G-Shock GA-2100 CasiOak', brand: 'Casio', category: 'Traditional Watches', seller: 'Gadget Galaxy',
    price: 85000, previousPrice: 105000, stock: 40, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
    description: "The iconic CasiOak. Carbon Core Guard, 200m water resistance, world time. Slim and tough.",
    tags: ['casio', 'g-shock', 'watch', 'sport'] },

  { name: 'Seiko 5 Automatic Sports Watch', brand: 'Seiko', category: 'Traditional Watches', seller: 'Gadget Galaxy',
    price: 145000, previousPrice: 185000, stock: 25, featured: true, flashSale: true, flashHours: 120,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
    description: "Automatic movement, 41-hour power reserve, stainless steel, exhibition caseback. Dress or sport.",
    tags: ['seiko', 'automatic', 'watch', 'sports'] },

  { name: 'Sunglasses UV400 Polarized - Aviator', brand: 'Fashion Forward', category: 'Sunglasses', seller: 'Fashion Forward NG',
    price: 18500, previousPrice: 28000, stock: 80, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
    description: "Classic aviator style with polarized UV400 lenses. Metal frame. Includes case and cloth.",
    tags: ['sunglasses', 'aviator', 'uv400', 'unisex'] },

  // ─── CAMERAS ───
  { name: 'Canon EOS R50 Mirrorless Camera Kit', brand: 'Canon', category: 'Cameras', seller: 'Gadget Galaxy',
    price: 985000, previousPrice: 1150000, stock: 10, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',
    description: "24.2MP APS-C, 4K video, RF-S 18-45mm lens, vari-angle screen. Perfect for creators.",
    tags: ['canon', 'camera', 'mirrorless', '4k'] },

  { name: 'GoPro HERO12 Black', brand: 'GoPro', category: 'Cameras', seller: 'Gadget Galaxy',
    price: 685000, previousPrice: 785000, stock: 15, featured: true, flashSale: true, flashHours: 96,
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',
    description: "5.3K60 video, HyperSmooth 6.0, waterproof to 10m. Includes 1 battery and mount.",
    tags: ['gopro', 'action-camera', '4k', 'waterproof'] },

  // ─── MONITORS ───
  { name: 'LG 27-inch 4K UHD IPS Monitor', brand: 'LG', category: 'Monitors', seller: 'Gadget Galaxy',
    price: 385000, previousPrice: 445000, stock: 22, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    description: "27-inch 4K IPS, USB-C with 96W power delivery, HDR10, P3 98% colour. Perfect for Mac and PC.",
    tags: ['monitor', 'lg', '4k', 'usb-c'] },

  { name: 'Samsung 32-inch Curved Gaming Monitor 165Hz', brand: 'Samsung', category: 'Monitors', seller: 'Gadget Galaxy',
    price: 425000, previousPrice: 495000, stock: 18, featured: true, flashSale: true, flashHours: 72,
    image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&q=80',
    description: "32-inch 1440p VA panel, 165Hz, 1ms, HDR10, FreeSync Premium. Immersive curved design.",
    tags: ['monitor', 'samsung', 'gaming', 'curved'] },

  // ─── POWER / ACCESSORIES ───
  { name: 'Anker PowerCore 20000mAh Power Bank', brand: 'Anker', category: 'Computer Accessories', seller: 'Gadget Galaxy',
    price: 45000, previousPrice: 55000, stock: 100, featured: true, flashSale: false,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80',
    description: "20000mAh capacity, 22.5W fast charge, dual USB-A and USB-C. Charges phone 4-5 times.",
    tags: ['powerbank', 'anker', 'charging', 'portable'] },

  { name: 'USB-C Fast Charger 65W GaN 3-Port', brand: 'Anker', category: 'Computer Accessories', seller: 'Gadget Galaxy',
    price: 32500, previousPrice: 42000, stock: 120, featured: false, flashSale: true, flashHours: 48,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80',
    description: "GaN tech 65W charger. 2x USB-C and 1x USB-A. Charges laptop, phone, and earbuds at once.",
    tags: ['charger', 'gan', 'usb-c', 'anker'] },

  { name: 'Wireless Mouse and Keyboard Combo', brand: 'Logitech', category: 'Computer Accessories', seller: 'TechHub Lagos',
    price: 38500, previousPrice: 48000, stock: 80, featured: false, flashSale: false,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    description: "Logitech MK270 wireless combo. 2.4GHz, 8 multimedia keys, quiet keys, 24-month battery.",
    tags: ['logitech', 'keyboard', 'mouse', 'wireless'] },
];

// ─────────────────────────────────────────────────────────────
// COUPONS
// ─────────────────────────────────────────────────────────────
export const DEMO_COUPONS = [
  {
    code: 'WELCOME10',
    description: '10% off your first order',
    type: 'percentage',
    value: 10,
    maxDiscount: 20000,
    minOrderAmount: 10000,
    usageLimit: 1000,
    perUserLimit: 1,
    validDaysFromNow: 90,
  },
  {
    code: 'SAVE5000',
    description: 'N5,000 off orders above N50,000',
    type: 'fixed',
    value: 5000,
    minOrderAmount: 50000,
    usageLimit: 500,
    perUserLimit: 1,
    validDaysFromNow: 60,
  },
  {
    code: 'ELECTRONICS15',
    description: '15% off Electronics and Computers',
    type: 'percentage',
    value: 15,
    maxDiscount: 50000,
    minOrderAmount: 100000,
    appliesTo: 'category',
    categoryNames: ['Electronics', 'Computers'],
    usageLimit: 200,
    perUserLimit: 1,
    validDaysFromNow: 30,
  },
  {
    code: 'FREESHIP',
    description: 'Free standard delivery on any order',
    type: 'fixed',
    value: 2500,
    minOrderAmount: 15000,
    usageLimit: 2000,
    perUserLimit: 2,
    validDaysFromNow: 120,
  },
  {
    code: 'FLASH20',
    description: '20% off during flash sale (max N30,000)',
    type: 'percentage',
    value: 20,
    maxDiscount: 30000,
    minOrderAmount: 25000,
    usageLimit: 300,
    perUserLimit: 1,
    validDaysFromNow: 7,
  },
];

export default { DEMO_USERS, DEMO_PRODUCTS, DEMO_COUPONS };