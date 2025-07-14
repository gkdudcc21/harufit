import React from 'react';
import './DietCard.css'; 
import waterBottleIcon from '../../assets/images/물통절반요.png';

export default function DietCard() {
  return (
    <div className="diet-card">
      <div className="card-header">식단</div>
      <div className="diet-content">
        <div className="diet-item">
          <p>아침: 닭가슴살 샐러드 (300 kcal)</p>
        </div>
        <div className="diet-item">
          <p>점심: 제육볶음 + 쌈밥 (700 kcal)</p>
        </div>
        <div className="diet-item">
          <p>저녁: 연어 스테이크 (400 kcal)</p>
        </div>
        <div className="water-intake">
          <img src={waterBottleIcon} alt="Water Bottle Icon" className="water-icon" /> 
          <span>물 섭취: 1.5L / 2L</span>
        </div>
      </div>
    </div>
  );
}