import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { TimingsConversion } from '../TimingsConversion';
import ChartComponent from '../../../Components/ChartComponent';
import {
  type_panel, isAnalyticsPage, createBasicDetails, buildChartPropTypes, buildChartColors,
  buildFilterRequestBody, buildRequestUrl, resolveChartRange, loadChartData, resolveHoverInfo,
  buildNoDataAnnotations, buildChartFrame, useChartStore, useChartRefresh, useChartInsight,
} from '../../../Components/chartUtils';

const colors_key = 'funnelChart-colors';
const basic_details_chart = createBasicDetails('Funnel Chart', {
  fSize: '18px', xFonntSize: '16', yFonntSize: '16',
});

const buildFunnelTrace = ({ data, paramData, colors }) => {
  const labels = paramData.parameters.map((ele) => `${ele.name}(${ele.paramUnit})`);

  return {
    x: data.x,
    hoverinfo: resolveHoverInfo(colors?.toolTip),
    text: labels,
    type: 'funnel',
    textinfo: colors?.textPosition ? labels : 'none',
    mode: 'lines',
    textposition: 'inside',
    marker: { color: paramData.parameters.map((ele) => ele.parameterColor) },
    textfont: {
      family: colors?.xfFamily,
      size: colors?.xFonntSize,
      color: colors?.xFontColor,
      weight: colors?.xBold ? 'bold' : 'normal',
    },
  };
};

const buildLayout = (colors, noData) => ({
  autosize: true,
  margin: { t: 15, l: 30, r: 20, b: 30 },
  annotations: buildNoDataAnnotations(noData, colors?.fFamily),
  x: 0.5,
  y: 0.3,
  yaxis: { showticklabels: false },
  ...buildChartFrame(colors, colors?.fSize),
});

export default function FunnelChart({
  chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type,
}) {
  const { baseUrl, eventDatesIs, viewToggle, projectName } = useChartStore();
  const [tracesIs, setTracesIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const funnelChartColors = useMemo(
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
    const paramData = isAnalyticsPage(paged) ? chartList : funnelChartColors;
    const { fromDate, toDate } = resolveChartRange({
      paged, chartList, colors: funnelChartColors, isPanel, eventDatesIs, timingsConverter: TimingsConversion,
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
      dataType: 'funnel',
      extraParams: `&aggregation_type=${paramData.aggregateRange}`,
    });

    await loadChartData({
      url,
      setTracesIs,
      setNoData,
      setLoading,
      buildTraces: (data) => [buildFunnelTrace({ data, paramData, colors: funnelChartColors })],
    });
  }, [baseUrl, paged, chartList, funnelChartColors, type, eventDatesIs]);

  useChartRefresh({ colors: funnelChartColors, fetchData: fetchDataAndRender, setLoading, toggle: viewToggle });

  const layout = useMemo(
    () => buildLayout(funnelChartColors, noData),
    [funnelChartColors, noData],
  );

  const { description, capture } = useChartInsight(layout.chartTitleIs, projectName);

  return (
    <View>
      <ChartComponent
        layout={layout}
        ChartColors={funnelChartColors}
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

FunnelChart.propTypes = buildChartPropTypes();