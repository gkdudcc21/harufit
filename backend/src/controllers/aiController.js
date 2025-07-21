// backend/src/controllers/aiController.js

const aiService = require('../services/aiService');
const DietEntry = require('../models/DietEntry');
const WorkoutEntry = require('../models/WorkoutEntry');
const Status = require('../models/Status');
const User = require('../models/user');
const mongoose = require('mongoose');

const mealTypeMap = { '아침': 'breakfast', '점심': 'lunch', '저녁': 'dinner', '간식': 'snack' };
const workoutTypeMap = { '유산소': 'cardio', '근력': 'strength', '요가': 'yoga', '스트레칭': 'stretching' };

exports.parseAndLogChat = async (req, res) => {
    const user = req.user;
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ message: '메시지를 입력해주세요.' });
    }

    try {
        const aiResponseMessage = await aiService.getAiChatResponse(message, history || [], user);
        
        const toolCalls = aiResponseMessage.tool_calls;
        let savedData = [];
        let clarificationQuestion = null;
        let customReply = null;
        
        const now = new Date();
        const kstOffset = 9 * 60 * 60 * 1000;
        const todayKST = new Date(now.getTime() + kstOffset);
        
        const todayStart = new Date(todayKST.toISOString().split('T')[0] + 'Z');
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);


        if (toolCalls) {
            for (const toolCall of toolCalls) {
                const functionName = toolCall.function.name;
                const parsedArgs = JSON.parse(toolCall.function.arguments);

                if (functionName === 'log_health_data') {
                    for (const item of parsedArgs.logs) {
                        if (item.type === 'diet' && item.items) {
                            const foodItemsForDb = [];
                            let totalCaloriesForEntry = 0;
                            for (const food of item.items) {
                                const quantity = food.quantity || 1;
                                const nutrition = await aiService.getNutritionEstimate(food.name);
                                foodItemsForDb.push({ name: food.name, quantity: quantity, calories: nutrition.calories, protein: nutrition.protein, carbs: nutrition.carbs, fat: nutrition.fat });
                                totalCaloriesForEntry += nutrition.calories * quantity;
                            }
                            if (foodItemsForDb.length > 0) {
                                const englishMealType = mealTypeMap[item.mealType] || 'other';
                                const newDiet = new DietEntry({ 
                                    user: user._id, 
                                    mealType: englishMealType, 
                                    foodItems: foodItemsForDb, 
                                    totalCalories: totalCaloriesForEntry,
                                    date: todayKST
                                });
                                await newDiet.save();
                                savedData.push({ type: 'diet', data: newDiet });
                            }
                        } else if (item.type === 'workout' && item.items) {
                            const exercisesForDb = item.items.map(ex => ({
                                name: ex.name,
                                reps: ex.reps,
                                sets: ex.sets,
                                durationMinutes: ex.durationMinutes,
                                weightKg: ex.weightKg,
                            }));
                            const newWorkout = new WorkoutEntry({ 
                                user: user._id, 
                                exercises: exercisesForDb,
                                date: todayKST
                            });
                            await newWorkout.save();
                            savedData.push({ type: 'workout', data: newWorkout });
                        } else if (item.type === 'status') {
                             let todayRecord = await Status.findOne({ user: user._id, date: { $gte: todayStart, $lte: todayEnd } });
                             
                            const updateWeight = (baseWeight) => {
                                if (item.weight !== undefined) {
                                    return parseFloat(item.weight);
                                }
                                if (item.weightChange !== undefined && baseWeight !== null) {
                                    let change = parseFloat(item.weightChange);

                                    if (item.changeDirection === 'loss') {
                                        change = -change;
                                    }
                                    return parseFloat(baseWeight) + change;
                                }
                                return baseWeight;
                            };

                            if (todayRecord) {
                                todayRecord.weight = updateWeight(todayRecord.weight);
                                if (item.bodyFatPercentage !== undefined) todayRecord.bodyFatPercentage = item.bodyFatPercentage;
                                await todayRecord.save();
                                savedData.push({ type: 'status', data: todayRecord });
                            } else {
                                const latestRecord = await Status.findOne({ user: user._id }).sort({ createdAt: -1 });
                                const baseWeight = latestRecord ? latestRecord.weight : null;
                                const newWeight = updateWeight(baseWeight);
                                const isWeightChanged = newWeight !== null && newWeight !== baseWeight;
                                const isBodyFatProvided = item.bodyFatPercentage !== undefined;

                                if (isWeightChanged || isBodyFatProvided) {
                                    if (newWeight === null) {
                                        console.error("Cannot create a status entry because weight is unknown.");
                                    } else {
                                        const newBodyFat = item.bodyFatPercentage !== undefined ? item.bodyFatPercentage : (latestRecord ? latestRecord.bodyFatPercentage : null);
                                        const newStatus = new Status({
                                            user: user._id,
                                            weight: newWeight,
                                            bodyFatPercentage: newBodyFat,
                                            date: todayKST
                                        });
                                        await newStatus.save();
                                        savedData.push({ type: 'status', data: newStatus });
                                    }
                                }
                            }
                        } else if (item.type === 'water' && item.waterAmountMl > 0) {
                             const newWaterEntry = new DietEntry({ 
                                user: user._id, 
                                waterIntakeMl: item.waterAmountMl, 
                                foodItems: [], 
                                totalCalories: 0,
                                date: todayKST
                            });
                            await newWaterEntry.save();
                            savedData.push({ type: 'water', data: newWaterEntry });
                        }
                    }
                } else if (functionName === 'set_user_preferences') {
                    if (parsedArgs.waterGoal) {
                        const newGoal = parseFloat(parsedArgs.waterGoal);
                        await User.findByIdAndUpdate(user._id, { waterGoal: newGoal });
                        customReply = `네, 하루 물 섭취 목표량을 ${newGoal}L로 설정했어요!`;
                        savedData.push({ type: 'water_goal_update' });
                    }
                // ✅ [수정] AI가 보내주는 '이유'가 포함된 답변을 가공하여 채팅창과 카드에 전달
                } else if (functionName === 'get_diet_recommendation') {
                    const mealType = parsedArgs.mealType;
                    if (mealType) {
                        const recommendationWithReason = await aiService.getSimpleDietRecommendation(mealType);
                        const [menu, reason] = recommendationWithReason.split('\n');
                        
                        customReply = `오늘은 ${mealType} 메뉴로 **${menu}** 어떠세요? ${reason || '맛있고 건강에도 좋을 거예요!'}`;
                        
                        savedData.push({ 
                            type: 'diet_recommendation', 
                            data: { mealType: mealType, menu: recommendationWithReason } 
                        });

                    } else {
                        customReply = "어떤 식사를 추천해드릴까요? (아침/점심/저녁)";
                    }
                } else if (functionName === 'get_workout_recommendation') {
                    const recommendation = await aiService.getSimpleWorkoutRecommendation(history);
                    customReply = `오늘은 이 운동 어떠세요?\n\n${recommendation}`;
                    savedData.push({ 
                        type: 'workout_recommendation', 
                        data: { name: recommendation } 
                    });
                } else if (functionName === 'request_clarification') {
                    clarificationQuestion = parsedArgs.question;
                }
            }
        }

        res.status(200).json({
            reply: customReply || aiResponseMessage.content || (savedData.length > 0 ? "기록되었습니다." : "네, 확인했습니다."),
            savedData: savedData,
            clarification: clarificationQuestion,
        });

    } catch (error) {
        console.error('AI 채팅 처리 중 오류:', error);
        if (!res.headersSent) {
            return res.status(500).json({ message: '하루핏 AI 매니저와의 통신에 문제가 발생했습니다.', error: error.message });
        }
    }
};