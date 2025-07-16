// 백엔드와의 모든 통신은 이곳을 통해 이루어집니다. 
// 닉네임,PIN은 자동으로 모든 요청에 추가됩니다. (로그인후 로컬스토리지에 저장되어 있다면)

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// ✅ 문제의 원인이었던 요청 인터셉터를 완전히 삭제했습니다.
// 로그인/회원가입 요청은 각 컴포넌트에서 직접 보낸 값을 사용해야 합니다.

// 응답 인터셉터: 로그인/회원가입 흐름을 위해 수정

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {

    if (error.response) {
      // 로그인/회원가입을 위해 사용자를 조회하는 API(/users/...)에서 404 오류가 발생한 경우,
      // alert를 띄우지 않고 IndexPage.jsx에서 직접 처리하도록 그냥 에러를 반환합니다.
      if (error.response.status === 404 && error.config.url.includes('/users/')) {
        return Promise.reject(error);
      }

      // 그 외 다른 모든 오류는 alert 창으로 표시
      if (error.response.data && error.response.data.message) {
        // alert(`오류: ${error.response.data.message}`); // alert 대신 console.error로 변경하여 테스트 흐름 방해 방지
        console.error(`API Error Message: ${error.response.data.message}`);
      } else {
        // alert(`알 수 없는 오류가 발생했습니다: ${error.response.status}`);
        console.error(`Unknown API Error: ${error.response.status}`);

      }
    } else if (error.request) {
      // alert('서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.');
      console.error('No response from server:', error.request);
    } else {
      // alert('요청 처리 중 오류가 발생했습니다.');
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;