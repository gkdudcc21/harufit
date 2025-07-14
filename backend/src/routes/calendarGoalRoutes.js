// backend/src/routes/calendarGoalRoutes.js
const express = require('express');
const calendarGoalController = require('../controllers/calendarGoalController'); // 컨트롤러 불러오기

const router = express.Router();

// 특정 날짜/기간의 요약 데이터 조회 (캘린더용)
router.get('/:nickname/:pin/daily-summary', calendarGoalController.getDailySummary);

// 사용자 목표 설정 (POST)
router.post('/:nickname/:pin/goals', calendarGoalController.setGoal);

// 사용자 목표 조회 (GET)
router.get('/:nickname/:pin/goals', calendarGoalController.getGoals);

// 사용자 목표 업데이트 (PUT)
router.put('/:nickname/:pin/goals/:goalId', calendarGoalController.updateGoal);

// 사용자 목표 삭제 (DELETE)
router.delete('/:nickname/:pin/goals/:goalId', calendarGoalController.deleteGoal);


module.exports = router;