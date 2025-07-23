// Tutorial.jsx (신규 생성 예시)
import React from 'react';
import './Tutorial.css';

// 화면을 어둡게 하고, 채팅창과 카드 영역에 하이라이트와 함께
// 설명 텍스트를 보여주는 튜토리얼 컴포넌트
export default function Tutorial({ onClose }) {
  return (
    <div className="tutorial-backdrop">
      <div className="tutorial-highlight-chat">
        <p className="tutorial-text">
          AI 매니저와 대화하여 식단, 운동을 기록해보세요!
        </p>
      </div>
      <div className="tutorial-highlight-cards">
        <p className="tutorial-text">
          기록된 내용은 여기에 즉시 반영됩니다.
        </p>
      </div>
      <button onClick={onClose} className="tutorial-close-btn">
        알겠습니다!
      </button>
    </div>
  );
}