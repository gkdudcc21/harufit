import React from 'react';
import './CalendarExpanded.css';

const CalendarExpanded = ({ onClose }) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const weeks = [
        [null, null, 1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10, 11, 12],
        [13, 14, 15, 16, 17, 18, 19],
        [20, 21, 22, 23, 24, 25, 26],
        [27, 28, 29, 30, 31, null, null],
    ];

    const getDayCell = (date) => {
        const isToday = date === 10; // 예시 강조
        return (
            <div className={`calendar-cell ${isToday ? 'today' : ''}`} key={date}>
                {date && <div className="date-number">{date}</div>}
                {date === 3 && <div className="icon purple" />}
                {date === 4 && <div className="icon green" />}
                {date === 10 && (
                    <>
                        <div className="icon purple" />
                        <div className="icon green" />
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="calendar-expanded-wrapper">
            <div className="calendar-expanded">
                <div className="calendar-header">
                    <span className="nav-icon" onClick={() => {/*이전달로*/}}>◀</span>
                    <span className="month-title">2025년 7월</span>
                    <span className="nav-icon" onClick={() => {/*다음달로*/}}>▶</span>                
                </div>

                <div className="calendar-grid">
                    {days.map((day) => (
                        <div className="day-header" key={day}>{day}</div>
                    ))}
                    {weeks.map((week, i) =>
                        week.map((date, j) => (
                            <React.Fragment key={`${i}-${j}`}>{getDayCell(date)}</React.Fragment>
                        ))
                    )}
                </div>

                <div className="calendar-summary">
                    <div className="box workout">
                        <span className="label">총 운동 시간 (주간)</span>
                        <strong className='strong'>3시간 45분</strong>
                        <span className="stat workout">+15분 ↑</span>
                    </div>
                    <div className="box calorie">
                        <span className="label">평균 칼로리 (일간)</span>
                        <strong className='strong'>1850 Kcal</strong>
                        <span className="stat calorie">-50 Kcal ↓</span>
                    </div>
                    <div className="box weight">
                        <span className="label">체중 변화 (일간)</span>
                        <strong className='strong'>-1.2 kg</strong>
                        <span className="stat weight">목표 달성!</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarExpanded;
