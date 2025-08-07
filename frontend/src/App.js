 
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndexPage from './pages/IndexPage/IndexPage';
import HomePage from './pages/HomePage/HomePage';
import UserTestForm from './components/UserTestForm'; 


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />  
        <Route path="/home" element={<HomePage />} />  

        {/* UserTestForm을 위한 별도 테스트 경로. */}
        <Route path="/user-test" element={<UserTestForm />} /> 

        {/* 다른 페이지 추가 시 여기에 <Route> 추가. */}
      </Routes>
    </Router>
  );
}

export default App;