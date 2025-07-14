// backend/server.js
require('dotenv').config(); // .env 파일의 환경 변수를 로드합니다.
const connectDB = require('./src/config/db'); // 새로 추가: connectDB 함수 불러오기

const app = require('./src/app'); // app.js의 경로가 src 폴더 아래로 변경

// .env 파일에 PORT=5000 처럼 설정하거나, 없으면 기본값 5000 사용
const PORT = process.env.PORT || 5000;

// 데이터베이스 연결
connectDB(); // 새로 추가: 서버 시작 전에 DB 연결 시도

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
