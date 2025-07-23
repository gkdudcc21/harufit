const User = require('../models/user');
const jwt = require('jsonwebtoken'); // ✅ [추가] jsonwebtoken 라이브러리 가져오기

const authMiddleware = async (req, res, next) => {
  let token;

  // 1. 요청 헤더에서 Authorization 토큰 확인
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 'Bearer' 문자열을 제외한 실제 토큰 부분만 추출
      token = req.headers.authorization.split(' ')[1];

      // 토큰 검증 및 디코딩 (환경 변수에 설정된 JWT_SECRET 사용)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 디코딩된 토큰에서 사용자 ID를 사용하여 DB에서 사용자 찾기
      req.user = await User.findById(decoded.id).select('-pin'); // 비밀번호(PIN) 제외

      // 사용자를 찾지 못하면 오류 반환
      if (!req.user) {
        return res.status(401).json({ message: '유효하지 않은 토큰입니다: 사용자를 찾을 수 없습니다.' });
      }

      // 다음 미들웨어로 진행
      next();
    } catch (error) {
      console.error('토큰 검증 오류:', error.message);
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
  } else {
    // 2. 토큰이 없는 경우 (Guest 모드 처리)
    // Guest 모드는 토큰 없이 특정 경로에서만 허용될 수 있도록 설계되었을 경우에만 유효합니다.
    // 현재 구현에서는 토큰이 없으면 대부분의 인증된 경로에서 401 에러를 발생시키는 것이 맞습니다.
    // 만약 'Guest' 닉네임으로 별도의 인증 없이 접근을 허용하고 싶다면, 해당 라우터에서 authMiddleware를 제외하거나,
    // 이곳에서 req.headers['x-user-nickname'] 등을 확인하는 이전 로직을 포함해야 합니다.
    // 하지만 현재까지의 논의로는 '모든 인증 필요한 요청은 JWT를 사용'하는 방향이므로,
    // 토큰이 없으면 401을 반환하는 것이 맞습니다.

    // 예외: 만약 Guest 모드를 로그인 없이 허용해야 하는 경로라면, 해당 라우트에서 authMiddleware를 제거하거나,
    // 여기에서 토큰이 없을 때의 Guest 로직을 명시적으로 처리해야 합니다.
    // 현재로서는 토큰이 없으면 무조건 401 Unauthorized를 반환합니다.
    return res.status(401).json({ message: '인증 토큰이 제공되지 않았습니다.' });
  }
};

module.exports = authMiddleware;