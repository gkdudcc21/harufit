const DietEntry = require('../models/DietEntry');
const User = require('../models/user');
const mongoose = require('mongoose');

const getTodayDietSummary = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);

        const now = new Date();
        const kstOffset = 9 * 60 * 60 * 1000; 
        const todayStart = new Date(new Date(now.getTime() + kstOffset).toISOString().slice(0, 10) + 'Z');
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

        const todayEntries = await DietEntry.find({
            user: userId,
            date: { $gte: todayStart, $lte: todayEnd }
        });

        if (todayEntries.length === 0) {
            return res.status(200).json({
                totalCalories: 0,
                eatenMeals: [],
                waterIntake: { current: 0, goal: 2 },
                recommendedMeal: null,
                targetCalories: req.user.targetCalories || 2000,
            });
        }
        
        let totalCalories = 0;
        let totalWaterIntakeMl = 0;
        const meals = {
            breakfast: { items: [], kcal: 0 },
            lunch: { items: [], kcal: 0 },
            dinner: { items: [], kcal: 0 },
            snack: { items: [], kcal: 0 },
        };

        todayEntries.forEach(entry => {
            totalCalories += entry.totalCalories || 0;
            totalWaterIntakeMl += entry.waterIntakeMl || 0;

            if (entry.foodItems && entry.foodItems.length > 0) {
                const mealType = entry.mealType;
                if (meals[mealType]) {
                    entry.foodItems.forEach(food => {
                        const existingFood = meals[mealType].items.find(i => i.name === food.name);
                        if (existingFood) {
                            existingFood.quantity += food.quantity;
                        } else {
                            meals[mealType].items.push({ name: food.name, quantity: food.quantity });
                        }
                    });
                    meals[mealType].kcal += entry.totalCalories || 0;
                }
            }
        });

        const eatenMeals = Object.entries(meals)
            .filter(([_, mealData]) => mealData.items.length > 0)
            .map(([mealType, mealData]) => {
                const menuString = mealData.items
                    .map(food => food.quantity > 1 ? `${food.name} ${food.quantity}` : food.name)
                    .join(', ');
                return {
                    type: mealType,
                    menu: menuString,
                    kcal: mealData.kcal
                };
            });

        const summary = {
            totalCalories: totalCalories,
            eatenMeals: eatenMeals,
            waterIntake: { current: totalWaterIntakeMl / 1000, goal: 2 },
            recommendedMeal: null, 
            targetCalories: req.user.targetCalories || 2000,
        };
        
        res.status(200).json(summary);

    } catch (error) {
        console.error('오늘의 식단 요약 조회 중 오류:', error);
        res.status(500).json({ message: '오늘의 식단 요약 조회 중 서버 오류가 발생했습니다.' });
    }
};

const addDietEntry = async (req, res) => {
    try {
        const { date, mealType, foodItems, waterIntakeMl, notes } = req.body;
        const userId = req.user._id;

        let totalCalories = 0;
        if (foodItems && foodItems.length > 0) {
            foodItems.forEach(item => { totalCalories += (item.calories || 0) * (item.quantity || 1); });
        }

        const newEntry = new DietEntry({
            user: userId, date: date || new Date(), mealType, foodItems, waterIntakeMl, totalCalories, notes
        });

        await newEntry.save();
        res.status(201).json({ message: '식단이 성공적으로 기록되었습니다.', entry: newEntry });
    } catch (error) {
        console.error('식단 기록 추가 중 오류:', error);
        res.status(500).json({ message: '서버 오류로 식단 기록에 실패했습니다.' });
    }
};

const getDietEntries = async (req, res) => {
    try {
        const dietEntries = await DietEntry.find({ user: req.user._id }).sort({ date: -1 });
        res.status(200).json({ message: '식단 기록을 성공적으로 가져왔습니다.', entries: dietEntries });
    } catch (error) {
        console.error('식단 기록 조회 중 오류:', error);
        res.status(500).json({ message: '식단 기록 조회에 실패했습니다.' });
    }
};


const updateDietEntry = async (req, res) => {
    try {
        const { entryId } = req.params;
        const updatedEntry = await DietEntry.findOneAndUpdate(
            { _id: entryId, user: req.user._id }, req.body, { new: true }
        );
        if (!updatedEntry) return res.status(404).json({ message: '해당 식단 기록을 찾을 수 없거나 수정 권한이 없습니다.' });
        res.status(200).json({ message: '식단 기록이 성공적으로 업데이트되었습니다.', entry: updatedEntry });
    } catch (error) {
        console.error('식단 기록 업데이트 중 오류:', error);
        res.status(500).json({ message: '식단 기록 업데이트에 실패했습니다.' });
    }
};

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