const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// ✅ [수정] 프론트엔드가 호출하는 API 경로('/parse-and-log')와 일치시킵니다.
// ✅ [수정] 컨트롤러 함수 이름을 새로운 이름('parseAndLogChat')으로 변경합니다.
router.post('/parse-and-log', aiController.parseAndLogChat);

module.exports = router;