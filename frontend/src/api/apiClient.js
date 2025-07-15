// frontend/src/api/apiClient.js
import axios from 'axios';

// 백엔드 API의 기본 URL (개발 환경)
// 배포 시에는 다른 URL로 설정해야 합니다.
// .env.development 파일에 REACT_APP_API_BASE_URL=http://localhost:5000 을 추가해야 합니다.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 모든 API 요청에 닉네임과 PIN 번호를 자동으로 포함
// (예시: 로컬 스토리지에서 가져온다고 가정)
apiClient.interceptors.request.use(
  (config) => {
    // 실제 앱에서는 로그인/인증 후 사용자 정보를 가져오는 로직이 들어갑니다.
    // 현재는 PoC 단계이므로, 임시로 닉네임과 PIN을 쿼리 파라미터나 바디에 직접 넣을 수 있도록 고려합니다.
    // 예를 들어, GET 요청의 경우 URL 파라미터, POST/PUT 요청의 경우 바디에 포함.
    // 여기서는 예시로 로컬스토리지에서 가져온다고 가정합니다.
    const userNickname = localStorage.getItem('userNickname');
    const userPin = localStorage.getItem('userPin');

    if (userNickname && userPin) {
      // GET 요청의 경우 쿼리 파라미터에 추가
      if (config.method === 'get') {
        config.params = {
          ...config.params,
          nickname: userNickname,
          pin: userPin,
        };
      } else { // POST, PUT, DELETE 등 요청의 경우 바디에 추가 (백엔드 컨트롤러에 따라 다름)
        // 백엔드에서 닉네임과 PIN을 바디로 받는 API(예: AI 채팅, 식단 생성)를 위해
        // 이 부분을 config.data에 추가합니다.
        // 하지만 백엔드 설계상 params로 받거나 URL에 직접 넣는 경우도 많으므로,
        // 실제 API 디자인에 맞춰 유연하게 적용해야 합니다.
        if (config.data) {
            config.data = {
                ...config.data,
                nickname: userNickname,
                pin: userPin,
            };
        } else {
            config.data = {
                nickname: userNickname,
                pin: userPin,
            };
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 공통 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 백엔드에서 받은 에러 메시지를 사용자에게 보여줄 수 있도록 처리
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
      // 예를 들어, 특정 상태 코드에 따라 다른 처리
      if (error.response.status === 401) {
        // 인증 오류: 로그인 페이지로 리다이렉트 등
        alert('인증이 필요합니다. 다시 로그인해주세요.');
        // window.location.href = '/login';
      } else if (error.response.data && error.response.data.message) {
        // 백엔드에서 보낸 에러 메시지 표시
        alert(`오류: ${error.response.data.message}`);
      } else {
        alert(`알 수 없는 오류가 발생했습니다: ${error.response.status}`);
      }
    } else if (error.request) {
      // 요청이 전송되었지만 응답을 받지 못함 (네트워크 문제 등)
      console.error('No response from server:', error.request);
      alert('서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.');
    } else {
      // 요청 설정 중 오류 발생
      console.error('Request setup error:', error.message);
      alert('요청 처리 중 오류가 발생했습니다.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;