// backend/src/app.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// ✅ [핵심 수정] authMiddleware를 app.js에서 직접 불러옵니다.
const authMiddleware = require('./middleware/authMiddleware.js');

const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const dietRoutes = require('./routes/dietRoutes');
const statusRoutes = require('./routes/statusRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const chatHistoryRoutes = require('./routes/chatHistoryRoutes');
const calendarGoalRoutes = require('./routes/calendarGoalRoutes');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// === API 라우트들을 여기에 추가합니다 ===

// '인증'이 필요 없는 라우트
app.use('/api/users', userRoutes);
app.use('/api/chatHistory', chatHistoryRoutes); // 이 라우트는 현재 JWT 인증을 사용하지 않음

// ✅ [핵심 수정] '인증'이 필요한 모든 라우트에 authMiddleware를 일괄 적용합니다.
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/diet', authMiddleware, dietRoutes);
app.use('/api/status', authMiddleware, statusRoutes);
app.use('/api/workout', authMiddleware, workoutRoutes);
app.use('/api/calendar', authMiddleware, calendarGoalRoutes);

// 기본 라우트 (서버 작동 확인용)
app.get('/', (req, res) => {
  res.send('HaruFit Backend API is running!');
});

module.exports = app;