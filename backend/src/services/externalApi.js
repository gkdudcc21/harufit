// backend/src/services/externalApi.js
const axios = require('axios'); // axios 라이브러리가 필요합니다. (npm install axios)
require('dotenv').config(); // .env 파일 로드

const MFDS_API_KEY = process.env.MFDS_API_KEY;
const MFDS_ENDPOINT = 'https://apis.data.go.kr/1471000/FoodNtrCpnntDbInfo02'; // 식약처 API End Point

/**
 * 식약처 API를 통해 식품 영양성분 정보를 조회합니다.
 * @param {string} foodName - 조회할 식품명
 * @returns {Promise<Array>} 조회된 식품 영양성분 데이터 배열
 */
exports.getFoodNutritionInfo = async (foodName) => {
    try {
        // API 호출 파라미터 설정
        // 기본 파라미터는 식약처 API 가이드에 따라 설정 (pageNo, numOfRows, type 등)
        // item_name은 조회할 식품명입니다.
        const response = await axios.get(MFDS_ENDPOINT, {
            params: {
                serviceKey: MFDS_API_KEY, // 인증키
                item_name: foodName,       // 식품명 (검색어)
                pageNo: 1,                 // 페이지 번호
                numOfRows: 10,             // 한 페이지 결과 수
                type: 'json'               // 응답 데이터 형식 (JSON)
            }
        });

        // API 응답 데이터 확인
        const data = response.data;
        if (data && data.body && data.body.items) {
            // 실제 필요한 영양성분 데이터만 필터링하거나 가공할 수 있습니다.
            return data.body.items;
        } else {
            console.warn('식약처 API 응답에 데이터가 없거나 형식이 다릅니다:', data);
            return [];
        }

    } catch (error) {
        console.error('식약처 API 호출 중 오류 발생:', error.response ? error.response.data : error.message);
        throw new Error("식품 영양성분 정보를 가져오는 데 실패했습니다.");
    }
};

// 운동 관련 API는 추후 필요시 여기에 추가할 수 있습니다.
// exports.getExerciseInfo = async (exerciseName) => { /* ... */ };