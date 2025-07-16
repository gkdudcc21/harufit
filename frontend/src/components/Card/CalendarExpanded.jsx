import React, { useState, useEffect, useRef } from 'react';
import './CalendarExpanded.css';

const CalendarExpanded = ({ onClose }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const wrapperRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (wrapperRef.current) {
                wrapperRef.current.classList.add('active');
            }
        }, 10); // 약간의 딜레이 후 active 클래스 추가 (애니메이션 시작)

        return () => clearTimeout(timer); // 컴포넌트 unmount 시 타이머 클리어
    }, []);



    // 한글 요일
    const days = ['일', '월', '화', '수', '목', '금', '토'];

    // 이전 달로 이동
    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    // 다음 달로 이동
    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    // 현재 연도와 월 정보
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0부터 시작하므로 +1 필요

    // 현재 월의 주차별 날짜 배열 생성
    const generateCalendarWeeks = () => {
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        const daysArray = [];

        for (let i = 0; i < firstDay; i++) {
            daysArray.push(null);
        }
        for (let i = 1; i <= lastDate; i++) {
            daysArray.push(i);
        }

        while (daysArray.length < 42) {
            daysArray.push(null);
        }

        const weeks = [];
        for (let i = 0; i < daysArray.length; i += 7) {
            weeks.push(daysArray.slice(i, i + 7));
        }

        return weeks;
    };

    const weeks = generateCalendarWeeks();

    // 각 날짜 셀 렌더링
    const getDayCell = (date) => {
        const isToday =
            date === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

        return (
            <div className={`calendar-cell ${isToday ? 'today' : ''}`} key={date}>
                {date && <div className="date-number">{date}</div>}
                {/* 예시: 특정 날짜에 아이콘 */}
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
        <div ref={wrapperRef} className="calendar-expanded-wrapper">
            <div className="calendar-expanded">
                {/* 헤더: 월 전환 */}
                <div className="calendar-header">
                    <span className="nav-icon" onClick={handlePrevMonth}>◀</span>
                    <span className="month-title">{year}년 {month + 1}월</span>
                    <span className="nav-icon" onClick={handleNextMonth}>▶</span>
                </div>

                {/* 요일 표시 */}
                <div
                    className="calendar-grid"
                    key={`${year}-${month}`} // 👈 이걸 추가!
                >
                    {days.map((day) => (
                        <div className="day-header" key={day}>{day}</div>
                    ))}

                    {/* 날짜 셀 */}
                    {weeks.map((week, i) =>
                        week.map((date, j) => (
                            <React.Fragment key={`${i}-${j}`}>{getDayCell(date)}</React.Fragment>
                        ))
                    )}
                </div>

                {/* 요약 정보 영역 */}
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