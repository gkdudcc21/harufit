
import React from 'react';
import './modeDescription.css';

const ModeDescription = ({ isVisible, description }) => {
  // isVisible prop에 따라 클래스를 동적으로 적용.
  // 이 컴포넌트 자체는 isVisible이 false여도 렌더링되도록 하여, CSS transition이 작동할 수 있게 함.
  // DOM에서 완전히 사라지지 않고, CSS의 opacity/visibility로 제어.
  return (
    <div className={`mode-description ${isVisible ? 'is-visible' : ''}`}>
      {description}
    </div>
  );
};

export default ModeDescription;