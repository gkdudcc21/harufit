// backend/src/services/aiService.js
const OpenAI = require('openai');

// OpenAI 클라이언트 초기화
// process.env.OPENAI_API_KEY 환경 변수에서 API 키를 자동으로 가져옵니다.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI 코치와 대화하고 응답을 받는 함수
 * @param {Array<Object>} messages - 대화 메시지 배열 ({ role: 'user' | 'assistant', content: '메시지 내용' })
 * @returns {Promise<string>} AI의 텍스트 응답
 */
exports.getAiResponse = async (messages) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // 사용할 GPT 모델 지정 (예: gpt-4o, gpt-3.5-turbo)
            messages: messages,
            // temperature: 0.7, // 창의성 조절 (0.0: 보수적, 1.0: 창의적)
            // max_tokens: 150, // 최대 응답 길이
        });

        // AI의 응답 텍스트를 반환합니다.
        return completion.choices[0].message.content;

    } catch (error) {
        console.error("OpenAI API 호출 중 오류 발생:", error);
        throw new Error("AI 코치와의 통신에 문제가 발생했습니다.");
    }
};