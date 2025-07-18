import axios from 'axios';

// 1. axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ [핵심 수정] 요청 인터셉터(interceptor)를 새로운 'JWT 토큰' 방식으로 교체합니다.
apiClient.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰을 가져옵니다.
    const token = localStorage.getItem('userToken');
    
    // 토큰이 존재하면, Authorization 헤더에 'Bearer' 방식의 토큰을 추가합니다.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config; // 수정된 요청 설정을 반환합니다.
  },
  (error) => {
    // 요청 에러 처리
    return Promise.reject(error);
  }
);

// 응답 에러를 콘솔에 출력하는 로직은 그대로 유지합니다.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.request || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;