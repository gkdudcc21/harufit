// backend/src/controllers/aiController.js
const aiService = require('../services/aiService');
const DietEntry = require('../models/DietEntry');
const WorkoutEntry = require('../models/WorkoutEntry');
// ✅ [수정] DB 저장을 위해 Status 모델을 가져옵니다.
const Status = require('../models/Status');

const mealTypeMap = { '아침': 'breakfast', '점심': 'lunch', '저녁': 'dinner', '간식': 'snack' };
const workoutTypeMap = { '유산소': 'cardio', '근력': 'strength', '요가': 'yoga', '스트레칭': 'stretching' };

exports.parseAndLogChat = async (req, res) => {
    const user = req.user;
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ message: '메시지를 입력해주세요.' });
    }

    try {
        const userContext = { nickname: user.nickname };
        const { conversationalReply, extractedData } = await aiService.getAiChatResponse(message, history || [], userContext);
        const savedData = [];

        if (extractedData && extractedData.length > 0) {
            for (const item of extractedData) {
                if (item.type === 'diet' && item.items) {
                    for (const food of item.items) {
                        const nutrition = await aiService.getNutritionEstimate(food.name);
                        const englishMealType = mealTypeMap[item.mealType] || 'other';
                        const newDiet = new DietEntry({
                            user: user._id,
                            mealType: englishMealType,
                            foodItems: [{ name: food.name, ...nutrition }],
                            totalCalories: nutrition.calories,
                        });
                        await newDiet.save();
                        savedData.push(newDiet);
                    }
                } else if (item.type === 'workout' && item.items) {
                    let totalDuration = 0;
                    let totalCalories = 0;
                    const exercises = item.items.map(ex => {
                        totalDuration += ex.durationMinutes || 0;
                        totalCalories += ex.caloriesBurned || 0;
                        return { name: ex.name, durationMinutes: ex.durationMinutes, sets: ex.sets, reps: ex.reps };
                    });
                    const englishWorkoutType = workoutTypeMap[item.workoutType] || 'other';
                    const newWorkout = new WorkoutEntry({
                        user: user._id,
                        workoutType: englishWorkoutType,
                        exercises: exercises,
                        totalDurationMinutes: totalDuration,
                        totalCaloriesBurned: totalCalories,
                    });
                    await newWorkout.save();
                    savedData.push(newWorkout);
                
                // ✅ [핵심 수정] '상태' 기록 로직을 추가했습니다.
                } else if (item.type === 'status') {
                    const newStatus = new Status({
                        user: user._id,
                        weight: item.weight,
                        bodyFatPercentage: item.bodyFatPercentage,
                        // AI가 다른 상태 값도 분석하면 여기에 추가할 수 있습니다.
                    });
                    await newStatus.save();
                    savedData.push(newStatus);
                }
            }
        }
        
        res.status(200).json({
            reply: conversationalReply,
            savedData: savedData,
        });

    } catch (error) {
        console.error('AI 채팅 처리 중 오류:', error);
        res.status(500).json({ message: '하루핏 AI 매니저와의 통신에 문제가 발생했습니다.', error: error.message });
    }
};