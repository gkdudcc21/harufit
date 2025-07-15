"use client"

import { useState } from "react"
import { useLocation } from "react-router-dom"
import "./HomePage.css"
import StatusCard from "../../components/Card/StatusCard.jsx"
import DietCard from "../../components/Card/DietCard.jsx"
import WorkoutCard from "../../components/Card/WorkoutCard.jsx"
import Calendar from "../../components/Card/Calendar.jsx"
import ManagerChat from "../../components/Card/ManagerChat.jsx"
import CalendarExpanded from "../../components/Card/CalendarExpanded.jsx";

export default function HomePage() {
  // IndexPage에서 넘어온 모드 정보를 가져옵니다.
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const selectedMode = queryParams.get("mode") || "normal" // 기본값 'normal'

  // 모달 상태 관리 
  const [isCalendarExpanded, setCalendarExpanded] = useState(false);

  // 메뉴바 상태 관리
  const [activeMenuItem, setActiveMenuItem] = useState("AboutUs") // 초기 활성 메뉴 항목

  // 메뉴 클릭 핸들러
  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem)
    console.log(`Selected menu: ${menuItem}`)
  }


  return (
    <div className="homepage-container">
      {/* 배경 이미지 */}
      <div className="background-image"></div>

      {/* 모드 버튼들 - 상단 좌측 */}
      <div className="mode-buttons">
        <button className={`mode-btn ${selectedMode === "easy" ? "active" : ""}`}>EASY</button>
        <button className={`mode-btn ${selectedMode === "normal" ? "active" : ""}`}>NORMAL</button>
        <button className={`mode-btn ${selectedMode === "hard" ? "active" : ""}`}>HARD</button>
      </div>

      {/* 좌측 메뉴바 */}
      <nav className="sidebar-menu">
        <ul className="menu-list">
          <li className={activeMenuItem === "AboutUs" ? "active" : ""} onClick={() => handleMenuClick("AboutUs")}>
            About Us
          </li>
          <li className={activeMenuItem === "calendar" ? "active" : ""} onClick={() => handleMenuClick("calendar")}>
            달력
          </li>
          <li className={activeMenuItem === "status" ? "active" : ""} onClick={() => handleMenuClick("status")}>
            상태
          </li>
          <li className={activeMenuItem === "diet" ? "active" : ""} onClick={() => handleMenuClick("diet")}>
            식단
          </li>
          <li className={activeMenuItem === "workout" ? "active" : ""} onClick={() => handleMenuClick("workout")}>
            운동
          </li>
        </ul>
      </nav>

      {/* 메인 컨텐츠 영역 - 카드들 */}
      <div className="main-cards-area">
        <div className="card-wrapper top-left">
          <Calendar onExpand={() => setCalendarExpanded(true)} />
        </div>
        <div className="card-wrapper top-right">
          <StatusCard />
        </div>
        <div className="card-wrapper bottom-left">
          <DietCard />
        </div>
        <div className="card-wrapper bottom-right">
          <WorkoutCard />
        </div>
      </div>

      {isCalendarExpanded && (
        <div className="modal-backdrop" onClick={() => setCalendarExpanded(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CalendarExpanded onClose={() => setCalendarExpanded(false)} />
          </div>
        </div>
      )}

      {/* 우측 채팅 영역 */}
      <div className="chat-area">
        <ManagerChat />
      </div>
    </div>
  )
}
