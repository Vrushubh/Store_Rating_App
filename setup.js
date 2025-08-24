const { testConnection, initDatabase } = require('./config/database');
require('dotenv').config();

async function setup() {
  console.log('🚀 Starting Store Rating Web App Setup...\n');

  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    await testConnection();
    console.log('✅ Database connection successful!\n');

    // Initialize database tables
    console.log('🗄️  Initializing database tables...');
    await initDatabase();
    console.log('✅ Database tables initialized successfully!\n');

    console.log('🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Install backend dependencies: npm install');
    console.log('2. Install frontend dependencies: cd client && npm install');
    console.log('3. Start the backend: npm run dev');
    console.log('4. Start the frontend: npm run client');
    console.log('\n🔑 Default admin account:');
    console.log('   Email: admin@storeapp.com');
    console.log('   Password: admin123!');
    console.log('\n🌐 The application will be available at:');
    console.log('   Backend: http://localhost:5000');
    console.log('   Frontend: http://localhost:3000');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check your .env file configuration');
    console.log('3. Verify database credentials');
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setup();
}

module.exports = setup;
