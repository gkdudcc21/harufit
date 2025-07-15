// src/components/common/Calendar.jsx
import React from 'react';
import './Calendar.css'; // Calendar 전용 스타일

export default function Calendar() {
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1); // 1일부터 31일까지

  // 하드코딩된 선택된 날짜 (사진과 동일하게 1, 9, 10, 11, 12, 13, 14)
  const selectedDates = [1, 9, 10, 11, 12, 13, 14];

  return (
    <div className="calendar-card  card-base">
      <div className="card-header">
        <span>달력</span>
      </div>
      <div className="calendar-grid">
        {daysOfWeek.map(day => (
          <div key={day} className="day-of-week">{day}</div>
        ))}
        {/* Placeholder for days before the 1st (e.g., if month starts on Wednesday, 2 empty divs) */}
        {Array.from({ length: 1 }).map((_, i) => <div key={`empty-${i}`} className="empty-day"></div>)} {/* 1일이 월요일 시작이라고 가정 */}
        {dates.map(date => (
          <div
            key={date}
            className={`calendar-day ${selectedDates.includes(date) ? 'selected' : ''}`}
          >
            {date}
          </div>
        ))}
      </div>
    </div>
  );
}