// backend/src/services/aiService.js
const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ [수정] AI가 '상태' 정보도 추출하도록 시스템 프롬프트를 강화합니다.
const systemPrompt = `당신은 사용자의 건강을 책임지는 AI 코치입니다. 스스로를 '하루핏 매니저'라고 칭하세요. 단, AI 기술, 데이터 분석 등 기술적인 측면을 강조해야 할 때는 '하루핏 AI 매니저'라고 칭할 수 있습니다. 항상 친절하고 동기를 부여하는 말투로 대화하세요.
사용자의 메시지에서 식단, 운동, 또는 '상태'(체중, 체지방 등) 기록을 발견하면, 자연스러운 대화 응답을 먼저 하세요.
그 다음, **줄을 바꾸고 반드시 \`[DATA_START]\`와 \`[DATA_END]\` 사이에** 추출한 정보를 JSON 형식으로 추가하세요.
JSON 데이터가 없다면 \`[DATA_START]\` 블록을 포함하지 마세요.

- 식단 JSON: {"type": "diet", "mealType": "아침/점심/저녁/간식", "items": [{"name": "음식1"}, {"name": "음식2"}]}
- 운동 JSON: {"type": "workout", "workoutType": "유산소/근력/기타", "items": [{"name": "운동1", "durationMinutes": 30}, {"name": "운동2", "sets": 3, "reps": 10}]}
- 상태 JSON: {"type": "status", "weight": 75.5, "bodyFatPercentage": 22.1}

예시 1:
사용자: 오늘 아침에 닭가슴살 샐러드 먹고 저녁엔 짬뽕 먹었어. 그리고 몸무게 재보니까 75.5kg야.
당신: 닭가슴살 샐러드, 건강한 식단이네요! 체중도 꾸준히 기록하는 모습 정말 멋져요.
[DATA_START]
{"type": "diet", "mealType": "아침", "items": [{"name": "닭가슴살 샐러드"}]}
[DATA_END]
[DATA_START]
{"type": "diet", "mealType": "저녁", "items": [{"name": "짬뽕"}]}
[DATA_END]
[DATA_START]
{"type": "status", "weight": 75.5}
[DATA_END]
`;

exports.getAiChatResponse = async (userMessage, history, userContext) => {
    try {
        const messages = [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: `(참고: 내 닉네임은 ${userContext.nickname}이야) ${userMessage}` }
        ];

        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
        });

        const fullResponse = chatCompletion.choices[0].message.content;

        const conversationalReply = fullResponse.split('[DATA_START]')[0].trim();
        const extractedData = [];
        
        const dataRegex = /\[DATA_START\]([\s\S]*?)\[DATA_END\]/g;
        let match;
        while ((match = dataRegex.exec(fullResponse)) !== null) {
            try {
                extractedData.push(JSON.parse(match[1].trim()));
            } catch (e) {
                console.error("JSON 파싱 오류:", e);
            }
        }

        return {
            conversationalReply,
            extractedData: extractedData.length > 0 ? extractedData : null,
        };

    } catch (error) {
        console.error('AI 응답 생성 중 오류 발생:', error);
        throw new Error('하루핏 AI 매니저의 응답 생성에 실패했습니다.');
    }
};

exports.getNutritionEstimate = async (foodName) => {
    try {
        const prompt = `${foodName}의 일반적인 1회 제공량(또는 100g 기준)에 대한 칼로리(kcal), 단백질(g), 탄수화물(g), 지방(g)을 JSON 형식으로 알려줘. 정확한 숫자만 포함하고, 불필요한 설명은 제외해줘.
    예시: {"calories": 150, "protein": 10, "carbs": 20, "fat": 5}`;

        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const text = chatCompletion.choices[0].message.content;
        return JSON.parse(text);

    } catch (error) {
        console.error('OpenAI를 통한 영양 정보 추정 중 오류 발생:', error);
        throw new Error("식품 영양성분 정보를 가져오는 데 실패했습니다.");
    }
};