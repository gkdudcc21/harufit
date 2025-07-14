"use client"

import { useState } from "react"
import { useNavigate } from 'react-router-dom';
import "./IndexPage.css"
import runnerBackground from '../../assets/images/index_image.png';
import ModeDescription from '../../components/common/modeDescription.jsx';

export default function IndexPage() {
    const [showDifficultyButtons, setShowDifficultyButtons] = useState(false)
    const [selectedMode, setSelectedMode] = useState("")
    const [userInput, setUserInput] = useState("")
    const [isModeHovered, setIsModeHovered] = useState(false); // 모드 버튼 호버 상태
    const [hoveredMode, setHoveredMode] = useState(''); // 호버된 모드 이름

    const navigate = useNavigate();

    const difficultyModes = [
        {
            id: "easy",
            label: "EASY",
            color: "#C8E6C9",
            hoverColor: "#A5D6A7",
        },
        {
            id: "normal",
            label: "NORMAL",
            color: "#E1BEE7",
            hoverColor: "#CE93D8",
        },
        {
            id: "hard",
            label: "HARD",
            color: "#FFCDD2",
            hoverColor: "#EF9A9A",
        },
    ]

    const modeDescriptions = {
        easy: '편안한 시작',
        normal: '꾸준한 관리',
        hard: '강력한 변화',
    };

    const handleModeSelect = (mode) => {
        setSelectedMode(mode)
        console.log(`Selected mode: ${mode}`)
        navigate(`/home?mode=${mode}`);
    };

    const handleNicknameSubmit = () => {
        if (userInput.trim()) {
            setShowDifficultyButtons(true)
            console.log(`User input: ${userInput}`)
        }
    }

    const handleGuestMode = () => {
        setShowDifficultyButtons(true)
        console.log("Guest mode selected")
    }

    const handleMouseEnter = (modeId) => {
        setIsModeHovered(true);
        setHoveredMode(modeId);
    };

    const handleMouseLeave = () => {
        setIsModeHovered(false);
        setHoveredMode('');
    };

    return (
        <div className="index-container">
            {/* Background Image Section */}
            <div
                className="background-image"
                style={{ backgroundImage: `url(${runnerBackground})` }} // 배경 이미지 적용
            >
                <div className="overlay"> {/* 오버레이 추가 (필요시) */}
                    <div className="header-text">
                        <p>안녕하세요! 하루핏과 함께 건강해질 준비 되셨나요?</p>
                    </div>
                    <h1 className="main-title">
                        YOUR AI HEALTH TRAINER, <br />
                        <span className="brand-name">HARU-FIT</span>
                    </h1>
                </div>
            </div>

            {/* Content Wrapper (Input or Difficulty Buttons) */}
            <div className="content-wrapper">
                {/* Main Content Area - Input Section */}
                {!showDifficultyButtons ? (
                    <div className="input-section">
                        <div className="input-container">
                            <div className="input-row">
                                <input
                                    type="text"
                                    placeholder="닉네임을 입력해주세요"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    className="nickname-input"
                                    onKeyPress={(e) => e.key === "Enter" && handleNicknameSubmit()}
                                />
                                <button
                                    onClick={handleNicknameSubmit}
                                    className="submit-btn"
                                    disabled={!userInput.trim()}
                                >
                                    입장
                                </button>
                            </div>
                            <div className="guest-mode">
                                <button onClick={handleGuestMode} className="guest-btn">
                                    익명 사용을 원하는 사용자 → 게스트 모드
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Difficulty Mode Buttons Section */
                    <div className="difficulty-buttons-container">
                        {difficultyModes.map((mode, index) => (
                            <div
                                key={mode.id}
                                className={`difficulty-btn ${mode.id} ${selectedMode === mode.id ? "selected" : ""
                                    }`}
                                style={{
                                    backgroundColor: mode.color,
                                    animationDelay: `${index * 100}ms`,
                                }}
                                onClick={() => handleModeSelect(mode.id)}
                                onMouseEnter={() => handleMouseEnter(mode.id)}
                                onMouseLeave={handleMouseLeave}
                            >
                                {mode.label}
                                {isModeHovered && hoveredMode === mode.id && (
                                    <ModeDescription
                                        isVisible={isModeHovered && hoveredMode === mode.id}
                                        description={modeDescriptions[mode.id]}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
