const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const rawNickname = req.headers['x-user-nickname'];
    const pin = req.headers['x-user-pin'];

    if (!rawNickname || !pin) {
      return res.status(401).json({ message: '인증 헤더(x-user-nickname, x-user-pin)가 필요합니다.' });
    }
    
    // ✅ 인코딩된 닉네임을 다시 한글로 디코딩합니다.
    const nickname = decodeURIComponent(rawNickname);
    const parsedPin = parseInt(pin, 10);

    if (isNaN(parsedPin)) {
        return res.status(400).json({ message: 'PIN 번호 형식이 올바르지 않습니다.' });
    }

    const user = await User.findOne({ nickname, pin: parsedPin });

    if (!user) {
      return res.status(401).json({ message: '인증에 실패했습니다.' });
    }

    req.user = user;
    next();

  } catch (error) {
    res.status(500).json({ message: '서버 인증 중 오류 발생', error: error.message });
  }
};

module.exports = authMiddleware;