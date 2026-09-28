import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { TimingsConversion } from '../TimingsConversion';
import ChartComponent from '../../../Components/ChartComponent';
import {
  type_panel, isAnalyticsPage, createBasicDetails, buildChartPropTypes, buildChartColors,
  buildFilterRequestBody, buildRequestUrl, resolveChartRange, loadChartData, buildAxisFont,
  buildNoDataAnnotations, buildChartFrame, useChartStore, useChartRefresh, useChartInsight,
} from '../../../Components/chartUtils';

const colors_key = 'gaugeChart-colors';
const basic_details_chart = createBasicDetails('Gauge Chart', {
  fSize: '18px', xFonntSize: '16', yFonntSize: '16', gaugeMin: '', gaugeMax: '', gaugeBg: [], gaugecolor: [],
});

const buildGaugeTrace = (data, colors) => ({
  domain: { x: [0, 1], y: [0, 1] },
  value: Object.values(data)[0],
  type: 'indicator',
  mode: 'gauge+number',
  gauge: {
    axis: { range: [colors?.gaugeMin, colors?.gaugeMax], tickmode: 'array' },
    steps: (colors?.gaugeBg || []).map((ele) => ({ range: [ele.startval, ele.endVal], color: ele.color })),
    bar: { color: colors?.gaugecolor?.[0]?.color },
  },
});

const buildLayout = (colors, noData) => ({
  autosize: true,
  font: buildAxisFont(colors),
  margin: { t: 15, l: 50, r: 50, b: 10 },
  annotations: buildNoDataAnnotations(noData, colors?.fFamily),
  ...buildChartFrame(colors, colors?.fSize),
});

export default function GaugeChart({
  chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type,
}) {
  const { baseUrl, eventDatesIs, viewToggle, projectName } = useChartStore();
  const [tracesIs, setTracesIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const gaugeChartColors = useMemo(
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
    const paramData = isAnalyticsPage(paged) ? chartList : gaugeChartColors;
    const { fromDate, toDate } = resolveChartRange({
      paged, chartList, colors: gaugeChartColors, isPanel, eventDatesIs, timingsConverter: TimingsConversion,
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
      setTracesIs,
      setNoData,
      setLoading,
      buildTraces: (data) => [buildGaugeTrace(data, gaugeChartColors)],
    });
  }, [baseUrl, paged, chartList, gaugeChartColors, type, eventDatesIs]);

  useChartRefresh({ colors: gaugeChartColors, fetchData: fetchDataAndRender, setLoading, toggle: viewToggle });

  const layout = useMemo(
    () => buildLayout(gaugeChartColors, noData),
    [gaugeChartColors, noData],
  );

  const { description, capture } = useChartInsight(layout.chartTitleIs, projectName);

  return (
    <View>
      <ChartComponent
        layout={layout}
        ChartColors={gaugeChartColors}
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

GaugeChart.propTypes = buildChartPropTypes();