// backend/src/services/aiService.js
const OpenAI = require('openai'); // ✅ 수정: GoogleGenerativeAI 대신 openai 불러오기
const dotenv = require('dotenv');
dotenv.config();

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // .env 파일에 OPENAI_API_KEY 설정 필요
});

/**
 * AI 코치와 대화하고 응답을 파싱하여 반환합니다.
 * @param {string} userMessage - 사용자의 메시지
 * @param {object} userContext - 사용자 정보 (닉네임, 목표 체중 등)
 * @returns {object} { aiResponseMessage, extractedData } - AI 응답 메시지와 추출된 데이터
 */
exports.getAiChatResponse = async (userMessage, userContext) => {
    try {
        const systemPrompt = `당신은 사용자의 건강 코치 하루핏입니다. 사용자의 메시지에 답변하고, 필요한 경우 식단 또는 운동 정보를 JSON 형식으로 추출합니다. 사용자는 닉네임 ${userContext.nickname}입니다. 목표 체중은 ${userContext.targetWeight || '설정되지 않음'}kg, 목표 칼로리는 ${userContext.targetCalories || '설정되지 않음'}kcal입니다. 사용자가 제공한 식단이나 운동 정보가 있으면 아래와 같이 JSON으로 응답합니다:
        - 식단 정보: {"type": "diet", "food_name": "음식명", "quantity": "수량"}
        - 운동 정보: {"type": "workout", "exercise_name": "운동명", "duration_minutes": "시간(분)", "calories_burned": "소모칼로리(추정치)"}
        위 JSON 형식은 응답 내용 중간에 포함될 수 있습니다. 그렇지 않은 경우 일반적인 대화로 응답합니다.`;

        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4o", // 또는 "gpt-3.5-turbo" 등 사용 가능한 모델
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            response_format: { type: "text" }, // 명시적으로 텍스트 응답을 요청
        });

        const aiResponseMessage = chatCompletion.choices[0].message.content;

        let extractedData = null;
        try {
            // 응답에서 JSON 문자열을 찾아 파싱 시도 (AI가 JSON을 직접 생성하는 경우)
            const jsonMatch = aiResponseMessage.match(/\{"type":\s*"(diet|workout)".*?\}/s);
            if (jsonMatch) {
                extractedData = JSON.parse(jsonMatch[0]);
            }
        } catch (parseError) {
            console.warn("AI 응답에서 JSON 파싱 중 오류 (추출 실패):", parseError);
        }

        return { aiResponseMessage: aiResponseMessage, extractedData: extractedData };

    } catch (error) {
        console.error('AI 응답 생성 중 오류 발생:', error);
        throw new Error('AI 코치 응답 생성에 실패했습니다.');
    }
};

/**
 * OpenAI를 사용하여 식품의 영양 정보를 추정합니다.
 * @param {string} foodName - 식품명
 * @returns {object|null} 추정된 영양 정보 (calories, protein, carbs, fat) 또는 null
 */
exports.getNutritionEstimate = async (foodName) => {
    try {
        const prompt = `${foodName}의 일반적인 1회 제공량(또는 100g 기준)에 대한 칼로리(kcal), 단백질(g), 탄수화물(g), 지방(g)을 JSON 형식으로 알려줘. 정확한 숫자만 포함하고, 불필요한 설명은 제외해줘.
예시: {"calories": 150, "protein": 10, "carbs": 20, "fat": 5}`;

        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4o", // 또는 "gpt-3.5-turbo"
            messages: [
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }, // JSON 객체로 응답을 요청
        });

        const text = chatCompletion.choices[0].message.content;
        const parsed = JSON.parse(text);

        return {
            calories: parseFloat(parsed.calories) || 0,
            protein: parseFloat(parsed.protein) || 0,
            carbs: parseFloat(parsed.carbs) || 0,
            fat: parseFloat(parsed.fat) || 0,
        };

    } catch (error) {
        console.error('OpenAI를 통한 영양 정보 추정 중 오류 발생:', error);
        throw new Error("식품 영양성분 정보를 가져오는 데 실패했습니다.");
    }
};