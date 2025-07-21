const express = require('express');
const router = express.Router();
const calendarGoalController = require('../controllers/calendarGoalController');

// ✅ HomePage 캘린더 요약 정보를 위한 새로운 라우트
// GET /api/calendar/summary
router.get('/summary', calendarGoalController.getCalendarSummary);

// ✅ 기존 라우트들도 새로운 인증 방식을 사용하도록 수정
//
// GET /api/calendar/goals (사용자 목표 조회)
router.get('/goals', calendarGoalController.getGoals);
//
// POST /api/calendar/goals (사용자 목표 설정)
router.post('/goals', calendarGoalController.setGoal);
//
// PUT /api/calendar/goals (사용자 목표 업데이트)
router.put('/goals', calendarGoalController.updateGoal);
//
// DELETE /api/calendar/goals (사용자 목표 삭제)
router.delete('/goals', calendarGoalController.deleteGoal);
//
// GET /api/calendar/daily-summary?date=YYYY-MM-DD (특정 날짜 요약)
router.get('/daily-summary', calendarGoalController.getDailySummary);


module.exports = router;