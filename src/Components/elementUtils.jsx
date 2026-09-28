import axios from 'axios';

const REFRESH_MULTIPLIERS = {
  Second: 1000,
  Minute: 1000 * 60,
  Hour: 1000 * 60 * 60,
  Hours: 1000 * 60 * 60,
};

export const parseHeight = (value) => {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'string') return value;
  return value.includes('px') ? Number.parseFloat(value.replace('px', '')) : Number.parseFloat(value);
};

export const parseFontSize = (fontSize) => {
  if (typeof fontSize === 'string') {
    return Number.parseInt(fontSize.replace('px', ''), 10);
  }
  console.warn('Unexpected fontSize value:', fontSize);
  return 12;
};

export const getRefreshInterval = (refreshFreq) => {
  if (!refreshFreq) return null;
  const [amount, unit] = refreshFreq.split(' ');
  const value = Number.parseInt(amount, 10);
  if (Number.isNaN(value) || !REFRESH_MULTIPLIERS[unit]) return null;
  return value * REFRESH_MULTIPLIERS[unit];
};

export const buildAuthHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const buildFilterRequestBody = (parameters = []) => {
  const requestBody = {};
  const filterTags = new Set();
  const parametersId = parameters.map((ele) => ele.parameterId);
  parameters.forEach((item) => {
    const conditions = (item.fiterConditionsNewFormat || []).join(' ');
    requestBody[item.parameterId] = conditions;
    (item.fiterConditionsNewFormat || []).forEach((condition) => {
      const paramId = condition.split(' ')[0];
      if (!parametersId.includes(parseInt(paramId, 10)) && !filterTags.has(paramId)) {
        filterTags.add(paramId);
      }
    });
  });
  requestBody.filter_tags = Array.from(filterTags).join(',');
  return requestBody;
};

export const evaluateColorRange = (colorTable = [], value, defaultColor = '#000') => {
  const numericValue = Number.parseFloat(value);
  const match = (colorTable || []).find((rule) => {
    switch (rule.condition) {
      case 'minMax':
        return numericValue > Number.parseFloat(rule.min) && numericValue < Number.parseFloat(rule.max);
      case 'greaterThan':
        return numericValue > Number.parseFloat(rule.max);
      case 'lessThan':
        return numericValue < Number.parseFloat(rule.max);
      case 'greaterThanEquall':
        return numericValue >= Number.parseFloat(rule.max);
      case 'lessThanEquall':
        return numericValue <= Number.parseFloat(rule.max);
      case 'text':
        return String(value) === String(rule.max);
      default:
        return false;
    }
  });
  return match ? match.color : defaultColor;
};

export const fetchParameterValue = async (url, token) => {
  const response = await axios.get(url, buildAuthHeaders(token));
  return response?.data?.data;
};