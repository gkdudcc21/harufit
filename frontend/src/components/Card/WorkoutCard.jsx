import React from 'react';
import './WorkoutCard.css';
import bikeIcon from '../../assets/images/bike-icon.png';

export default function WorkoutCard({ mode, onExpand, data }) {
  // ✅ data prop에서 필요한 데이터를 안전하게 추출합니다.
  const latestWorkout = data?.latestWorkout;
  const recommendedWorkout = data?.recommendedWorkout;

  return (
    <div className="workout-card card-base">
      <div className={`card-header ${mode}-theme`}>
        <span>운동</span>
        <button className="expand-btn" onClick={onExpand}>▶</button>
      </div>
      <div className="workout-content">
        {/* 최신 운동 섹션 */}
        <div className="current-workout">
          <div className="recommend-label">최신 운동</div>
          {/* ✅ latestWorkout 데이터가 있으면 목록을, 없으면 안내 메시지를 보여줍니다. */}
          {latestWorkout && latestWorkout.length > 0 ? (
            <ul className="exercise-list">
              {latestWorkout.map((item, index) => (
                <li key={index}><span>{item.name}</span><span>{item.details}</span></li>
              ))}
            </ul>
          ) : (
            <p className="empty-section-guide"><center>
              매니저에게<br/>
              <span className="italic-highlight"><span className="my-colored-text">"오늘 30분 달렸어"</span></span> 라고 말하며<br />
              첫 기록을<br/> 시작해보세요!</center>
            </p>
          )}
        </div>
        
        {/* 추천 운동 섹션 */}
        <div className="recommended-workout">
          <div className="recommend-label">추천 운동</div>
          {/* ✅ recommendedWorkout 데이터가 있으면 아이콘과 운동을, 없으면 안내 메시지를 보여줍니다. */}
          {recommendedWorkout ? (
            <>
              <img src={bikeIcon} alt="Bike Icon" className="workout-icon" />
              <div className="workout-details">
                <p>{recommendedWorkout.name}</p>
                <span>({recommendedWorkout.kcal} kcal)</span>
              </div>
            </>
          ) : (
            <p className="empty-section-guide">
              어떤 운동을 할지<br/> 고민되나요?<br/>
              매니저에게 <br/><span className="italic-highlight"><span className="my-colored-text"> "운동 추천해줘"</span></span> 라고<br/>
              말해보세요!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}