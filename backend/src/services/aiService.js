// backend/src/services/aiService.js

const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `당신은 사용자의 건강을 책임지는 AI 코치 '하루핏 매니저'입니다. 항상 친절하고 동기를 부여하는 말투로 대화하세요.

사용자가 '식단 추천'을 요청하면, 대화 맥락이나 현재 시간을 바탕으로 어떤 식사(아침/점심/저녁)에 대한 추천인지 판단하여 'get_diet_recommendation' 함수를 호출하세요. 판단이 어려우면 'request_clarification'으로 질문하세요.
사용자의 메시지에서 '물 목표' 또는 '목표 음수량'과 같은 키워드를 발견하면 'set_user_preferences' 함수를 호출하여 사용자의 설정을 변경하세요.
그 외 식단, 운동, 상태, 물 섭취 정보는 'log_health_data' 함수를 호출하여 데이터를 기록하세요.

**[가장 중요한 원칙]**
1.  **최신 메시지 우선**: 항상 사용자의 '가장 마지막 메시지'를 기준으로 작업의 종류(식단/운동/상태/설정/추천)를 판단하세요. 이전 대화는 참고만 합니다.
2.  **정확한 데이터 구조 생성**: 함수를 호출할 때, 각 타입에 맞는 데이터 구조를 반드시 지켜야 합니다.
    -   **식단 기록 시**: '사과 2개' 와 같은 메시지에서 \`items\` 배열을 추출하는 것은 가장 중요한 작업입니다. \`items\` 배열에는 반드시 \`[{ "name": "사과", "quantity": 2 }]\` 와 같은 내용이 포함되어야 합니다.
    -   **상태 기록 시**: '70kg', '체지방 15%' 등의 값을 정확히 추출해야 합니다.

**[기록 규칙]**
-   사용자가 제공한 정보가 불완전하더라도 (예: 체중만 말하거나) 일단 'log_health_data' 호출을 시도하세요.
-   '식단' 기록 시 '식사 시간' 정보가 없는 경우처럼, 기록 자체가 불가능한 필수 정보가 누락되었을 때만 'request_clarification'으로 질문하세요.
-   당신이 질문한 후 사용자가 답변하면, 그 답변과 이전 맥락을 종합하여 'log_health_data'를 다시 호출하세요.
`;

const tools = [
  {
    type: "function",
    function: {
      name: "log_health_data",
      description: "사용자의 메시지에서 식단, 운동, 신체 상태 정보를 발견했을 때 시스템에 기록합니다.",
      parameters: {
        type: "object",
        properties: {
          logs: {
            type: "array",
            description: "분석된 건강 데이터 로그의 배열",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["diet", "workout", "status", "water"], description: "기록 종류" },
                mealType: { type: "string", enum: ["아침", "점심", "저녁", "간식"], description: "식단 기록일 경우 식사 시간" },
                items: {
                  type: "array",
                  description: "섭취한 음식 또는 수행한 운동의 목록. 반드시 이름(name)과 수량(quantity)을 포함해야 합니다.",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "음식 또는 운동의 핵심 이름" },
                      quantity: { type: "number", description: "음식의 개수 또는 수량", default: 1 },
                    },
                    required: ["name"],
                  },
                },
                weight: { type: "number", description: "사용자의 현재 체중(kg). '몸무게 75kg' 같은 절대값." },
                weightChange: { type: "number", description: "변화한 체중의 절대값(kg). 예: '2kg 쪘어', '3kg 감량했어', '10키로 뺌' 등의 표현에서 숫자만 추출합니다." },
                changeDirection: { type: "string", enum: ["gain", "loss"], description: "체중이 증가했으면 'gain', 감소했으면 'loss'로 설정합니다. '쪘어', '늘었어' 등은 gain / '빠졌어', '감량', '줄었어', '뺌' 등은 loss로 해석합니다." },
                bodyFatPercentage: { type: "number", description: "체지방률(%). '체지방 20%', '체지방률 20퍼센트' 같은 표현을 처리합니다." },
                waterAmountMl: { type: "number", description: "마신 물의 양(ml)" },
              },
              required: ["type"],
            },
          },
        },
        required: ["logs"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_user_preferences",
      description: "사용자의 개인 설정(예: 물 목표량)을 변경합니다.",
      parameters: {
        type: "object",
        properties: {
          waterGoal: {
            type: "number",
            description: "사용자가 설정하려는 일일 물 섭취 목표량 (단위: L). 예: '물 목표 3리터로' -> 3"
          }
        },
        required: ["waterGoal"]
      }
    }
  },
  {
    type: "function",
    function: {
        name: "get_diet_recommendation",
        description: "사용자가 식단 추천을 요청했을 때, 지정된 식사 시간에 맞는 메뉴를 추천해줍니다.",
        parameters: {
            type: "object",
            properties: {
                mealType: {
                    type: "string",
                    enum: ["아침", "점심", "저녁", "간식"],
                    description: "추천할 식사의 종류. 예: '점심 메뉴 추천해줘' -> '점심'"
                }
            },
            required: ["mealType"]
        }
    }
  },
  {
    type: "function",
    function: {
        name: "request_clarification",
        description: "식사 시간 등 기록에 반드시 필요한 정보가 누락되었을 때, 사용자에게 질문하기 위해 사용합니다.",
        parameters: {
            type: "object",
            properties: {
                question: {
                    type: "string",
                    description: "사용자에게 물어볼 질문. 예: '언제 드신 건가요? (아침/점심/저녁)'"
                }
            },
            required: ["question"]
        }
    }
  }
];

exports.getAiChatResponse = async (userMessage, history, user) => {
    try {
        const messages = [ { role: "system", content: systemPrompt }, ...history, { role: "user", content: `(참고: 내 닉네임은 ${user.nickname}이야) ${userMessage}` } ];
        const response = await openai.chat.completions.create({ model: "gpt-4o", messages: messages, tools: tools, tool_choice: "auto" });
        return response.choices[0].message;
    } catch (error) {
        console.error('AI 응답 생성 중 오류 발생:', error);
        throw new Error('하루핏 AI 매니저의 응답 생성에 실패했습니다.');
    }
};

exports.getNutritionEstimate = async (foodName) => {
    try {
        const prompt = `${foodName}의 일반적인 1인분 기준 칼로리(kcal), 단백질(g), 탄수화물(g), 지방(g)을 JSON 형식으로 알려줘. 음식 이름이나 '1인분' 같은 부가 설명은 모두 제외하고 오직 JSON 객체만 반환해줘. 예시: {"calories": 800, "protein": 30, "carbs": 90, "fat": 35}`;
        const chatCompletion = await openai.chat.completions.create({ model: "gpt-4o", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" } });
        const text = chatCompletion.choices[0].message.content;
        return JSON.parse(text);
    } catch (error) {
        console.error(`[Haru-Fit Service] "${foodName}"의 영양 정보 조회 중 오류가 발생하여 기본값(0)으로 대체합니다.`);
        return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
};

exports.getSimpleDietRecommendation = async (mealType) => {
    try {
        const prompt = `맛있고 건강한 ${mealType} 식사 메뉴 딱 하나만 추천해줘. 다른 설명은 모두 제외하고 오직 음식 이름만 응답해줘. 예: 닭가슴살 샐러드`;
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
        });
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error(`AI ${mealType} 식단 추천 생성 중 오류:`, error);
        switch(mealType) {
            case "아침": return "그릭요거트";
            case "점심": return "퀴노아 샐러드";
            case "저녁": return "오븐에 구운 연어";
            default: return "견과류 한 줌";
        }
    }
};