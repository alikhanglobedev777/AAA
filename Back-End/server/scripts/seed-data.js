'use strict';

// This module is pure: generating records does not connect to MongoDB.
// Everything is fictional. Never represent these listings as real providers.
const SEED_MARKER = 'AAA_DEMO_SEED_V2';

const CATEGORIES = [
  { slug: 'plumbing', name: 'Plumbing', icon: 'fas fa-faucet', services: [['Pipe leak repair', 1800], ['Bathroom fixture fitting', 3500], ['Drain cleaning', 2200], ['Water tank maintenance', 4500]] },
  { slug: 'electrical', name: 'Electrical', icon: 'fas fa-bolt', services: [['Wiring inspection', 2500], ['Fan installation', 1500], ['Circuit breaker replacement', 2800], ['Lighting installation', 3200]] },
  { slug: 'cleaning', name: 'Cleaning', icon: 'fas fa-broom', services: [['Home deep cleaning', 6500], ['Office cleaning', 8500], ['Sofa cleaning', 2400], ['Kitchen cleaning', 3500]] },
  { slug: 'painting', name: 'Painting', icon: 'fas fa-paint-roller', services: [['Interior wall painting', 12000], ['Exterior painting', 18000], ['Wall preparation', 4800], ['Wood polish', 4200]] },
  { slug: 'gardening', name: 'Gardening', icon: 'fas fa-leaf', services: [['Lawn trimming', 2500], ['Garden design', 12000], ['Tree pruning', 4000], ['Seasonal planting', 3500]] },
  { slug: 'repair', name: 'Repair', icon: 'fas fa-tools', services: [['Appliance diagnosis', 1800], ['Mobile repair', 3200], ['Laptop maintenance', 4500], ['Equipment servicing', 5200]] },
  { slug: 'transport', name: 'Transport', icon: 'fas fa-truck', services: [['Local parcel delivery', 800], ['Furniture moving', 9000], ['Small truck hire', 6500], ['Packing assistance', 2500]] },
  { slug: 'security', name: 'Security', icon: 'fas fa-shield-alt', services: [['CCTV survey', 2500], ['Camera installation', 8500], ['Alarm system setup', 12000], ['Security consultation', 3200]] },
  { slug: 'education', name: 'Education', icon: 'fas fa-graduation-cap', services: [['Math tutoring', 2500], ['English lessons', 2200], ['Computer basics', 3500], ['Exam preparation', 4500]] },
  { slug: 'food', name: 'Food', icon: 'fas fa-utensils', services: [['Lunch box delivery', 650], ['Family meal package', 3000], ['Event catering', 18000], ['Office refreshments', 4500]] },
  { slug: 'beauty', name: 'Beauty', icon: 'fas fa-spa', services: [['Haircut and styling', 1800], ['Bridal styling', 15000], ['Facial treatment', 3200], ['Home salon visit', 4800]] },
  { slug: 'health', name: 'Health', icon: 'fas fa-heartbeat', services: [['Wellness consultation', 2200], ['Fitness coaching', 3500], ['Nutrition planning', 4000], ['Personal training', 3000]] },
  { slug: 'construction', name: 'Construction', icon: 'fas fa-hard-hat', services: [['Renovation estimate', 5000], ['Tile installation', 12000], ['Masonry work', 18000], ['Site preparation', 15000]] },
  { slug: 'maintenance', name: 'Maintenance', icon: 'fas fa-wrench', services: [['AC maintenance', 3500], ['Generator servicing', 5500], ['Building inspection', 4200], ['Water pump service', 2800]] },
  { slug: 'other', name: 'Other Services', icon: 'fas fa-store', services: [['Custom product order', 3200], ['Gift wrapping', 500], ['Printing service', 1200], ['General consultation', 2500]] },
];

// Area names are used only as broad context. Specific addresses and contact details are invented.
const CITIES = [
  { city: 'Lahore', areas: ['Gulberg', 'Johar Town', 'Model Town', 'DHA', 'Wapda Town'], lat: 31.5204, lng: 74.3587 },
  { city: 'Karachi', areas: ['Clifton', 'Gulshan-e-Iqbal', 'North Nazimabad', 'Saddar', 'PECHS'], lat: 24.8607, lng: 67.0011 },
  { city: 'Islamabad', areas: ['F-8', 'G-11', 'I-8', 'F-10', 'Blue Area'], lat: 33.6844, lng: 73.0479 },
  { city: 'Rawalpindi', areas: ['Satellite Town', 'Bahria Town', 'Chaklala', 'Saddar'], lat: 33.5651, lng: 73.0169 },
  { city: 'Faisalabad', areas: ['D Ground', 'Madina Town', 'Peoples Colony'], lat: 31.4187, lng: 73.0791 },
  { city: 'Multan', areas: ['Gulgasht', 'Cantt', 'Shah Rukn-e-Alam'], lat: 30.1575, lng: 71.5249 },
  { city: 'Peshawar', areas: ['University Town', 'Hayatabad', 'Saddar'], lat: 34.0151, lng: 71.5249 },
  { city: 'Quetta', areas: ['Jinnah Town', 'Satellite Town', 'Cantt'], lat: 30.1798, lng: 66.9750 },
  { city: 'Gujranwala', areas: ['Satellite Town', 'Model Town', 'Civil Lines'], lat: 32.1877, lng: 74.1945 },
  { city: 'Sialkot', areas: ['Cantt', 'Model Town', 'Shahabpura'], lat: 32.4945, lng: 74.5229 },
  { city: 'Hyderabad', areas: ['Latifabad', 'Qasimabad', 'Saddar'], lat: 25.3960, lng: 68.3578 },
  { city: 'Abbottabad', areas: ['Jinnahabad', 'Mandian', 'Supply'], lat: 34.1688, lng: 73.2215 },
];
const FIRST_NAMES = ['Ayesha', 'Ahmed', 'Fatima', 'Ali', 'Zainab', 'Hassan', 'Hira', 'Bilal', 'Sana', 'Usman', 'Noor', 'Hamza', 'Iqra', 'Danish', 'Mariam', 'Farhan'];
const LAST_NAMES = ['Khan', 'Malik', 'Sheikh', 'Ahmed', 'Raza', 'Hussain', 'Siddiqui', 'Qureshi', 'Butt', 'Shah', 'Chaudhry', 'Iqbal'];
const SHOP_TYPES = ['food', 'beauty', 'repair', 'other', 'health', 'maintenance'];
const SHOP_WORDS = ['Market', 'Studio', 'Corner', 'Outlet', 'Hub', 'Store', 'Supplies', 'House'];
const PROVIDER_WORDS = ['Solutions', 'Experts', 'Services', 'Team', 'Works', 'Care', 'Professionals', 'Partners'];

function padded(index) { return String(index + 1).padStart(5, '0'); }
function pick(list, n) { return list[n % list.length]; }
function locationAt(n) {
  const place = pick(CITIES, n);
  return { city: place.city, area: pick(place.areas, Math.floor(n / CITIES.length)) };
}
function emailFor(kind, index) { return `demo.${kind}.${padded(index)}@seed.example.com`; }
function usernameFor(kind, index) { return `aaademo${kind}${padded(index)}`; }
// Explicitly non-dialable sample contact numbers (country code +000).
function demoPhone(index) { return `+000${String(index + 1).padStart(11, '0')}`; }

function makeUser(kind, index) {
  const location = locationAt(index + (kind === 'customer' ? 2 : 0));
  const firstName = pick(FIRST_NAMES, index + kind.length);
  const lastName = pick(LAST_NAMES, Math.floor(index / FIRST_NAMES.length));
  return {
    username: usernameFor(kind, index),
    email: emailFor(kind, index),
    firstName,
    lastName,
    // The seeder adds a bcrypt hash to this object; never use a plaintext default.
    userType: kind === 'customer' ? 'customer' : 'business',
    isActive: true,
    // Synthetic test accounts bypass actual email delivery, not business verification.
    isVerified: true,
    emailVerified: true,
    location,
    tags: [SEED_MARKER, 'Fictional Demo Account', kind === 'customer' ? 'Customer' : 'Service Provider'],
  };
}

function makeBusiness(kind, index, ownerId) {
  const type = kind === 'shop' ? pick(SHOP_TYPES, index) : pick(CATEGORIES, index).slug;
  const category = CATEGORIES.find((c) => c.slug === type);
  const place = pick(CITIES, index + (kind === 'shop' ? 3 : 0));
  const area = pick(place.areas, Math.floor(index / CITIES.length));
  const name = `[DEMO ${kind === 'shop' ? 'SHOP' : 'PROVIDER'}] ${place.city} ${category.name} ${pick(kind === 'shop' ? SHOP_WORDS : PROVIDER_WORDS, index)} ${padded(index)}`;
  const services = category.services.map(([service, base], n) => ({
    name: service,
    description: `Fictional ${service.toLowerCase()} offering for development and interface testing only.`,
    price: base + (index % 5) * 150 + n * 100,
    priceType: 'fixed',
    currency: 'PKR',
  }));
  return {
    owner: ownerId,
    businessName: name,
    businessType: type,
    description: `FICTIONAL DEMO LISTING. ${name} is a simulated ${category.name.toLowerCase()} ${kind} in ${place.city}. Do not contact, book, or rely on this listing as a real business.`,
    contact: {
      email: emailFor(kind, index),
      phone: demoPhone(index + (kind === 'shop' ? 40000 : 10000)),
      website: 'https://example.com',
    },
    location: {
      address: `Demo Address ${padded(index)} (not a real street address)`,
      city: place.city,
      area,
      serviceAreas: [...new Set([area, ...place.areas.slice(0, 2)])],
    },
    services,
    status: 'active',
    verification: { isVerified: false, documents: [] },
    features: {
      isPremium: false,
      isFeatured: index % 10 === 0,
      acceptsOnlineBooking: false,
      acceptsEmergencyCalls: false,
    },
    tags: [SEED_MARKER, 'Fictional Demo Listing', kind === 'shop' ? 'Demo Shop' : 'Demo Service Provider', category.slug, place.city],
  };
}

function makeCategory(category, index) {
  return {
    name: category.name,
    slug: category.slug,
    description: `Browse ${category.name.toLowerCase()} businesses and services. Demo listings are clearly marked.`,
    icon: category.icon,
    isActive: true,
    isFeatured: true,
    approvalStatus: 'approved',
    sortOrder: index + 1,
    tags: [category.slug, 'services'],
  };
}

module.exports = { CATEGORIES, SEED_MARKER, makeUser, makeBusiness, makeCategory, emailFor };
