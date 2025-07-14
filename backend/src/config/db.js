// backend/src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,      // Deprecated warnings 방지
      useUnifiedTopology: true,   // Deprecated warnings 방지
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // 연결 실패 시 프로세스 종료
  }
};

module.exports = connectDB;
