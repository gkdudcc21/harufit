import React from 'react';
import './WorkoutCard.css';
import runningIcon from '../../assets/images/run-icon.png';
import bikeIcon from '../../assets/images/bike-icon.png';

export default function WorkoutCard({ mode, onExpand }) {
  return (
    <div className="workout-card card-base">
      <div className={`card-header ${mode}-theme`}>
        <span>운동</span>
        <button className="expand-btn" onClick={onExpand}>▶</button>
      </div>
      <div className="workout-content">
        <div className="current-workout">
          <img src={runningIcon} alt="Running Icon" className="workout-icon" />
          <div className="workout-details">
            <p>조깅</p>
            <span>(30분, 250 kcal)</span>
          </div>
        </div>
        <div className="recommended-workout">
          <span className="recommend-label">추천 운동</span>
          <img src={bikeIcon} alt="Bike Icon" className="workout-icon" />
          <div className="workout-details">
            <p>자전거 타기</p>
            <span>(200 kcal)</span>
          </div>
        </div>
      </div>
    </div>
  );
}