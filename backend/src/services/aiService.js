// backend/src/services/aiService.js
const OpenAI = require('openai');
require('dotenv').config(); // ✅ 추가: .env 파일을 로드합니다.

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// ✅ 함수 이름과 매개변수를 aiController.js에 맞게 수정했습니다.
async function getAiChatResponse(userMessage, user) {
    let aiResponseMessage = '';
    let extractedData = null; // 파싱된 데이터를 담을 변수

    try {
        // LLM 프롬프트 설계: 사용자의 모드와 닉네임을 포함하여 개인화 유도
        const userMode = user ? user.mode : 'easy';
        const userNickname = user ? user.nickname : '사용자';

        // GPT-4o 모델 사용 (가장 성능이 좋고 파싱에 유리)
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4o", // 가장 최신 모델 사용
            messages: [
                { role: "system", content: `당신은 하루핏(HARUFIT) 매니저입니다. 사용자의 건강을 돕는 친절하고 공감능력 있는 AI 웰니스 코치입니다. 현재 사용자 모드는 '${userMode}' 입니다. 사용자의 닉네임은 '${userNickname}'입니다. 사용자의 메시지를 이해하고, 필요한 경우 식단이나 운동 정보를 추출하여 JSON 형태로 제공해주세요. 감정이나 핑계도 이해하고 공감해주세요.` },
                { role: "user", content: userMessage },
                { role: "system", content: `사용자 '${userNickname}'님의 메시지를 받았습니다. 어떤 도움을 드릴까요? 식단/운동 정보가 있다면 다음 JSON 형식으로 추출해주세요: {"type": "diet/workout/general", "details": "파싱된 정보", "aiResponse": "AI의 답변"}` }
                // LLM에게 JSON 포맷을 명시적으로 요구하는 것이 파싱에 유리합니다.
            ],
            response_format: { type: "json_object" } // JSON 응답 형식 강제
        });

        const rawResponseContent = chatCompletion.choices[0].message.content;
        console.log("Raw AI Response:", rawResponseContent); // 디버깅용

        try {
            const parsedResponse = JSON.parse(rawResponseContent);
            aiResponseMessage = parsedResponse.aiResponse || "이해했습니다. 더 자세히 말씀해주세요."; // AI의 답변 부분
            extractedData = parsedResponse.extractedData || null; // 추출된 데이터 부분

            // **아주 기본적인 파싱 및 분류 로직 (MVP):**
            // 여기서는 LLM이 JSON으로 잘 줬다고 가정하고, LLM이 'type'을 잘 분류해줬다고 가정
            if (extractedData && extractedData.type === 'diet') {
                aiResponseMessage = `${userNickname}님, 식단 정보를 기록할게요! ${extractedData.details} 잘하셨습니다!`;
            } else if (extractedData && extractedData.type === 'workout') {
                aiResponseMessage = `${userNickname}님, 운동 정보를 기록할게요! ${extractedData.details} 정말 대단합니다!`;
            } else {
                // 일반 대화 (감정, 핑계 등)
                aiResponseMessage = parsedResponse.aiResponse || `(${userNickname}님) ${userMessage}에 대해 제가 도울 수 있는 것을 말씀해주세요.`;
            }


        } catch (jsonError) {
            // LLM이 JSON 형식으로 응답하지 않았을 경우
            console.warn("AI 응답이 JSON 형식이 아닙니다. 일반 텍스트로 처리합니다:", rawResponseContent);
            aiResponseMessage = rawResponseContent;
            extractedData = null; // 파싱 실패
        }


    } catch (error) {
        console.error('OpenAI API 호출 오류:', error.response ? error.response.data : error.message);
        aiResponseMessage = '죄송합니다, 현재 AI 코치와 연결이 원활하지 않습니다.';
        extractedData = null;
    }

    return { aiResponseMessage, extractedData };
}

module.exports = { getAiChatResponse }; // ✅ 여기서 함수를 올바른 이름으로 내보냅니다.