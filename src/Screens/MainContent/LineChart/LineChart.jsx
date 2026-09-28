import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimingsConversion } from '../TimingsConversion';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import ChartComponent from '../../../Components/ChartComponent';
import {
  DEFAULT_CHART_COLORS, parseHeight, getRefreshInterval, resolveTimeRange,
  buildFilterRequestBody, buildAuthHeaders, captureChartInsight,
} from '../../../Components/chartUtils';

const ANALYTICS = 'analytics';
const PANEL = 'panel';
const GRID_DASH = 'dot';
const GRID_SHAPE = 'linear';
const PAPER = 'paper';
const DEFAULT_FONT = 'Nunito';
const DEFAULT_GRID_COLOR = '#b3b0b0ff';
const RANGED_AGGREGATES = new Set(['custom', 'Days', 'Hours', 'Month', 'Past Month']);
const AXIS_SPACING = 0.06;
const AXIS_DOMAIN_PADDING = 0.03;
const HIDDEN_AXIS = { showgrid: false, zeroline: false, showline: false, showticklabels: false };

const BASIC_DETAILS = {
  chartTitle: 'Line Chart', plotAreaBg: '#fff', plotAreaOutline: DEFAULT_GRID_COLOR, areaBackground: '#fff', areaOutline: '#fff',
  isGridPresent: true, toolTip: true, showLegend: true, legend: { x: 0.5, y: 1.1 }, chartType: 'horizontal', barGap: 0.3, donutGap: 0.6, scatterType: 'bubble',
  fSize: '10', fFamily: DEFAULT_FONT, isBold: false, isItalic: false, isUnderLine: false, isCaseChange: false, legendType: 'name', isTitleOpen: false,
  fontColor: '#33A9AC', fontBgColor: '#fff', legendTop: false, legendBottom: false, legendLeft: false, legendRight: false, xGridColor: '#000', yGridColor: '#C6D0DC',
  xBold: false, xFontColor: DEFAULT_GRID_COLOR, xFonntSize: '10', xfFamily: DEFAULT_FONT, yBold: false, yFontColor: DEFAULT_GRID_COLOR, chartZindex: 1,
  yFonntSize: '10', yfFamily: DEFAULT_FONT, textPosition: false, textInside: true, textOutSide: false,
  YGap: 0.3, heatColorRange: 'none', HeatpaletNo: 0, parameters: [], refreshFreq: 'None', timeRange: '5 Minute', subSup: 'Enter The Title', legendWeight: '14px', legendFamily: DEFAULT_FONT,
};

const buildLineChartColors = ({ paged, chartList, checkTheCond, chartId, sizeProps }) => {
  if (paged === ANALYTICS) {
    return {
      ...BASIC_DETAILS,
      multiaxis: chartList.multiAxis,
      parameters: chartList.parameters,
      reSizeProperties: sizeProps,
    };
  }
  const stored = checkTheCond?.[chartId]?.['lineChart-colors'] || {};
  return { ...stored, reSizeProperties: stored.reSizeProperties ?? sizeProps };
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

const buildYAxis = (colors) => {
  const rangedParams = (colors?.parameters || []).filter((param) => param?.range);
  const hasRange = rangedParams.length > 0;
  return {
    range: hasRange
      ? [
        Math.min(...rangedParams.map((param) => param?.minRangeValue || 0)),
        Math.max(...rangedParams.map((param) => param?.maxRangeValue || 0)),
      ]
      : undefined,
    autorange: rangedParams.map((param) => param?.range),
    showgrid: colors?.isGridPresent,
    gridcolor: colors?.yGridColor,
    gridwidth: 1,
    griddash: GRID_DASH,
    gridshape: GRID_SHAPE,
    showline: true,
    tickfont: buildTickFont(colors?.yfFamily, colors?.yFontColor, colors?.yBold),
  };
};

const buildExtraYAxis = (parameter, index, isLeft, position, colors) => ({
  title: parameter.paramUnit,
  titlefont: { color: parameter.parameterColor, size: 8 },
  tickfont: { color: parameter.parameterColor, size: 8 },
  overlaying: index === 0 ? undefined : 'y',
  position,
  showline: true,
  zeroline: false,
  side: isLeft ? 'left' : 'right',
  showgrid: colors?.isGridPresent && index === 0,
  range: parameter.range ? [parameter.minRangeValue, parameter.maxRangeValue] : undefined,
  autorange: !parameter.range,
  anchor: 'free',
});

const buildMultiAxisLayout = (colors, alternateSides) => {
  let leftPosition = 0;
  let rightPosition = 0.98;
  let leftPositionMax = leftPosition;
  let rightPositionMax = rightPosition;
  const yAxes = {};

  colors.parameters.forEach((parameter, index) => {
    const isLeft = alternateSides ? (index + 1) % 2 !== 0 : parameter.yaxisPosition === 'left';
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

const buildAxesLayout = (colors, paged) => {
  if (colors?.multiaxis) {
    return buildMultiAxisLayout(colors, paged === ANALYTICS);
  }
  const showAxes = colors?.isChartAxisPresent || colors?.isChartAxisPresent === undefined;
  if (!showAxes) {
    return { xaxis: HIDDEN_AXIS, yaxis: HIDDEN_AXIS };
  }
  return { xaxis: buildXAxis(colors), yaxis: buildYAxis(colors) };
};

const buildLayout = (colors, noData, paged) => ({
  dragmode: 'zoom',
  margin: { l: 30, r: 20, b: 30, t: 5 },
  annotations: noData
    ? [{
      x: 0.5, y: 0.5, xref: PAPER, yref: PAPER, text: 'No data found', showarrow: false,
      font: { family: colors?.fFamily, size: 10, color: 'red' },
    }]
    : [],
  ...buildAxesLayout(colors, paged),
  showlegend: colors?.showLegend,
  legend: {
    y: colors?.legend?.y,
    x: colors?.legend?.x,
    orientation: 'h',
    xanchor: 'center',
    traceorder: 'normal',
    itemsizing: 'trace',
    font: { family: colors?.legendFamily, size: 10, weight: 'lighter' },
  },
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
  fontSize: 10,
  fontFamily: colors?.fFamily,
  isBold: colors?.isBold,
  isItalic: colors?.isItalic,
  isUnderLine: colors?.isUnderLine,
  isCaseChange: colors?.isCaseChange,
  fontColor: colors?.fontColor,
  fontBgColor: colors?.fontBgColor,
  rndproperties: colors?.reSizeProperties,
});

const buildTraceName = (paged, paramData, index) => {
  const parameter = paramData.parameters[index];
  const unit = `(${parameter.paramUnit})`;
  if (paged === ANALYTICS) {
    return `${paramData.parametrList[index].global}${unit}`;
  }
  const label = paramData.legendType === 'name' ? parameter.name : parameter.global;
  return `${label}${unit}`;
};

const buildTrace = ({ paramId, index, paramData, paged, data, multiaxis }) => {
  const x = [];
  const y = [];
  Object.entries(data).forEach(([timestamp, values]) => {
    const value = values[paramId];
    if (value) {
      x.push(timestamp);
      y.push(value);
    }
  });

  const isSpline = Boolean(paramData.isCubicSpline);
  const lineColor = paged === ANALYTICS ? DEFAULT_CHART_COLORS[index] : paramData.parameters[index].parameterColor;

  return {
    x,
    y,
    name: buildTraceName(paged, paramData, index),
    mode: 'lines',
    hoverinfo: paramData.toolTip ? 'all' : 'none',
    line: {
      shape: isSpline ? 'spline' : '',
      smoothing: isSpline ? paramData.splineRange : 0,
      dash: 'solid',
      width: 1.5,
      color: lineColor,
    },
    yaxis: multiaxis ? `y${index + 1}` : undefined,
  };
};

const buildRequestUrl = ({ baseUrl, parametersId, paramData, fromDate, toDate, requestBody, isPanel }) => {
  const filter = JSON.stringify(requestBody);
  const root = `${baseUrl}dataservice_app/api/parameter_values/?id=${parametersId}`;
  if (isPanel || RANGED_AGGREGATES.has(paramData.aggregateTime)){
    return `${root}&from_date=${fromDate}&to_date=${toDate}&data_type=line&filter_condition=${filter}`;
  }
  return `${root}&data_type=line&time_frequency=${paramData.aggregateTime}&filter_condition=${filter}`;
};

export default function LineChart({
  chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type,
}) {
  const BASE_URL = useSelector((state) => state.mainSlice.baseUrlIs);
  const eventDatesIs = useSelector((state) => state.mainSlice.eventDate);
  const viewButtonTogling = useSelector((state) => state.mainSlice.analyticalPageView);
  const userDetail = useSelector((state) => state.authSlice.userDetails);
  const dispatch = useDispatch();
  const [tracesIs, setTracesIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [description, setDescription] = useState('');

  const lineChartColors = useMemo(
    () => buildLineChartColors({
      paged, chartList, checkTheCond, chartId, sizeProps: { x: xIs, y: yIs, width, height },
    }),
    [paged, chartList, checkTheCond, chartId, xIs, yIs, width, height],
  );

  const fetchDataAndRender = useCallback(async () => {
    const isPanel = type === PANEL;
    const isAnalytics = paged === ANALYTICS;
    const paramData = isAnalytics ? chartList : lineChartColors;

    let fromDate = chartList?.fromdateIs;
    let toDate = chartList?.toDateIs;
    if (!isAnalytics) {
      const range = resolveTimeRange({
        isPanel,
        isCustom: lineChartColors?.aggregateTime === 'custom',
        eventDatesIs,
        fromDate: lineChartColors?.fromDate,
        toDate: lineChartColors?.toDate,
        aggregateTime: lineChartColors?.aggregateTime,
        timingsConverter: TimingsConversion,
      });
      fromDate = range.fromDate;
      toDate = range.toDate;
    }

    const parametersId = paramData.parameters.map((ele) => ele.parameterId);
    const requestBody = buildFilterRequestBody(paramData.parameters, parametersId);
    const url = buildRequestUrl({
      baseUrl: BASE_URL, parametersId, paramData, fromDate, toDate, requestBody, isPanel,
    });

    try {
      const token = await AsyncStorage.getItem('jwttoken');
      const response = await axios.get(url, buildAuthHeaders(token));
      const data = response.data.data;
      setNoData(Object.keys(response.data).length === 0);

      if (data) {
        setTracesIs(parametersId.map((paramId, index) => buildTrace({
          paramId, index, paramData, paged, data, multiaxis: lineChartColors?.multiaxis,
        })));
      } else {
        setTracesIs([]);
      }
    } catch (error) {
      setNoData(true);
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, paged, chartList, lineChartColors, type, eventDatesIs]);

  useEffect(() => {
    setLoading(true);
    const sizeProps = lineChartColors?.reSizeProperties;
    dispatch(updateHeight(Number(sizeProps?.y) + Number(parseHeight(sizeProps?.height)) + 10));
    fetchDataAndRender();

    const refreshTime = getRefreshInterval(lineChartColors?.refreshFreq);
    if (!refreshTime) {
      return undefined;
    }
    const intervalId = setInterval(fetchDataAndRender, refreshTime);
    return () => clearInterval(intervalId);
  }, [viewButtonTogling, fetchDataAndRender, dispatch, lineChartColors]);

  const layout = useMemo(
    () => buildLayout(lineChartColors, noData, paged),
    [lineChartColors, noData, paged],
  );

  const projectName = userDetail?.projectName?.name;
  const chartTitle = layout.chartTitleIs;

  const capture = useCallback((imageUri) => {
    captureChartInsight(imageUri, chartTitle, projectName, {
      onSuccess: setDescription,
      onError: (error) => console.error('Error:', error),
    });
  }, [chartTitle, projectName]);

  return (
    <View>
      <ChartComponent
        layout={layout}
        ChartColors={lineChartColors}
        tracesIs={tracesIs}
        showtitle={showtitle}
        loading={loading}
        type={type}
        screen={paged}
        onAIPress={capture}
        aiText={description}
      />
    </View>
  );
}

LineChart.propTypes = {
  chartId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  chartList: PropTypes.shape({
    multiAxis: PropTypes.bool,
    parameters: PropTypes.arrayOf(PropTypes.object),
    parametrList: PropTypes.arrayOf(PropTypes.object),
    fromdateIs: PropTypes.string,
    toDateIs: PropTypes.string,
    aggregateTime: PropTypes.string,
  }),
  checkTheCond: PropTypes.object,
  paged: PropTypes.string,
  showtitle: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  xIs: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  yIs: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  type: PropTypes.string,
};