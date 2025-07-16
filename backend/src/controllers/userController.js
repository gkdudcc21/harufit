// backend/src/controllers/userController.js (확인용 전체 코드)
const User = require('../models/User');

// 현재 사용자 정보를 반환하는 함수 (임시 데이터)
exports.getCurrentUser = (req, res) => {
  try {
    const user = {
      id: 'user123',
      nickname: '하루핏유저',
      email: 'user@harufit.com',
      level: 'Normal',
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
  console.log('Received request body in createUser:', req.body);

  const { nickname, mode, pin } = req.body;

  if (!nickname || nickname.trim() === '') {
    return res.status(400).json({ message: '닉네임은 필수 입력 항목입니다.' });
  }
  if (nickname.length < 2 || nickname.length > 20) {
    return res.status(400).json({ message: '닉네임은 2자 이상 20자 이하로 입력해주세요.' });
  }

  let parsedPin = null;
  if (pin) {
    parsedPin = parseInt(pin, 10);
    if (isNaN(parsedPin) || pin.length !== 4) {
      return res.status(400).json({ message: 'PIN 번호는 4자리 숫자로 입력해주세요.' });
    }
  } else {
    return res.status(400).json({ message: 'PIN 번호가 필요합니다.' });
  }

  try {
    const trimmedNickname = nickname.trim();
    // ✅ 닉네임 조회 쿼리 실행 전/후 로그 추가
    console.log(`[createUser] Searching for user with nickname: "${trimmedNickname}"`);
    const userExists = await User.findOne({ nickname: trimmedNickname });
    console.log(`[createUser] User exists check result:`, userExists); // ✅ 조회 결과 로그

    if (userExists) {
      return res.status(409).json({ message: '이미 존재하는 닉네임, 또는 PIN이 일치하지 않습니다.' });
    }

    const user = await User.create({
      nickname: trimmedNickname,
      mode: mode || 'easy',
      pin: parsedPin, // ✅ 변환된 숫자로 PIN 저장
    });

    console.log(`[createUser] User created in DB:`, user);

    const responseUser = {
      id: user._id.toString(),
      nickname: user.nickname,
      mode: user.mode,
      createdAt: user.createdAt,
    };
    console.log(`[createUser] Sending response user object:`, responseUser);

    res.status(201).json({
      message: '사용자가 성공적으로 생성되었습니다.',
      user: responseUser,
    });
  } catch (error) {
    console.error('사용자 생성 중 오류 발생:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: '서버 오류로 사용자 생성에 실패했습니다.', error: error.message });
  }
};

exports.getUser = async (req, res) => {
  const { nickname } = req.params;
  const { pin } = req.query;

  if (!nickname || !pin) {
    return res.status(400).json({ message: '이미 존재하는 닉네임, 또는 PIN이 일치하지 않습니다.' });
  }

  try {
    const trimmedNickname = nickname.trim();
    const parsedPin = parseInt(pin, 10);

    if (isNaN(parsedPin)) {
      return res.status(400).json({ message: 'PIN 번호 형식이 올바르지 않습니다.' });
    }

    const user = await User.findOne({ nickname: trimmedNickname });

    // ✅ 닉네임이 없거나, 있더라도 PIN이 틀린 경우 모두 동일한 401 오류를 반환
    if (!user || user.pin !== parsedPin) {
      return res.status(401).json({ message: '이미 존재하는 닉네임, 또는 PIN이 일치하지 않습니다.' });
    }

    // 닉네임과 PIN이 모두 일치하는 경우 (로그인 성공)
    const responseUser = {
      id: user._id.toString(),
      nickname: user.nickname,
      mode: user.mode,
      pin: user.pin,
      targetWeight: user.targetWeight,
      targetCalories: user.targetCalories,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      message: '사용자 정보를 성공적으로 가져왔습니다.',
      user: responseUser
    });

  } catch (error) {
    console.error('사용자 조회 중 오류:', error);
    res.status(500).json({ message: '서버 오류로 사용자 조회에 실패했습니다.' });
  }
};