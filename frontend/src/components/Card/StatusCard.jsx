import React from 'react';
import './StatusCard.css'; 

export default function StatusCard() {
  return (
    <div className="status-card">
      <div className="card-header">상태</div>
      <div className="status-content">
        <div className="status-item">
          <div className="status-details">
            <p>체중: 70.5 kg</p>
            <p>체지방: 25.1 %</p>
            <p className="status-message">AI코치: 목표 체중에 가까워지고 있어요! 꾸준함이 중요해요!</p>
          </div>
        </div>
      </div>
    </div>
  );
}