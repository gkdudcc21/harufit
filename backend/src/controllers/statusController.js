// backend/src/controllers/statusController.js
const Status = require('../models/Status');
const mongoose = require('mongoose'); // mongoose 추가

// 오늘의 상태 정보를 가져오는 함수
exports.getTodayStatus = async (req, res) => {
    try {
        const userId = req.user._id;

        const now = new Date();
        const kstOffset = 9 * 60 * 60 * 1000;
        
        const todayStart = new Date(new Date(now.getTime() + kstOffset).toISOString().split('T')[0] + 'Z');
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

        // ✅ [핵심 수정] createdAt -> date 기준으로 오늘의 기록을 찾습니다.
        const todayStatus = await Status.findOne({
            user: userId,
            date: { $gte: todayStart, $lte: todayEnd }
        }).sort({ date: -1 }); // 정렬 기준도 date로 변경

        if (todayStatus) {
            return res.status(200).json(todayStatus);
        }

        // 오늘 기록이 없으면, 생성 시간(createdAt) 기준 가장 마지막 기록을 보내줌 (이 부분은 유지)
        const lastStatus = await Status.findOne({ user: userId }).sort({ createdAt: -1 });
        if (lastStatus) {
            return res.status(200).json(lastStatus);
        }

        // 어떤 기록도 없다면 기본값 반환
        return res.status(200).json({
            weight: 0,
            bodyFatPercentage: 0,
            skeletalMuscleMass: 0,
            notes: '첫 상태 기록을 시작해보세요!',
        });

    } catch (error) {
        console.error('오늘의 상태 정보 조회 중 오류:', error);
        res.status(500).json({ message: '상태 정보 조회 중 서버 오류가 발생했습니다.' });
    }
};

// 여기에 나중에 addStatus, updateStatus 등 다른 함수들을 추가할 수 있습니다.