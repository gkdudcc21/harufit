// backend/src/routes/dietRoutes.js
const express = require('express');
const dietController = require('../controllers/dietController'); // 컨트롤러 불러오기

const router = express.Router();

// 식단 기록 추가 (POST)
router.post('/', dietController.addDietEntry);

// 사용자 식단 기록 조회 (GET)
router.get('/', dietController.getDietEntries);

// 식단 기록 업데이트 (PUT) - 닉네임, PIN, 식단 ID를 URL 파라미터로 받음
router.put('/:nickname/:pin/:entryId', dietController.updateDietEntry);

// 식단 기록 삭제 (DELETE) - 닉네임, PIN, 식단 ID를 URL 파라미터로 받음
router.delete('/:nickname/:pin/:entryId', dietController.deleteDietEntry);

module.exports = router;