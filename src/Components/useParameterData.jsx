import { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRefreshInterval, buildAuthHeaders } from './elementUtils';

const API_PATH = 'dataservice_app/api/parameter_values/';

const buildModeParams = (ele, mode) => {
  if (mode === 'aggregate') {
    return { aggregation_type: ele.aggregate };
  }
  if (mode) {
    return { data_type: mode };
  }
  return {};
};

export const fetchParameterData = async (baseUrl, ele, mode) => {
  const token = await AsyncStorage.getItem('jwttoken');
  const params = { id: ele.id, ...buildModeParams(ele, mode) };

  if (ele.timeRange === 'custom') {
    params.from_date = ele.fromDate;
    params.to_date = ele.toDate;
  } else {
    params.time_frequency = ele.timeRange;
  }

  const response = await axios.get(`${baseUrl}${API_PATH}`, {
    ...buildAuthHeaders(token),
    params,
  });
  return response?.data?.data ?? null;
};

export const useParameterData = (baseUrl, ele, mode, refreshFreq) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!ele) {
      setData(null);
      return undefined;
    }

    let active = true;

    const load = async () => {
      try {
        const result = await fetchParameterData(baseUrl, ele, mode);
        if (active) {
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    load();

    const refreshTime = getRefreshInterval(refreshFreq);
    const intervalId = refreshTime ? setInterval(load, refreshTime) : null;

    return () => {
      active = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [baseUrl, ele, mode, refreshFreq]);

  return data;
};