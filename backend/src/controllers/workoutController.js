// backend/src/controllers/workoutController.js
const WorkoutEntry = require('../models/WorkoutEntry');
const User = require('../models/user');
const mongoose = require('mongoose');

exports.getTodayWorkoutSummary = async (req, res) => {
    try {
        const userId = req.user._id;

        const now = new Date();
        const kstOffset = 9 * 60 * 60 * 1000;
        
        const todayStart = new Date(new Date(now.getTime() + kstOffset).toISOString().split('T')[0] + 'Z');
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

        const todayWorkouts = await WorkoutEntry.find({
            user: userId,
            date: { $gte: todayStart, $lte: todayEnd }
        }).sort({ date: -1 });

        // ✅ [수정] 운동 기록이 없을 때의 기본 응답 구조 명확화
        if (!todayWorkouts || todayWorkouts.length === 0) {
            return res.status(200).json({
                latestWorkout: [], // 빈 배열로 초기화
                recommendedWorkout: null, // 추천 운동은 여기서 다루지 않음
            });
        }
        
        // ✅ [수정] 상세 정보를 텍스트로 가공하는 로직 강화
        const latestWorkoutDetails = [];
        todayWorkouts.forEach(entry => {
            entry.exercises.forEach(ex => {
                let detailsParts = [];
                if (ex.weightKg) detailsParts.push(`${ex.weightKg}kg`);
                if (ex.reps) detailsParts.push(`${ex.reps}회`);
                if (ex.sets) detailsParts.push(`${ex.sets}세트`);
                if (ex.durationMinutes) detailsParts.push(`${ex.durationMinutes}분`);

                // 상세 정보가 하나라도 있을 때만 name과 함께 추가
                if (detailsParts.length > 0) {
                    latestWorkoutDetails.push({ name: ex.name, details: detailsParts.join(', ') });
                } else {
                    latestWorkoutDetails.push({ name: ex.name, details: '' }); // 상세 정보가 없으면 이름만
                }
            });
        });

        const summary = {
            latestWorkout: latestWorkoutDetails.slice(0, 4), // 최신 4개 항목만 표시
            recommendedWorkout: null,
        };

        res.status(200).json(summary);
    } catch (error) {
        console.error('오늘의 운동 요약 조회 중 오류:', error);
        res.status(500).json({ message: '오늘의 운동 요약 조회 중 오류가 발생했습니다.' });
    }
};

// 이하 다른 함수들 (addWorkoutEntry, getWorkoutEntries 등)은 수정할 필요 없습니다.
// ... (기존의 다른 컨트롤러 함수들) ...
exports.addWorkoutEntry = async (req, res) => {
    try {
        const { date, workoutType, exercises, notes } = req.body;
        const userId = req.user._id;
        
        let totalDurationMinutes = 0;
        let totalCaloriesBurned = 0;
        exercises.forEach(exercise => {
            totalDurationMinutes += (exercise.durationMinutes || 0);
            totalCaloriesBurned += (exercise.caloriesBurned || 0);
        });

        const newEntry = new WorkoutEntry({
            user: userId,
            date: date || new Date(),
            workoutType,
            exercises,
            totalDurationMinutes,
            totalCaloriesBurned,
            notes
        });
        await newEntry.save();
        res.status(201).json({ message: '운동 기록이 성공적으로 추가되었습니다.', entry: newEntry });
    } catch (error) {
        console.error('운동 기록 추가 중 오류:', error);
        res.status(500).json({ message: '운동 기록 추가에 실패했습니다.' });
    }
};
exports.getWorkoutEntries = async (req, res) => {
    try {
        const workoutEntries = await WorkoutEntry.find({ user: req.user._id }).sort({ date: -1 });
        res.status(200).json({ message: '운동 기록을 성공적으로 가져왔습니다.', entries: workoutEntries });
    } catch (error) {
        console.error('운동 기록 조회 중 오류:', error);
        res.status(500).json({ message: '운동 기록 조회에 실패했습니다.' });
    }
};
exports.updateWorkoutEntry = async (req, res) => {
    try {
        const { entryId } = req.params;
        const userId = req.user._id;
        const updateData = req.body;

        const updatedEntry = await WorkoutEntry.findOneAndUpdate(
            { _id: entryId, user: userId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({ message: '해당 운동 기록을 찾을 수 없거나 수정 권한이 없습니다.' });
        }
        res.status(200).json({ message: '운동 기록이 성공적으로 업데이트되었습니다.', entry: updatedEntry });
    } catch (error) {
        console.error('운동 기록 업데이트 중 오류:', error);
        res.status(500).json({ message: '운동 기록 업데이트에 실패했습니다.' });
    }
};
exports.deleteWorkoutEntry = async (req, res) => {
    try {
        const { entryId } = req.params;
        const userId = req.user._id;

        const deletedEntry = await WorkoutEntry.findOneAndDelete({ _id: entryId, user: userId });

        if (!deletedEntry) {
            return res.status(404).json({ message: '해당 운동 기록을 찾을 수 없거나 삭제 권한이 없습니다.' });
        }
        res.status(200).json({ message: '운동 기록이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('운동 기록 삭제 중 오류:', error);
        res.status(500).json({ message: '운동 기록 삭제에 실패했습니다.' });
    }
};