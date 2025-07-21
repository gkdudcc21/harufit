const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');

// ✅ '오늘의 운동 요약' API 라우트 추가
// GET /api/workout/today
router.get('/today', workoutController.getTodayWorkoutSummary);

// ✅ 다른 모든 라우트에도 authMiddleware를 적용
//
// GET /api/workout (해당 사용자의 모든 운동 기록 조회)
router.get('/', workoutController.getWorkoutEntries);
//
// POST /api/workout (새로운 운동 기록 추가)
router.post('/', workoutController.addWorkoutEntry);
//
// PUT /api/workout/:entryId (특정 운동 기록 수정)
router.put('/:entryId', workoutController.updateWorkoutEntry);
//
// DELETE /api/workout/:entryId (특정 운동 기록 삭제)
router.delete('/:entryId', workoutController.deleteWorkoutEntry);

module.exports = router;