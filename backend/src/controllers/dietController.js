// backend/src/controllers/dietController.js
const DietEntry = require('../models/DietEntry');
const User = require('../models/User');

// 오늘의 식단 요약 정보를 가져오는 함수
const getTodayDietSummary = async (req, res) => {
    try {
        const userId = req.user._id;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayDiets = await DietEntry.find({
            user: userId,
            createdAt: { $gte: todayStart, $lte: todayEnd }
        });

        // ✅ [수정] 데이터가 없는 신규 사용자를 위한 처리
        if (!todayDiets || todayDiets.length === 0) {
            return res.status(200).json({
                totalCalories: 0,
                eatenMeals: [],
                waterIntake: { current: 0, goal: 2 }, // 기본 목표 2L
                recommendedMeal: { type: '저녁', menu: '가벼운 샐러드' }, // 임시 추천
                targetCalories: req.user.targetCalories || 2000,
            });
        }

        // ✅ [수정] 더 상세한 요약 정보를 계산합니다.
        let totalCalories = 0;
        let totalWaterIntakeMl = 0;
        const eatenMeals = [];

        todayDiets.forEach(diet => {
            totalCalories += diet.totalCalories || 0;
            totalWaterIntakeMl += diet.waterIntakeMl || 0;
            // 프론트엔드가 사용하기 좋은 형태로 식단 목록을 가공합니다.
            eatenMeals.push({
                type: diet.mealType,
                menu: diet.foodItems.map(item => item.name).join(', '),
                kcal: diet.totalCalories
            });
        });
        
        const summary = {
            totalCalories,
            eatenMeals,
            waterIntake: {
                current: totalWaterIntakeMl / 1000, // ml를 L로 변환
                goal: 2 // 기본 목표 2L
            },
            recommendedMeal: { type: '저녁', menu: '가벼운 샐러드' }, // 임시 추천
            targetCalories: req.user.targetCalories || 2000,
        };

        res.status(200).json(summary);
    } catch (error) {
        console.error('오늘의 식단 요약 조회 중 오류:', error);
        res.status(500).json({ message: '오늘의 식단 요약 조회 중 서버 오류가 발생했습니다.' });
    }
};

// --- 이하 다른 함수들은 기존 코드를 그대로 유지합니다. ---

// 식단 기록 추가
const addDietEntry = async (req, res) => {
    try {
        const { date, mealType, foodItems, waterIntakeMl, notes } = req.body;
        const userId = req.user._id;

        let totalCalories = 0;
        if (foodItems && foodItems.length > 0) {
            foodItems.forEach(item => {
                totalCalories += item.calories || 0;
            });
        }

        const newEntry = new DietEntry({
            user: userId,
            date: date || new Date(),
            mealType,
            foodItems,
            waterIntakeMl,
            totalCalories,
            notes
        });

        await newEntry.save();
        res.status(201).json({ message: '식단이 성공적으로 기록되었습니다.', entry: newEntry });
    } catch (error) {
        console.error('식단 기록 추가 중 오류:', error);
        res.status(500).json({ message: '서버 오류로 식단 기록에 실패했습니다.' });
    }
};

// 사용자의 모든 식단 기록 조회
const getDietEntries = async (req, res) => {
    try {
        const dietEntries = await DietEntry.find({ user: req.user._id }).sort({ date: -1 });
        res.status(200).json({ message: '식단 기록을 성공적으로 가져왔습니다.', entries: dietEntries });
    } catch (error) {
        console.error('식단 기록 조회 중 오류:', error);
        res.status(500).json({ message: '식단 기록 조회에 실패했습니다.' });
    }
};

// 식단 기록 업데이트
const updateDietEntry = async (req, res) => {
    try {
        const { entryId } = req.params;
        const updatedEntry = await DietEntry.findOneAndUpdate(
            { _id: entryId, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!updatedEntry) return res.status(404).json({ message: '해당 식단 기록을 찾을 수 없거나 수정 권한이 없습니다.' });
        res.status(200).json({ message: '식단 기록이 성공적으로 업데이트되었습니다.', entry: updatedEntry });
    } catch (error) {
        console.error('식단 기록 업데이트 중 오류:', error);
        res.status(500).json({ message: '식단 기록 업데이트에 실패했습니다.' });
    }
};

// 식단 기록 삭제
const deleteDietEntry = async (req, res) => {
    try {
        const { entryId } = req.params;
        const deletedEntry = await DietEntry.findOneAndDelete({ _id: entryId, user: req.user._id });
        if (!deletedEntry) return res.status(404).json({ message: '해당 식단 기록을 찾을 수 없거나 삭제 권한이 없습니다.' });
        res.status(200).json({ message: '식단 기록이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('식단 기록 삭제 중 오류:', error);
        res.status(500).json({ message: '식단 기록 삭제에 실패했습니다.' });
    }
};

module.exports = {
    getTodayDietSummary,
    addDietEntry,
    getDietEntries,
    updateDietEntry,
    deleteDietEntry,
};