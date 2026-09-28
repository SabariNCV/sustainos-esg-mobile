import { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimingsConversion } from '../Screens/MainContent/TimingsConversion';
import { parseRefreshTime } from './shapeUtils';

const API_PATH = 'dataservice_app/api/parameter_values/';

const resolveDateRange = (shape, dateRange) => {
  if (dateRange) {
    return dateRange;
  }
  if (shape.aggregateTime === 'custom') {
    return [shape.fromDate, shape.toDate];
  }
  return TimingsConversion(shape.aggregateTime);
};

const buildRequestParams = (shape, forceRange, dateRange) => {
  const parameterIds = shape.parameters.map((item) => item.parameterId);
  const filterCondition = {};
  const filterTags = new Set();

  shape.parameters.forEach((item) => {
    filterCondition[item.parameterId] = item.fiterConditionsNewFormat.join(' ');
    item.fiterConditionsNewFormat.forEach((condition) => {
      const paramId = condition.split(' ')[0];
      if (!parameterIds.includes(Number.parseInt(paramId, 10))) {
        filterTags.add(paramId);
      }
    });
  });
  filterCondition.filter_tags = [...filterTags].join(',');

  const params = {
    id: parameterIds.join(','),
    aggregation_type: shape.aggregateRange,
    filter_condition: JSON.stringify(filterCondition),
  };

  if (shape.aggregateTime === 'custom' || forceRange || dateRange) {
    const [fromDate, toDate] = resolveDateRange(shape, dateRange);
    params.from_date = fromDate;
    params.to_date = toDate;
  } else {
    params.time_frequency = shape.aggregateTime;
  }

  return { params, firstId: parameterIds[0] };
};

export const useShapeValue = (shape, baseUrl, forceRange = false, dateRange = null) => {
  const [value, setValue] = useState('');
  const kind = shape?.shapeType ?? shape?.labelType;
  const isDynamic = kind === 'dynamic' && shape?.parameters?.length > 0;

  useEffect(() => {
    if (!isDynamic) {
      return undefined;
    }

    let active = true;

    const fetchValue = async () => {
      try {
        const { params, firstId } = buildRequestParams(shape, forceRange, dateRange);
        const token = await AsyncStorage.getItem('jwttoken');
        const response = await axios.get(`${baseUrl}${API_PATH}`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data.data;
        if (active && data) {
          setValue(data[firstId]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchValue();

    const refreshTime = parseRefreshTime(shape.refreshFreq);
    const intervalId = refreshTime ? setInterval(fetchValue, refreshTime) : null;

    return () => {
      active = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [shape, baseUrl, forceRange, dateRange, isDynamic]);

  return value;
};