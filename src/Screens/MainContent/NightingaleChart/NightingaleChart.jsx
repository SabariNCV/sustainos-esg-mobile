import React, { useCallback, useMemo, useState } from 'react';
import { TimingsConversion } from '../TimingsConversion';
import EChartComponent from '../../../Components/EChartComponent';
import {
  type_panel, isAnalyticsPage, createBasicDetails, buildChartPropTypes, buildChartColors,
  buildFilterRequestBody, buildRequestUrl, resolveChartRange, loadChartData, resolveSeriesColor,
  buildEChartsLabel, buildEChartsLegend, ECHARTS_NO_DATA, useChartStore, useChartRefresh,
} from '../../../Components/chartUtils';

const colors_key = 'nightingaleChart-colors';
const basic_details_chart = createBasicDetails('NightingaleChart', {
  fSize: '12',
  xFonntSize: '12',
  yFonntSize: '12',
  isTextOutside: false,
  ftextFamily: 'Nunito',
  isTextBold: false,
  textfontColor: '#008000',
  ftextSize: '12',
});

const buildBaseOption = (colors) => ({
  legend: buildEChartsLegend(colors),
  tooltip: {
    show: colors?.toolTip,
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
  },
  backgroundColor: colors?.areaBackground,
  toolbox: { show: false },
});

const buildEmptyOption = (colors) => ({
  ...buildBaseOption(colors),
  ...ECHARTS_NO_DATA,
  series: [],
});

const buildNightingaleOption = ({ data, paramData, paged, colors }) => ({
  ...buildBaseOption(colors),
  series: [{
    name: 'Nightingale Chart',
    type: 'pie',
    radius: colors?.donutGap === 0 ? '70%' : ['30%', '70%'],
    center: ['50%', '50%'],
    roseType: 'area',
    itemStyle: { borderRadius: 8 },
    label: {
      show: true,
      position: 'outside',
      fontSize: 10,
      fontWeight: colors?.isTextBold ? 'bold' : 'normal',
      color: colors?.textfontColor,
      fontFamily: colors?.ftextFamily || 'Open Sans',
    },
    data: Object.values(data).map((value, index) => ({
      value,
      name: buildEChartsLabel(paramData.parameters[index], paged, paramData.legendType),
      itemStyle: { color: resolveSeriesColor(paged, index, paramData.parameters[index]) },
    })),
  }],
});

export default function NightingaleChart({
  chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type,
}) {
  const { baseUrl, eventDatesIs, viewToggle } = useChartStore();
  const [option, setOption] = useState({});
  const [loading, setLoading] = useState(false);
  const [, setNoData] = useState(false);

  const nightingaleChartColors = useMemo(
    () => buildChartColors({
      paged,
      checkTheCond,
      chartId,
      storageKey: colors_key,
      basicDetails: basic_details_chart,
      sizeProps: { x: xIs, y: yIs, width, height },
    }),
    [paged, checkTheCond, chartId, xIs, yIs, width, height],
  );

  const fetchDataAndRender = useCallback(async () => {
    const isPanel = type === type_panel;
    const paramData = isAnalyticsPage(paged) ? chartList : nightingaleChartColors;
    const { fromDate, toDate } = resolveChartRange({
      paged, chartList, colors: nightingaleChartColors, isPanel, eventDatesIs, timingsConverter: TimingsConversion,
    });

    const parametersId = paramData.parameters.map((ele) => ele.parameterId);
    const requestBody = buildFilterRequestBody(paramData.parameters, parametersId);
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
      emptyResult: buildEmptyOption(nightingaleChartColors),
      buildTraces: (data) => buildNightingaleOption({
        data, paramData, paged, colors: nightingaleChartColors,
      }),
    });
  }, [baseUrl, paged, chartList, nightingaleChartColors, type, eventDatesIs]);

  useChartRefresh({ colors: nightingaleChartColors, fetchData: fetchDataAndRender, setLoading, toggle: viewToggle });

  return (
    <EChartComponent
      ChartColors={nightingaleChartColors}
      option={option}
      showtitle={showtitle}
      loading={loading}
      type={type}
    />
  );
}

NightingaleChart.propTypes = buildChartPropTypes();