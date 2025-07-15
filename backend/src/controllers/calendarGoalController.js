// backend/src/controllers/calendarGoalController.js
const User = require('../models/User');
const DietEntry = require('../models/DietEntry'); // 식단 기록 모델 불러오기
const WorkoutEntry = require('../models/WorkoutEntry'); // 운동 기록 모델 불러오기

// 특정 날짜/기간의 요약 데이터 조회 (캘린더 화면용)
exports.getDailySummary = async (req, res) => {
    const { nickname, pin } = req.params;
    const { date } = req.query; // 조회할 날짜 (YYYY-MM-DD 형식)

    if (!nickname || !pin || !date) {
        return res.status(400).json({ message: '닉네임, PIN, 조회 날짜는 필수입니다.' });
    }

    try {
        const user = await User.findOne({ nickname, pin });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없거나 PIN이 일치하지 않습니다.' });
        }

        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // 해당 날짜의 식단 기록 조회
        const dietEntries = await DietEntry.find({
            user: user._id,
            date: { $gte: startOfDay, $lte: endOfDay }
        }).lean(); // lean()은 Mongoose 문서가 아닌 Plain JavaScript 객체 반환 (성능 향상)

        // 해당 날짜의 운동 기록 조회
        const workoutEntries = await WorkoutEntry.find({
            user: user._id,
            date: { $gte: startOfDay, $lte: endOfDay }
        }).lean();

        // 요약 데이터 계산 (예시)
        let totalConsumedCalories = 0;
        let totalWorkoutDuration = 0;
        let totalWorkoutCaloriesBurned = 0;

        dietEntries.forEach(entry => {
            totalConsumedCalories += entry.totalCalories || 0;
        });

        workoutEntries.forEach(entry => {
            totalWorkoutDuration += entry.totalDurationMinutes || 0;
            totalWorkoutCaloriesBurned += entry.totalCaloriesBurned || 0;
        });

        res.status(200).json({
            message: `${date}의 일일 요약 데이터입니다.`,
            summary: {
                date: date,
                diet: {
                    entriesCount: dietEntries.length,
                    totalCalories: totalConsumedCalories
                },
                workout: {
                    entriesCount: workoutEntries.length,
                    totalDurationMinutes: totalWorkoutDuration,
                    totalCaloriesBurned: totalWorkoutCaloriesBurned
                }
            }
        });

    } catch (error) {
        console.error('일일 요약 조회 중 오류:', error);
        res.status(500).json({ message: '일일 요약 데이터를 가져오는 데 실패했습니다.', error: error.message });
    }
};

// 사용자 목표 설정 (추후 필요시 Goals 모델 별도 정의 필요)
// 현재는 User 모델의 targetWeight, targetCalories를 임시 목표로 활용
exports.setGoal = async (req, res) => {
    const { nickname, pin } = req.params;
    const { targetWeight, targetCalories } = req.body;

    if (!nickname || !pin || (!targetWeight && !targetCalories)) {
        return res.status(400).json({ message: '닉네임, PIN, 목표(체중 또는 칼로리)는 필수입니다.' });
    }

    try {
        const user = await User.findOne({ nickname, pin });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없거나 PIN이 일치하지 않습니다.' });
        }

        // User 모델에 목표 업데이트
        user.targetWeight = targetWeight !== undefined ? targetWeight : user.targetWeight;
        user.targetCalories = targetCalories !== undefined ? targetCalories : user.targetCalories;

        await user.save();
        res.status(200).json({ message: '목표가 성공적으로 설정/업데이트되었습니다.', user: user });

    } catch (error) {
        console.error('목표 설정 중 오류:', error);
        res.status(500).json({ message: '목표 설정에 실패했습니다.', error: error.message });
    }
};

// 사용자 목표 조회
exports.getGoals = async (req, res) => {
    const { nickname, pin } = req.params;

    if (!nickname || !pin) {
        return res.status(400).json({ message: '닉네임과 PIN 번호는 필수입니다.' });
    }

    try {
        const user = await User.findOne({ nickname, pin });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없거나 PIN이 일치하지 않습니다.' });
        }

        res.status(200).json({
            message: '목표를 성공적으로 가져왔습니다.',
            goals: {
                targetWeight: user.targetWeight,
                targetCalories: user.targetCalories
            }
        });

    } catch (error) {
        console.error('목표 조회 중 오류:', error);
        res.status(500).json({ message: '목표 조회에 실패했습니다.', error: error.message });
    }
};

// 목표 업데이트 (현재는 setGoal과 동일하게 targetWeight, targetCalories 직접 업데이트)
// 만약 Goals 모델을 별도로 만든다면, 여기서 goalId를 받아 특정 목표를 업데이트하는 로직이 들어갑니다.
exports.updateGoal = async (req, res) => {
    const { nickname, pin, goalId } = req.params; // goalId는 현재 사용 안 함 (User 모델 직접 업데이트)
    const { targetWeight, targetCalories } = req.body;

    if (!nickname || !pin || (!targetWeight && !targetCalories)) {
        return res.status(400).json({ message: '닉네임, PIN, 업데이트할 목표는 필수입니다.' });
    }

    try {
        const user = await User.findOne({ nickname, pin });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없거나 PIN이 일치하지 않습니다.' });
        }

        user.targetWeight = targetWeight !== undefined ? targetWeight : user.targetWeight;
        user.targetCalories = targetCalories !== undefined ? targetCalories : user.targetCalories;

        await user.save();
        res.status(200).json({ message: '목표가 성공적으로 업데이트되었습니다.', user: user });

    } catch (error) {
        console.error('목표 업데이트 중 오류:', error);
        res.status(500).json({ message: '목표 업데이트에 실패했습니다.', error: error.message });
    }
};

// 목표 삭제 (현재는 targetWeight, targetCalories를 null로 설정)
// 만약 Goals 모델을 별도로 만든다면, 여기서 goalId를 받아 특정 목표를 삭제하는 로직이 들어갑니다.
exports.deleteGoal = async (req, res) => {
    const { nickname, pin, goalId } = req.params; // goalId는 현재 사용 안 함 (User 모델 직접 업데이트)

    if (!nickname || !pin) {
        return res.status(400).json({ message: '닉네임과 PIN 번호는 필수입니다.' });
    }

    try {
        const user = await User.findOne({ nickname, pin });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없거나 PIN이 일치하지 않습니다.' });
        }

        user.targetWeight = null;
        user.targetCalories = null;

        await user.save();
        res.status(200).json({ message: '목표가 성공적으로 삭제되었습니다.', user: user });

    } catch (error) {
        console.error('목표 삭제 중 오류:', error);
        res.status(500).json({ message: '목표 삭제에 실패했습니다.', error: error.message });
    }
};