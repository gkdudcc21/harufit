import React, { useState, useEffect, useRef } from 'react';
import LineChart from '../common/LineChart.jsx';
import { statusHistory } from '../../mocks/mockStatusHistory.js';
// ✅ [수정] 공통 모달 CSS를 가져옵니다.
import '../common/ExpandedModal.css';
import './StatusExpanded.css';

// 헬퍼 함수 (기존과 동일)
const renderChange = (change, unit) => {
    if (change === 0 || isNaN(change)) return <span className="stat-change no-change">-</span>;
    const isPositive = change > 0;
    const changeClass = isPositive ? 'increase' : 'decrease'; 
    const arrow = isPositive ? '▲' : '▼';
    return <span className={`stat-change ${changeClass}`}>{arrow} {Math.abs(change).toFixed(1)}{unit}</span>;
};

// ✅ 아이콘 컴포넌트 추가
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);

const StatusExpanded = ({ onClose }) => {
    const wrapperRef = useRef(null);
    const [hoveredData, setHoveredData] = useState(null);

    // 차트 데이터 및 옵션 (기존과 동일)
     const chartData = {
        labels: statusHistory.map(data => data.date),
        datasets: [
            { label: '체중 (kg)', data: statusHistory.map(data => data.weight), borderColor: '#8e44ad', backgroundColor: 'rgba(142, 68, 173, 0.1)', yAxisID: 'y_weight', fill: true, tension: 0.3 },
            { label: '체지방률 (%)', data: statusHistory.map(data => data.bodyFat), borderColor: '#2980b9', backgroundColor: 'rgba(52, 152, 219, 0.1)', yAxisID: 'y_percent', hidden: true },
            { label: '골격근량 (kg)', data: statusHistory.map(data => data.muscle), borderColor: '#27ae60', backgroundColor: 'rgba(39, 174, 96, 0.1)', yAxisID: 'y_weight', hidden: true }
        ]
    };
    const chartOptions = {
        responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'bottom' }, title: { display: true, text: '최근 7일간 신체 변화', font: { size: 16, weight: 'bold' }, padding: { bottom: 20 } } },
        scales: {
            y_weight: { type: 'linear', display: true, position: 'left', title: { display: true, text: '체중(kg)' } },
            y_percent: { type: 'linear', display: true, position: 'right', title: { display: true, text: '체지방률(%)' }, grid: { drawOnChartArea: false } },
        },
        onHover: (event, chartElement) => {
            if (chartElement.length > 0) setHoveredData(statusHistory[chartElement[0].index]);
            else setHoveredData(null);
        },
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (wrapperRef.current) wrapperRef.current.classList.add('active');
        }, 10);
        return () => clearTimeout(timer);
    }, []);

    // 계산 로직 (기존과 동일)
    const currentStatus = statusHistory.length > 0 ? statusHistory[statusHistory.length - 1] : {};
    const previousStatus = statusHistory.length > 1 ? statusHistory[statusHistory.length - 2] : currentStatus;
    const weightChange = currentStatus.weight - previousStatus.weight;
    const bodyFatChange = currentStatus.bodyFat - previousStatus.bodyFat;
    const muscleChange = currentStatus.muscle - previousStatus.muscle;
    const goalWeight = 62.0;
    const initialWeight = statusHistory.length > 0 ? statusHistory[0].weight : currentStatus.weight;
    const progressPercent = Math.max(0, 100 - (((currentStatus.weight - goalWeight) / (initialWeight - goalWeight)) * 100));

    return (
        // ✅ [수정] 클릭 이벤트가 번지는 것을 막고, 공통 CSS 클래스를 적용합니다.
        <div className="expanded-modal-container" onClick={(e) => e.stopPropagation()}>
            <header className="expanded-modal-header">
                <h2>나의 몸 상태</h2>
                <button className="expanded-modal-close-btn" onClick={onClose}>
                    <CloseIcon />
                </button>
            </header>
            
            {/* --- 이하 내용은 기존과 거의 동일합니다 --- */}

            <div className="ai-briefing">
                <p><strong>하루핏 매니저:</strong> 최근 체중 변화가 꾸준히 나타나고 있네요! 그래프에 마우스를 올려 상세 수치를 확인해보세요.</p>
            </div>

            <div className="chart-section">
                <div className="chart-container">
                    <LineChart chartData={chartData} chartOptions={chartOptions} />
                </div>
                 <div className="goal-status">
                    <div className="goal-text">
                        <span>목표: {goalWeight.toFixed(1)}kg</span>
                        <span>현재: {currentStatus.weight ? currentStatus.weight.toFixed(1) : '-'}kg</span>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar-filled" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="stats-card-container">
                <div className="stat-card">
                    <span className="stat-card-label">현재 체중</span>
                    <span className="stat-card-value">{currentStatus.weight ? currentStatus.weight.toFixed(1) : '-'} kg</span>
                    <span className="stat-card-change">{renderChange(weightChange, 'kg')}</span>
                </div>
                 <div className="stat-card">
                    <span className="stat-card-label">체지방률</span>
                    <span className="stat-card-value">{currentStatus.bodyFat ? currentStatus.bodyFat.toFixed(1) : '-'} %</span>
                    <span className="stat-card-change">{renderChange(bodyFatChange, '%')}</span>
                </div>
                 <div className="stat-card">
                    <span className="stat-card-label">골격근량</span>
                    <span className="stat-card-value">{currentStatus.muscle ? currentStatus.muscle.toFixed(1) : '-'} kg</span>
                    <span className="stat-card-change">{renderChange(muscleChange, 'kg')}</span>
                </div>
            </div>
            
             <div className="record-btn-container">
                <button className="record-btn">매니저에게 상태 기록하기</button>
            </div>
        </div>
    );
};

export default StatusExpanded;