"use client"

import { useState, useCallback } from "react"
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
import apiClient from "../../api/apiClient"

// ✅ [추가] 오늘 날짜를 'YYYY-MM-DD' 형식으로 가져오는 헬퍼 함수
const getTodayString = () => {
  const today = new Date();
  // 한국 시간 기준으로 날짜를 계산하여 Z(UTC) 타임존 문제를 해결합니다.
  return new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
};

export default function HomePage() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialMode = localStorage.getItem('userMode') || queryParams.get("mode") || "normal";
  const [selectedMode, setSelectedMode] = useState(initialMode);
  const { nickname } = useAuth();

  const [isCalendarExpanded, setCalendarExpanded] = useState(false);
  const [isStatusExpanded, setStatusExpanded] = useState(false);
  const [isWorkoutExpanded, setWorkoutExpanded] = useState(false);
  const [isDietExpanded, setDietExpanded] = useState(false);
  const [isAboutExpanded, setAboutExpanded] = useState(false);

  const { data: statusData, error: statusError, refetch: refetchStatus } = useApi(API_ENDPOINTS.STATUS_TODAY);
  const { data: dietData, error: dietError, refetch: refetchDiet } = useApi(API_ENDPOINTS.DIET_TODAY);
  const { data: workoutData, error: workoutError, refetch: refetchWorkout } = useApi(API_ENDPOINTS.WORKOUT_TODAY);
  const { data: calendarData, error: calendarError, refetch: refetchCalendar } = useApi(API_ENDPOINTS.CALENDAR_SUMMARY);

  // ✅ [수정] 컴포넌트가 로드될 때 localStorage에서 오늘의 추천 데이터를 불러와서 상태를 초기화합니다.
  const [recommendedMealData, setRecommendedMealData] = useState(() => {
    const saved = localStorage.getItem('recommendedMeal');
    if (saved) {
      try {
        const { date, data } = JSON.parse(saved);
        if (date === getTodayString()) {
          return data;
        }
      } catch (e) {
        console.error("Failed to parse recommendedMeal from localStorage", e);
        return null;
      }
    }
    return null;
  });

  const [recommendedWorkoutData, setRecommendedWorkoutData] = useState(() => {
    const saved = localStorage.getItem('recommendedWorkout');
    if (saved) {
      try {
        const { date, data } = JSON.parse(saved);
        if (date === getTodayString()) {
          return data;
        }
      } catch (e) {
        console.error("Failed to parse recommendedWorkout from localStorage", e);
        return null;
      }
    }
    return null;
  });

  const handleDataUpdate = useCallback((savedDataArray) => {
    if (!savedDataArray || savedDataArray.length === 0) {
      refetchStatus();
      refetchDiet();
      refetchWorkout();
      refetchCalendar();
      return;
    }

    let needsCalendarUpdate = false;
    let refetchedTypes = new Set(); 

    savedDataArray.forEach(item => {
      const dataType = item.type;
      const dataPayload = item.data;
      
      if (refetchedTypes.has(dataType)) return;

      switch (dataType) {
        case 'status':
          refetchStatus();
          refetchedTypes.add('status');
          break;
        case 'diet':
        case 'water':
          refetchDiet();
          needsCalendarUpdate = true;
          refetchedTypes.add('diet');
          refetchedTypes.add('water');
          break;
        case 'workout':
          refetchWorkout();
          needsCalendarUpdate = true;
          refetchedTypes.add('workout');
          break;
        case 'diet_recommendation':
          setRecommendedMealData(dataPayload);
          // ✅ [추가] 새로운 추천 데이터를 받을 때마다 오늘 날짜와 함께 localStorage에 저장합니다.
          localStorage.setItem('recommendedMeal', JSON.stringify({ date: getTodayString(), data: dataPayload }));
          break;
        case 'workout_recommendation':
          setRecommendedWorkoutData(dataPayload);
          // ✅ [추가] 새로운 추천 데이터를 받을 때마다 오늘 날짜와 함께 localStorage에 저장합니다.
          localStorage.setItem('recommendedWorkout', JSON.stringify({ date: getTodayString(), data: dataPayload }));
          break;
        case 'water_goal_update':
            refetchDiet();
            break;
        default:
          console.log(`[Haru-Fit] Unknown data type received: ${dataType}`);
          break;
      }
    });

    if (needsCalendarUpdate) {
      refetchCalendar();
    }
  }, [refetchStatus, refetchDiet, refetchWorkout, refetchCalendar]);

  const [chatSystemMessage, setChatSystemMessage] = useState(null);
  
  const handleModeChange = async (mode) => {
    const today = new Date().toISOString().split('T')[0];
    const lastChangeDate = localStorage.getItem('lastModeChangeDate');
    let changeCount = parseInt(localStorage.getItem('modeChangeCount') || '0', 10);

    if (lastChangeDate !== today) {
      changeCount = 0;
      localStorage.setItem('lastModeChangeDate', today);
    }

    if (changeCount >= 3) {
      setChatSystemMessage({
        sender: 'ai',
        text: '모드 변경은 하루 세 번만 가능해요. 내일 다시 변경해주세요! 💪'
      });
      return;
    }

    try {
      await apiClient.put('/users/mode', { mode });
      setSelectedMode(mode);
      localStorage.setItem('userMode', mode);
      changeCount++;
      localStorage.setItem('modeChangeCount', changeCount.toString());
      const modeDescriptions = { easy: "편안한 시작", normal: "꾸준한 관리", hard: "강력한 변화" };
      setChatSystemMessage({ sender: 'ai', text: `'${mode.toUpperCase()}' 모드로 변경되었어요. '${modeDescriptions[mode]}'를 목표로 함께 나아가요!` });
    } catch (error) {
      console.error('Mode update error:', error);
      setChatSystemMessage({ sender: 'ai', text: '모드 변경 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.' });
    }
  };

  const [triggerChatFocus, setTriggerChatFocus] = useState(0);
  const [chatTriggerSource, setChatTriggerSource] = useState(null);
  const handleLogDietToManager = () => { setDietExpanded(false); setChatTriggerSource('diet'); setTriggerChatFocus(prev => prev + 1); };
  const handleLogWorkoutToManager = () => { setWorkoutExpanded(false); setChatTriggerSource('workout'); setTriggerChatFocus(prev => prev + 1); };
  const handleLogStatusToManager = () => { setStatusExpanded(false); setChatTriggerSource('status'); setTriggerChatFocus(prev => prev + 1); };
  const hasError = statusError || dietError || workoutError || calendarError;

  if (hasError) {
    return <div>데이터를 불러오는 중 에러가 발생했습니다. 잠시 후 다시 시도해주세요.</div>;
  }

  const finalDietData = {
    ...dietData,
    recommendedMeal: recommendedMealData || dietData?.recommendedMeal
  };
  
  const finalWorkoutData = {
    ...workoutData,
    recommendedWorkout: recommendedWorkoutData || workoutData?.recommendedWorkout
  };

  return (
    <div className={`homepage-container ${selectedMode}-theme`}>
      <div className="background-image"></div>
      <div className="user-info">
        <p>환영합니다, {nickname}님!</p>
        <p>모드: {selectedMode}</p>
      </div>
      <div className="mode-buttons">
        <button className={`mode-btn ${selectedMode === "easy" ? "mode-easy" : "mode-inactive"}`} onClick={() => handleModeChange("easy")}>EASY</button>
        <button className={`mode-btn ${selectedMode === "normal" ? "mode-normal" : "mode-inactive"}`} onClick={() => handleModeChange("normal")}>NORMAL</button>
        <button className={`mode-btn ${selectedMode === "hard" ? "mode-hard" : "mode-inactive"}`} onClick={() => handleModeChange("hard")}>HARD</button>
      </div>
      <nav className="sidebar-menu">
        <ul className="menu-list">
          <li onClick={() => setAboutExpanded(true)}>About Us</li>
          <li onClick={() => setCalendarExpanded(true)}>달력</li>
          <li onClick={() => setStatusExpanded(true)}>상태</li>
          <li onClick={() => setDietExpanded(true)}>식단</li>
          <li onClick={() => setWorkoutExpanded(true)}>운동</li>
        </ul>
      </nav>
      <div className="main-cards-area">
        <div className="card-wrapper top-left"><Calendar mode={selectedMode} data={calendarData} onExpand={() => setCalendarExpanded(true)} /></div>
        <div className="card-wrapper top-right"><StatusCard mode={selectedMode} data={statusData} onExpand={() => setStatusExpanded(true)} /></div>
        <div className="card-wrapper bottom-left"><DietCard mode={selectedMode} data={finalDietData} onExpand={() => setDietExpanded(true)} /></div>
        <div className="card-wrapper bottom-right"><WorkoutCard mode={selectedMode} data={finalWorkoutData} onExpand={() => setWorkoutExpanded(true)} /></div>
      </div>

      {isAboutExpanded && (<div className="modal-backdrop" onClick={() => setAboutExpanded(false)}><AboutUsExpanded onClose={() => setAboutExpanded(false)} /></div>)}
      {isCalendarExpanded && (<div className="modal-backdrop" onClick={() => setCalendarExpanded(false)}><CalendarExpanded onClose={() => setCalendarExpanded(false)} /></div>)}
      {isStatusExpanded && (<div className="modal-backdrop" onClick={() => setStatusExpanded(false)}><StatusExpanded data={statusData} onClose={() => setStatusExpanded(false)} onLogStatusToManager={handleLogStatusToManager}/></div>)}
      {isDietExpanded && (<div className="modal-backdrop" onClick={() => setDietExpanded(false)}><DietExpanded onClose={() => setDietExpanded(false)} onLogDietToManager={handleLogDietToManager} /></div>)}
      {isWorkoutExpanded && (<div className="modal-backdrop" onClick={() => setWorkoutExpanded(false)}><WorkoutExpanded onClose={() => setWorkoutExpanded(false)} onLogWorkoutToManager={handleLogWorkoutToManager} /></div>)}

      <div className="chat-area">
        <ManagerChat mode={selectedMode} shouldFocusInput={triggerChatFocus} triggerSource={chatTriggerSource} onDataRefresh={handleDataUpdate} systemMessage={chatSystemMessage} />
      </div>
    </div>
  )
}