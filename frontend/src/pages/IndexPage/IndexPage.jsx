"use client";
import { useState, useEffect } from "react";
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
  const [isInitialState, setIsInitialState] = useState(true);

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

  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      navigate('/home');
    }
  }, [navigate]);

  const handleModeSelect = async (mode) => {
    setSelectedMode(mode);
    setApiMessage('');
    const userNickname = localStorage.getItem('userNickname');

    try {
      await apiClient.put('/users/mode', { mode });
      localStorage.setItem('userMode', mode);
      navigate(`/home?nickname=${userNickname}&mode=${mode}`);
    } catch (error) {
      setApiMessage('모드 설정 중 오류가 발생했습니다.');
      console.error('Mode update error:', error);
    }
  };

  const handleEnterClick = async () => {
    setApiMessage('');
    try {
      const response = await apiClient.post('/users', {
        nickname: nickname.trim(),
        pin: pin.trim(),
      });

      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userNickname', response.data.user.nickname);
      localStorage.removeItem('chatMessages');

      if (response.data.message.includes('로그인')) {
        localStorage.setItem('userMode', response.data.user.mode || 'normal');
        navigate('/home');
      } else {
        setIsInitialState(false);
        setShowDifficultyButtons(true);
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
      setApiMessage(`오류: ${errorMessage}`);
    }
  };

  const handleGuestMode = async () => {
    setApiMessage('');
    try {
      const response = await apiClient.post('/users/guest');

      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userNickname', response.data.user.nickname);
      // userMode는 다음 단계(모드 선택)에서 저장.
      localStorage.removeItem('chatMessages');

      // 바로 이동하는 대신, 모드 선택 버튼을 보여줌.
      setIsInitialState(false);
      setShowDifficultyButtons(true);

    } catch (error) {
      const errorMessage = error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
      setApiMessage(`오류: ${errorMessage}`);
    }
  };

  const handleMouseEnterModeBtn = (modeId) => {
    setHoveredMode(modeId);
  };

  const handleMouseLeaveModeBtn = () => {
    setHoveredMode("");
  };

  return (
    <div className="index-container">
      <div className="background-image" style={{ backgroundImage: `url(${runnerBackground})` }}>
        <div className="overlay">
          <div className="header-text">
            {isInitialState ? (
              <p>안녕하세요! 하루핏과 함께 건강해질 준비 되셨나요?</p>
            ) : (
              <p><strong>{localStorage.getItem('userNickname') || nickname}</strong>님, 환영합니다! 목표를 향한 첫 걸음, 난이도를 선택해주세요.</p>
            )}
          </div>
          <h1 className="main-title">
            YOUR AI HEALTH TRAINER, <br />
            <span className="brand-name">HARU-FIT</span>
          </h1>
          {isInitialState && (
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
                  placeholder="PIN 4자리 숫자"
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
              <button onClick={handleGuestMode} className="guest-btn-inline">
                게스트로 입장
              </button>
            </div>
          )}
          <div className="message-area-fixed">
            {apiMessage && (
              <p className={`api-status-message ${apiMessage.startsWith('오류') ? 'error' : 'success'}`}>
                {apiMessage}
              </p>
            )}
          </div>
          <div className={`difficulty-buttons-container ${showDifficultyButtons ? 'show-modes' : ''}`}>
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
                <ModeDescription
                  isVisible={hoveredMode === mode.id}
                  description={modeDescriptions[mode.id]}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}