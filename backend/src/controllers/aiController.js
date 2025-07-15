// backend/src/controllers/aiController.js
const aiService = require('../services/aiService');
const User = require('../models/User');
const ChatHistory = require('../models/ChatHistory'); // ✅ 추가: ChatHistory 모델 불러오기

exports.getAiResponse = async (req, res) => {
    const { message, nickname, pin } = req.body;

    if (!message) {
        return res.status(400).json({ message: '메시지를 입력해주세요.' });
    }
    if (!nickname || !pin) {
        return res.status(400).json({ message: '닉네임과 PIN 번호가 필요합니다.' });
    }

    try {
        // 1. 사용자 정보 가져오기 (닉네임과 PIN으로 인증)
        const user = await User.findOne({ nickname, pin });
        if (!user) {
            return res.status(404).json({ message: '존재하지 않는 사용자이거나 PIN이 일치하지 않습니다.' });
        }

        // 2. aiService를 통해 LLM 응답 생성 및 파싱 시도
        const { aiResponseMessage, extractedData } = await aiService.getAiChatResponse(message, user);

        // ✅ 추가: 대화 기록 저장 로직
        let chatHistory = await ChatHistory.findOne({ user: user._id });

        if (!chatHistory) {
            chatHistory = new ChatHistory({ user: user._id, messages: [] });
        }

        // 사용자 메시지 저장
        chatHistory.messages.push({ role: 'user', content: message, timestamp: new Date() });
        // AI 응답 저장 (extractedData 포함)
        chatHistory.messages.push({ role: 'assistant', content: aiResponseMessage, timestamp: new Date(), extractedData: extractedData });

        await chatHistory.save(); // 대화 기록 저장

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