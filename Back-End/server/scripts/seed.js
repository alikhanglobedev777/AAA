const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const User = require('../models/user');
const Business = require('../models/Business');
const ServiceCategory = require('../models/ServiceCategory');

const categories = [
  {
    name: 'Plumbing',
    slug: 'plumbing',
    description: 'Repairs, installations, and emergency plumbing services.',
    icon: 'fas fa-faucet',
    tags: ['pipes', 'leaks', 'repairs'],
  },
  {
    name: 'Electrical',
    slug: 'electrical',
    description: 'Residential and commercial electrical services.',
    icon: 'fas fa-bolt',
    tags: ['wiring', 'lighting', 'repairs'],
  },
  {
    name: 'Cleaning',
    slug: 'cleaning',
    description: 'Home, office, and deep-cleaning services.',
    icon: 'fas fa-broom',
    tags: ['home', 'office', 'deep cleaning'],
  },
  {
    name: 'Food',
    slug: 'food',
    description: 'Catering, meal preparation, and food delivery services.',
    icon: 'fas fa-utensils',
    tags: ['catering', 'meals', 'delivery'],
  },
  {
    name: 'Construction',
    slug: 'construction',
    description: 'Construction, renovation, and general contracting services.',
    icon: 'fas fa-hammer',
    tags: ['building', 'renovation', 'contractor'],
  },
  {
    name: 'Transport',
    slug: 'transport',
    description: 'Moving, delivery, and local transportation services.',
    icon: 'fas fa-truck',
    tags: ['moving', 'delivery', 'transportation'],
  },
  {
    name: 'Security',
    slug: 'security',
    description: 'Security guards, CCTV, and access-control services.',
    icon: 'fas fa-shield-alt',
    tags: ['guards', 'cctv', 'access control'],
  },
].map((category, index) => ({
  ...category,
  isActive: true,
  isFeatured: true,
  approvalStatus: 'approved',
  sortOrder: index + 1,
}));

const businessSeeds = [
  {
    type: 'plumbing',
    name: 'AAA Demo Plumbing',
    ownerName: 'Plumbing',
    serviceName: 'Leak repair',
    description: 'Reliable local plumbing services for repairs, installations, and emergencies.',
    serviceDescription: 'Diagnose and repair common household leaks.',
    price: 3500,
    emergency: true,
  },
  {
    type: 'electrical',
    name: 'AAA Bright Electrical',
    ownerName: 'Electrical',
    serviceName: 'Electrical repair',
    description: 'Certified electricians for safe wiring, lighting, and electrical repair work.',
    serviceDescription: 'Troubleshoot and repair common electrical faults.',
    price: 4000,
    emergency: true,
  },
  {
    type: 'cleaning',
    name: 'AAA Fresh Cleaning',
    ownerName: 'Cleaning',
    serviceName: 'Deep cleaning',
    description: 'Professional home and office cleaning with flexible scheduling and careful service.',
    serviceDescription: 'Complete deep cleaning for homes and offices.',
    price: 5000,
  },
  {
    type: 'food',
    name: 'AAA Home Catering',
    ownerName: 'Food',
    serviceName: 'Event catering',
    description: 'Freshly prepared catering and meal services for family events and business gatherings.',
    serviceDescription: 'Fresh catering package for small events.',
    price: 12000,
  },
  {
    type: 'construction',
    name: 'AAA Build & Renovate',
    ownerName: 'Construction',
    serviceName: 'Home renovation',
    description: 'Experienced construction team for renovations, repairs, and residential building work.',
    serviceDescription: 'Planning and labor for a residential renovation.',
    price: 50000,
  },
  {
    type: 'transport',
    name: 'AAA Local Transport',
    ownerName: 'Transport',
    serviceName: 'Local moving',
    description: 'Dependable moving, delivery, and local transport services for homes and businesses.',
    serviceDescription: 'Local moving service with loading assistance.',
    price: 8000,
  },
  {
    type: 'security',
    name: 'AAA Secure Services',
    ownerName: 'Security',
    serviceName: 'CCTV installation',
    description: 'Professional security guards, CCTV installation, and access-control solutions.',
    serviceDescription: 'Install and configure a basic CCTV system.',
    price: 15000,
    emergency: true,
  },
];

async function findOrCreateUser(email, data) {
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      password: 'Password123!',
      isVerified: true,
      emailVerified: true,
      ...data,
    });
  }

  return user;
}

async function seed() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is required. Create Back-End/server/.env first.');
  }

  await mongoose.connect(mongoUri);

  for (const category of categories) {
    await ServiceCategory.findOneAndUpdate(
      { slug: category.slug },
      { $set: category },
      { upsert: true, new: true, runValidators: true }
    );
  }

  await findOrCreateUser('customer@example.com', {
    firstName: 'Demo',
    lastName: 'Customer',
    phone: '+1555010101',
    location: { city: 'Los Angeles', area: 'Downtown' },
  });

  for (const [index, businessSeed] of businessSeeds.entries()) {
    const email = `owner.${businessSeed.type}@example.com`;
    const phone = `+15550102${String(index + 1).padStart(2, '0')}`;
    const owner = await findOrCreateUser(email, {
      firstName: businessSeed.ownerName,
      lastName: 'Owner',
      phone,
      userType: 'business',
      location: { city: 'Los Angeles', area: 'Downtown' },
    });

    await Business.findOneAndUpdate(
      { businessType: businessSeed.type },
      {
        $set: {
          owner: owner._id,
          businessName: businessSeed.name,
          businessType: businessSeed.type,
          description: businessSeed.description,
          contact: {
            phone,
            email,
            website: 'https://example.com',
          },
          location: {
            address: `${100 + index} Demo Street`,
            city: 'Los Angeles',
            area: 'Downtown',
            serviceAreas: ['Downtown', 'Hollywood'],
          },
          services: [
            {
              name: businessSeed.serviceName,
              description: businessSeed.serviceDescription,
              price: businessSeed.price,
              priceType: 'fixed',
              currency: 'PKR',
            },
          ],
          status: 'active',
          verification: { isVerified: true, verifiedAt: new Date() },
          features: {
            isFeatured: true,
            acceptsOnlineBooking: true,
            acceptsEmergencyCalls: Boolean(businessSeed.emergency),
          },
          tags: ['Service Provider', businessSeed.type],
        },
      },
      { upsert: true, new: true, runValidators: true }
    );
  }

  for (const category of categories) {
    const businessCount = await Business.countDocuments({
      businessType: category.slug,
      status: 'active',
    });
    await ServiceCategory.updateOne({ slug: category.slug }, { $set: { businessCount } });
  }

  console.log('Seed complete. Added an active business for every main navbar category.');
  console.log('Customer login: customer@example.com / Password123!');
  console.log('Business logins: owner.<category>@example.com / Password123!');
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
