// backend/src/controllers/userController.js
const User = require('../models/user'); // User 모델 불러오기

// 현재 사용자 정보를 반환하는 함수 (임시 데이터)
exports.getCurrentUser = (req, res) => {
  try {
    // 실제 데이터베이스에서는 사용자 인증 후 해당 사용자 정보를 조회합니다.
    const user = {
      id: 'user123',
      nickname: '하루핏유저',
      email: 'user@harufit.com',
      level: 'Normal', // 또는 Easy, Hard
      profileImage: 'https://example.com/profile.jpg'
    };
    res.status(200).json({ message: 'User data fetched successfully', user });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 새로운 사용자를 생성하는 함수
exports.createUser = async (req, res) => {
  const { nickname, mode, pin } = req.body; // 요청 본문에서 nickname과 mode를 가져옵니다.

  // 닉네임 유효성 검사 (아주 간단한 예시)
  if (!nickname || nickname.trim() === '') {
    return res.status(400).json({ message: '닉네임은 필수 입력 항목입니다.' });
  }
  // ✅ pin 유효성 검사 추가 (필수로 할 경우)
  if (pin && (pin.length < 4 || pin.length > 6)) { // PIN을 선택사항으로 두려면 이 검사를 제거하거나 조건부로 적용
    return res.status(400).json({ message: 'PIN 번호는 4~6자리여야 합니다.' });
  }
  try {
    // 이미 존재하는 닉네임인지 확인
    const userExists = await User.findOne({ nickname });
    if (userExists) {
      return res.status(409).json({ message: '이미 존재하는 닉네임입니다. 다른 닉네임을 선택해주세요.' });
    }

    // 새로운 사용자 생성 및 데이터베이스에 저장
    const user = await User.create({
      nickname,
      mode: mode || 'easy', // mode가 제공되지 않으면 기본값 'easy'
      pin, // ✅ pin 저장
    });

    // 성공 응답 (생성된 사용자 정보 반환)
    res.status(201).json({
      message: '사용자가 성공적으로 생성되었습니다.',
      user: {
        id: user._id, // MongoDB에서 자동 생성된 ID
        nickname: user.nickname,
        mode: user.mode,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('사용자 생성 중 오류 발생:', error);
    // MongoDB 유효성 검사 오류 (예: required 필드 누락) 처리
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: '서버 오류로 사용자 생성에 실패했습니다.', error: error.message });
  }
};

// 닉네임으로 사용자 정보를 조회하는 함수
exports.getUser = async (req, res) => {
  const { nickname } = req.params; // URL 파라미터에서 닉네임을 가져옵니다.
  const { pin } = req.query; // ✅ 쿼리 파라미터로 pin을 받도록 추가 (GET 요청이므로 Body는 불가)
  try {
    // 닉네임과 PIN이 모두 일치하는 사용자 찾기
    const user = await User.findOne({ nickname, pin }); // ✅ pin 조건 추가
    if (!user) {
      // PIN이 틀리거나 사용자가 없는 경우 모두 '찾을 수 없음'으로 처리하여 정보 유출 방지
      return res.status(404).json({ message: '사용자를 찾을 수 없거나 PIN이 일치하지 않습니다.' });
    }
    res.status(200).json({ message: '사용자 정보를 성공적으로 가져왔습니다.', user });
  } catch (error) {
    console.error('사용자 조회 중 오류:', error);
    res.status(500).json({ message: '서버 오류로 사용자 조회에 실패했습니다.', error: error.message });
  }
};