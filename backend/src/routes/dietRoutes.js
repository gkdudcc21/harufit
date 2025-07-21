// backend/src/routes/dietRoutes.js
const express = require('express');
const router = express.Router();
const dietController = require('../controllers/dietController');

// '오늘의 식단 요약' API 라우트
router.get('/today', dietController.getTodayDietSummary);

// 다른 모든 라우트
router.get('/', dietController.getDietEntries);
router.post('/', dietController.addDietEntry);
router.put('/:entryId', dietController.updateDietEntry);
router.delete('/:entryId', dietController.deleteDietEntry);

module.exports = router;