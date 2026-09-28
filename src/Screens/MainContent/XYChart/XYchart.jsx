import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { TimingsConversion } from '../TimingsConversion';
import ChartComponent from '../../../Components/ChartComponent';
import {
  type_panel, buildAxesLayout, buildChartColors, buildChartFrame, buildChartPropTypes,
  buildFilterRequestBody, buildLegend, buildNoDataAnnotations, buildRequestUrl,
  createBasicDetails, isAnalyticsPage, loadChartData, resolveChartRange,
  useChartInsight, useChartRefresh, useChartStore,
} from '../../../Components/chartUtils';

const PAPER = 'paper';
const STORAGE_KEY = 'XYChart-colors';
const MARGIN = { t: 15, l: 40, r: 20, b: 50 };
const POINT_COLOR = '#1682BC';
const TREND_COLOR = '#FF0101';
const R_SQUARED_FONT_SIZE = 12;
const passThrough = (payload) => payload;

const basic_details_chart = createBasicDetails('XY Chart', {
  fSize: '18px', xFonntSize: '16', yFonntSize: '16', legendTop: true, xParm: '', yParm: '', xyLine: true,
});

const findParameterName = (parameters, parameterId) => (
  parameters?.find((parameter) => parameter.parameterId === parameterId)?.name ?? ''
);

const buildXYTraces = (payload, showTrend) => {
  const points = {
    x: payload.x_values,
    y: payload.y_values,
    mode: 'markers',
    type: 'scatter',
    marker: { color: POINT_COLOR },
  };
  if (!showTrend) {
    return [points];
  }
  return [
    {
      x: payload.trend_x_range,
      y: payload.trend_y_range,
      mode: 'lines',
      type: 'scatter',
      line: { color: TREND_COLOR },
    },
    points,
  ];
};

const buildEquationAnnotations = (colors, equation, rSquared) => [
  {
    x: 0.01,
    y: 0.99,
    xref: PAPER,
    yref: PAPER,
    text: `Y = ${equation}`,
    showarrow: false,
    font: {
      family: colors?.eqFontfamily,
      size: Number.parseInt(colors?.eqFontSize, 10),
      color: colors?.eqCo,
    },
  },
  {
    x: 0.01,
    y: 0.93,
    xref: PAPER,
    yref: PAPER,
    text: `R-squared = ${rSquared}`,
    showarrow: false,
    font: { family: colors?.eqFontfamily, size: R_SQUARED_FONT_SIZE, color: colors?.eqCo },
  },
];

const buildAnnotations = ({ colors, noData, equation, rSquared }) => {
  if (noData) {
    return buildNoDataAnnotations(true, colors?.fFamily);
  }
  if (colors?.xyEq && colors?.xyLine) {
    return buildEquationAnnotations(colors, equation, rSquared);
  }
  return [];
};

const buildAxisTitle = (title, colors) => ({
  title,
  automargin: true,
  titlefont: {
    family: colors?.xfFamily,
    size: 10,
    color: colors?.xFontColor,
    weight: colors?.xBold ? 'bold' : 'normal',
  },
});

const buildLayout = ({ colors, noData, equation, rSquared, xName, yName }) => {
  const { xaxis, yaxis } = buildAxesLayout(colors, false);
  return {
    autosize: true,
    margin: MARGIN,
    annotations: buildAnnotations({ colors, noData, equation, rSquared }),
    xaxis: { ...xaxis, ...buildAxisTitle(xName, colors) },
    yaxis: { ...yaxis, ...buildAxisTitle(yName, colors) },
    showlegend: false,
    legend: buildLegend(colors, { orientation: 'v' }),
    ...buildChartFrame(colors),
  };
};

export default function XYChart({
  chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type,
}) {
  const { baseUrl, eventDatesIs, viewToggle, projectName } = useChartStore();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const colors = useMemo(
    () => buildChartColors({
      paged,
      checkTheCond,
      chartId,
      storageKey: STORAGE_KEY,
      basicDetails: basic_details_chart,
      sizeProps: { x: xIs, y: yIs, width, height },
    }),
    [paged, checkTheCond, chartId, xIs, yIs, width, height],
  );

  const fetchData = useCallback(async () => {
    const isAnalytics = isAnalyticsPage(paged);
    const isPanel = type === type_panel;
    const paramData = isAnalytics ? chartList : colors;
    const xyChart = isAnalytics
      ? { x: chartList?.xType, y: chartList?.yType }
      : { x: colors?.xParm, y: colors?.yParm };
    const { fromDate, toDate } = resolveChartRange({
      paged, chartList, colors, isPanel, eventDatesIs, timingsConverter: TimingsConversion,
    });

    const parametersId = paramData.parameters.map((parameter) => parameter.parameterId);
    const requestBody = {
      ...buildFilterRequestBody(paramData.parameters, parametersId),
      xy_chart: xyChart,
    };
    const url = buildRequestUrl({
      baseUrl, parametersId, paramData, fromDate, toDate, requestBody, isPanel, dataType: 'xy',
    });

    await loadChartData({
      url,
      selectData: passThrough,
      buildTraces: passThrough,
      emptyResult: null,
      setTracesIs: setPayload,
      setNoData,
      setLoading,
    });
  }, [baseUrl, paged, chartList, colors, type, eventDatesIs]);

  useChartRefresh({ colors, fetchData, setLoading, toggle: viewToggle });

  const tracesIs = useMemo(
    () => (payload ? buildXYTraces(payload, colors?.xyLine) : []),
    [payload, colors?.xyLine],
  );

  const layout = useMemo(
    () => buildLayout({
      colors,
      noData,
      equation: payload?.Equation,
      rSquared: payload?.['R-squared'],
      xName: findParameterName(colors?.parameters, colors?.xParm),
      yName: findParameterName(colors?.parameters, colors?.yParm),
    }),
    [colors, noData, payload],
  );

  const { description, capture } = useChartInsight(layout.chartTitleIs, projectName);

  return (
    <View>
      <ChartComponent
        layout={layout}
        ChartColors={colors}
        tracesIs={tracesIs}
        showtitle={showtitle}
        loading={loading}
        onAIPress={capture}
        aiText={description}
      />
    </View>
  );
}

XYChart.propTypes = buildChartPropTypes();