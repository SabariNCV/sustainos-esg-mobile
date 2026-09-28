import { PixelRatio } from 'react-native';

const CONDITION_CHECKS = {
  minMax: (value, { min, max }) => value > Number.parseFloat(min) && value < Number.parseFloat(max),
  greaterThan: (value, { min }) => value > Number.parseFloat(min),
  lessThan: (value, { max }) => value < Number.parseFloat(max),
  greaterThanEquall: (value, { min }) => value >= Number.parseFloat(min),
  lessThanEquall: (value, { max }) => value <= Number.parseFloat(max),
};

const REFRESH_UNIT_MS = {
  Second: 1000,
  Minute: 60000,
  Hours: 3600000,
};

const formatEventDate = (date) => date?.toISOString()?.slice(0, 19)?.replace('T', ' ');

export const getShapeData = (list, id, tabShape) => {
  if (tabShape) {
    return list.find((item) => item.id === id)?.dataIs;
  }
  return list[id]?.dataIs;
};

export const roundPx = (value) => PixelRatio.roundToNearestPixel(Number(value));

export const buildEventRange = (eventDates) => [
  formatEventDate(eventDates?.[0]),
  formatEventDate(eventDates?.[1]),
];

export const parseRefreshTime = (refreshFreq = '') => {
  const [count, unit] = refreshFreq.split(' ');
  const multiplier = REFRESH_UNIT_MS[unit];
  return multiplier ? Number.parseInt(count, 10) * multiplier : null;
};

export const resolveShapeColor = (value, ranges, defaultColor) => {
  const numeric = Number.parseFloat(value);
  return (ranges ?? []).reduce((color, range) => {
    const check = CONDITION_CHECKS[range.condition];
    return check?.(numeric, range) ? range.color : color;
  }, defaultColor);
};

export const hasRequiredLayout = (shape, requireRotation = true) => {
  const hasBase = Boolean(shape?.position && shape.width && shape.height);
  if (!requireRotation) {
    return hasBase;
  }
  return hasBase && Boolean(shape.SquareBg) && shape.rotation != null;
};

export const clampHorizontal = (rect, screenWidth, rotation = 0) => {
  if (Number(rotation) % 180 !== 0) {
    return rect;
  }
  const width = Math.min(rect.width, screenWidth);
  const left = Math.min(Math.max(rect.left, 0), screenWidth - width);
  return { ...rect, left, width };
};

export const fitTextBox = (left, screenWidth) => {
  const safeLeft = Math.min(Math.max(left, 0), screenWidth);
  return { left: safeLeft, maxWidth: screenWidth - safeLeft };
};

export const calculateProgress = (value, min, max) => {
  const isValid = [value, min, max].every(Number.isFinite) && max > min;
  if (!isValid || value <= min) {
    return 0;
  }
  if (value >= max) {
    return 100;
  }
  return ((value - min) / (max - min)) * 100;
};