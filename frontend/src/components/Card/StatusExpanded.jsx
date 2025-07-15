import React from 'react';
import './StatusExpanded.css';

const StatusExpanded = ({ onClose }) => {
  return (
    <div className="status-expanded-wrapper zoom-in">
      <div className="status-expanded">
        <div className="status-header">
          <span className="nav-back" onClick={onClose}>← 뒤로 가기</span>
          <h2>나의 몸 상태</h2>
        </div>

        <p className="ai-comment">
          하루핏 AI 코치: 사용자님, 최근 체중 변화가 꾸준히 나타나고 있네요! 이대로 건강한 습관을 유지하시면 목표 달성에 더욱 가까워질 거예요. 궁금한 점이 있으면 언제든 저에게 물어보세요!
        </p>

        <div className="graph-box">
          <div className="graph-placeholder">
            여기에는 체중, 체지방률, 골격근량 변화 그래프가 표시됩니다. <br />
            (실제 구현 시 Chart.js, D3.js 등 타이브러리 사용)
          </div>

          <div className="metrics-row">
            <div className="metric weight">
              <div className="label">체중</div>
              <div className="value">65.2 kg</div>
              <div className="date">07.06</div>
            </div>
            <div className="metric fat">
              <div className="label">체지방률</div>
              <div className="value">22.5%</div>
              <div className="date">07.06</div>
            </div>
            <div className="metric muscle">
              <div className="label">골격근량</div>
              <div className="value">28.1 kg</div>
              <div className="date">07.06</div>
            </div>
          </div>
        </div>

        <div className="goal-box">
          <button className="record-btn">+ 하루핏 매니저에게 기록 업데이트 부탁하기</button>
          <div className="progress-info">
            <div className="label">목표: <strong>62.0kg</strong> / 현재 <strong>65.2kg</strong></div>
            <div className="progress-bar">
              <div className="filled" style={{ width: '60%' }}></div>
            </div>
            <button className="edit-btn">목표 수정</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusExpanded;
