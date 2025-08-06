import React from 'react';
import './DietCard.css';
import waterBottleIcon from '../../assets/images/물통절반요.png';

export default function DietCard({ onExpand, mode, data }) {
  const eatenMeals = data?.eatenMeals || [];
  const waterIntake = data?.waterIntake || { current: 0, goal: 2 };
  const recommendedMeal = data?.recommendedMeal;

  const breakfast = eatenMeals.find(m => m.type === 'breakfast') || { menu: '기록 없음', kcal: 0 };
  const lunch = eatenMeals.find(m => m.type === 'lunch') || { menu: '기록 없음', kcal: 0 };
  const dinner = eatenMeals.find(m => m.type === 'dinner') || { menu: '기록 없음', kcal: 0 };

  return (
    <div className="diet-card card-base">
      <div className={`card-header ${mode}-theme`}>
        <span>식단</span>
        <button className="expand-btn" onClick={onExpand}>▶</button>
      </div>

      <div className="diet-content-grid">
        <div className="eaten-meals-section">
          <div className="diet-item">
            <p>아침: {breakfast.menu} <br /> <span className="diet-kcal">{breakfast.kcal} kcal</span></p>
          </div>
          <div className="diet-item">
            <p>점심: {lunch.menu} <br /> <span className="diet-kcal">{lunch.kcal} kcal</span></p>
          </div>
          <div className="diet-item">
            <p>저녁: {dinner.menu} <br /> <span className="diet-kcal">{dinner.kcal} kcal</span></p>
          </div>
        </div>

        <div className="recommend-section">
          <div className="recommendation-header">오늘의 추천 식단</div>
          {recommendedMeal && recommendedMeal.menu ? (
            <p className="rec-menu" >{recommendedMeal.menu.split('\n')[0].replace(/^"|"$/g, '')} </p>
          ) : (
            <p className="diet-empty-section-guide">
              매니저에게<br/>
              <span className="diet-italic-highlight">"식단 추천해줘"</span> 라고<br />
              말해보세요!
            </p>
          )}
        </div>

        <div className="water-section-grid">
          <div className="water-intake">
            <img src={waterBottleIcon} alt="물병 아이콘" className="water-icon" />
            <span className="eaten-water">{waterIntake.current.toFixed(1)}L / {waterIntake.goal}L</span>
            <div className="water-progress-bar-container">
              <div
                className="water-progress-bar"
                style={{ width: `${(waterIntake.current / waterIntake.goal) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}