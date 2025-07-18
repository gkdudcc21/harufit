import React from 'react';
import './StatusCard.css';
// ✅ [수정] 이미지 파일의 경로를 원래대로 복구했습니다.
// import personIcon from '../../assets/images/pp.png'; // 이 줄은 제거하고 아래 코드로 대체
// 만약 pp.png가 images 폴더에 없다면 assets 폴더 안에 직접 pp.png가 있어야 합니다.
// 보통 이미지는 assets/images에 있으므로, 이 경로가 맞을 가능성이 높습니다.
import personIcon from '../../assets/images/pp.png'; // ⚠️ 실제 이미지 경로에 맞춰주세요.

export default function StatusCard({ onExpand, mode, data }) {
  // ✅ [수정] data가 유효하지 않거나 weight 값이 0 또는 null일 경우를 '데이터 없음'으로 간주
  const isDataEmpty = !data || !data.weight || data.weight === 0;

  const displayWeight = isDataEmpty ? '0' : data.weight.toFixed(1);
  // ✅ [수정] data.bodyFatPercentage가 없을 경우 0으로 표시 (기존 로직과 동일)
  const displayBodyFat = isDataEmpty ? '0' : (data.bodyFatPercentage ? data.bodyFatPercentage.toFixed(1) : '0');

  // ✅ [수정] AI 메시지 로직을 기존 디자인에 맞춰 복구하고, 데이터 없을 때만 특정 메시지 표시
  const displayMessage = isDataEmpty
    ? '하루핏 매니저: 매니저에게 체중을 알려주고 기록을 시작해보세요!'
    : '하루핏 매니저: 목표 체중에 가까워지고 있어요! 꾸준함이 중요해요!'; // 기존 이미지의 메시지 복구

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
            {/* ✅ [수정] 'AI코치' 용어 복구 */}
            <p className="status-message">{displayMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}