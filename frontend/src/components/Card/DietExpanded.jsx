import React from 'react';
import './DietExpanded.css';
import waterBottleIcon from '../../assets/images/물통절반요.png';


const DietExpanded = ({ onClose }) => {
  return (
    <div className="diet-expanded-wrapper zoom-in">
      <div className="diet-expanded">
        <div className="diet-header">
          <span className="nav-back" onClick={onClose}>← 뒤로 가기</span>
          <h2>오늘의 식단</h2>
        </div>

        <p className="ai-comment">
          하루핏 AI 코치: 사용자님, 오늘 탄수화물 섭취가 조금 부족해 보여요. 통곡물이나 채소를 더 추가해 보는 건 어떨까요?
        </p>

        <div className="nutrient-summary">
          <div className="nutrient-item">
            <strong>1500</strong>
            <span>Kcal</span>
          </div>
          <div className="nutrient-item">
            <strong>180g</strong>
            <span>탄수화물</span>
          </div>
          <div className="nutrient-item">
            <strong>100g</strong>
            <span>단백질</span>
          </div>
          <div className="nutrient-item">
            <strong>50g</strong>
            <span>지방</span>
          </div>
        </div>

        <div className="diet-info-section">

          <div className="water-intake">
            <h4>물 섭취량</h4>
            <div className="water-graphic">
              <span>1.2L / 2.0L</span>
              <br />
              <br />
              <img src={waterBottleIcon} alt="Water Bottle Icon" className="water-icon" />
            </div>
          </div>

          <div className="meal-log">
            <h4>오늘 기록한 식단</h4>
            <ul>
              <li>아침: 기록 없음 <span>0 Kcal</span></li>
              <li>점심: 닭가슴살 샐러드 <span>550 Kcal</span></li>
              <li>저녁: 기록 없음 <span>0 Kcal</span></li>
              <li>간식: 바나나 1개 <span>100 Kcal</span></li>
            </ul>
          </div>

          <div className="diet-goal">
            <h4>식단 목표</h4>
            <p className="goal-status">오늘 목표 칼로리 달성률</p>
            <div className="goal-progress">
              <div className="progress-bar">
                <div className="filled progress-75"></div>
              </div>
              <span className="percent">75%</span>
            </div>
            <p className="goal-text">목표: <strong>1800 Kcal</strong> (300 Kcal 남음)</p>
            <button className="edit-btn">목표 수정</button>
          </div>

        </div>

        <div className="diet-suggestions">
          <div className="suggested-meals">
            <h4>추천 식단</h4>
            <ul>
              <li>아침: 오트밀, 과일 <span className="kcal">300 Kcal</span></li>
              <li>점심: 고단백 샐러드 <span className="kcal">520 Kcal</span></li>
              <li>저녁: 채소볶음밥 <span className="kcal">450 Kcal</span></li>
            </ul>
          </div>
          <div className="record-entry">
            <h4>식단 기록하기</h4>
            <button className="log-btn">새로운 기록 입력하기</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DietExpanded;
