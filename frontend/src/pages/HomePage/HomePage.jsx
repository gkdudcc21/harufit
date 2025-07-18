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
import { API_ENDPOINTS } from '../../utils/constants';


export default function HomePage() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialMode = queryParams.get("mode") || "normal"
  const [selectedMode, setSelectedMode] = useState(initialMode);
  const { nickname } = useAuth(); 

  const [isCalendarExpanded, setCalendarExpanded] = useState(false);
  const [isStatusExpanded, setStatusExpanded] = useState(false);
  const [isWorkoutExpanded, setWorkoutExpanded] = useState(false);
  const [isDietExpanded, setDietExpanded] = useState(false);
  const [isAboutExpanded, setAboutExpanded] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("AboutUs")

  // ✅ [수정] useApi에서 refetch 함수를 받아옵니다.
  const { data: statusData, loading: statusLoading, error: statusError, refetch: refetchStatus } = useApi(API_ENDPOINTS.STATUS_TODAY);
  const { data: dietData, loading: dietLoading, error: dietError, refetch: refetchDiet } = useApi(API_ENDPOINTS.DIET_TODAY);
  const { data: workoutData, loading: workoutLoading, error: workoutError, refetch: refetchWorkout } = useApi(API_ENDPOINTS.WORKOUT_TODAY);
  const { data: calendarData, loading: calendarLoading, error: calendarError, refetch: refetchCalendar } = useApi(API_ENDPOINTS.CALENDAR_SUMMARY);

  // ✅ [추가] 모든 카드 데이터를 한번에 새로고침하는 함수를 만듭니다.
  const handleDataRefresh = async () => {
    console.log("모든 카드 데이터 새로고침을 시작합니다...");
    try {
      // 4개의 API를 동시에 호출하여 효율적으로 데이터를 가져옵니다.
      await Promise.all([
        refetchStatus(),
        refetchDiet(),
        refetchWorkout(),
        refetchCalendar()
      ]);
      console.log("모든 카드 데이터 새로고침 완료.");
    } catch (error) {
      console.error("데이터 새로고침 중 오류 발생:", error);
    }
  };

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem)
    console.log(`Selected menu: ${menuItem}`)
  }

  const [triggerChatFocus, setTriggerChatFocus] = useState(0);
  const [chatTriggerSource, setChatTriggerSource] = useState(null);

  const handleLogDietToManager = () => {
    setDietExpanded(false);
    setChatTriggerSource('diet');
    setTriggerChatFocus(prev => prev + 1);
  };

  const handleLogWorkoutToManager = () => {
    setWorkoutExpanded(false);
    setChatTriggerSource('workout');
    setTriggerChatFocus(prev => prev + 1);
  };

  const handleLogStatusToManager = () => {
    setStatusExpanded(false);
    setChatTriggerSource('status');
    setTriggerChatFocus(prev => prev + 1);
  };
  
  const isLoading = statusLoading || dietLoading || workoutLoading || calendarLoading;
  const hasError = statusError || dietError || workoutError || calendarError;

  if (isLoading) {
    return <div>데이터를 불러오는 중입니다...</div>;
  }
  if (hasError) {
    return <div>데이터를 불러오는 중 에러가 발생했습니다. 잠시 후 다시 시도해주세요.</div>;
  }

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
          <li className={activeMenuItem === "AboutUs" ? "active" : ""} onClick={() => { handleMenuClick("AboutUs"); setAboutExpanded(true); }}>About Us</li>
          <li className={activeMenuItem === "calendar" ? "active" : ""} onClick={() => { handleMenuClick("calendar"); setCalendarExpanded(true); }}>달력</li>
          <li className={activeMenuItem === "status" ? "active" : ""} onClick={() => { handleMenuClick("status"); setStatusExpanded(true); }}>상태</li>
          <li className={activeMenuItem === "diet" ? "active" : ""} onClick={() => { handleMenuClick("diet"); setDietExpanded(true); }}>식단</li>
          <li className={activeMenuItem === "workout" ? "active" : ""} onClick={() => { handleMenuClick("workout"); setWorkoutExpanded(true); }}>운동</li>
        </ul>
      </nav>
      <div className="main-cards-area">
        <div className="card-wrapper top-left"><Calendar mode={selectedMode} data={calendarData} onExpand={() => setCalendarExpanded(true)} /></div>
        <div className="card-wrapper top-right"><StatusCard mode={selectedMode} data={statusData} onExpand={() => setStatusExpanded(true)} /></div>
        <div className="card-wrapper bottom-left"><DietCard mode={selectedMode} data={dietData} onExpand={() => setDietExpanded(true)} /></div>
        <div className="card-wrapper bottom-right"><WorkoutCard mode={selectedMode} data={workoutData} onExpand={() => setWorkoutExpanded(true)} /></div>
      </div>

      {isAboutExpanded && (<div className="modal-backdrop" onClick={() => setAboutExpanded(false)}><AboutUsExpanded onClose={() => setAboutExpanded(false)} /></div>)}
      {isCalendarExpanded && (<div className="modal-backdrop" onClick={() => setCalendarExpanded(false)}><CalendarExpanded onClose={() => setCalendarExpanded(false)} /></div>)}
      {isStatusExpanded && (<div className="modal-backdrop" onClick={() => setStatusExpanded(false)}><StatusExpanded onClose={() => setStatusExpanded(false)} onLogStatusToManager={handleLogStatusToManager}/></div>)}
      {isDietExpanded && (<div className="modal-backdrop" onClick={() => setDietExpanded(false)}><DietExpanded onClose={() => setDietExpanded(false)} onLogDietToManager={handleLogDietToManager} /></div>)}
      {isWorkoutExpanded && (<div className="modal-backdrop" onClick={() => setWorkoutExpanded(false)}><WorkoutExpanded onClose={() => setWorkoutExpanded(false)} onLogWorkoutToManager={handleLogWorkoutToManager} /></div>)}

      <div className="chat-area">
        {/* ✅ [수정] ManagerChat에 onDataRefresh 함수를 props로 전달합니다. */}
        <ManagerChat mode={selectedMode} shouldFocusInput={triggerChatFocus} triggerSource={chatTriggerSource} onDataRefresh={handleDataRefresh} />
      </div>
    </div>
  )
}