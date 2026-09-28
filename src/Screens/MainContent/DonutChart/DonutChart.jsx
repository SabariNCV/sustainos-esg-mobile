import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { TimingsConversion } from '../TimingsConversion';
import ChartComponent from '../../../Components/ChartComponent';
import {
  DEFAULT_CHART_COLORS, PANEL, isAnalyticsPage, createBasicDetails, buildChartPropTypes,
  buildChartColors, buildFilterRequestBody, buildRequestUrl, resolveChartRange, loadChartData,
  resolveHoverInfo, buildParameterLabel, buildLegend, buildNoDataAnnotations, buildChartFrame,
  useChartStore, useChartRefresh, useChartInsight,
} from '../../../Components/chartUtils';

const COLORS_KEY = 'donutChart-colors';
const BASIC_DETAILS = createBasicDetails('Donut Chart', {
  fSize: '18px', xFonntSize: '16', yFonntSize: '16',
});

const buildDonutTrace = ({ data, paramData, paged, colors }) => ({
  values: Object.values(data),
  labels: paramData.parameters.map((ele) => buildParameterLabel(ele, paged, colors?.legendType)),
  hoverinfo: resolveHoverInfo(colors?.toolTip),
  hole: colors?.donutGap,
  type: 'pie',
  textinfo: 'percent',
  insidetextorientation: 'radial',
  textposition: colors?.isTextOutside === true ? 'outside' : 'inside',
  textfont: { size: 12 },
  marker: {
    colors: isAnalyticsPage(paged)
      ? DEFAULT_CHART_COLORS
      : paramData.parameters.map((ele) => ele.parameterColor),
  },
});

const buildLayout = (colors, noData) => ({
  autosize: true,
  margin: { t: 10, l: 20, r: 20, b: 10 },
  showlegend: colors?.showLegend,
  legend: buildLegend(colors, { fontSize: 8 }),
  annotations: buildNoDataAnnotations(noData, colors?.fFamily),
  ...buildChartFrame(colors, colors?.fSize),
});

export default function DonutChart({
  chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type,
}) {
  const { baseUrl, eventDatesIs, viewToggle, projectName } = useChartStore();
  const [tracesIs, setTracesIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const donutChartColors = useMemo(
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
    const paramData = isAnalyticsPage(paged) ? chartList : donutChartColors;
    const { fromDate, toDate } = resolveChartRange({
      paged, chartList, colors: donutChartColors, isPanel, eventDatesIs, timingsConverter: TimingsConversion,
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
      buildTraces: (data) => [buildDonutTrace({ data, paramData, paged, colors: donutChartColors })],
    });
  }, [baseUrl, paged, chartList, donutChartColors, type, eventDatesIs]);

  useChartRefresh({ colors: donutChartColors, fetchData: fetchDataAndRender, setLoading, toggle: viewToggle });

  const layout = useMemo(
    () => buildLayout(donutChartColors, noData),
    [donutChartColors, noData],
  );

  const { description, capture } = useChartInsight(layout.chartTitleIs, projectName);

  return (
    <View>
      <ChartComponent
        layout={layout}
        ChartColors={donutChartColors}
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

DonutChart.propTypes = buildChartPropTypes();