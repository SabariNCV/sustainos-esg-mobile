import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateHeight } from '../Redux/ReduxSlice/mainSlice';

export const ANALYTICS = 'analytics';
export const PANEL = 'panel';

const PAPER = 'paper';
const GRID_DASH = 'dot';
const GRID_SHAPE = 'linear';
const DEFAULT_FONT = 'Nunito';
const DEFAULT_GRID_COLOR = '#b3b0b0ff';
const AXIS_SPACING = 0.06;
const AXIS_DOMAIN_PADDING = 0.03;
const HIDDEN_AXIS = { showgrid: false, zeroline: false, showline: false, showticklabels: false };
const RANGED_AGGREGATES = new Set(['custom', 'Days', 'Hours', 'Month', 'Past Month']);
const CHART_INSIGHT_URL = 'https://SustainOS.ai:9012/services/upload_chart/';

export const DEFAULT_CHART_COLORS = [
  '#00A68F', '#528CFA', '#FF8810', '#C46253', '#7E01A9',
  '#CF2020', '#FFBB10', '#748C76', '#DF9F4E', '#9B79FF',
];

export const HEATMAP_PALETTES = [
  'none',
  [[0, '#C5E2EC'], [0.2, '#9DC4D3'], [0.5, '#74A7B9'], [0.8, '#48879D'], [1, '#236D86']],
  [[0, '#00F5E7'], [0.2, '#00F8E0'], [0.5, '#00F3D4'], [0.8, '#00DEC4'], [1, '#34E9CC']],
  [[0, '#FACBC5'], [0.2, '#F89B89'], [0.5, '#F25B2C'], [0.8, '#D95737'], [1, '#943D22']],
  [[0, '#448C82'], [0.2, '#A7C1A4'], [0.5, '#F0EBD7'], [0.8, '#E6A777'], [1, '#C35E34']],
  [[0, '#FDFFE1'], [0.2, '#F6C250'], [0.5, '#E54788'], [0.8, '#8D0F9B'], [1, '#4B1D93']],
  [[0, '#6824FF'], [0.2, '#1C93EF'], [0.5, '#83FFB3'], [0.8, '#FD9B4F'], [1, '#FE3116']],
  [[0, '#8E025B'], [0.2, '#A20169'], [0.5, '#F8B9D8'], [0.8, '#DA5632'], [1, '#913D21']],
  [[0, '#006C74'], [0.2, '#018A99'], [0.5, '#97D6DB'], [0.8, '#0091AD'], [1, '#006E7E']],
  [[0, '#4A1668'], [0.2, '#5A2889'], [0.5, '#AC92BE'], [0.8, '#F3893A'], [1, '#E3701F']],
];

const REFRESH_MULTIPLIERS = {
  Second: 1000,
  Minute: 1000 * 60,
  Hours: 1000 * 60 * 60,
};

const BASE_DETAILS = {
  plotAreaBg: '#fff', plotAreaOutline: DEFAULT_GRID_COLOR, areaBackground: '#fff', areaOutline: '#fff',
  isGridPresent: true, toolTip: true, showLegend: true, legend: { x: 0.5, y: 1.1 }, chartType: 'horizontal', barGap: 0.3, donutGap: 0.6, scatterType: 'bubble',
  fSize: '10', fFamily: DEFAULT_FONT, isBold: false, isItalic: false, isUnderLine: false, isCaseChange: false, legendType: 'name', isTitleOpen: false,
  fontColor: '#33A9AC', fontBgColor: '#fff', legendTop: false, legendBottom: false, legendLeft: false, legendRight: false, xGridColor: '#000', yGridColor: '#C6D0DC',
  xBold: false, xFontColor: DEFAULT_GRID_COLOR, xFonntSize: '10', xfFamily: DEFAULT_FONT, yBold: false, yFontColor: DEFAULT_GRID_COLOR,
  yFonntSize: '10', yfFamily: DEFAULT_FONT, textPosition: false, textInside: true, textOutSide: false,
  YGap: 0.3, heatColorRange: 'none', HeatpaletNo: 0, parameters: [], refreshFreq: 'None', timeRange: '5 Minute', subSup: 'Enter The Title', legendWeight: '14px', legendFamily: DEFAULT_FONT,
};

export const createBasicDetails = (chartTitle, overrides = {}) => ({ ...BASE_DETAILS, chartTitle, ...overrides });

export const buildChartPropTypes = (pageKey = 'paged') => ({
  chartId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  chartList: PropTypes.shape({
    multiAxis: PropTypes.bool,
    parameters: PropTypes.arrayOf(PropTypes.object),
    parametrList: PropTypes.arrayOf(PropTypes.object),
    fromdateIs: PropTypes.string,
    toDateIs: PropTypes.string,
    aggregateTime: PropTypes.string,
    aggregateRange: PropTypes.string,
    barType: PropTypes.string,
  }),
  checkTheCond: PropTypes.object,
  [pageKey]: PropTypes.string,
  showtitle: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  xIs: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  yIs: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  type: PropTypes.string,
});

export const parseHeight = (value) => {
  if (typeof value !== 'string') return value;
  return value.includes('px') ? Number.parseFloat(value.replace('px', '')) : Number.parseFloat(value);
};

export const getRefreshInterval = (refreshFreq) => {
  if (!refreshFreq) return null;
  const [amount, unit] = refreshFreq.split(' ');
  const value = Number.parseInt(amount, 10);
  if (Number.isNaN(value) || !REFRESH_MULTIPLIERS[unit]) return null;
  return value * REFRESH_MULTIPLIERS[unit];
};

const formatLocalDate = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const getPanelDateRange = (eventDatesIs) => {
  const [fromRaw, toRaw] = eventDatesIs || [];
  const fromDateObj = new Date(fromRaw);
  const toDateObj = new Date(toRaw);
  const halfDifferenceInMillis = (toDateObj.getTime() - fromDateObj.getTime()) / 2;
  return {
    fromDate: formatLocalDate(new Date(fromDateObj.getTime() - halfDifferenceInMillis)),
    toDate: formatLocalDate(new Date(toDateObj.getTime() + halfDifferenceInMillis)),
  };
};

export const buildFilterRequestBody = (parameters = [], parametersId = []) => {
  const requestBody = {};
  const filterTags = new Set();
  parameters.forEach((item) => {
    const conditions = (item.fiterConditionsNewFormat || []).join(' ');
    requestBody[item.parameterId] = conditions;
    (item.fiterConditionsNewFormat || []).forEach((condition) => {
      const paramId = condition.split(' ')[0];
      if (!parametersId.includes(Number.parseInt(paramId, 10)) && !filterTags.has(paramId)) {
        filterTags.add(paramId);
      }
    });
  });
  requestBody.filter_tags = Array.from(filterTags).join(',');
  return requestBody;
};

export const buildBoundsMap = (parameters = []) => parameters.reduce((acc, item) => {
  acc[item.parameterId] = { ub: item.upperBoundValue, lb: item.lowerBoundValue };
  return acc;
}, {});

export const resolveTimeRange = ({ isPanel, isCustom, eventDatesIs, fromDate, toDate, aggregateTime, timingsConverter }) => {
  if (isPanel) {
    return getPanelDateRange(eventDatesIs);
  }
  if (isCustom) {
    return { fromDate, toDate };
  }
  const [from, to] = timingsConverter(aggregateTime);
  return { fromDate: from, toDate: to };
};

export const buildAuthHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const isAnalyticsPage = (paged) => typeof paged === 'string' && paged.toLowerCase() === ANALYTICS;

export const buildParameterMaps = (parameters = [], defaultColors = DEFAULT_CHART_COLORS) => {
  const markerColor = {};
  const parametersName = {};
  const globalName = {};
  const parmUnits = {};
  const analyticGlobal = {};
  const analyticColor = {};
  parameters.forEach((obj, index) => {
    markerColor[obj.parameterId] = obj.parameterColor;
    parametersName[obj.parameterId] = obj.name;
    globalName[obj.parameterId] = obj.global;
    parmUnits[obj.parameterId] = obj.paramUnit;
    analyticGlobal[obj.parameterId] = obj.globalCode;
    analyticColor[obj.parameterId] = defaultColors[index];
  });
  return { markerColor, parametersName, globalName, parmUnits, analyticGlobal, analyticColor };
};

export const getLegendName = ({ paged, key, legendType, analyticGlobal, parametersName, globalName, parmUnits }) => {
  const unit = `(${parmUnits[key]})`;
  if (isAnalyticsPage(paged)) {
    return `${analyticGlobal[key]}${unit}`;
  }
  return legendType === 'name' ? `${parametersName[key]}${unit}` : `${globalName[key]}${unit}`;
};

export const buildMultiAxisXDomain = (parametersCount, spacing = 0.03) => {
  let leftPosition = 0;
  let rightPosition = 1;
  let leftPositionMax = leftPosition;
  let rightPositionMax = rightPosition;
  const positions = [];
  for (let index = 0; index < parametersCount; index += 1) {
    const isLeft = (index + 1) % 2 !== 0;
    const position = isLeft ? leftPosition : rightPosition;
    if (isLeft) {
      leftPosition += spacing;
      leftPositionMax = Math.max(leftPositionMax, leftPosition);
    } else {
      rightPosition -= spacing;
      rightPositionMax = Math.min(rightPositionMax, rightPosition);
    }
    positions.push(position);
  }
  return { positions, leftPositionMax, rightPositionMax };
};

export const captureChartInsight = async (imageUri, chartTitle, verticalName, { onSuccess, onError } = {}) => {
  try {
    const response = await axios.post(CHART_INSIGHT_URL, {
      image: imageUri,
      chart_title: chartTitle,
      vertical_name: verticalName,
    });
    onSuccess?.(response.data.summary);
  } catch (error) {
    onError?.(error);
  }
};

export const buildChartColors = ({ paged, checkTheCond, chartId, storageKey, basicDetails, sizeProps, analyticsExtras = {} }) => {
  if (isAnalyticsPage(paged)) {
    return { ...basicDetails, ...analyticsExtras, reSizeProperties: sizeProps };
  }
  const stored = checkTheCond?.[chartId]?.[storageKey] || {};
  return { ...stored, reSizeProperties: stored.reSizeProperties ?? sizeProps };
};

export const resolveChartRange = ({ paged, chartList, colors, isPanel, eventDatesIs, timingsConverter }) => {
  if (isAnalyticsPage(paged)) {
    return { fromDate: chartList?.fromdateIs, toDate: chartList?.toDateIs };
  }
  return resolveTimeRange({
    isPanel,
    isCustom: colors?.aggregateTime === 'custom',
    eventDatesIs,
    fromDate: colors?.fromDate,
    toDate: colors?.toDate,
    aggregateTime: colors?.aggregateTime,
    timingsConverter,
  });
};

export const buildRequestUrl = ({ baseUrl, parametersId, paramData, fromDate, toDate, requestBody, isPanel, dataType, extraParams = '' }) => {
  const filter = JSON.stringify(requestBody);
  const root = `${baseUrl}dataservice_app/api/parameter_values/?id=${parametersId}&data_type=${dataType}${extraParams}`;
  if (isPanel || RANGED_AGGREGATES.has(paramData?.aggregateTime)) {
    return `${root}&from_date=${fromDate}&to_date=${toDate}&filter_condition=${filter}`;
  }
  return `${root}&time_frequency=${paramData?.aggregateTime}&filter_condition=${filter}`;
};

const fetchChartPayload = async (url) => {
  const token = await AsyncStorage.getItem('jwttoken');
  const response = await axios.get(url, buildAuthHeaders(token));
  return response.data;
};

const selectPayloadData = (payload) => payload?.data;

export const loadChartData = async ({
  url, buildTraces, setTracesIs, setNoData, setLoading, selectData = selectPayloadData, emptyResult = [],
}) => {
  try {
    const payload = await fetchChartPayload(url);
    const data = selectData(payload);
    const isEmpty = !data || Object.keys(data).length === 0;
    setNoData(isEmpty);
    setTracesIs(isEmpty ? emptyResult : buildTraces(data));
  } catch (error) {
    setNoData(true);
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
};

export const resolveHoverInfo = (enabled) => (enabled ? 'all' : 'none');

export const resolveSeriesColor = (paged, index, parameter) => (
  isAnalyticsPage(paged) ? DEFAULT_CHART_COLORS[index] : parameter?.parameterColor
);

export const buildParameterLabel = (parameter, paged, legendType) => {
  const unit = `(${parameter?.paramUnit})`;
  if (isAnalyticsPage(paged)) {
    return `${parameter?.globalCode}${unit}`;
  }
  return `${legendType === 'name' ? parameter?.name : parameter?.global}${unit}`;
};

export const buildSeriesName = ({ paged, paramData, index }) => {
  const parameter = paramData?.parameters?.[index];
  const unit = `(${parameter?.paramUnit})`;
  if (isAnalyticsPage(paged)) {
    return `${paramData?.parametrList?.[index]?.globalCode}${unit}`;
  }
  return `${paramData?.legendType === 'name' ? parameter?.name : parameter?.global}${unit}`;
};

export const collectSeries = (data, paramId) => {
  const x = [];
  const y = [];
  Object.entries(data).forEach(([timestamp, values]) => {
    x.push(timestamp);
    y.push(values[paramId] || null);
  });
  return { x, y };
};

const buildTickFont = (family, color, bold) => ({
  family,
  size: 10,
  color,
  weight: bold ? 'bold' : 'normal',
});

const buildXAxis = (colors) => ({
  autorange: true,
  showgrid: colors?.isGridPresent,
  gridcolor: colors?.xGridColor,
  gridwidth: 1,
  griddash: GRID_DASH,
  gridshape: GRID_SHAPE,
  showline: true,
  tickfont: buildTickFont(colors?.xfFamily, colors?.xFontColor, colors?.xBold),
  tickangle: 0,
});

const buildYAxis = (colors) => ({
  autorange: true,
  showgrid: colors?.isGridPresent,
  gridcolor: colors?.yGridColor,
  gridwidth: 1,
  griddash: GRID_DASH,
  gridshape: GRID_SHAPE,
  showline: true,
  tickfont: buildTickFont(colors?.yfFamily, colors?.yFontColor, colors?.yBold),
});

const buildExtraYAxis = (parameter, index, isLeft, position, colors) => ({
  title: parameter?.paramUnit,
  titlefont: { color: parameter?.parameterColor, size: 8 },
  tickfont: { color: parameter?.parameterColor, size: 8 },
  overlaying: index === 0 ? undefined : 'y',
  position,
  showline: true,
  zeroline: false,
  side: isLeft ? 'left' : 'right',
  showgrid: colors?.isGridPresent && index === 0,
  range: parameter?.range ? [parameter.minRangeValue, parameter.maxRangeValue] : undefined,
  autorange: !parameter?.range,
  anchor: 'free',
});

const buildMultiAxisLayout = (colors, alternateSides) => {
  let leftPosition = 0;
  let rightPosition = 0.98;
  let leftPositionMax = leftPosition;
  let rightPositionMax = rightPosition;
  const yAxes = {};

  (colors?.parameters || []).forEach((parameter, index) => {
    const isLeft = alternateSides ? (index + 1) % 2 !== 0 : parameter?.yaxisPosition === 'left';
    const position = isLeft ? leftPosition : rightPosition;
    if (isLeft) {
      leftPosition += AXIS_SPACING;
      leftPositionMax = Math.max(leftPositionMax, leftPosition);
    } else {
      rightPosition -= AXIS_SPACING;
      rightPositionMax = Math.min(rightPositionMax, rightPosition);
    }
    yAxes[`yaxis${index + 1}`] = buildExtraYAxis(parameter, index, isLeft, position, colors);
  });

  return {
    ...yAxes,
    xaxis: {
      ...buildXAxis(colors),
      domain: [leftPositionMax - AXIS_DOMAIN_PADDING, rightPositionMax + AXIS_DOMAIN_PADDING],
    },
  };
};

export const buildAxesLayout = (colors, alternateSides, xAxisExtras = {}) => {
  if (colors?.multiaxis) {
    return buildMultiAxisLayout(colors, alternateSides);
  }
  const showAxes = colors?.isChartAxisPresent || colors?.isChartAxisPresent === undefined;
  if (!showAxes) {
    return { xaxis: HIDDEN_AXIS, yaxis: HIDDEN_AXIS };
  }
  return { xaxis: { ...buildXAxis(colors), ...xAxisExtras }, yaxis: buildYAxis(colors) };
};

export const buildLegend = (colors, { yOffset = 0, orientation = 'h', fontSize = 10 } = {}) => ({
  y: colors?.legend?.y + yOffset,
  x: colors?.legend?.x,
  orientation,
  xanchor: 'center',
  traceorder: 'normal',
  itemsizing: 'trace',
  font: { family: colors?.legendFamily, size: fontSize, weight: 'lighter' },
});

export const buildNoDataAnnotations = (noData, family) => (
  noData
    ? [{
      x: 0.5, y: 0.5, xref: PAPER, yref: PAPER, text: 'No data found', showarrow: false,
      font: { family, size: 10, color: 'red' },
    }]
    : []
);

export const buildChartFrame = (colors, fontSize = 10) => ({
  images: [{
    source: colors?.plotAreaBg, xref: PAPER, yref: PAPER, x: 0, y: 1, sizex: 1, sizey: 1, sizing: 'stretch', opacity: 0.7, layer: 'below',
  }],
  paper_bgcolor: colors?.areaBackground,
  plot_bgcolor: colors?.plotAreaBg,
  shapes: [{
    type: 'rect', x0: 0, x1: 1, y0: 0, y1: 1, xref: PAPER, yref: PAPER,
    line: { color: colors?.plotAreaOutline, width: 1 },
  }],
  chartOutline: `1px solid ${colors?.areaOutline}`,
  chartTitleIs: colors?.chartTitle,
  fontSize,
  fontFamily: colors?.fFamily,
  isBold: colors?.isBold,
  isItalic: colors?.isItalic,
  isUnderLine: colors?.isUnderLine,
  isCaseChange: colors?.isCaseChange,
  fontColor: colors?.fontColor,
  fontBgColor: colors?.fontBgColor,
  rndproperties: colors?.reSizeProperties,
});

export const useChartStore = () => {
  const baseUrl = useSelector((state) => state.mainSlice.baseUrlIs);
  const eventDatesIs = useSelector((state) => state.mainSlice.eventDate);
  const viewToggle = useSelector((state) => state.mainSlice.analyticalPageView);
  const projectName = useSelector((state) => state.authSlice.userDetails?.projectName?.name);
  return { baseUrl, eventDatesIs, viewToggle, projectName };
};

export const useChartRefresh = ({ colors, fetchData, setLoading, toggle }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    setLoading(true);
    const sizeProps = colors?.reSizeProperties;
    dispatch(updateHeight(Number(sizeProps?.y) + Number(parseHeight(sizeProps?.height)) + 10));
    fetchData();

    const refreshTime = getRefreshInterval(colors?.refreshFreq);
    if (!refreshTime) {
      return undefined;
    }
    const intervalId = setInterval(fetchData, refreshTime);
    return () => clearInterval(intervalId);
  }, [toggle, fetchData, dispatch, colors, setLoading]);
};

export const useChartInsight = (chartTitle, projectName) => {
  const [description, setDescription] = useState('');

  const capture = useCallback((imageUri) => {
    captureChartInsight(imageUri, chartTitle, projectName, {
      onSuccess: setDescription,
      onError: (error) => console.error('Error:', error),
    });
  }, [chartTitle, projectName]);

  return { description, capture };
};

export const buildRecentUrl = ({ baseUrl, parametersId, minutes }) => {
  const now = Date.now();
  const format = (timestamp) => new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');
  const fromDate = format(now - minutes * 60 * 1000);
  const toDate = format(now);
  return `${baseUrl}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDate}&to_date=${toDate}`;
};

export const buildAxisFont = (colors, size = 8) => ({
  family: colors?.xfFamily,
  size,
  color: colors?.xFontColor,
  weight: colors?.xBold ? 'bold' : 'normal',
});

export const buildEChartsLabel = (parameter, paged, legendType) => {
  const useName = !isAnalyticsPage(paged) && legendType === 'name';
  return `${useName ? parameter?.name : parameter?.global}(${parameter?.paramUnit})`;
};

export const buildEChartsLegend = (colors, data) => ({
  ...(data ? { data } : {}),
  show: colors?.showLegend,
  orient: colors?.legend?.y === 'center' ? 'vertical' : 'horizontal',
  top: colors?.legend?.y,
  left: colors?.legend?.x,
  textStyle: { fontSize: 10, fontFamily: colors?.legendFamily || 'Open Sans' },
});

export const ECHARTS_NO_DATA = {
  graphic: [{
    type: 'text',
    left: 'center',
    top: 'center',
    style: { text: 'No data available', fontSize: 10, fill: 'red', fontFamily: 'Open Sans' },
  }],
  dataZoom: [{ type: 'inside' }],
};