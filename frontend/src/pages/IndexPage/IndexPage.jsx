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

    const handleModeSelect = async (mode) => {
        setSelectedMode(mode);
        setApiMessage('');
        try {
            localStorage.setItem('userMode', mode);
            const userDisplayName = localStorage.getItem('userNickname') || 'Guest';
            navigate(`/home?nickname=${userDisplayName}&mode=${mode}`);
        } catch (error) {
            setApiMessage(`오류: ${error.response?.data?.message || '모드 변경 중 오류 발생'}`);
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
            const userCheckResponse = await apiClient.get(`/users/${nickname.trim()}?pin=${pin.trim()}`);
    
            setApiMessage(`로그인 성공: ${userCheckResponse.data.message || '환영합니다!'}`);
            localStorage.setItem('userNickname', userCheckResponse.data.user.nickname);
            localStorage.setItem('userPin', userCheckResponse.data.user.pin);
            localStorage.setItem('userMode', userCheckResponse.data.user.mode || 'normal');
    
            setIsInitialState(false);
            setShowDifficultyButtons(true);
    
        } catch (error) {
            if (error.response) {
                // ✅ 401 오류 (닉네임 없거나 PIN 틀림) -> 회원가입 시도
                if (error.response.status === 401) {
                    try {
                        const createResponse = await apiClient.post('/users', {
                            nickname: nickname.trim(),
                            pin: pin.trim(),
                            mode: 'normal'
                        });
    
                        setApiMessage(`회원가입 성공: ${createResponse.data.message}`);
                        localStorage.setItem('userNickname', createResponse.data.user.nickname);
                        localStorage.setItem('userPin', pin.trim());
                        localStorage.setItem('userMode', 'normal');
    
                        setIsInitialState(false);
                        setShowDifficultyButtons(true);
    
                    } catch (createError) {
                        // 회원가입 시도 중 '이미 존재하는 닉네임' 오류가 발생하면 여기에 걸림
                        const errorMessage = createError.response?.data?.message || '사용자 생성 중 오류 발생';
                        setApiMessage(`오류: ${errorMessage}`);
                    }
                } else {
                    // 그 외 다른 오류 (500 서버 에러 등)
                    const errorMessage = error.response.data.message || '알 수 없는 오류 발생';
                    setApiMessage(`오류: ${errorMessage}`);
                }
            } else {
                setApiMessage('오류: 서버에 연결할 수 없습니다.');
            }
        }
    };
    
    const handleGuestMode = () => {
        setApiMessage('');
        setNickname('게스트');
        setPin('');
        localStorage.setItem('userNickname', 'Guest');
        localStorage.setItem('userPin', '0000');
        localStorage.setItem('userMode', 'easy');
        setIsInitialState(false);
        setShowDifficultyButtons(true);
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
                    <div className="header-text">
                        {isInitialState ? (
                            <p>안녕하세요! 하루핏과 함께 건강해질 준비 되셨나요?</p>
                        ) : (
                            <p><strong>{nickname} </strong>님, 하루핏과 함께 건강해질 준비 되셨나요?</p>
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
                            <button
                                onClick={handleGuestMode}
                                className="guest-btn-inline"
                            >
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