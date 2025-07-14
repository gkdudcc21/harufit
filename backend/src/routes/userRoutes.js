// backend/src/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController'); // 컨트롤러를 불러옵니다.

const router = express.Router();

// GET /api/users/me 엔드포인트: 현재 사용자 정보를 가져옵니다.
router.get('/me', userController.getCurrentUser);


// POST /api/users 엔드포인트: 새로운 사용자를 생성합니다. (회원가입/닉네임 설정)
router.post('/', userController.createUser); // 새로 추가
router.get('/:nickname', userController.getUser);


module.exports = router;
