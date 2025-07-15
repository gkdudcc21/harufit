// src/App.js

import React from 'react'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // 라우팅 관련 컴포넌트 임포트
import IndexPage from './pages/IndexPage/IndexPage'; 
import HomePage from './pages/HomePage/HomePage';     

function App() {
  return (
    <Router> {/* 애플리케이션의 라우팅을 감싸는 최상위 컴포넌트 */}
      <Routes> {/* 여러 Route들을 정의하는 컨테이너 */}
        <Route path="/" element={<IndexPage />} /> {/* 루트 경로 ("/")에 IndexPage 연결 */}
        <Route path="/home" element={<HomePage />} /> {/* "/home" 경로에 HomePage 연결 */}
        {/* 나중에 다른 페이지를 추가한다면 여기에 <Route>를 추가합니다. */}
        {/* 예: <Route path="/diet" element={<DietPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;