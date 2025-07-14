// backend/src/models/DietEntry.js
const mongoose = require('mongoose');

const DietEntrySchema = mongoose.Schema(
    {
        user: { // 어떤 사용자의 식단 기록인지 연결
            type: mongoose.Schema.Types.ObjectId, // User 모델의 _id와 연결
            ref: 'User', // User 모델을 참조
            required: true,
        },
        date: { // 기록 날짜
            type: Date,
            default: Date.now,
            required: true,
        },
        mealType: { // 아침, 점심, 저녁, 간식 등
            type: String,
            enum: ['breakfast', 'lunch', 'dinner', 'snack', 'other'],
            default: 'other',
        },
        foodItems: [ // 섭취한 음식 목록
            {
                name: { type: String, required: true },
                calories: { type: Number, default: 0 },
                protein: { type: Number, default: 0 },
                carbs: { type: Number, default: 0 },
                fat: { type: Number, default: 0 },
                quantity: { type: String, default: '적당량' } // 예: 100g, 1개, 적당량
            }
        ],
        waterIntakeMl: { // 물 섭취량 (밀리리터)
            type: Number,
            default: 0,
        },
        totalCalories: { // 해당 식단의 총 칼로리 (계산된 값)
            type: Number,
            default: 0,
        },
        notes: { // 기타 메모
            type: String,
            default: '',
        },
    },
    {
        timestamps: true, // 생성 및 업데이트 시간 자동 기록
    }
);

const DietEntry = mongoose.model('DietEntry', DietEntrySchema);
module.exports = DietEntry;