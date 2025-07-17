const aiService = require('../services/aiService');
const ChatHistory = require('../models/ChatHistory');
const User = require('../models/User'); // User 모델도 필요합니다.

// getAiResponse 함수를 handleChat으로 이름을 변경하고 로직을 수정합니다.
exports.handleChat = async (req, res) => {
    // authMiddleware가 인증을 처리하므로, req.user에서 사용자 정보를 가져옵니다.
    const user = req.user;
    const { message, history } = req.body; // 프론트에서 메시지와 이전 대화 기록을 받습니다.

    if (!message) {
        return res.status(400).json({ message: '메시지를 입력해주세요.' });
    }

    try {
        // user 객체 전체 대신, 필요한 context만 전달합니다.
        const userContext = {
            nickname: user.nickname,
            targetWeight: user.targetWeight,
            targetCalories: user.targetCalories,
        };
        
        const { aiResponseMessage, extractedData } = await aiService.getAiChatResponse(message, history || [], userContext);

        // (대화 기록 저장 로직은 나중에 추가할 수 있으므로, 지금은 AI 응답에 집중합니다.)
        
        res.status(200).json({
            reply: aiResponseMessage,
            extractedData: extractedData || null
        });

    } catch (error) {
        res.status(500).json({ message: '하루핏 메니저와의 통신에 문제가 발생했습니다.', error: error.message });
    }
};