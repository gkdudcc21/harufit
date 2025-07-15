// backend/src/models/User.js
const mongoose = require('mongoose');

// 사용자 스키마 정의
const UserSchema = mongoose.Schema(
    {
        nickname: {
            type: String,
            required: [true, '닉네임은 필수입니다.'], // 닉네임은 필수로 있어야 함
            unique: true, // 닉네임은 고유해야 함
            trim: true, // 앞뒤 공백 제거
        },
        mode: {
            type: String,
            enum: ['easy', 'normal', 'hard'], // 'easy', 'normal', 'hard' 중 하나
            default: 'easy', // 기본값은 'easy'
        },
        // ✅ 추가: PIN 번호 필드 (PoC용 최소 보안)
        pin: {
            type: String, // 숫자로만 구성될 경우 Number 타입으로 해도 되지만, String으로 유연하게 처리
            required: false, // 필수로 입력받을지 선택적으로 할지는 프론트엔드 기획에 따라 조절
            minlength: [4, 'PIN 번호는 최소 4자리여야 합니다.'], // 예시: 4자리 이상
            maxlength: [4, 'PIN 번호는 최대 4자리여야 합니다.'], // 예시: 4자리 이하
        },
        // 여기에 나중에 이메일, 비밀번호 등 인증 관련 필드를 추가할 수 있습니다.
        // email: { type: String, required: true, unique: true },
        // password: { type: String, required: true },
        // profileImage: { type: String }, // 프로필 이미지 URL
        // 기타 사용자 설정 (예: 목표 체중, 목표 칼로리 등)
        targetWeight: { type: Number, default: null },
        targetCalories: { type: Number, default: null },
    },
    {
        timestamps: true, // 생성 및 업데이트 시간을 자동으로 기록
    }
);

// User 모델 생성 및 내보내기
const User = mongoose.model('User', UserSchema);
module.exports = User;