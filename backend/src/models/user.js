// backend/src/models/user.js
const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
    {
        nickname: {
            type: String,
            required: [true, '닉네임은 필수입니다.'],
            unique: true,
            trim: true,
        },
        mode: {
            type: String,
            enum: ['easy', 'normal', 'hard'],
            default: 'easy',
        },
        pin: {
            type: Number,
            required: false,
        },
        isGuest: {
            type: Boolean,
            default: false,
        },
        targetWeight: { type: Number, default: null },
        targetCalories: { type: Number, default: null },
        // ✅ [핵심 수정] 개인별 물 목표량을 저장할 필드 추가 (단위: L)
        waterGoal: { 
            type: Number, 
            default: 2 
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = User;