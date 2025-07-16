import React from 'react';
import './ManagerChat.css';  

export default function ManagerChat({ mode }) {
  return (
    <div className="manager-chat-card">
      <div className={`manager-card-header ${mode}-theme`}>하루핏 매니저</div>
      <div className="chat-content">
        <div className="manager-message">
          <p>안녕하세요! 하루핏과 함께 건강해질 준비 되셨나요?</p>
          <p>AI코치가 항상 옆에서 여러분의 건강 목표 달성을 도와드릴게요!</p>
          <p>궁금한 점이 있다면 언제든지 저에게 질문해주세요! 😊</p>
        </div>
        <div className="chat-input-area">
          <input type="text" placeholder="궁금한 점을 물어보세요!" className="chat-input" />
          <button className="chat-send-btn">입력</button>
        </div>
      </div>
    </div>
  );
}