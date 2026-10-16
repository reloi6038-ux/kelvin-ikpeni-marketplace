/**
 * config/constants.js
 * -------------------
 * Shared constants: categories, order statuses, marketplace config.
 * Import anywhere: `import { CATEGORIES } from '../config/constants.js'`
 */

export const CATEGORIES = [
  {
    name: 'Electronics',
    description: 'Phones, TVs, audio, cameras, and gadgets',
    icon: '📱',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80',
    order: 1,
    isFeatured: true,
    children: ['Phones & Tablets', 'Smart TVs', 'Audio & Headphones', 'Cameras'],
  },
  {
    name: 'Computers',
    description: 'Laptops, desktops, monitors, and accessories',
    icon: '💻',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
    order: 2,
    isFeatured: true,
    children: ['Laptops', 'Desktops', 'Monitors', 'Computer Accessories'],
  },
  {
    name: 'Fashion',
    description: 'Clothing, traditional wear, and accessories',
    icon: '👕',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80',
    order: 3,
    isFeatured: true,
    children: ['Men', 'Women', 'Traditional Wear', 'Bags & Accessories'],
  },
  {
    name: 'Shoes & Sneakers',
    description: 'Men and women footwear for every occasion',
    icon: '👟',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
    order: 4,
    isFeatured: true,
    children: ['Sneakers', 'Formal Shoes', 'Sandals', 'Boots'],
  },
  {
    name: 'Home & Living',
    description: 'Furniture, decor, and household essentials',
    icon: '🏠',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    order: 5,
    isFeatured: true,
    children: ['Furniture', 'Home Decor', 'Bedding', 'Lighting'],
  },
  {
    name: 'Kitchen & Appliances',
    description: 'Cookware, fridges, washing machines, and more',
    icon: '🍳',
    image: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=600&q=80',
    order: 6,
    isFeatured: true,
    children: ['Large Appliances', 'Cookware', 'Small Appliances', 'Dining'],
  },
  {
    name: 'Beauty & Personal Care',
    description: 'Skincare, makeup, haircare, and fragrances',
    icon: '💄',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    order: 7,
    isFeatured: true,
    children: ['Skincare', 'Makeup', 'Hair Care', 'Fragrances'],
  },
  {
    name: 'Grocery & Essentials',
    description: 'Food staples, beverages, and household items',
    icon: '🛒',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
    order: 8,
    isFeatured: false,
    children: ['Rice & Grains', 'Oils & Spices', 'Beverages', 'Snacks'],
  },
  {
    name: 'Books & Education',
    description: 'Nigerian literature, textbooks, and study materials',
    icon: '📚',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
    order: 9,
    isFeatured: false,
    children: ['Fiction', 'Textbooks', 'Business', 'Children Books'],
  },
  {
    name: 'Sports & Outdoors',
    description: 'Fitness gear, bicycles, and outdoor equipment',
    icon: '⚽',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    order: 10,
    isFeatured: false,
    children: ['Fitness', 'Cycling', 'Football', 'Camping'],
  },
  {
    name: 'Toys & Baby',
    description: 'Baby care, toys, and children essentials',
    icon: '🧸',
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&q=80',
    order: 11,
    isFeatured: false,
    children: ['Baby Care', 'Toys', 'Diapers & Wipes', 'Feeding'],
  },
  {
    name: 'Gaming & Entertainment',
    description: 'Consoles, games, and gaming accessories',
    icon: '🎮',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
    order: 12,
    isFeatured: true,
    children: ['Consoles', 'Games', 'Gaming Accessories', 'VR'],
  },
  {
    name: 'Automotive',
    description: 'Car accessories, tools, and maintenance',
    icon: '🚗',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80',
    order: 13,
    isFeatured: false,
    children: ['Car Accessories', 'Tools', 'Car Care', 'Tyres'],
  },
  {
    name: 'Health & Wellness',
    description: 'Supplements, medical devices, and wellness',
    icon: '💊',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
    order: 14,
    isFeatured: false,
    children: ['Supplements', 'Medical Devices', 'Wellness', 'First Aid'],
  },
  {
    name: 'Watches & Accessories',
    description: 'Watches, jewellery, and fashion accessories',
    icon: '⌚',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80',
    order: 15,
    isFeatured: true,
    children: ['Smartwatches', 'Traditional Watches', 'Jewellery', 'Sunglasses'],
  },
];

export const ORDER_STATUSES = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

export const PRODUCT_STATUSES = ['draft', 'pending', 'active', 'rejected', 'archived'];

export const SELLER_STATUSES = ['pending', 'approved', 'rejected', 'suspended'];

export const MARKETPLACE = {
  commissionPercent: 10,
  defaultDeliveryFee: 2500,
  freeDeliveryThreshold: 50000,
  currency: 'NGN',
};

export default {
  CATEGORIES,
  ORDER_STATUSES,
  PRODUCT_STATUSES,
  SELLER_STATUSES,
  MARKETPLACE,
};