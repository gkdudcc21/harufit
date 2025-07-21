const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/users - 로그인 또는 회원가입
router.post('/', userController.createUser);

// ✅ [핵심 추가] POST /api/users/guest - 게스트 사용자 생성 및 토큰 발급
router.post('/guest', userController.createGuestUser);

// PUT /api/users/mode - 사용자 모드 변경
router.put('/mode', authMiddleware, userController.updateUserMode);

module.exports = router;