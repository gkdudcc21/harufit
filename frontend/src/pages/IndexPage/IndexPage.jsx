// frontend/src/pages/IndexPage/IndexPage.jsx
"use client";

import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./IndexPage.css";
import runnerBackground from '../../assets/images/index_image.png';
import ModeDescription from '../../components/common/modeDescription.jsx';
import apiClient from '../../api/apiClient';

export default function IndexPage() {
  const [showDifficultyButtons, setShowDifficultyButtons] = useState(false);
  const [selectedMode, setSelectedMode] = useState("");
  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState("");
  const [hoveredMode, setHoveredMode] = useState('');
  const [apiMessage, setApiMessage] = useState('');

  const navigate = useNavigate();

  const difficultyModes = [
    { id: "easy", label: "EASY", color: "#C8E6C9" },
    { id: "normal", label: "NORMAL", color: "#E1BEE7" },
    { id: "hard", label: "HARD", color: "#FFCDD2" },
  ];

  const modeDescriptions = {
    easy: "편안한 시작",
    normal: "꾸준한 관리",
    hard: "강력한 변화",
  };

  const handleModeSelect = async (mode) => {
    setSelectedMode(mode);
    setApiMessage('');

    try {
      localStorage.setItem('userMode', mode);
      navigate(`/home?nickname=${nickname}&mode=${mode}`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || '모드 변경 중 오류 발생';
      setApiMessage(`오류: ${errorMessage}`);
      console.error('Mode select error:', error);
    }
  };

  const handleEnterClick = async () => {
    setApiMessage('');

    if (!nickname.trim()) {
      setApiMessage('닉네임을 입력해주세요.');
      return;
    }
    if (!pin.trim()) {
      setApiMessage('PIN 번호를 입력해주세요.');
      return;
    }
    if (pin.length !== 4 || !/^\d+$/.test(pin.trim())) {
      setApiMessage('PIN 번호는 4자리 숫자로 입력해주세요.');
      return;
    }

    try {
      const response = await apiClient.post('/users', {
        nickname: nickname.trim(),
        pin: pin.trim(),
        mode: 'normal'
      });

      setApiMessage(`성공: ${response.data.message}`);
      console.log('User processed:', response.data.user);

      localStorage.setItem('userNickname', nickname.trim());
      localStorage.setItem('userPin', pin.trim());
      localStorage.setItem('userMode', 'normal');

      setShowDifficultyButtons(true);

    } catch (error) {
      const errorMessage = error.response?.data?.message || '사용자 처리 중 알 수 없는 오류 발생';
      setApiMessage(`오류: ${errorMessage}`);
      console.error('User processing error:', error);
    }
  };

  const handleGuestMode = () => {
    setApiMessage('');
    localStorage.setItem('userNickname', 'Guest');
    localStorage.setItem('userPin', '0000');
    localStorage.setItem('userMode', 'easy');
    navigate('/home?nickname=Guest&mode=easy');
  };

  const handleMouseEnterModeBtn = (modeId) => {
    setHoveredMode(modeId);
  };

  const handleMouseLeaveModeBtn = () => {
    setHoveredMode("");
  };


  return (
    <div className="index-container">
      <div
        className="background-image"
        style={{ backgroundImage: `url(${runnerBackground})` }}
      >
        <div className="overlay">
          {/* 상단 환영 메시지 */}
          <div className="header-text">
            {showDifficultyButtons ? (
              <p><strong>{nickname || "USER"}</strong>님, 하루핏과 함께 건강해질 준비 되셨나요?</p>
            ) : (
              <p>안녕하세요! 하루핏과 함께 건강해질 준비 되셨나요?</p>
            )}
          </div>

          {/* 메인 타이틀 */}
          <h1 className="main-title">
            YOUR AI HEALTH TRAINER, <br />
            <span className="brand-name">HARU-FIT</span>
          </h1>

          {/* 닉네임/PIN 입력창 및 게스트 모드 버튼 섹션 */}
          {!showDifficultyButtons && (
            <div className="input-interaction-section">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="닉네임을 입력해주세요"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEnterClick()}
                  className="input-field nickname-input"
                />
                <input
                  type="password"
                  placeholder="PIN 4자리 숫자" // 플레이스홀더 수정된 내용으로 가정
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEnterClick()}
                  maxLength="4"
                  className="input-field pin-input"
                />
                <button
                  onClick={handleEnterClick}
                  className="submit-btn"
                  disabled={!nickname.trim() || !pin.trim()}
                >
                  입장
                </button>
              </div>
              <button
                onClick={handleGuestMode}
                className="guest-btn-inline"
              >
                게스트 모드
              </button>
              {/* ✅ message-area-placeholder를 여기서는 제거합니다. */}
            </div>
          )}

          {/* ✅ message-area-placeholder를 input-interaction-section 밖, overlay 안에 새로 추가 */}
          <div className="message-area-fixed"> {/* 이름은 message-area-fixed 유지 */}
            {apiMessage && (
              <p className={`api-status-message ${apiMessage.startsWith('오류') ? 'error' : 'success'}`}>
                {apiMessage}
              </p>
            )}
          </div>

          {/* 모드 버튼 섹션 */}
          {showDifficultyButtons && (
            <div className="difficulty-buttons-container">
              {difficultyModes.map((mode) => (
                <div className="difficulty-btn-wrapper" key={mode.id}>
                  <div
                    className={`difficulty-btn ${mode.id} ${selectedMode === mode.id ? "selected" : ""}`}
                    style={{ backgroundColor: mode.color }}
                    onClick={() => handleModeSelect(mode.id)}
                    onMouseEnter={() => handleMouseEnterModeBtn(mode.id)}
                    onMouseLeave={() => handleMouseLeaveModeBtn()}
                  >
                    {mode.label}
                  </div>
                  {hoveredMode === mode.id && (
                    <ModeDescription
                      isVisible={true}
                      description={modeDescriptions[mode.id]}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}