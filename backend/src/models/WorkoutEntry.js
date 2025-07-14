// backend/src/models/WorkoutEntry.js
const mongoose = require('mongoose');

const WorkoutEntrySchema = mongoose.Schema(
    {
        user: { // 어떤 사용자의 운동 기록인지 연결
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: { // 기록 날짜
            type: Date,
            default: Date.now,
            required: true,
        },
        workoutType: { // 운동 종류 (예: 유산소, 근력, 요가, 기타)
            type: String,
            enum: ['cardio', 'strength', 'yoga', 'stretching', 'other'],
            default: 'other',
        },
        exercises: [ // 운동 세부 목록
            {
                name: { type: String, required: true },
                durationMinutes: { type: Number, default: 0 }, // 운동 시간 (분)
                sets: { type: Number, default: null }, // 세트 수
                reps: { type: Number, default: null }, // 반복 횟수
                weightKg: { type: Number, default: null }, // 사용한 무게 (kg)
                caloriesBurned: { type: Number, default: 0 }, // 예상 칼로리 소모량
                notes: { type: String, default: '' },
            }
        ],
        totalDurationMinutes: { // 해당 운동 기록의 총 시간 (분)
            type: Number,
            default: 0,
        },
        totalCaloriesBurned: { // 해당 운동 기록의 총 칼로리 소모량 (계산된 값)
            type: Number,
            default: 0,
        },
        notes: { // 기타 메모
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

const WorkoutEntry = mongoose.model('WorkoutEntry', WorkoutEntrySchema);
module.exports = WorkoutEntry;