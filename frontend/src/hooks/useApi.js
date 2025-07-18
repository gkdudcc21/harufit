import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';

const useApi = (endpoint, method = 'get', initialData = null, fetchImmediately = true) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ [수정] 기존 execute 함수의 이름을 request로 변경하여 내부에서만 사용합니다.
  const request = useCallback(async (body = null, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        method: method,
        url: endpoint,
      };

      if (body && (method === 'post' || method === 'put' || method === 'patch')) {
        config.data = body;
      }
      if (Object.keys(params).length > 0 && method === 'get') {
        config.params = params;
      }

      const response = await apiClient(config);
      setData(response.data);
      return response.data;
    } catch (err) {
      console.error(`[useApi] API 호출 실패 (${endpoint}):`, err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, method]);

  useEffect(() => {
    if (fetchImmediately) {
      request(); // 컴포넌트가 처음 보일 때 데이터를 불러옵니다.
    }
  }, [fetchImmediately, request]);

  // ✅ [추가] 외부에서 데이터를 다시 불러올 수 있도록 refetch 함수를 노출시킵니다.
  const refetch = useCallback(() => {
    return request();
  }, [request]);

  // ✅ [수정] 반환 객체에 refetch 함수를 추가합니다. execute는 refetch로 이름을 바꿉니다.
  return { data, loading, error, refetch, setData };
};

export default useApi;