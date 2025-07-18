const User = require('../models/User');
// ✅ [추가] jsonwebtoken 라이브러리를 가져옵니다.
const jwt = require('jsonwebtoken');

// ✅ [추가] JWT 토큰을 생성하는 헬퍼 함수입니다.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // 토큰 유효기간: 30일
  });
};

// '로그인 또는 회원가입'을 모두 처리하는 함수
exports.createUser = async (req, res) => {
  const { nickname, pin } = req.body;

  if (!nickname || !pin) {
    return res.status(400).json({ message: '닉네임과 PIN은 필수입니다.' });
  }
  // ... (유효성 검사는 기존과 동일)
  const trimmedNickname = nickname.trim();
  if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
    return res.status(400).json({ message: '닉네임은 2자 이상 20자 이하로 입력해주세요.' });
  }
  const parsedPin = parseInt(pin, 10);
  if (isNaN(parsedPin) || pin.length !== 4) {
    return res.status(400).json({ message: 'PIN 번호는 4자리 숫자로 입력해주세요.' });
  }

  try {
    const existingUser = await User.findOne({ nickname: trimmedNickname });

    if (existingUser) { // 사용자가 이미 존재할 경우 (로그인 시도)
      if (existingUser.pin === parsedPin) {
        // ✅ [수정] 로그인 성공 시, 토큰을 함께 발급하여 응답에 포함합니다.
        return res.status(200).json({
          message: '로그인에 성공했습니다.',
          user: existingUser,
          token: generateToken(existingUser._id),
        });
      } else {
        return res.status(401).json({ message: 'PIN 번호가 일치하지 않습니다.' });
      }
    }

    // 사용자가 없을 경우 (회원가입)
    const newUser = await User.create({
      nickname: trimmedNickname,
      pin: parsedPin,
      mode: 'normal',
    });

    // ✅ [수정] 회원가입 성공 시에도, 토큰을 함께 발급하여 응답에 포함합니다.
    res.status(201).json({
      message: '사용자가 성공적으로 생성되었습니다.',
      user: newUser,
      token: generateToken(newUser._id),
    });
  } catch (error) {
    console.error('사용자 처리 중 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 사용자의 모드를 업데이트하는 함수
exports.updateUserMode = async (req, res) => {
    try {
        const { mode } = req.body;
        const validModes = ['easy', 'normal', 'hard'];
        if (!mode || !validModes.includes(mode)) {
            return res.status(400).json({ message: '올바른 모드를 선택해주세요.' });
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id, { mode: mode }, { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }
        res.status(200).json({ message: '모드가 성공적으로 변경되었습니다.', user: updatedUser });
    } catch (error) {
        console.error('모드 업데이트 중 오류:', error);
        res.status(500).json({ message: '모드 업데이트 중 서버 오류가 발생했습니다.' });
    }
};

// 더 이상 사용되지 않는 함수들
exports.getUser = async (req, res) => {};
exports.getCurrentUser = async (req, res) => {};