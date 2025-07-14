// backend/src/controllers/aiController.js
const { getAiResponse } = require('../services/aiService'); // aiService에서 getAiResponse 함수를 불러옵니다.

// AI 코치와 대화하고 응답을 반환하는 함수
exports.getChatResponse = async (req, res) => {
  const { message, userId } = req.body; // 요청 본문에서 사용자 메시지와 사용자 ID를 가져옵니다.
  // 실제 앱에서는 userId를 이용하여 사용자의 과거 대화 기록이나 프로필을 불러와 AI에 전달합니다.

  if (!message || message.trim() === '') {
    return res.status(400).json({ message: '메시지 내용을 입력해주세요.' });
  }

  try {
    // AI 모델에 전달할 메시지 배열 구성
    // 여기서는 간단하게 사용자 메시지만 전달하지만, 실제로는 과거 대화 기록도 포함되어야 합니다.
    // 예: [{ role: 'system', content: 'You are a helpful AI wellness coach.' }, { role: 'user', content: message }]
    const messagesForAi = [
        { role: 'system', content: 'You are HARUFIT manager, a friendly and empathetic AI wellness coach. Understand user\'s emotions and provide personalized, encouraging advice for diet and exercise. Respond concisely.' },
        { role: 'user', content: message }
    ];

    // aiService를 통해 AI 응답을 받아옵니다.
    const aiResponseMessage = await getAiResponse(messagesForAi);

    // AI 응답을 클라이언트에 반환합니다.
    res.status(200).json({
      message: 'AI 응답을 성공적으로 받았습니다.',
      aiResponse: aiResponseMessage,
      // 여기에 AI가 추출한 구조화된 데이터(예: 식단 정보)를 추가할 수 있습니다.
      // extractedData: aiExtractedData
    });
  } catch (error) {
    console.error('AI 코치 응답 생성 중 오류 발생:', error);
    res.status(500).json({ message: 'AI 코치와의 통신에 문제가 발생했습니다.', error: error.message });
  }
};