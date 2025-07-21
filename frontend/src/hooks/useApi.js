import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';

const useApi = (endpoint, method = 'get', initialData = null, fetchImmediately = true) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (body = null, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        method: method,
        url: endpoint,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      };

      if (body && (method === 'post' || method === 'put' || method === 'patch')) {
        config.data = body;
      }
      if (Object.keys(params).length > 0 && method === 'get') {
        config.params = params;
      }

      const response = await apiClient(config);
      
      const newData = response.data;
      setData(prevData => {
        if (typeof newData === 'object' && newData !== null && !Array.isArray(newData)) {
          return { ...newData };
        }
        if (Array.isArray(newData)) {
          return [...newData];
        }
        return newData;
      });

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
      request();
    }
  }, [fetchImmediately, request]);

  const refetch = useCallback(() => {
    return request();
  }, [request]);
  
  const customSetData = useCallback((newData) => {
    setData(prevData => {
        if (typeof newData === 'object' && newData !== null && !Array.isArray(newData)) {
          return { ...newData };
        }
        if (Array.isArray(newData)) {
          return [...newData];
        }
        return newData;
      });
  }, []);


  return { data, loading, error, refetch, setData: customSetData };
};

export default useApi;