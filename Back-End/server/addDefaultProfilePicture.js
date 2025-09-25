const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aaa-services', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Admin = require('./models/Admin');

async function addDefaultProfilePictures() {
  try {
    console.log('🔍 Adding default profile pictures to existing admin accounts...');
    
    // Find all admin accounts without profile pictures
    const adminsWithoutPictures = await Admin.find({ 
      $or: [
        { profilePicture: { $exists: false } },
        { profilePicture: null },
        { profilePicture: '' }
      ]
    });
    
    console.log(`📊 Found ${adminsWithoutPictures.length} admin accounts without profile pictures`);
    
    if (adminsWithoutPictures.length === 0) {
      console.log('✅ All admin accounts already have profile pictures');
      return;
    }
    
    // Create a simple SVG profile picture with initials
    const createDefaultPicture = (fullName) => {
      const initial = fullName ? fullName.charAt(0).toUpperCase() : 'A';
      const svg = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="50" fill="#228B22"/>
        <circle cx="50" cy="40" r="20" fill="white"/>
        <path d="M30 75L50 55L70 75" fill="white"/>
        <text x="50" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#228B22">${initial}</text>
      </svg>`;
      return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    };
    
    // Update each admin account
    for (const admin of adminsWithoutPictures) {
      const defaultPicture = createDefaultPicture(admin.fullName);
      
      await Admin.updateOne(
        { _id: admin._id },
        { 
          profilePicture: defaultPicture,
          phone: admin.phone || null
        }
      );
      
      console.log(`✅ Updated admin: ${admin.fullName} (${admin.username})`);
    }
    
    console.log('🎉 Successfully added default profile pictures to all admin accounts!');
    
  } catch (error) {
    console.error('❌ Error adding default profile pictures:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
addDefaultProfilePictures();
