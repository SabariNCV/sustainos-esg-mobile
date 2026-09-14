import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { TimingsConversion } from '../TimingsConversion';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import ChartComponent from '../../../Components/ChartComponent';
import { fetchLineChartData, captureChartImage } from '../../../Redux/ReduxSlice/actions/componentActions';
import { setTraces } from '../../../Redux/ReduxSlice/componentSlice';

const default_colors = ['#00A68F', '#528CFA', '#FF8810', '#C46253', '#7E01A9', '#CF2020', '#FFBB10', '#748C76', '#DF9F4E', '#9B79FF'];

const refresh_unit = {
  Second: 1000,
  Minute: 1000 * 60,
  Hours: 1000 * 60 * 60,
};

function parseHeightValue(value) {
  if (typeof value === 'string') {
    return value.includes('px') ? Number.parseFloat(value.replace('px', '')) : Number.parseFloat(value);
  }
  return value;
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getPanelDateRange(eventDatesIs) {
  const toDateObj = new Date(eventDatesIs[1]);
  const fromDateObj = new Date(eventDatesIs[0]);
  const differenceInMillis = toDateObj.getTime() - fromDateObj.getTime();
  const halfDifferenceInMillis = differenceInMillis / 2;
  const adjustedFromDateObj = new Date(fromDateObj.getTime() - halfDifferenceInMillis);
  const adjustedToDateObj = new Date(toDateObj.getTime() + halfDifferenceInMillis);
  return {
    fromDate: formatLocalDate(adjustedFromDateObj),
    toDate: formatLocalDate(adjustedToDateObj),
  };
}

function getStandardDateRange(lineChartColors) {
  if (lineChartColors?.aggregateTime === 'custom') {
    return { fromDate: lineChartColors?.fromDate, toDate: lineChartColors?.toDate };
  }
  const timeIs = TimingsConversion(lineChartColors?.aggregateTime);
  return { fromDate: timeIs[0], toDate: timeIs[1] };
}

function resolveParamData({ paged, chartList, lineChartColors, type, eventDatesIs }) {
  if (paged === 'analytics') {
    return { paramData: chartList, fromDate: chartList.fromdateIs, toDate: chartList.toDateIs };
  }
  if (type === 'panel') {
    const { fromDate, toDate } = getPanelDateRange(eventDatesIs);
    return { paramData: lineChartColors, fromDate, toDate };
  }
  const { fromDate, toDate } = getStandardDateRange(lineChartColors);
  return { paramData: lineChartColors, fromDate, toDate };
}

function buildRequestBody(paramData, parametersId) {
  const requestBody = {};
  const filterTags = [];
  paramData.parameters.forEach((item) => {
    const conditions = item.fiterConditionsNewFormat.join(' ');
    requestBody[item.parameterId] = conditions;
    item.fiterConditionsNewFormat.forEach((condition) => {
      const paramId = condition.split(' ')[0];
      if (!parametersId.includes(Number.parseInt(paramId, 10)) && !filterTags.includes(paramId)) {
        filterTags.push(paramId);
      }
    });
  });
  requestBody.filter_tags = filterTags.join(',');
  return requestBody;
}

function buildUrl({ BASE_URL, paramData, parametersId, fromDate, toDate, requestBody, type }) {
  const usesDateRange =
    paramData.aggregateTime === 'custom' ||
    paramData.aggregateTime === 'Days' ||
    paramData.aggregateTime === 'Hours' ||
    paramData.aggregateTime === 'Month' ||
    paramData.aggregateTime === 'Past Month' ||
    type === 'panel';

  if (usesDateRange) {
    return `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDate}&to_date=${toDate}&data_type=line&filter_condition=${JSON.stringify(requestBody)}`;
  }
  return `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&data_type=line&time_frequency=${paramData.aggregateTime}&filter_condition=${JSON.stringify(requestBody)}`;
}

function getTraceName(paramData, paged, ind) {
  if (paged === 'analytics') {
    return `${paramData.parametrList[ind].global}(${paramData.parameters[ind].paramUnit})`;
  }
  if (paramData.legendType === 'name') {
    return `${paramData.parameters[ind].name}(${paramData.parameters[ind].paramUnit})`;
  }
  return `${paramData.parameters[ind].global}(${paramData.parameters[ind].paramUnit})`;
}

function buildTraces({ paramData, parametersId, data, paged, lineChartColors }) {
  return parametersId.map((paramId, ind) => {
    const trace = {
      x: [],
      y: [],
      name: getTraceName(paramData, paged, ind),
      mode: 'lines',
      hoverinfo: paramData.toolTip ? 'all' : 'none',
      line: {
        shape: paramData.isCubicSpline ? 'spline' : '',
        smoothing: paramData.isCubicSpline ? paramData.splineRange : 0,
        dash: 'solid',
        width: 1.5,
        color: paged === 'analytics' ? default_colors[ind] : paramData.parameters[ind].parameterColor,
      },
      yaxis: lineChartColors?.multiaxis ? `y${ind + 1}` : undefined,
    };
    Object.entries(data).forEach(([timestamp, values]) => {
      const valueObj = values[paramId];
      if (valueObj) {
        trace.x.push(timestamp);
        trace.y.push(valueObj || null);
      }
    });
    return trace;
  });
}

function buildMultiAxisLayout(lineChartColors, paged, parmMultiAxis) {
  let leftPosition = 0;
  let rightPosition = 0.98;
  const spacing = 0.06;
  let leftPositionMax = leftPosition;
  let rightPositionMax = rightPosition;

  const yAxisConfigs = Object.fromEntries(
    lineChartColors?.parameters.map((parameter, index) => {
      let isLeft;
      let position;
      if (paged === 'analytics' || parmMultiAxis) {
        isLeft = (index + 1) % 2 !== 0;
        position = isLeft ? leftPosition : rightPosition;
      } else {
        isLeft = parameter.yaxisPosition === 'left';
        position = isLeft ? leftPosition : rightPosition;
      }
      if (isLeft) {
        leftPosition += spacing;
        leftPositionMax = Math.max(leftPositionMax, leftPosition);
      } else {
        rightPosition -= spacing;
        rightPositionMax = Math.min(rightPositionMax, rightPosition);
      }
      return [
        `yaxis${index + 1}`,
        {
          title: parameter.paramUnit,
          titlefont: { color: parameter.parameterColor, size: 8 },
          tickfont: { color: parameter.parameterColor, size: 8 },
          overlaying: index === 0 ? undefined : 'y',
          position,
          showline: true,
          zeroline: false,
          side: isLeft ? 'left' : 'right',
          showgrid: lineChartColors?.isGridPresent && index === 0,
          range: parameter.range ? [parameter.minRangeValue, parameter.maxRangeValue] : undefined,
          autorange: !parameter.range,
          anchor: 'free',
        },
      ];
    })
  );

  return {
    ...yAxisConfigs,
    xaxis: {
      domain: [leftPositionMax - 0.03, rightPositionMax + 0.03],
      autorange: true,
      showgrid: lineChartColors?.isGridPresent,
      gridcolor: lineChartColors?.xGridColor,
      gridwidth: 1,
      griddash: 'dot',
      gridshape: 'linear',
      showline: true,
      tickfont: {
        family: lineChartColors?.xfFamily,
        size: 10,
        color: lineChartColors?.xFontColor,
        weight: lineChartColors?.xBold ? 'bold' : 'normal',
      },
      tickangle: 0,
    },
  };
}

function buildStandardAxisLayout(lineChartColors) {
  const rangedParams = lineChartColors?.parameters?.filter((param) => param?.range) || [];
  return {
    xaxis: {
      autorange: true,
      showgrid: lineChartColors?.isGridPresent,
      gridcolor: lineChartColors?.xGridColor,
      gridwidth: 1,
      griddash: 'dot',
      gridshape: 'linear',
      showline: true,
      tickfont: {
        family: lineChartColors?.xfFamily,
        size: 10,
        color: lineChartColors?.xFontColor,
        weight: lineChartColors?.xBold ? 'bold' : 'normal',
      },
      tickangle: 0,
    },
    yaxis: {
      range: rangedParams.length
        ? [Math.min(...rangedParams.map((param) => param?.minRangeValue || 0)), Math.max(...rangedParams.map((param) => param?.maxRangeValue || 0))]
        : undefined,
      autorange: rangedParams.map((param) => param?.range),
      showgrid: lineChartColors?.isGridPresent,
      gridcolor: lineChartColors?.yGridColor,
      gridwidth: 1,
      griddash: 'dot',
      gridshape: 'linear',
      showline: true,
      tickfont: {
        family: lineChartColors?.yfFamily,
        size: 10,
        color: lineChartColors?.yFontColor,
        weight: lineChartColors?.yBold ? 'bold' : 'normal',
      },
    },
  };
}

function buildHiddenAxisLayout() {
  return {
    xaxis: { showgrid: false, zeroline: false, showline: false, showticklabels: false },
    yaxis: { showgrid: false, zeroline: false, showline: false, showticklabels: false },
  };
}

function buildAxisLayout(lineChartColors, paged, parmMultiAxis) {
  if (lineChartColors?.multiaxis) {
    return buildMultiAxisLayout(lineChartColors, paged, parmMultiAxis);
  }
  const hasAxis = lineChartColors?.isChartAxisPresent || lineChartColors?.isChartAxisPresent === undefined;
  return hasAxis ? buildStandardAxisLayout(lineChartColors) : buildHiddenAxisLayout();
}

export default function LineChart(props) {
  const { chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type } = props;
  const dispatch = useDispatch();

  const BASE_URL = useSelector((state) => state.authSlice.baseUrlIs);
  const eventDatesIs = useSelector((state) => state.mainSlice.eventDate);
  const viewButtonTogling = useSelector((state) => state.mainSlice.analyticalPageView);
  const userDetail = useSelector((state) => state.authSlice.userDetails);

  const traces = useSelector((state) => state.componentSlice.traces);
  const loading = useSelector((state) => state.componentSlice.loading);
  const noData = useSelector((state) => state.componentSlice.noData);
  const chartData = useSelector((state) => state.componentSlice.chartData);
  const description = useSelector((state) => state.componentSlice.description);

  const lineChartColorsIs =
    paged === 'analytics'
      ? { chartTitle: 'Line Chart', plotAreaBg: '#fff', plotAreaOutline: '#b3b0b0ff', areaBackground: '#fff', areaOutline: '#fff', isGridPresent: true, toolTip: true, showLegend: true, legend: { x: 0.5, y: 1.1 }, chartType: 'horizontal', barGap: 0.3, donutGap: 0.6, scatterType: 'bubble', fSize: '10', fFamily: 'Nunito', isBold: false, isItalic: false, isUnderLine: false, isCaseChange: false, legendType: 'name', isTitleOpen: false, fontColor: '#33A9AC', fontBgColor: '#fff', legendTop: false, legendBottom: false, legendLeft: false, legendRight: false, xGridColor: '#000', yGridColor: '#C6D0DC', xBold: false, xFontColor: '#b3b0b0ff', xFonntSize: '10', xfFamily: 'Nunito', yBold: false, yFontColor: '#b3b0b0ff', chartZindex: 1, yFonntSize: '10', yfFamily: 'Nunito', reSizeProperties: { x: xIs, y: yIs, width, height }, textPosition: false, textInside: true, textOutSide: false, YGap: 0.3, heatColorRange: 'none', HeatpaletNo: 0, parameters: [], refreshFreq: 'None', timeRange: '5 Minute', subSup: 'Enter The Title', legendWeight: '14px', legendFamily: 'Nunito', multiAxis: chartList.multiAxis }
      : checkTheCond[chartId]['lineChart-colors'];

  const lineChartColors = lineChartColorsIs;
  const parmMultiAxis = false;

  const fetchDataAndRender = async () => {
    const { paramData, fromDate, toDate } = resolveParamData({ paged, chartList, lineChartColors, type, eventDatesIs });
    const parametersId = paramData.parameters.map((ele) => ele.parameterId);
    const requestBody = buildRequestBody(paramData, parametersId);
    const url = buildUrl({ BASE_URL, paramData, parametersId, fromDate, toDate, requestBody, type });
    await dispatch(fetchLineChartData({ url }));
  };

  useEffect(() => {
    const heightValue = parseHeightValue(layout?.rndproperties?.height);
    const newHeight = Number(layout?.rndproperties?.y) + Number(heightValue) + 10;
    dispatch(updateHeight(newHeight));
    fetchDataAndRender();

    const refreshFreq = lineChartColors?.refreshFreq?.split(' ');
    const unitMs = refreshFreq && refresh_unit[refreshFreq[1]];
    const refreshTime = unitMs ? Number.parseInt(refreshFreq[0], 10) * unitMs : null;

    if (refreshTime) {
      const intervalId = setInterval(fetchDataAndRender, refreshTime);
      return () => clearInterval(intervalId);
    }
    return undefined;
  }, [viewButtonTogling]);

  useEffect(() => {
    if (!chartData) {
      dispatch(setTraces([]));
      return;
    }
    const { paramData } = resolveParamData({ paged, chartList, lineChartColors, type, eventDatesIs });
    const parametersId = paramData.parameters.map((ele) => ele.parameterId);
    const newTraces = buildTraces({ paramData, parametersId, data: chartData, paged, lineChartColors });
    dispatch(setTraces(newTraces));
  }, [chartData]);

  const layout = useMemo(
    () => ({
      dragmode: 'zoom',
      margin: { l: 30, r: 20, b: 30, t: 5 },
      annotations: noData
        ? [
            {
              x: 0.5,
              y: 0.5,
              xref: 'paper',
              yref: 'paper',
              text: 'No data found',
              showarrow: false,
              font: { family: lineChartColors?.fFamily, size: 10, color: 'red' },
            },
          ]
        : [],
      ...buildAxisLayout(lineChartColors, paged, parmMultiAxis),
      showlegend: lineChartColors?.showLegend,
      legend: {
        y: lineChartColors?.legend?.y,
        x: lineChartColors?.legend?.x,
        orientation: 'h',
        xanchor: 'center',
        traceorder: 'normal',
        itemsizing: 'trace',
        font: { family: lineChartColors?.legendFamily, size: 10, weight: 'lighter' },
      },
      images: [
        {
          source: lineChartColors?.plotAreaBg,
          xref: 'paper',
          yref: 'paper',
          x: 0,
          y: 1,
          sizex: 1,
          sizey: 1,
          sizing: 'stretch',
          opacity: 0.7,
          layer: 'below',
        },
      ],
      paper_bgcolor: lineChartColors?.areaBackground,
      plot_bgcolor: lineChartColors?.plotAreaBg,
      shapes: [
        {
          type: 'rect',
          x0: 0,
          x1: 1.0,
          y0: 0,
          y1: 1.0,
          xref: 'paper',
          yref: 'paper',
          line: { color: lineChartColors?.plotAreaOutline, width: 1 },
        },
      ],
      chartOutline: `1px solid ${lineChartColors?.areaOutline}`,
      chartTitleIs: lineChartColors?.chartTitle,
      fontSize: 10,
      fontFamily: lineChartColors?.fFamily,
      isBold: lineChartColors?.isBold,
      isItalic: lineChartColors?.isItalic,
      isUnderLine: lineChartColors?.isUnderLine,
      isCaseChange: lineChartColors?.isCaseChange,
      fontColor: lineChartColors?.fontColor,
      fontBgColor: lineChartColors?.fontBgColor,
      rndproperties: lineChartColors?.reSizeProperties,
    }),
    [lineChartColors, noData, paged, parmMultiAxis]
  );

  const capture = (url) => {
    dispatch(
      captureChartImage({
        imageUrl: url,
        chartTitle: layout.chartTitleIs,
        verticalName: userDetail?.projectName?.name,
      })
    );
  };

  return (
    <View>
      <ChartComponent
        layout={layout}
        ChartColors={lineChartColors}
        tracesIs={traces}
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