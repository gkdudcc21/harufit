import React from 'react';
import './WorkoutExpanded.css';
import useApi from '../../hooks/useApi'; //  
import { API_ENDPOINTS } from '../../utils/constants'; //  
import { useAuth } from '../../hooks/useAuth'; // nickname pin 가져오기 (필요하다면)

const WorkoutExpanded = ({ onClose }) => {
  // 만약 특정 ID나 날짜의 운동 기록을 가져와야 한다면, 해당 정보를 URL 파라미터나 props로 전달받아 API_ENDPOINTS.WORKOUT_BY_DATE(date) 또는 새로운 엔드포인트를 사용해야 합니다.
  const { data: workoutDetail, loading, error } = useApi(
    API_ENDPOINTS.WORKOUT_TODAY, // (상세 정보용으로 변경 가능)
    'get'
  );

  if (loading) {
    return (
      <div className="workout-expanded-wrapper zoom-in">
        <div className="workout-expanded">
          <p>운동 기록 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workout-expanded-wrapper zoom-in">
        <div className="workout-expanded">
          <p>운동 기록을 불러오는 데 실패했습니다: {error.message}</p>
        </div>
      </div>
    );
  }

  // 데이터가 없을 경우 처리
  if (!workoutDetail) {
    return (
      <div className="workout-expanded-wrapper zoom-in">
        <div className="workout-expanded">
          <div className="workout-header">
            <span className="nav-back" onClick={onClose}>← 뒤로 가기</span>
            <h2>오늘의 운동</h2>
          </div>
          <p>오늘의 운동 기록이 없습니다.</p>
        </div>
      </div>
    );
  }

  // API로부터 받은 데이터를 사용하여 UI 업데이트
  const aiComment = workoutDetail.aiComment || "하루핏 AI 코치: 오늘의 운동 기록을 확인해 보세요!";
  const summaryTime = workoutDetail.totalDurationMinutes ? `${workoutDetail.totalDurationMinutes}분` : 'N/A';
  const consumedCalories = workoutDetail.totalCaloriesBurned ? `${workoutDetail.totalCaloriesBurned} Kcal` : 'N/A';
  const recordedActivities = workoutDetail.activities ? workoutDetail.activities.length : 0;
  const workoutPlan = workoutDetail.recommendedPlan || []; // 백엔드에서 추천 운동 계획을 받는다고 가정

  return (
    <div className="workout-expanded-wrapper zoom-in">
      <div className="workout-expanded">
        <div className="workout-header">
          <span className="nav-back" onClick={onClose}>← 뒤로 가기</span>
          <h2>오늘의 운동</h2>
        </div>
        <p className="ai-comment"> 하루핏 AI 코치: {aiComment} </p>
        <div className="summary-section">
          <div className="summary-item">
            <span className="icon">💪</span>
            <div className="text">
              <div className="label">운동 요약</div>
              <div className="value sub">{summaryTime}</div>
            </div>
          </div>
          <div className="summary-item">
            <span className="icon">🔥</span>
            <div className="text">
              <div className="label">소모 칼로리</div>
              <div className="value sub">{consumedCalories}</div>
            </div>
          </div>
          <div className="summary-item">
            <span className="icon">📋</span>
            <div className="text">
              <div className="label">운동 등록</div>
              <div className="value sub">{recordedActivities}</div>
            </div>
          </div>
        </div>

        <div className="log-goal-section">
          <div className="log-section">
            <h4>오늘 수행한 운동</h4>
            <ul className="log-list">
              {/* 백엔드에서 받은 실제 운동 목록을 매핑하여 표시 */}
              {workoutDetail.activities && workoutDetail.activities.length > 0 ? (
                workoutDetail.activities.map((activity, index) => (
                  <li key={index}>
                    {activity.name} - {activity.sets}세트 × {activity.reps}회 ({activity.weight}kg){activity.duration ? ` (${activity.duration}분)` : ''}
                  </li>
                ))
              ) : (
                <li>오늘 기록된 운동이 없습니다.</li>
              )}
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
              {workoutPlan && workoutPlan.length > 0 ? (
                workoutPlan.map((plan, index) => (
                  <li key={index}><strong>{plan.day}:</strong> {plan.description}</li>
                ))
              ) : (
                <li>추천 운동 계획이 없습니다.</li>
              )}
            </ul>
          </div>

          <div className="coach-right">
            <h4>운동 기록하기</h4>
            <button className="log-btn">+ 하루핏 매니저에게 기록 업데이트 부탁하기</button>
            <p className="recommendation">
              운동 목표 달성을 위해 하루핏 AI 코치의 추천을 받아보세요!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WorkoutExpanded;
