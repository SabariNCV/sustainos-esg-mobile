import React, { useCallback, useMemo, useState } from 'react';
import { TimingsConversion } from '../TimingsConversion';
import EChartComponent from '../../../Components/EChartComponent';
import {
  PANEL, isAnalyticsPage, createBasicDetails, buildChartPropTypes, buildChartColors,
  buildFilterRequestBody, buildRequestUrl, resolveChartRange, loadChartData, resolveSeriesColor,
  buildEChartsLabel, buildEChartsLegend, ECHARTS_NO_DATA, useChartStore, useChartRefresh,
} from '../../../Components/chartUtils';

const COLORS_KEY = 'radialBarChart-colors';
const BASIC_DETAILS = createBasicDetails('RadialBar Chart', {
  fSize: '18px', xFonntSize: '16', yFonntSize: '16', timeRange: 'hour', legendType: 'code',
});

const formatTooltip = (params) => `${params.seriesName}: ${params.value}`;

const buildAxisLabel = (family, color, bold, extras = {}) => ({
  fontSize: 10,
  fontWeight: bold ? 'bold' : 'normal',
  color,
  fontFamily: family,
  ...extras,
});

const buildBaseOption = (colors, names) => ({
  angleAxis: {
    axisLabel: buildAxisLabel(colors?.yfFamily, colors?.yFontColor, colors?.yBold),
    splitLine: {
      show: colors?.isGridPresent,
      lineStyle: { color: colors?.xGridColor },
    },
  },
  radiusAxis: {
    type: 'category',
    data: names,
    z: 10,
    axisLabel: buildAxisLabel(colors?.xfFamily, colors?.xFontColor, colors?.xBold, { show: true, interval: 0, rotate: 0 }),
  },
  polar: {},
  backgroundColor: colors?.areaBackground,
  legend: buildEChartsLegend(colors, names),
  tooltip: {
    trigger: 'item',
    show: colors?.toolTip,
    formatter: formatTooltip,
  },
});

const buildRadialOption = ({ data, paramData, paged, colors, names }) => {
  const values = Object.values(data);
  return {
    ...buildBaseOption(colors, names),
    series: names.map((name, index) => {
      const seriesValues = new Array(names.length).fill(0);
      seriesValues[index] = values[index];
      return {
        type: 'bar',
        data: seriesValues,
        coordinateSystem: 'polar',
        name,
        stack: 'a',
        itemStyle: { color: resolveSeriesColor(paged, index, paramData.parameters[index]) },
      };
    }),
  };
};

export default function RadialBarChart({
  chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type,
}) {
  const { baseUrl, eventDatesIs, viewToggle } = useChartStore();
  const [option, setOption] = useState({});
  const [loading, setLoading] = useState(false);
  const [, setNoData] = useState(false);

  const radialBarChartColors = useMemo(
    () => buildChartColors({
      paged,
      checkTheCond,
      chartId,
      storageKey: COLORS_KEY,
      basicDetails: BASIC_DETAILS,
      sizeProps: { x: xIs, y: yIs, width, height },
    }),
    [paged, checkTheCond, chartId, xIs, yIs, width, height],
  );

  const fetchDataAndRender = useCallback(async () => {
    const isPanel = type === PANEL;
    const paramData = isAnalyticsPage(paged) ? chartList : radialBarChartColors;
    const { fromDate, toDate } = resolveChartRange({
      paged, chartList, colors: radialBarChartColors, isPanel, eventDatesIs, timingsConverter: TimingsConversion,
    });

    const parametersId = paramData.parameters.map((ele) => ele.parameterId);
    const requestBody = buildFilterRequestBody(paramData.parameters, parametersId);
    const names = paramData.parameters.map((ele) => buildEChartsLabel(ele, paged, paramData.legendType));
    const url = buildRequestUrl({
      baseUrl,
      parametersId,
      paramData,
      fromDate,
      toDate,
      requestBody,
      isPanel,
      dataType: 'pie',
      extraParams: `&aggregation_type=${paramData.aggregateRange}`,
    });

    await loadChartData({
      url,
      setTracesIs: setOption,
      setNoData,
      setLoading,
      emptyResult: { ...buildBaseOption(radialBarChartColors, names), ...ECHARTS_NO_DATA },
      buildTraces: (data) => buildRadialOption({
        data, paramData, paged, colors: radialBarChartColors, names,
      }),
    });
  }, [baseUrl, paged, chartList, radialBarChartColors, type, eventDatesIs]);

  useChartRefresh({ colors: radialBarChartColors, fetchData: fetchDataAndRender, setLoading, toggle: viewToggle });

  return (
    <EChartComponent
      ChartColors={radialBarChartColors}
      option={option}
      showtitle={showtitle}
      loading={loading}
      type={type}
    />
  );
}

RadialBarChart.propTypes = buildChartPropTypes();