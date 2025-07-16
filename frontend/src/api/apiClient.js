// 백엔드와의 모든 통신은 이곳을 통해 이루어집니다. 
// 닉네임,PIN은 자동으로 모든 요청에 추가됩니다. (로그인후 로컬스토리지에 저장되어 있다면)

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
// (로컬 스토리지에서 가져와서 존재할 때만 추가합니다.)
apiClient.interceptors.request.use(
  (config) => {
    // 현재는 임시로 닉네임,PIN을 쿼리파라미터or바디에 직접 넣을 수 있도록함.
    const userNickname = localStorage.getItem('userNickname');
    const userPin = localStorage.getItem('userPin');

    // GET요청-쿼리 파라미터에 추가, POST, PUT, DELETE-바디에 추가
    // 백엔드에서 닉네임PIN을 바디로 받는 API(예: AI채팅, 식단생성)를 위해 이 부분을 config.data에 추가
    // 하지만 백엔드 설계상 params로 받거나 URL에 직접 넣는 경우도 많으므로 실제 API 디자인에 맞춰 유연하게 적용
    if (userNickname && userPin) {
      if (config.method === 'get') {
        config.params = {
          ...config.params,
          nickname: userNickname,
          pin: userPin,
        };
      };
    } else if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
      config.data = {
        ...config.data, // 기존 본문 데이터가 있다면 유지
        nickname: userNickname,
        pin: userPin,
      };
    }
    // 다른 HTTP 메서드 (DELETE 등)의 경우 필요하다면 여기에 추가 로직 작성
    return config;
  },
  (error) => {
    console.error('API 요청 인터셉터 에러:', error);
    alert('요청을 보내는 도중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.');
    return Promise.reject(error);
  }
);


// 응답 인터셉터: 공통 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 백엔드에서 받은 에러메시지를 사용자에게 보여주도록 처리
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
      // 예를 들어, 특정 HTTP 상태 코드에 따라 다른 처리
      if (error.response.status === 401) {
        // 인증 오류: 로그인 페이지로 리다이렉트 등
        alert('인증이 필요합니다. 다시 로그인해주세요.');
        // window.location.href = '/login';
      } else if (error.response.data && error.response.data.message) {
        // 백엔드에서 보낸 에러 메시지 표시
        alert(`오류: ${error.response.data.message}`);
      } else {
        // alert(`알 수 없는 오류가 발생했습니다: ${error.response.status}`);
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