// backend/app.js
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes'); // 새로 추가: aiRoutes 불러오기

const app = express();

// 미들웨어 설정
app.use(cors()); // CORS 허용 (프론트엔드와 백엔드 도메인이 다를 때 필수)
app.use(express.json()); // JSON 형태의 요청 본문(body)을 파싱합니다.

// === API 라우트들을 여기에 추가합니다 ===
app.use('/api/users', userRoutes); // 새로 추가: /api/users 경로로 userRoutes 연결
app.use('/api/ai', aiRoutes); // 새로 추가: /api/ai 경로로 aiRoutes 연결

// 기본 라우트 (서버 작동 확인용)
app.get('/', (req, res) => {
  res.send('HaruFit Backend API is running!');
});

// === 에러 핸들링 미들웨어를 여기에 추가할 예정입니다 ===

module.exports = app; // Express 앱 인스턴스를 내보냅니다.
