// backend/src/controllers/workoutController.js
const WorkoutEntry = require('../models/WorkoutEntry'); // WorkoutEntry 모델 불러오기
const User = require('../models/User'); // User 모델 불러오기 (user.js 파일명에 맞춤)

// 운동 기록 추가 (POST 요청)
exports.addWorkoutEntry = async (req, res) => {
    const { nickname, pin, date, workoutType, exercises, notes } = req.body;

    if (!nickname || !pin || !exercises || exercises.length === 0) {
        return res.status(400).json({ message: '닉네임, PIN, 운동 항목은 필수입니다.' });
    }

    try {
        const user = await User.findOne({ nickname, pin });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없거나 PIN이 일치하지 않습니다.' });
        }

        let totalDurationMinutes = 0;
        let totalCaloriesBurned = 0;
        exercises.forEach(exercise => {
            totalDurationMinutes += (exercise.durationMinutes || 0);
            totalCaloriesBurned += (exercise.caloriesBurned || 0);
        });

        const newEntry = new WorkoutEntry({
            user: user._id, // User._id와 연결
            date: date || new Date(),
            workoutType: workoutType,
            exercises: exercises,
            totalDurationMinutes: totalDurationMinutes,
            totalCaloriesBurned: totalCaloriesBurned,
            notes: notes
        });

        await newEntry.save();
        res.status(201).json({ message: '운동 기록이 성공적으로 추가되었습니다.', entry: newEntry });

    } catch (error) {
        console.error('운동 기록 추가 중 오류:', error);
        res.status(500).json({ message: '운동 기록 추가에 실패했습니다.', error: error.message });
    }
};

// 사용자 운동 기록 조회 (GET 요청)
exports.getWorkoutEntries = async (req, res) => {
    const { nickname, pin } = req.query; // GET 요청에서는 쿼리 파라미터로 받음

    if (!nickname || !pin) {
        return res.status(400).json({ message: '닉네임과 PIN 번호가 필요합니다.' });
    }

    try {
        const user = await User.findOne({ nickname, pin });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없거나 PIN이 일치하지 않습니다.' });
        }

        // 특정 사용자의 모든 운동 기록을 최신 순으로 조회
        const workoutEntries = await WorkoutEntry.find({ user: user._id }).sort({ date: -1 });

        res.status(200).json({ message: '운동 기록을 성공적으로 가져왔습니다.', entries: workoutEntries });

    } catch (error) {
        console.error('운동 기록 조회 중 오류:', error);
        res.status(500).json({ message: '운동 기록 조회에 실패했습니다.', error: error.message });
    }
};

// 운동 기록 업데이트 (PUT/PATCH 요청)
exports.updateWorkoutEntry = async (req, res) => {
    const { nickname, pin, entryId } = req.params; // URL 파라미터에서 entryId 가져옴
    const updateData = req.body; // 업데이트할 데이터

    if (!nickname || !pin || !entryId) {
        return res.status(400).json({ message: '닉네임, PIN, 운동 ID는 필수입니다.' });
    }

    try {
        const user = await User.findOne({ nickname, pin });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없거나 PIN이 일치하지 않습니다.' });
        }

        // 해당 사용자의 특정 운동 기록 찾기 및 업데이트
        const updatedEntry = await WorkoutEntry.findOneAndUpdate(
            { _id: entryId, user: user._id }, // user._id로 해당 사용자의 기록만 업데이트 가능하도록 함
            updateData,
            { new: true, runValidators: true } // 업데이트 후의 문서 반환, 스키마 유효성 검사 실행
        );

        if (!updatedEntry) {
            return res.status(404).json({ message: '운동 기록을 찾을 수 없거나 접근 권한이 없습니다.' });
        }

        res.status(200).json({ message: '운동 기록이 성공적으로 업데이트되었습니다.', entry: updatedEntry });

    } catch (error) {
        console.error('운동 기록 업데이트 중 오류:', error);
        res.status(500).json({ message: '운동 기록 업데이트에 실패했습니다.', error: error.message });
    }
};

// 운동 기록 삭제 (DELETE 요청)
exports.deleteWorkoutEntry = async (req, res) => {
    const { nickname, pin, entryId } = req.params;

    if (!nickname || !pin || !entryId) {
        return res.status(400).json({ message: '닉네임, PIN, 운동 ID는 필수입니다.' });
    }

    try {
        const user = await User.findOne({ nickname, pin });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없거나 PIN이 일치하지 않습니다.' });
        }

        // 해당 사용자의 특정 운동 기록 삭제
        const deletedEntry = await WorkoutEntry.findOneAndDelete({ _id: entryId, user: user._id });

        if (!deletedEntry) {
            return res.status(404).json({ message: '운동 기록을 찾을 수 없거나 접근 권한이 없습니다.' });
        }

        res.status(200).json({ message: '운동 기록이 성공적으로 삭제되었습니다.', entry: deletedEntry });

    } catch (error) {
        console.error('운동 기록 삭제 중 오류:', error);
        res.status(500).json({ message: '운동 기록 삭제에 실패했습니다.', error: error.message });
    }
};