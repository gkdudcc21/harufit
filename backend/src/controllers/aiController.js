// backend/src/controllers/aiController.js
const aiService = require('../services/aiService');
const DietEntry = require('../models/DietEntry');
const WorkoutEntry = require('../models/WorkoutEntry');

// ✅ [수정] 한글 식사 타입을 영어로 변환하기 위한 객체(Map)를 추가합니다.
const mealTypeMap = {
    '아침': 'breakfast',
    '점심': 'lunch',
    '저녁': 'dinner',
    '간식': 'snack'
};

const workoutTypeMap = {
    '유산소': 'cardio',
    '근력': 'strength',
    '요가': 'yoga',
    '스트레칭': 'stretching'
};


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
                        
                        // ✅ [수정] AI가 분석한 한글 mealType을 영어로 변환합니다. (예: '점심' -> 'lunch')
                        const englishMealType = mealTypeMap[item.mealType] || 'other';

                        const newDiet = new DietEntry({
                            user: user._id,
                            mealType: englishMealType, // 변환된 영어 타입을 저장
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
                        return {
                            name: ex.name,
                            durationMinutes: ex.durationMinutes,
                            sets: ex.sets,
                            reps: ex.reps,
                        };
                    });
                    
                    // ✅ [수정] AI가 분석한 한글 workoutType을 영어로 변환합니다.
                    const englishWorkoutType = workoutTypeMap[item.workoutType] || 'other';

                    const newWorkout = new WorkoutEntry({
                        user: user._id,
                        workoutType: englishWorkoutType, // 변환된 영어 타입을 저장
                        exercises: exercises,
                        totalDurationMinutes: totalDuration,
                        totalCaloriesBurned: totalCalories,
                    });
                    await newWorkout.save();
                    savedData.push(newWorkout);
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