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
import StatusExpanded from "../../components/Card/StatusExpanded.jsx"
import WorkoutExpanded from "../../components/Card/WorkoutExpanded.jsx"
import DietExpanded from "../../components/Card/DietExpanded.jsx"
import AboutUsExpanded from "../../components/Card/AboutUsExpanded.jsx"


import useAuth from '../../hooks/useAuth';
import useApi from '../../hooks/useApi';
import { API_ENDPOINTS } from '../../utils/constants'; // 상수 임포트
import "./HomePage.css";



export default function HomePage() {
  // IndexPage에서 넘어온 모드 정보를 가져옵니다.
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialMode = queryParams.get("mode") || "normal" // 기본값 'normal'
  const [selectedMode, setSelectedMode] = useState(initialMode);
  const { nickname, mode } = useAuth();


  // 모달 상태 관리 
  const [isCalendarExpanded, setCalendarExpanded] = useState(false);
  const [isStatusExpanded, setStatusExpanded] = useState(false);
  const [isWorkoutExpanded, setWorkoutExpanded] = useState(false);
  const [isDietExpanded, setDietExpanded] = useState(false);
  const [isAboutExpanded, setAboutExpanded] = useState(false);

  // 메뉴바 상태 관리
  const [activeMenuItem, setActiveMenuItem] = useState("AboutUs")

  // 메뉴 클릭 핸들러
  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem)
    console.log(`Selected menu: ${menuItem}`)
  }

  // ✅ useApi 훅을 사용하여 각 카드에 필요한 데이터 불러오기
  const { data: statusData, loading: statusLoading, error: statusError } = useApi(
    API_ENDPOINTS.STATUS_TODAY, 'get'
  );

  const { data: workoutSummaryData, loading: workoutLoading, error: workoutError } = useApi(
    API_ENDPOINTS.WORKOUT_TODAY, 'get'
  );

  const { data: dietSummaryData, loading: dietLoading, error: dietError } = useApi(
    API_ENDPOINTS.DIET_TODAY, 'get'
  );

  const { data: calendarSummaryData, loading: calendarLoading, error: calendarError } = useApi(
    API_ENDPOINTS.CALENDAR_SUMMARY, 'get'
  );

  // 로딩 및 에러 처리 
  if (statusLoading || workoutLoading || dietLoading || calendarLoading) {
    return (
      <div className="homepage-container">
        <div className="loading-overlay">
          <p>데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (statusError || workoutError || dietError || calendarError) {
    return (
      <div className="homepage-container">
        <div className="error-overlay">
          <p>데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.</p>
          {/* 실제 앱에서는 에러 메시지를 더 상세히 표시할 수 있습니다. */}
        </div>
      </div>
    );
  }

  return (
    <div className={`homepage-container ${selectedMode}-theme`}>
      {/* 배경 이미지 */}
      <div className="background-image"></div>

      {/* user 환영문구 */}
      <div className="user-info">
        <p>환영합니다, {nickname}님!</p>
        <p>모드: {mode}</p>
        {/* 필요시추가- <button onClick={logout}>로그아웃</button> */}
      </div>

      {/* 모드 버튼들 - 상단 좌측 */}
      <div className="mode-buttons">
        <button className={`mode-btn ${selectedMode === "easy" ? "mode-easy" : "mode-inactive"}`} onClick={() => setSelectedMode("easy")}> EASY</button>
        <button className={`mode-btn ${selectedMode === "normal" ? "mode-normal" : "mode-inactive"}`} onClick={() => setSelectedMode("normal")}> NORMAL</button>
        <button className={`mode-btn ${selectedMode === "hard" ? "mode-hard" : "mode-inactive"}`} onClick={() => setSelectedMode("hard")}>HARD</button>

      </div>

      {/* 좌측 메뉴바 */}
      <nav className="sidebar-menu">
        <ul className="menu-list">
          <li className={activeMenuItem === "AboutUs" ? "active" : ""}
            onClick={() => {
              handleMenuClick("AboutUs")
              setAboutExpanded(true);             
              }}>
            About Us
          </li>
          <li className={activeMenuItem === "calendar" ? "active" : ""}
            onClick={() => {
              handleMenuClick("calendar");
              setCalendarExpanded(true);
            }}>
            달력
          </li>
          <li className={activeMenuItem === "status" ? "active" : ""}
            onClick={() => {
              handleMenuClick("status");
              setStatusExpanded(true);
            }}>
            상태
          </li>
          <li className={activeMenuItem === "diet" ? "active" : ""}
            onClick={() => {
              handleMenuClick("diet");
              setDietExpanded(true);
            }}>
            식단
          </li>
          <li className={activeMenuItem === "workout" ? "active" : ""}
            onClick={() => {
              handleMenuClick("workout");
              setWorkoutExpanded(true);
            }}>
            운동
          </li>
        </ul>
      </nav>

      {/* 메인 컨텐츠 영역 - 카드들 */}
      <div className="main-cards-area">
        <div className="card-wrapper top-left">

          <Calendar mode={selectedMode} data={calendarSummaryData} onExpand={() => setCalendarExpanded(true)} />
        </div>
        <div className="card-wrapper top-right">
          <StatusCard mode={selectedMode} data={statusData} onExpand={() => setStatusExpanded(true)} />
        </div>
        <div className="card-wrapper bottom-left">
          <DietCard mode={selectedMode} data={dietSummaryData} onExpand={() => setDietExpanded(true)} />
        </div>
        <div className="card-wrapper bottom-right">
          <WorkoutCard mode={selectedMode} data={workoutSummaryData} onExpand={() => setWorkoutExpanded(true)} />

        </div>
      </div>

      {isAboutExpanded && (
        <div className="modal-backdrop" onClick={() => setAboutExpanded(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AboutUsExpanded onClose={() => setAboutExpanded(false)} />
          </div>
        </div>
      )}

      {isCalendarExpanded && (
        <div className="modal-backdrop" onClick={() => setCalendarExpanded(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CalendarExpanded onClose={() => setCalendarExpanded(false)} />
          </div>
        </div>
      )}

      {isStatusExpanded && (
        <div className="modal-backdrop" onClick={() => setStatusExpanded(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <StatusExpanded onClose={() => setStatusExpanded(false)} />
          </div>
        </div>
      )}

      {isDietExpanded && (
        <div className="modal-backdrop" onClick={() => setDietExpanded(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <DietExpanded onClose={() => setDietExpanded(false)} />
          </div>
        </div>
      )}

      {isWorkoutExpanded && (
        <div className="modal-backdrop" onClick={() => setWorkoutExpanded(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <WorkoutExpanded onClose={() => setWorkoutExpanded(false)} />
          </div>
        </div>
      )}

      {/* 우측 채팅 영역 */}
      <div className="chat-area">
        <ManagerChat mode={selectedMode} />

      </div>
    </div>
  )
}
