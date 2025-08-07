import React from 'react';
import './StatusCard.css';
import personIcon from '../../assets/images/pp.png';

export default function StatusCard({ onExpand, mode, data }) {
  // 데이터가 null이거나 weight 속성 없을 경우 대비해 기본값을 0으로 설정.
  const weight = data?.weight ?? 0;
  const bodyFat = data?.bodyFatPercentage ?? 0;
  const isDataEmpty = !data || weight === 0;

  // toFixed를 호출하기 전에, String으로 변환하여 오류를 방지.
  const displayWeight = String(weight).includes('.') ? weight.toFixed(1) : String(weight);
  const displayBodyFat = String(bodyFat).includes('.') ? bodyFat.toFixed(1) : String(bodyFat);

  const getDisplayMessage = () => {
    if (isDataEmpty) {
      return '매니저에게 체중을 알려주고 기록을 시작해보세요!';
    }
    const targetWeight = data?.targetWeight;
    if (targetWeight && targetWeight > 0) {
      const diff = weight - targetWeight;
      if (diff <= 0) {
        return `목표 달성! 정말 대단해요! 🎉`;
      }
      return `목표까지 ${diff.toFixed(1)}kg 남았어요! 조금만 더 힘내요! 💪`;
    }
    return '목표 체중에 가까워지고 있어요! 꾸준함이 중요해요!';
  };

  return (
    <div className="status-card card-base">
      <div className={`card-header ${mode}-theme`}>
        <span>상태</span>
        <button className="expand-btn" onClick={onExpand}>▶</button>
      </div>
      <div className="status-content">
        <div className="status-item">
          <div className="status-icon">
            <img src={personIcon} alt="아이콘" />
          </div>
          <div className="status-details">
            <p>체중: <span className="status-value">{displayWeight} kg</span></p>
            <p>체지방: <span className="status-value">{displayBodyFat} %</span></p>
            <p className="status-message">하루핏 매니저: {getDisplayMessage()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}