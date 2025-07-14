// backend/src/routes/workoutRoutes.js
const express = require('express');
const workoutController = require('../controllers/workoutController'); // 컨트롤러 불러오기

const router = express.Router();

// 운동 기록 추가 (POST)
router.post('/', workoutController.addWorkoutEntry);

// 사용자 운동 기록 조회 (GET)
router.get('/', workoutController.getWorkoutEntries);

// 운동 기록 업데이트 (PUT) - 닉네임, PIN, 운동 ID를 URL 파라미터로 받음
router.put('/:nickname/:pin/:entryId', workoutController.updateWorkoutEntry);

// 운동 기록 삭제 (DELETE) - 닉네임, PIN, 운동 ID를 URL 파라미터로 받음
router.delete('/:nickname/:pin/:entryId', workoutController.deleteWorkoutEntry);

module.exports = router;