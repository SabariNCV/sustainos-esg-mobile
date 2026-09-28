import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimingsConversion } from '../../Screens/MainContent/TimingsConversion';

const API_PATH = 'dataservice_app/api/parameter_values/';

const REFRESH_UNITS = {
  Second: 1000,
  Minute: 60 * 1000,
  Hours: 60 * 60 * 1000,
};

const RANGE_MATCHERS = {
  minMax: (value, { min, max }) => value > Number.parseFloat(min) && value < Number.parseFloat(max),
  greaterThan: (value, { min }) => value > Number.parseFloat(min),
  lessThan: (value, { max }) => value < Number.parseFloat(max),
  greaterThanEquall: (value, { min }) => value >= Number.parseFloat(min),
  lessThanEquall: (value, { max }) => value <= Number.parseFloat(max),
};

export const getRefreshTime = (refreshFreq = '') => {
  const [amount, unit] = refreshFreq.split(' ');
  const multiplier = REFRESH_UNITS[unit];
  const time = Number.parseInt(amount, 10) * multiplier;
  return Number.isFinite(time) && time > 0 ? time : null;
};

export const getShapeColor = (value, defaultColor, ranges = []) => {
  const numericValue = Number.parseFloat(value);
  return ranges.reduce(
    (color, range) => (RANGE_MATCHERS[range.condition]?.(numericValue, range) ? range.color : color),
    defaultColor
  );
};

const buildFilterCondition = (parameters) => {
  const parameterIds = parameters.map((item) => item.parameterId);
  const requestBody = {};
  const filterTags = new Set();

  parameters.forEach(({ parameterId, fiterConditionsNewFormat }) => {
    requestBody[parameterId] = fiterConditionsNewFormat.join(' ');
    fiterConditionsNewFormat.forEach((condition) => {
      const [paramId] = condition.split(' ');
      if (!parameterIds.includes(Number.parseInt(paramId, 10))) {
        filterTags.add(paramId);
      }
    });
  });

  requestBody.filter_tags = [...filterTags].join(',');
  return { parameterIds, requestBody };
};

const resolveDateRange = (shapeStyles) =>
  shapeStyles.aggregateTime === 'custom'
    ? [shapeStyles.fromDate, shapeStyles.toDate]
    : TimingsConversion(shapeStyles.aggregateTime);

const buildRequest = (shapeStyles, useDateRange) => {
  const { parameterIds, requestBody } = buildFilterCondition(shapeStyles.parameters);
  const params = {
    id: parameterIds.join(','),
    aggregation_type: shapeStyles.aggregateRange,
    filter_condition: JSON.stringify(requestBody),
  };

  if (shapeStyles.aggregateTime === 'custom' || useDateRange) {
    const [fromDate, toDate] = resolveDateRange(shapeStyles);
    return { params: { ...params, from_date: fromDate, to_date: toDate }, primaryId: parameterIds[0] };
  }

  return { params: { ...params, time_frequency: shapeStyles.aggregateTime }, primaryId: parameterIds[0] };
};

export const useShapeColor = (shapeStyles, useDateRange = false) => {
  const baseUrl = useSelector((state) => state.mainSlice.baseUrlIs);
  const [shapeValue, setShapeValue] = useState('');

  useEffect(() => {
    if (shapeStyles?.shapeType !== 'dynamic' || !shapeStyles.parameters?.length) {
      return undefined;
    }

    let active = true;
    const controller = new AbortController();

    const fetchValue = async () => {
      try {
        const token = await AsyncStorage.getItem('jwttoken');
        const { params, primaryId } = buildRequest(shapeStyles, useDateRange);
        const response = await axios.get(`${baseUrl}${API_PATH}`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = response.data?.data;
        if (active && data) {
          setShapeValue(data[primaryId]);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchValue();
    const refreshTime = getRefreshTime(shapeStyles.refreshFreq);
    const intervalId = refreshTime ? setInterval(fetchValue, refreshTime) : null;

    return () => {
      active = false;
      controller.abort();
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [shapeStyles, baseUrl, useDateRange]);

  return useMemo(
    () => getShapeColor(shapeValue, shapeStyles?.SquareBg, shapeStyles?.shapeValueRange),
    [shapeValue, shapeStyles?.SquareBg, shapeStyles?.shapeValueRange]
  );
};