// backend/src/controllers/dietController.js
const DietEntry = require('../models/DietEntry'); // DietEntry 모델 불러오기
const User = require('../models/user'); // User 모델 불러오기 (user.js 파일명에 맞춤)
const externalApi = require('../services/externalApi'); // externalApi 서비스 불러오기

// 식단 기록 추가 (POST 요청)
exports.addDietEntry = async (req, res) => {
    const { nickname, pin, date, mealType, foodItems, waterIntakeMl, notes } = req.body;

    if (!nickname || !pin || !foodItems || foodItems.length === 0) {
        return res.status(400).json({ message: '닉네임, PIN, 식단 항목은 필수입니다.' });
    }

    try {
        const user = await User.findOne({ nickname, pin });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없거나 PIN이 일치하지 않습니다.' });
        }

        let totalCalories = 0;
        const processedFoodItems = [];
        for (const item of foodItems) { // foodItems 배열을 반복하여 처리
            let calories = item.calories || 0;
            let protein = item.protein || 0;
            let carbs = item.carbs || 0;
            let fat = item.fat || 0;

            // foodName이 있으면 식약처 API에서 영양 정보 가져오기 시도
            if (item.name) {
                try {
                    const nutritionData = await externalApi.getFoodNutritionInfo(item.name);
                    if (nutritionData && nutritionData.length > 0) {
                        const firstResult = nutritionData[0]; // 가장 첫 번째 결과 사용

                        // 식약처 API의 AMT_NUM 필드에 맞춰 정확히 매핑
                        calories = firstResult.AMT_NUM1 ? parseFloat(firstResult.AMT_NUM1) : calories;     // 에너지(kcal)
                        protein = firstResult.AMT_NUM3 ? parseFloat(firstResult.AMT_NUM3) : protein;     // 단백질(g)
                        fat = firstResult.AMT_NUM4 ? parseFloat(firstResult.AMT_NUM4) : fat;         // 지방(g)
                        carbs = firstResult.AMT_NUM6 ? parseFloat(firstResult.AMT_NUM6) : carbs;     // 탄수화물(g)

                        console.log(`자동으로 가져온 ${item.name} 영양정보: 칼로리 ${calories}, 단백질 ${protein}, 탄수화물 ${carbs}, 지방 ${fat}`);
                    }
                } catch (apiError) {
                    console.warn(`식품명 ${item.name}의 영양정보를 가져오는데 실패했습니다:`, apiError.message);
                    // API 오류가 발생해도 기존 값 사용 또는 기본값 사용
                }
            }
            processedFoodItems.push({
                name: item.name,
                calories: calories,
                protein: protein,
                carbs: carbs,
                fat: fat,
                quantity: item.quantity
            });
            totalCalories += calories; // 총 칼로리에 합산
        }


        const newEntry = new DietEntry({
            user: user._id, // User._id와 연결
            date: date || new Date(),
            mealType: mealType,
            foodItems: processedFoodItems, // 처리된 foodItems 사용
            waterIntakeMl: waterIntakeMl,
            totalCalories: totalCalories,
            notes: notes
        });

        await newEntry.save();
        res.status(201).json({ message: '식단이 성공적으로 기록되었습니다.', entry: newEntry });

    } catch (error) {
        console.error('식단 기록 중 오류:', error);
        res.status(500).json({ message: '식단 기록에 실패했습니다.', error: error.message });
    }
};

// 사용자 식단 기록 조회 (GET 요청)
exports.getDietEntries = async (req, res) => {
    const { nickname, pin } = req.query; // GET 요청에서는 쿼리 파라미터로 받음

    if (!nickname || !pin) {
        return res.status(400).json({ message: '닉네임과 PIN 번호가 필요합니다.' });
    }

    try {
        const user = await User.findOne({ nickname, pin });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없거나 PIN이 일치하지 않습니다.' });
        }

        // 특정 사용자의 모든 식단 기록을 최신 순으로 조회
        const dietEntries = await DietEntry.find({ user: user._id }).sort({ date: -1 });

        res.status(200).json({ message: '식단 기록을 성공적으로 가져왔습니다.', entries: dietEntries });

    } catch (error) {
        console.error('식단 기록 조회 중 오류:', error);
        res.status(500).json({ message: '식단 기록 조회에 실패했습니다.', error: error.message });
    }
};

// 식단 기록 업데이트 (PUT/PATCH 요청)
exports.updateDietEntry = async (req, res) => {
    const { nickname, pin, entryId } = req.params; // URL 파라미터에서 entryId 가져옴
    const updateData = req.body; // 업데이트할 데이터

    if (!nickname || !pin || !entryId) {
        return res.status(400).json({ message: '닉네임, PIN, 식단 ID는 필수입니다.' });
    }

    try {
        const user = await User.findOne({ nickname, pin });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없거나 PIN이 일치하지 않습니다.' });
        }

        // 해당 사용자의 특정 식단 기록 찾기 및 업데이트
        const updatedEntry = await DietEntry.findOneAndUpdate(
            { _id: entryId, user: user._id }, // user._id로 해당 사용자의 기록만 업데이트 가능하도록 함
            updateData,
            { new: true, runValidators: true } // 업데이트 후의 문서 반환, 스키마 유효성 검사 실행
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

        // 해당 사용자의 특정 식단 기록 삭제
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