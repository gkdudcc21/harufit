"use client";


import { useState } from "react"
import { useNavigate } from 'react-router-dom';
import "./IndexPage.css"
import runnerBackground from '../../assets/images/index_image.png';
import ModeDescription from '../../components/common/modeDescription.jsx';

export default function IndexPage() {
    const [showDifficultyButtons, setShowDifficultyButtons] = useState(false)
    const [selectedMode, setSelectedMode] = useState("")
    const [userInput, setUserInput] = useState("")
    const [hoveredMode, setHoveredMode] = useState(''); // 호버된 모드 이름

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

    const handleModeSelect = (mode) => {
        setSelectedMode(mode)
        console.log(`Selected mode: ${mode}`)
        navigate(`/home?mode=${mode}`);
    };

    const handleNicknameSubmit = () => {
        if (userInput.trim()) {
            setShowDifficultyButtons(true)
        }
    };

    const handleGuestMode = () => {
        setUserInput("게스트");
        setShowDifficultyButtons(true);

    };

    return (
        <div className="index-container">
            <div
                className="background-image"
                
                style={{ backgroundImage: `url(${runnerBackground})` }}
            >
                <div className="difficulty-buttons-container"></div>
                <div className="overlay">
                    {/* 상단 텍스트 */}
                    <div className="header-text">
                        {showDifficultyButtons ? (
                            <p><strong>{userInput || "USER"}</strong>님, 하루핏과 함께 건강해질 준비 되셨나요?</p>
                        ) : (
                            <p>안녕하세요! 하루핏과 함께 건강해질 준비 되셨나요?</p>
                        )}
                    </div>
                    {/* 타이틀 */}
                    <h1 className="main-title">
                        YOUR AI HEALTH TRAINER, <br />
                        <span className="brand-name">HARU-FIT</span>
                    </h1>
                    {/* 닉네임 입력창 */}
                    {!showDifficultyButtons && (
                        <div className="input-section">
                            <div className="input-group">

                                <input
                                    type="text"
                                    placeholder="닉네임을 입력해주세요"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleNicknameSubmit()}
                                    className="nickname-input"
                                />
                                <button
                                    onClick={handleNicknameSubmit}
                                    className="submit-btn"
                                    disabled={!userInput.trim()}
                                >
                                    입장
                                </button>
                                <button
                                    onClick={handleGuestMode}
                                    className="guest-btn-inline"
                                >
                                    게스트 모드
                                </button>
                            </div>
                        </div>
                    )}
                    {/* 모드 버튼 */}
                    {showDifficultyButtons && (
                        <div className="difficulty-buttons-container">
                            {difficultyModes.map((mode) => (
                                <div className="difficulty-btn-wrapper" key={mode.id}>
                                    <div
                                        className={`difficulty-btn ${mode.id} ${selectedMode === mode.id ? "selected" : ""}`}
                                        style={{ backgroundColor: mode.color }}
                                        onClick={() => handleModeSelect(mode.id)}
                                        onMouseEnter={() => setHoveredMode(mode.id)}
                                        onMouseLeave={() => setHoveredMode("")}
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

