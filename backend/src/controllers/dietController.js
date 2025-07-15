// backend/src/controllers/dietController.js
const DietEntry = require('../models/DietEntry');
const User = require('../models/User'); // 'User' 모델명 대문자 통일
const aiService = require('../services/aiService'); // ✅ 수정: externalApi 대신 aiService 불러오기

// 식단 기록 추가 (POST 요청)
exports.addDietEntry = async (req, res) => {
    const { nickname, pin, date, mealType, foodItems, waterIntakeMl, notes } = req.body;

    // 필수 필드 검사
    if (!nickname || nickname.trim() === '') {
        return res.status(400).json({ message: '닉네임은 필수 입력 항목입니다.' });
    }
    if (!pin) { // PIN은 선택사항일 수 있지만, 여기서는 API 호출 인증에 사용되므로 필수
        return res.status(400).json({ message: 'PIN 번호는 필수 입력 항목입니다.' });
    }
    if (!foodItems || !Array.isArray(foodItems) || foodItems.length === 0) {
        return res.status(400).json({ message: '식단 항목(foodItems)은 필수로, 최소 하나 이상의 음식을 포함해야 합니다.' });
    }

    // mealType 유효성 검사
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];
    if (mealType && !validMealTypes.includes(mealType)) {
        return res.status(400).json({ message: `유효하지 않은 식사 유형입니다. (${validMealTypes.join(', ')}) 중 하나여야 합니다.` });
    }

    // waterIntakeMl 유효성 검사
    if (waterIntakeMl !== undefined && (typeof waterIntakeMl !== 'number' || waterIntakeMl < 0)) {
        return res.status(400).json({ message: '물 섭취량(waterIntakeMl)은 0 이상의 숫자여야 합니다.' });
    }

    try {
        const user = await User.findOne({ nickname, pin });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없거나 PIN이 일치하지 않습니다.' });
        }

        let totalCalories = 0;
        const processedFoodItems = [];

        for (const item of foodItems) {
            // foodItem 개별 필드 유효성 검사
            if (!item.name || item.name.trim() === '') {
                return res.status(400).json({ message: '식단 항목의 음식명(name)은 필수입니다.' });
            }
            if (item.calories !== undefined && (typeof item.calories !== 'number' || item.calories < 0)) {
                return res.status(400).json({ message: `${item.name}의 칼로리(calories)는 0 이상의 숫자여야 합니다.` });
            }
            if (item.protein !== undefined && (typeof item.protein !== 'number' || item.protein < 0)) {
                return res.status(400).json({ message: `${item.name}의 단백질(protein)은 0 이상의 숫자여야 합니다.` });
            }
            if (item.carbs !== undefined && (typeof item.carbs !== 'number' || item.carbs < 0)) {
                return res.status(400).json({ message: `${item.name}의 탄수화물(carbs)은 0 이상의 숫자여야 합니다.` });
            }
            if (item.fat !== undefined && (typeof item.fat !== 'number' || item.fat < 0)) {
                return res.status(400).json({ message: `${item.name}의 지방(fat)은 0 이상의 숫자여야 합니다.` });
            }

            let calories = item.calories || 0;
            let protein = item.protein || 0;
            let carbs = item.carbs || 0;
            let fat = item.fat || 0;

            // foodName이 있으면 OpenAI를 통해 영양 정보 추정 시도
            if (item.name) {
                try {
                    const estimatedNutrition = await aiService.getNutritionEstimate(item.name);
                    if (estimatedNutrition) {
                        calories = estimatedNutrition.calories || calories;
                        protein = estimatedNutrition.protein || protein;
                        carbs = estimatedNutrition.carbs || carbs;
                        fat = estimatedNutrition.fat || fat;

                        console.log(`OpenAI로 추정된 ${item.name} 영양정보: 칼로리 ${calories}, 단백질 ${protein}, 탄수화물 ${carbs}, 지방 ${fat}`);
                    }
                } catch (aiError) {
                    console.warn(`OpenAI를 통해 ${item.name}의 영양정보를 추정하는데 실패했습니다:`, aiError.message);
                    // OpenAI 오류 발생해도 기존 값 사용 또는 기본값 사용
                }
            }

            processedFoodItems.push({
                name: item.name,
                calories: parseFloat(calories),
                protein: parseFloat(protein),
                carbs: parseFloat(carbs),
                fat: parseFloat(fat),
                quantity: item.quantity
            });
            totalCalories += parseFloat(calories);
        }

        const newEntry = new DietEntry({
            user: user._id,
            date: date || new Date(),
            mealType: mealType || 'other', // 유효성 검사 후 기본값 설정
            foodItems: processedFoodItems,
            waterIntakeMl: waterIntakeMl || 0, // 유효성 검사 후 기본값 설정
            totalCalories: totalCalories,
            notes: notes
        });

        await newEntry.save();
        res.status(201).json({ message: '식단이 성공적으로 기록되었습니다.', entry: newEntry });

    } catch (error) {
        console.error('식단 기록 중 오류:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: '서버 오류로 식단 기록에 실패했습니다.', error: error.message });
    }
};


// 사용자 식단 기록 조회 (GET 요청)
exports.getDietEntries = async (req, res) => {
    const { nickname, pin } = req.query;

    if (!nickname || !pin) {
        return res.status(400).json({ message: '닉네임과 PIN 번호가 필요합니다.' });
    }

    try {
        const user = await User.findOne({ nickname, pin });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없거나 PIN이 일치하지 않습니다.' });
        }

        const dietEntries = await DietEntry.find({ user: user._id }).sort({ date: -1 });

        res.status(200).json({ message: '식단 기록을 성공적으로 가져왔습니다.', entries: dietEntries });

    } catch (error) {
        console.error('식단/models/User 기록 조회 중 오류:', error);
        res.status(500).json({ message: '식단 기록 조회에 실패했습니다.', error: error.message });
    }
};

// 식단 기록 업데이트 (PUT/PATCH 요청)
exports.updateDietEntry = async (req, res) => {
    const { nickname, pin, entryId } = req.params;
    const updateData = req.body;

    if (!nickname || !pin || !entryId) {
        return res.status(400).json({ message: '닉네임, PIN, 식단 ID는 필수입니다.' });
    }

    try {
        const user = await User.findOne({ nickname, pin });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없거나 PIN이 일치하지 않습니다.' });
        }

        const updatedEntry = await DietEntry.findOneAndUpdate(
            { _id: entryId, user: user._id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({ message: '식단 기록을 찾을 수 없거나 접근 권한이 없습니다.' });
        }

        res.status(200).json({ message: '식단 기록이 성공적으로 업데이트되었습니다.', entry: updatedEntry });

    } catch (error) {
        console.error('식단 기록 업데이트 중 오류:', error);
        res.status(500).json({ message: '식단 기록 업데이트에 실패했습니다.', error: error.message });
    }
};

// 식단 기록 삭제 (DELETE 요청)
exports.deleteDietEntry = async (req, res) => {
    const { nickname, pin, entryId } = req.params;

    if (!nickname || !pin || !entryId) {
        return res.status(400).json({ message: '닉네임, PIN, 식단 ID는 필수입니다.' });
    }

    try {
        const user = await User.findOne({ nickname, pin });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없거나 PIN이 일치하지 않습니다.' });
        }

        const deletedEntry = await DietEntry.findOneAndDelete({ _id: entryId, user: user._id });

        if (!deletedEntry) {
            return res.status(404).json({ message: '식단 기록을 찾을 수 없거나 접근 권한이 없습니다.' });
        }

        res.status(200).json({ message: '식단 기록이 성공적으로 삭제되었습니다.', entry: deletedEntry });

    } catch (error) {
        console.error('식단 기록 삭제 중 오류:', error);
        res.status(500).json({ message: '식단 기록 삭제에 실패했습니다.', error: error.message });
    }
};