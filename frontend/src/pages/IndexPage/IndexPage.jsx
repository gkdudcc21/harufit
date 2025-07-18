"use client";
import { useState, useEffect } from "react"; // ✅ [수정] useEffect 추가
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

    // ✅ [추가] 컴포넌트 마운트 시 토큰 확인 및 자동 리다이렉트
    useEffect(() => {
        const userToken = localStorage.getItem('userToken');
        const userNickname = localStorage.getItem('userNickname');
        const userMode = localStorage.getItem('userMode');

        if (userToken && userNickname && userMode) {
            // 유효한 토큰 및 사용자 정보가 있으면 바로 HomePage로 이동
            navigate(`/home?nickname=${userNickname}&mode=${userMode}`);
        } else {
            // 토큰이 없거나 정보가 불완전하면 초기 상태 유지
            setIsInitialState(true);
            setShowDifficultyButtons(false);
        }
    }, [navigate]); // navigate 함수가 변경될 때마다 재실행될 수 있도록 의존성 배열에 추가

    const handleModeSelect = async (mode) => {
        setSelectedMode(mode);
        setApiMessage('');
        const userNickname = localStorage.getItem('userNickname');

        // ✅ [수정] 인증 기능이 완성될 때까지, 모드 선택은 localStorage에만 저장하고 바로 이동합니다.
        localStorage.setItem('userMode', mode);
        navigate(`/home?nickname=${userNickname}&mode=${mode}`);
    };

    const handleEnterClick = async () => {
        setApiMessage('');
        if (!nickname.trim()) {
            setApiMessage('닉네임을 입력해주세요.');
            return;
        }
        if (nickname.trim().length < 2 || nickname.trim().length > 20) {
            setApiMessage('닉네임은 2자 이상 20자 이하로 입력해주세요.');
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
            });

            setApiMessage(`성공: ${response.data.message}`);

            // ✅ [핵심 수정] 백엔드로부터 받은 토큰을 localStorage에 저장합니다.
            localStorage.setItem('userToken', response.data.token);

            localStorage.setItem('userNickname', response.data.user.nickname);
            localStorage.setItem('userPin', response.data.user.pin);
            localStorage.setItem('userMode', response.data.user.mode || 'normal');

            // ✅ [추가] 로그인 성공 시 이전 채팅 내역 초기화
            localStorage.removeItem('chatMessages');

            setIsInitialState(false);
            setShowDifficultyButtons(true);

        } catch (error) {
            const errorMessage = error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
            setApiMessage(`오류: ${errorMessage}`);
            console.error('Login/Signup error:', error);
        }
    };

    const handleGuestMode = () => {
        setApiMessage('');
        setNickname('게스트');
        setPin('');
        localStorage.setItem('userNickname', 'Guest');
        localStorage.setItem('userPin', '0000');
        localStorage.setItem('userMode', 'easy');

        // ✅ [추가] 게스트 모드 진입 시 이전 채팅 내역 초기화
        localStorage.removeItem('chatMessages');

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