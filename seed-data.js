// seed-data.js - CORRECTED VERSION
const mongoose = require('mongoose');
require('dotenv').config();

// Use the correct environment variable name from your .env
const MONGODB_URI = process.env.MONGO_URI; // ← FIXED: Changed from MONGODB_URI to MONGO_URI

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGO_URI is not defined in environment variables');
  process.exit(1);
}

console.log('Connecting to MongoDB Atlas...');
console.log('URI:', MONGODB_URI.replace(/:[^:]*@/, ':********@')); // Hide password in logs

// Sample data using YOUR actual credentials from the assessment
const sampleOrders = [
  {
    school_id: '65b0e6293e9f76a9694d84b4', // From your assessment
    trustee_id: '65b0e552dd31950a9b41c5ba', // From your assessment
    student_info: {
      name: 'Rahul Sharma',
      id: 'STU2024001',
      email: 'rahul.sharma@school.edu'
    },
    gateway_name: 'PhonePe',
    createdAt: new Date('2024-01-20T10:30:00Z')
  },
  {
    school_id: '65b0e6293e9f76a9694d84b4',
    trustee_id: '65b0e552dd31950a9b41c5ba',
    student_info: {
      name: 'Priya Patel',
      id: 'STU2024002',
      email: 'priya.patel@school.edu'
    },
    gateway_name: 'Razorpay',
    createdAt: new Date('2024-01-21T14:45:00Z')
  },
  {
    school_id: '65b0e6293e9f76a9694d84b4',
    trustee_id: '65b0e552dd31950a9b41c5ba',
    student_info: {
      name: 'Amit Kumar',
      id: 'STU2024003',
      email: 'amit.kumar@school.edu'
    },
    gateway_name: 'Stripe',
    createdAt: new Date('2024-01-22T09:15:00Z')
  }
];

const sampleOrderStatuses = [
  {
    order_amount: 2500,
    transaction_amount: 2500,
    payment_mode: 'upi',
    payment_details: 'success@ybl',
    bank_reference: 'YESBNK2024001',
    payment_message: 'Payment successful',
    status: 'success',
    error_message: 'NA',
    payment_time: new Date('2024-01-20T10:35:00Z')
  },
  {
    order_amount: 1800,
    transaction_amount: 1800,
    payment_mode: 'card',
    payment_details: '4242********4242',
    bank_reference: 'HDFCBNK2024002',
    payment_message: 'Payment pending',
    status: 'pending',
    error_message: 'NA',
    payment_time: new Date('2024-01-21T14:50:00Z')
  },
  {
    order_amount: 3200,
    transaction_amount: 0,
    payment_mode: 'netbanking',
    payment_details: 'failed@ybl',
    bank_reference: 'ICICBNK2024003',
    payment_message: 'Payment failed',
    status: 'failed',
    error_message: 'Insufficient funds',
    payment_time: new Date('2024-01-22T09:20:00Z')
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to your MongoDB Atlas database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas successfully!');

    // Import your models (adjust paths as needed)
    const Order = require('./models/Order');
    const OrderStatus = require('./models/OrderStatus');

    // Clear existing test data (optional but recommended)
    await Order.deleteMany({});
    await OrderStatus.deleteMany({});
    console.log('Cleared existing test data');

    // Insert orders
    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`Inserted ${createdOrders.length} orders`);

    // Link order statuses with orders
    for (let i = 0; i < createdOrders.length; i++) {
      sampleOrderStatuses[i].collect_id = createdOrders[i]._id;
    }

    // Insert order statuses
    const createdOrderStatuses = await OrderStatus.insertMany(sampleOrderStatuses);
    console.log(`Inserted ${createdOrderStatuses.length} order statuses`);

    console.log('✅ Database seeded successfully!');
    console.log('🎉 Your live frontend should now display sample data!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();