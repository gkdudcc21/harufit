import React from 'react';
import './modeDescription.css'; // ModeDescription 컴포넌트의 CSS 임포트

const ModeDescription = ({ isVisible, description }) => { // currentMode prop은 IndexPage.jsx에서 직접 전달하지 않으므로 제거
  if (!isVisible) return null;

  return (
    <div className="mode-description">
      {description}
    </div>
  );
};

export default ModeDescription;