require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const products = [
  {
    name: 'Oats Chips – Peri Peri',
    slug: 'oats-chips-peri-peri',
    description: 'We believe snacking shouldn\'t be a choice between a greasy bag of chips or a boring diet. By perfecting a roasted process, we created a snack that is fun, functional, & 100% guilt-free.',
    price: 149, mrp: 199,
    images: ['https://res.cloudinary.com/dy9vdjxmm/image/upload/v1/grainzz/products/placeholder.jpg'],
    category: 'Healthy Chips',
    stock: 100, isSale: true,
    tags: ['Jar', '150g'],
    nutritionInfo: 'High-Fibre | No Palm Oil | Baked Crunch',
    ingredients: 'Oats, Peri Peri Seasoning, Rice Flour, Salt',
  },
  {
    name: 'Quinoa Puffs – Classic Salt',
    slug: 'quinoa-puffs-classic-salt',
    description: 'Light, airy puffs made from real quinoa. Packed with protein and bursting with classic salt flavor.',
    price: 149, mrp: 199,
    images: ['https://res.cloudinary.com/dy9vdjxmm/image/upload/v1/grainzz/products/placeholder.jpg'],
    category: 'Grain Puffs',
    stock: 80, isSale: true,
    tags: ['Jar', '100g'],
    nutritionInfo: 'High Protein | Gluten Free | Puffed',
    ingredients: 'Quinoa, Salt, Rice Flour',
  },
  {
    name: 'Bajra Chips – Masala',
    slug: 'bajra-chips-masala',
    description: 'Traditional millets meet modern flavors. Bajra chips packed with fibre and iron.',
    price: 129, mrp: 169,
    images: ['https://res.cloudinary.com/dy9vdjxmm/image/upload/v1/grainzz/products/placeholder.jpg'],
    category: 'Healthy Chips',
    stock: 60, isSale: false,
    tags: ['Pouch', '120g'],
    nutritionInfo: 'Iron Rich | High Fibre | Baked',
    ingredients: 'Bajra Flour, Masala Seasoning, Salt',
  },
  {
    name: 'Ragi Chips – Cheese Onion',
    slug: 'ragi-chips-cheese-onion',
    description: 'Finger millet power in every crunch. Bold cheese & onion flavor with the goodness of ragi.',
    price: 139, mrp: 179,
    images: ['https://res.cloudinary.com/dy9vdjxmm/image/upload/v1/grainzz/products/placeholder.jpg'],
    category: 'Healthy Chips',
    stock: 75, isSale: true,
    tags: ['Pouch', '130g'],
    nutritionInfo: 'Calcium Rich | High Fibre | Baked',
    ingredients: 'Ragi Flour, Cheese Seasoning, Onion, Salt',
  },
  {
    name: 'Essential Snack Box – Mixed',
    slug: 'essential-snack-box-mixed',
    description: 'The ultimate combo pack for healthy snacking. Includes all our bestselling flavors.',
    price: 499, mrp: 699,
    images: ['https://res.cloudinary.com/dy9vdjxmm/image/upload/v1/grainzz/products/placeholder.jpg'],
    category: 'Combos',
    stock: 30, isSale: true,
    tags: ['Box', 'Bundle'],
    nutritionInfo: 'Variety Pack | All Natural | No Preservatives',
    ingredients: 'Assorted Grainzz Products',
  },
  {
    name: 'Grain Puff – Turmeric Ginger',
    slug: 'grain-puff-turmeric-ginger',
    description: 'Ancient spices meet modern puffing. Anti-inflammatory snacking at its finest.',
    price: 159, mrp: 199,
    images: ['https://res.cloudinary.com/dy9vdjxmm/image/upload/v1/grainzz/products/placeholder.jpg'],
    category: 'Grain Puffs',
    stock: 90, isSale: false,
    tags: ['Jar', '100g'],
    nutritionInfo: 'Anti-Inflammatory | Probiotic | Puffed',
    ingredients: 'Mixed Grains, Turmeric, Ginger, Salt',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Seed admin
    const adminExists = await User.findOne({ email: 'admin@grainzz.com' });
    if (!adminExists) {
      await User.create({ email: 'admin@grainzz.com', password: 'Grainzz@2026', role: 'admin' });
      console.log('✅ Admin created: admin@grainzz.com / Grainzz@2026');
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // Seed products
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`✅ ${products.length} products seeded`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('Admin login: admin@grainzz.com | Password: Grainzz@2026');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
