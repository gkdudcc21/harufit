import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://harufit.onrender.com',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    
    // ▼▼▼ [디버깅 코드 추가] ▼▼▼
    console.log('--- apiClient: API 요청 직전 ---');
    console.log('localStorage에서 가져온 토큰:', token);
    // ▲▲▲ [디버깅 코드 추가] ▲▲▲
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.request || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
