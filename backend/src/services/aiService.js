// backend/src/services/aiService.js

const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `당신은 사용자의 건강을 책임지는 AI 코치 '하루핏 매니저'입니다. 항상 친절하고 동기를 부여하는 말투로 대화하세요.

사용자가 '식단 추천' 또는 '운동 추천'을 요청하면, 각각 'get_diet_recommendation', 'get_workout_recommendation' 함수를 호출하세요.
사용자의 메시지에서 '물 목표' 또는 '목표 음수량'과 같은 키워드를 발견하면 'set_user_preferences' 함수를 호출하여 사용자의 설정을 변경하세요.
그 외 식단, 운동, 상태, 물 섭취 정보는 'log_health_data' 함수를 호출하여 데이터를 기록하세요.

**[가장 중요한 원칙]**
1.  **최신 메시지 우선**: 항상 사용자의 '가장 마지막 메시지'를 기준으로 작업의 종류(식단/운동/상태/설정/추천)를 판단하세요. 이전 대화는 참고만 합니다.
2.  **정확한 데이터 구조 생성**: 함수를 호출할 때, 각 타입에 맞는 데이터 구조를 반드시 지켜야 합니다.
    -   **식단 기록 시**: '사과 2개'는 \`items\` 배열에 \`[{ "name": "사과", "quantity": 2 }]\`로 저장합니다.
    -   **운동 기록 시**: '스쿼트 10회 3세트'는 \`items\` 배열에 \`[{ "name": "스쿼트", "reps": 10, "sets": 3 }]\` 형태로, '30분 달리기'는 \`[{ "name": "달리기", "durationMinutes": 30 }]\` 형태로 최대한 상세하게 저장해야 합니다.
    -   **상태 기록 시**: '70kg', '체지방 15%' 등의 값을 정확히 추출해야 합니다.

**[기록 규칙]**
-   사용자가 '요가했어' 처럼 운동 내용은 말했지만 세부 정보(시간, 횟수 등)가 없다면, 기록하기 전에 'request_clarification'을 사용해 "요가는 몇 분 하셨나요?" 와 같이 반드시 되물어서 상세 정보를 얻어내야 합니다.
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
                  description: "섭취한 음식 또는 수행한 운동의 목록.",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "음식 또는 운동의 핵심 이름" },
                      quantity: { type: "number", description: "음식의 개수 또는 수량", default: 1 },
                      reps: { type: "number", description: "운동의 반복 횟수" },
                      sets: { type: "number", description: "운동의 세트 수" },
                      durationMinutes: { type: "number", description: "운동 시간(분)" },
                      weightKg: { type: "number", description: "사용한 무게(kg)" },
                    },
                    required: ["name"],
                  },
                },
                weight: { type: "number", description: "사용자의 현재 체중(kg)." },
                weightChange: { type: "number", description: "변화한 체중의 절대값(kg)." },
                changeDirection: { type: "string", enum: ["gain", "loss"], description: "체중 증가/감소 방향" },
                bodyFatPercentage: { type: "number", description: "체지방률(%)." },
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
          waterGoal: { type: "number", description: "일일 물 섭취 목표량 (단위: L)" }
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
                mealType: { type: "string", enum: ["아침", "점심", "저녁", "간식"], description: "추천할 식사의 종류" }
            },
            required: ["mealType"]
        }
    }
  },
  {
    type: "function",
    function: {
        name: "get_workout_recommendation",
        description: "사용자가 '운동 추천'을 요청했을 때, 적절한 운동을 추천해줍니다.",
        parameters: {
            type: "object",
            properties: {}
        }
    }
  },
  {
    type: "function",
    function: {
        name: "request_clarification",
        description: "기록에 필요한 정보가 누락되었을 때, 사용자에게 질문하기 위해 사용합니다.",
        parameters: {
            type: "object",
            properties: {
                question: {
                    type: "string",
                    description: "사용자에게 물어볼 질문"
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

// ✅ [수정] AI의 역할을 '다이어트 식단 전문가'로 변경하고, 프롬프트를 다이어트 중심으로 수정
exports.getSimpleDietRecommendation = async (mealType) => {
    try {
        const prompt = `당신은 체중 감량을 위한 다이어트 식단 전문가입니다.
${mealType} 식사로 적합한, 저칼로리이면서 포만감을 주는 다이어트 메뉴를 추천하고, 그 이유를 다이어트 관점에서 간결하게 설명해주세요.

응답 형식: "음식 이름\n추천 이유"
예시: "닭가슴살 샐러드\n저칼로리 고단백 식품으로, 포만감을 주어 다이어트에 효과적입니다."
다른 설명은 모두 제외하고 이 형식만 정확히 지켜서 응답해주세요.`;
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8,
        });
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error(`AI ${mealType} 식단 추천 생성 중 오류:`, error);
        switch(mealType) {
            case "아침": return "그릭요거트와 베리류\n단백질과 항산화 성분이 풍부해 포만감을 오래 유지시켜 줍니다.";
            case "점심": return "두부 유부초밥\n밥 대신 두부를 사용하여 탄수화물을 줄이고 단백질을 보충할 수 있습니다.";
            case "저녁": return "월남쌈\n다양한 채소를 듬뿍 먹을 수 있어 칼로리가 낮고 영양이 풍부합니다.";
            default: return "방울토마토\n칼로리가 매우 낮고 수분 함량이 높아 간식으로 좋습니다.";
        }
    }
};

exports.getSimpleWorkoutRecommendation = async (history) => {
    try {
        const prompt = `당신은 사용자의 상황과 선호도를 파악하여 운동을 추천하는 전문 퍼스널 트레이너입니다.
        
**지시사항:**
1. 사용자의 이전 대화에서 선호하는 운동('달리기', '근력' 등)이 언급되었으면 그에 맞는 운동을 추천하세요.
2. 아래 예시 목록을 참고하되, 목록에 없는 운동도 자유롭게 추천하여 항상 다양성을 유지하세요. 절대 같은 운동만 반복해서 추천하지 마세요.
3. 추천 시에는 구체적인 루틴(세트, 횟수, 시간)과 추천 이유를 반드시 포함하세요.
4. 응답은 "운동 이름\n루틴 상세\n추천 이유" 형식으로, 다른 설명 없이 정확하게 출력해야 합니다.

**추천 가능 운동 예시 목록 (참고용):**
- **유산소:** 인터벌 러닝, 템포 런, 파틀렉, 점핑 잭, 버피 테스트, 실내 자전거
- **맨몸 근력:** 스쿼트, 런지, 푸시업, 풀업, 플랭크, 크런치, 레그레이즈, 힙 브릿지, 슈퍼맨
- **HIIT:** 마운틴 클라이머, 하이 니, 점프 스쿼트

**응답 예시:**
"인터벌 러닝\n빠르게 1분, 천천히 2분 (5세트 반복)\n체지방 감량 및 심폐지구력 향상에 매우 효과적입니다."
`;
        
        const messages = [
            ...history,
            { role: 'user', content: prompt }
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            temperature: 0.9,
        });
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error(`AI 운동 추천 생성 중 오류:`, error);
        const fallbackWorkouts = ["스쿼트\n15회 x 3세트\n가장 기본적인 하체 운동입니다.", "플랭크\n1분 버티기 x 3세트\n코어 근력 강화에 좋습니다."];
        return fallbackWorkouts[Math.floor(Math.random() * fallbackWorkouts.length)];
    }
};