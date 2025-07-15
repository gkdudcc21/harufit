// backend/src/routes/aiRoutes.js
const express = require('express');
const aiController = require('../controllers/aiController'); // AI 컨트롤러를 불러옵니다.

const router = express.Router();

// POST /api/ai/chat 엔드포인트: AI 코치와 대화 메시지를 주고받습니다.
router.post('/chat', aiController.getAiResponse);

module.exports = router;