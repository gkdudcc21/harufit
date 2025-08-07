
import React, { useState } from 'react';
import apiClient from '../api/apiClient';

function UserTestForm() {
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);

  // 사용자 생성 핸들러
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage('');
    setUserData(null);
    try {
      const response = await apiClient.post('/users', { nickname, mode: 'easy', pin });
      setMessage(`성공: ${response.data.message}`);
      localStorage.setItem('userNickname', nickname);
      localStorage.setItem('userPin', pin);
      setUserData(response.data.user);
    } catch (error) {
      setMessage(`오류: ${error.response ? error.response.data.message : error.message}`);
      console.error("사용자 생성 오류:", error);
    }
  };

  // 사용자 조회 핸들러
  const handleGetUser = async (e) => {
    e.preventDefault();
    setMessage('');
    setUserData(null);
    try {
      const response = await apiClient.get(`/users/${nickname}`);
      setMessage(`성공: ${response.data.message}`);
      setUserData(response.data.user);
    } catch (error) {
      setMessage(`오류: ${error.response ? error.response.data.message : error.message}`);
      console.error("사용자 조회 오류:", error);
    }
  };

  return (
    <div>
      <h2>사용자 테스트 (프론트엔드)</h2>
      <form onSubmit={handleCreateUser}>
        <input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <input
          type="password" // PIN은 비밀번호처럼 입력
          placeholder="PIN (4자리 숫자)"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          maxLength="4"
          required
        />
        <button type="submit">사용자 생성</button>
        <button type="button" onClick={handleGetUser} style={{ marginLeft: '10px' }}>
          사용자 조회
        </button>
      </form>
      {message && <p style={{ color: message.startsWith('오류') ? 'red' : 'green' }}>{message}</p>}
      {userData && (
        <div>
          <h3>사용자 정보:</h3>
          <pre>{JSON.stringify(userData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default UserTestForm;