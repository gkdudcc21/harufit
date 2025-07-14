// backend/src/controllers/aiController.js
const aiService = require('../services/aiService'); // aiService에서 getAiResponse 함수를 불러옵니다.
const User = require('../models/user'); // ✅ 추가: User 모델 불러오기

// AI 코치와 대화하고 응답을 반환하는 함수
exports.getChatResponse = async (req, res) => {
  // ✅ 수정: userId 대신 nickname을 req.body에서 가져옵니다.
  const { message, nickname, pin } = req.body;

  if (!message) {
    return res.status(400).json({ message: '메시지를 입력해주세요.' });
  }
  // 이제 nickname 변수가 정의되었으므로 이 조건문이 정상 작동합니다.
  if (!nickname || !pin) {
    return res.status(400).json({ message: '닉네임과 PIN 번호가 필요합니다.' });
  }

  try {
    // 1. 사용자 정보 가져오기 (닉네임과 PIN으로 인증)
    // 이제 User 모델이 불러와졌으므로 정상 작동합니다.
    const user = await User.findOne({ nickname, pin });
    if (!user) {
      return res.status(404).json({ message: '존재하지 않는 사용자이거나 PIN이 일치하지 않습니다.' });
    }

    // 2. aiService를 통해 LLM 응답 생성 및 파싱 시도
    const { aiResponseMessage, extractedData } = await aiService.getAiChatResponse(message, user);

    // 3. 응답 전송
    res.status(200).json({
      message: 'AI 응답을 성공적으로 받았습니다.',
      aiResponse: aiResponseMessage,
      extractedData: extractedData || null
    });

  } catch (error) {
    console.error('AI 코치 응답 생성 중 오류 발생:', error);
    res.status(500).json({ message: 'AI 코치와의 통신에 문제가 발생했습니다.', error: error.message });
  }
};