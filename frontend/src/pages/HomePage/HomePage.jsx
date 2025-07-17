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
// ✅ 실제 API 호출 관련 코드는 주석 처리합니다.
// import useApi from '../../hooks/useApi';
// import { API_ENDPOINTS } from '../../utils/constants';

export default function HomePage() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialMode = queryParams.get("mode") || "normal"
  const [selectedMode, setSelectedMode] = useState(initialMode);
  const { nickname } = useAuth(); // mode는 selectedMode로 대체 사용

  const [isCalendarExpanded, setCalendarExpanded] = useState(false);
  const [isStatusExpanded, setStatusExpanded] = useState(false);
  const [isWorkoutExpanded, setWorkoutExpanded] = useState(false);
  const [isDietExpanded, setDietExpanded] = useState(false);
  const [isAboutExpanded, setAboutExpanded] = useState(false);


  const [activeMenuItem, setActiveMenuItem] = useState("AboutUs")

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem)
    console.log(`Selected menu: ${menuItem}`)
  }

  // ✅ 실제 API 호출 대신 사용할 가짜 데이터 (Mock Data)
  const mockData = {
    status: {
      weight: 75.5,
      bodyFat: 22.1,
      muscleMass: 31.2,
    },
    workout: {
      totalTime: "1h 20m",
      totalCalories: 450,
      parts: ["가슴", "어깨"],
    },
    diet: {
      totalCalories: 1890,
      carbs: 200,
      protein: 150,
      fat: 60,
    },
    calendar: [
      { date: "2025-07-16", hasWorkout: true, hasDiet: true },
      { date: "2025-07-15", hasWorkout: false, hasDiet: true },
      { date: "2025-07-14", hasWorkout: true, hasDiet: false },
    ]
  };

  /*
  // ✅ 에러의 원인이 되는 실제 API 호출 부분 전체를 주석 처리합니다.
  const { data: statusData, loading: statusLoading, error: statusError } = useApi(
    API_ENDPOINTS.STATUS_TODAY, 'get'
  );
  // ... (다른 API 호출들도 모두 주석 처리)

  if (statusLoading || workoutLoading || dietLoading || calendarLoading) {
    return <div>로딩 중...</div>;
  }

  if (statusError || workoutError || dietError || calendarError) {
    return <div>에러 발생!</div>;
  }
  */

  return (
    <div className={`homepage-container ${selectedMode}-theme`}>
      <div className="background-image"></div>
      <div className="user-info">
        <p>환영합니다, {nickname}님!</p>
        <p>모드: {selectedMode}</p>
      </div>
      <div className="mode-buttons">
        <button className={`mode-btn ${selectedMode === "easy" ? "mode-easy" : "mode-inactive"}`} onClick={() => setSelectedMode("easy")}> EASY</button>
        <button className={`mode-btn ${selectedMode === "normal" ? "mode-normal" : "mode-inactive"}`} onClick={() => setSelectedMode("normal")}> NORMAL</button>
        <button className={`mode-btn ${selectedMode === "hard" ? "mode-hard" : "mode-inactive"}`} onClick={() => setSelectedMode("hard")}>HARD</button>
      </div>
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
          <li className={activeMenuItem === "status" ? "active" : ""} onClick={() => { handleMenuClick("status"); setStatusExpanded(true); }}>
            상태
          </li>
          <li className={activeMenuItem === "diet" ? "active" : ""} onClick={() => { handleMenuClick("diet"); setDietExpanded(true); }}>
            식단
          </li>
          <li className={activeMenuItem === "workout" ? "active" : ""} onClick={() => { handleMenuClick("workout"); setWorkoutExpanded(true); }}>
            운동
          </li>
        </ul>
      </nav>
      <div className="main-cards-area">
        {/* ✅ 각 카드에 가짜 데이터를 props로 전달합니다. */}
        <div className="card-wrapper top-left">
          <Calendar mode={selectedMode} data={mockData.calendar} onExpand={() => setCalendarExpanded(true)} />
        </div>
        <div className="card-wrapper top-right">
          <StatusCard mode={selectedMode} data={mockData.status} onExpand={() => setStatusExpanded(true)} />
        </div>
        <div className="card-wrapper bottom-left">
          <DietCard mode={selectedMode} data={mockData.diet} onExpand={() => setDietExpanded(true)} />
        </div>
        <div className="card-wrapper bottom-right">
          <WorkoutCard mode={selectedMode} data={mockData.workout} onExpand={() => setWorkoutExpanded(true)} />
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

      <div className="chat-area">
        <ManagerChat mode={selectedMode} />
      </div>
    </div>
  )
}