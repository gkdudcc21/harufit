// 📁 components/Card/WorkoutExpanded.jsx
import React from 'react';
import './WorkoutExpanded.css';

const WorkoutExpanded = ({ onClose }) => {
  return (
    <div className="workout-expanded-wrapper zoom-in">
      <div className="workout-expanded">
        <div className="workout-header">
          <span className="nav-back" onClick={onClose}>← 뒤로 가기</span>
          <h2>오늘의 운동</h2>
        </div>

        <p className="ai-comment">
          하루핏 AI 코치: 사용자님, 오늘 하체 운동 목표를 달성하셨네요! 다음 운동은 상체 위주로 구성해 보는 건 어떨까요?
        </p>

        <div className="summary-section">
          <div className="summary-item">
            <span className="icon">💪</span>
            <div className="text">
              <div className="label">운동 요약</div>
              <div className="value sub">60분</div>
            </div>
          </div>
          <div className="summary-item">
            <span className="icon">🔥</span>
            <div className="text">
              <div className="label">소모 칼로리</div>
              <div className="value sub">300 Kcal</div>
            </div>
          </div>
          <div className="summary-item">
            <span className="icon">📋</span>
            <div className="text">
              <div className="label">운동 등록</div>
              <div className="value sub">4개</div>
            </div>
          </div>
        </div>
        <div className="log-goal-wrapper">
          <div className="log-section">
            <h4>오늘 기록한 운동</h4>
            <ul className="log-list">
              <li>스쿼트 - 3세트 × 10회 (50kg) </li>
              <li>런지 - 3세트 × 12회  </li>
              <li>유산소 (러닝) - 30분 (5km) </li>
              <li>플랭크 - 3세트 × 60초 </li>
            </ul>
          </div>

          <div className="goal-section">
            <h4>운동 목표</h4>
            <p className="goal-status">주간 운동 일수 달성률</p>
            <div className="goal-progress">
              <div className="progress-bar">
                <div className="filled progress-80"></div>
              </div>
              <span className="percent">80%</span>
            </div>
            <p className="goal-text">목표: <strong>주 4회</strong> (현재 3회 달성)</p>
            <button className="edit-btn">목표 수정</button>
          </div>
        </div>

        <div className="coach-section">
          <div className="coach-left">
            <h4>하루핏 코치 추천 운동</h4>
            <ul className="plan-list">
              <li><strong>월:</strong> 가슴/삼두 (벤치프레스, 딥스)</li>
              <li><strong>화:</strong> 하체 (레그프레스, 런지)</li>
              <li><strong>수:</strong> 휴식 또는 유산소</li>
              <li><strong>목:</strong> 등/이두 (데드리프트, 턱걸이)</li>
              <li><strong>금:</strong> 어깨/코어 (오버헤드 프레스, 플랭크)</li>
            </ul>
          </div>
          <div className="coach-right">
            <h4>운동 기록하기</h4>
            <button className="log-btn">+ 하루핏 매니저에게 기록 업데이트 부탁하기</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WorkoutExpanded;
