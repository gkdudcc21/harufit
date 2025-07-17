import React, { useState, useEffect, useRef } from 'react';
import LineChart from '../common/LineChart.jsx';
import { statusHistory } from '../../mocks/mockStatusHistory.js';
import './StatusExpanded.css';

const StatusExpanded = ({ onClose }) => {
    const wrapperRef = useRef(null);
    const [hoveredData, setHoveredData] = useState(null);

    const chartData = {
        labels: statusHistory.map(data => data.date),
        datasets: [
            {
                label: '체중 (kg)',
                data: statusHistory.map(data => data.weight),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                yAxisID: 'y_weight',
                fill: true,
            },
            {
                label: '체지방률 (%)',
                data: statusHistory.map(data => data.bodyFat),
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                yAxisID: 'y_percent',
                hidden: true,
            },
            {
                label: '골격근량 (kg)',
                data: statusHistory.map(data => data.muscle),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                yAxisID: 'y_percent',
                hidden: true,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: '최근 7일간 신체 변화', font: { size: 16 } }
        },
        scales: {
            y_weight: { type: 'linear', display: true, position: 'left', title: { display: true, text: '체중(kg)' } },
            y_percent: { type: 'linear', display: true, position: 'right', title: { display: true, text: '체지방/골격근량' }, grid: { drawOnChartArea: false } },
        },
        onHover: (event, chartElement) => {
            if (chartElement.length > 0) {
                const dataIndex = chartElement[0].index;
                setHoveredData(statusHistory[dataIndex]);
            } else {
                setHoveredData(null);
            }
        },
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (wrapperRef.current) wrapperRef.current.classList.add('active');
        }, 10);
        return () => clearTimeout(timer);
    }, []);

    const currentStatus = statusHistory[statusHistory.length - 1];
    const initialStatus = statusHistory[0];
    const goalWeight = 62.0;
    const progressPercent = Math.max(0, 100 - (((currentStatus.weight - goalWeight) / (initialStatus.weight - goalWeight)) * 100));
    const displayData = hoveredData || currentStatus;

    return (
        <div ref={wrapperRef} className="status-expanded-wrapper" onClick={onClose}>
            <div className="status-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="status-header">
                    <h2 className="status-title">나의 몸 상태</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="ai-briefing">
                    <p>
                        <strong>하루핏 AI 코치:</strong> 
                        최근 체중 변화가 꾸준히 나타나고 있네요! 그래프에 마우스를 올려 상세 수치를 확인해보세요.
                    </p>
                </div>

                <div className="chart-container">
                    <LineChart chartData={chartData} chartOptions={chartOptions} />
                </div>

                <div className="current-stats-grid">
                    <div className="stat-box">
                        <span className="stat-label">{displayData.date} 체중</span>
                        <span className="stat-value">{displayData.weight} kg</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">{displayData.date} 체지방률</span>
                        <span className="stat-value">{displayData.bodyFat} %</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">{displayData.date} 골격근량</span>
                        <span className="stat-value">{displayData.muscle} kg</span>
                    </div>
                </div>

                <div className="goal-status">
                    <div className="goal-text">
                        <span>목표: {goalWeight}kg</span>
                        <span>현재: {currentStatus.weight}kg</span>
                    </div>
                    <div className="progress-bar-container">
                        <div 
                            className="progress-bar-filled" 
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>

                <button className="update-request-btn">+ 하루핏 매니저에게 기록 업데이트 부탁하기</button>
            </div>
        </div>
    );
};

export default StatusExpanded;