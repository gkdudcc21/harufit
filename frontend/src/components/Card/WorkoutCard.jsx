import React from 'react';
import './WorkoutCard.css';

export default function WorkoutCard({ onExpand, mode, data }) {
  const latestWorkouts = data?.latestWorkout || [];
  const recommendedWorkout = data?.recommendedWorkout || null;

  return (
    <div className="workout-card card-base">
      <div className={`card-header ${mode}-theme`}>
        <span>운동</span>
        <button className="expand-btn" onClick={onExpand}>▶</button>
      </div>

      <div className="workout-content"> 

        <div className="current-workout">
          <div className="recommend-label" style={{ position: 'absolute', top: '4px', right: '10px' }}>최신 운동</div>
          <ul className="exercise-list">
            {latestWorkouts.length > 0 ? (
              latestWorkouts.map((workout, index) => (
                <li key={index}>
                  <span>{workout.name}</span>
                  {workout.details && <span>{workout.details}</span>}
                </li>
              ))
            ) : (
              <p className="empty-section-guide" style={{ justifyContent: 'center' }}>
                <span className="italic-highlight">
                <span className="my-colored-text">
                "오늘 30분 달렸어" </span></span>
                와 같이<br/>
                운동을 기록해보세요!
              </p>
            )}
          </ul>
        </div>

        <div className="recommended-workout">
          <div className="recommend-label">추천 운동</div>
          {recommendedWorkout ? (
            <div className="workout-details" style={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              <p style={{
                fontSize: '1.1em',
                fontWeight: 'bold',
                textAlign: 'center',
                // ✅ [수정] 이 한 줄을 추가하여 글자색을 다른 텍스트와 통일합니다.
                color: 'var(--text-color-light)'
              }}>
                {recommendedWorkout.name}
              </p>
            </div>
          ) : (
            <p className="empty-section-guide" style={{ justifyContent: 'center' }}>
              <br/>어떤 운동을 할지<br/> 고민되시나요?<br/>
              매니저에게 <br/>
              <span className="italic-highlight">
                <span className="my-colored-text"> "운동 추천해줘"</span>
              </span> <br/>라고<br/>
              말해보세요!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}