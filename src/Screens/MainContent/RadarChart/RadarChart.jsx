import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { TimingsConversion } from '../TimingsConversion';
import ChartComponent from '../../../Components/ChartComponent';
import {
  PANEL, isAnalyticsPage, createBasicDetails, buildChartPropTypes, buildChartColors,
  buildFilterRequestBody, buildRequestUrl, resolveChartRange, loadChartData, resolveHoverInfo,
  buildAxisFont, buildNoDataAnnotations, buildChartFrame, useChartStore, useChartRefresh,
  useChartInsight,
} from '../../../Components/chartUtils';

const COLORS_KEY = 'radarChart-colors';
const BASIC_DETAILS = createBasicDetails('Radar Chart', {
  fSize: '18px', xFonntSize: '16', yFonntSize: '16',
});

const buildRadarTrace = ({ data, paramData, colors }) => {
  const names = paramData.parameters.map((parameter) => `${parameter.name}(${parameter.paramUnit})`);

  return {
    type: 'scatterpolar',
    r: data.r,
    theta: [...names, names[0]],
    fill: 'toself',
    name: 'Group A',
    hoverinfo: resolveHoverInfo(colors?.toolTip),
    marker: { color: colors?.radarColor },
  };
};

const buildLayout = (colors, noData) => ({
  autosize: true,
  font: buildAxisFont(colors),
  polar: {
    radialaxis: { visible: true },
    angularaxis: { tickfont: buildAxisFont(colors) },
  },
  margin: { t: 15, l: 30, r: 20, b: 30 },
  x: 0.5,
  y: 0.3,
  annotations: buildNoDataAnnotations(noData, colors?.fFamily),
  showlegend: false,
  ...buildChartFrame(colors, 8),
});

export default function RadarChart({
  chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type,
}) {
  const { baseUrl, eventDatesIs, viewToggle, projectName } = useChartStore();
  const [tracesIs, setTracesIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const radarChartColors = useMemo(
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
    const paramData = isAnalyticsPage(paged) ? chartList : radarChartColors;
    const { fromDate, toDate } = resolveChartRange({
      paged, chartList, colors: radarChartColors, isPanel, eventDatesIs, timingsConverter: TimingsConversion,
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
      dataType: 'radar',
      extraParams: `&aggregation_type=${paramData.aggregateRange}`,
    });

    await loadChartData({
      url,
      setTracesIs,
      setNoData,
      setLoading,
      buildTraces: (data) => [buildRadarTrace({ data, paramData, colors: radarChartColors })],
    });
  }, [baseUrl, paged, chartList, radarChartColors, type, eventDatesIs]);

  useChartRefresh({ colors: radarChartColors, fetchData: fetchDataAndRender, setLoading, toggle: viewToggle });

  const layout = useMemo(
    () => buildLayout(radarChartColors, noData),
    [radarChartColors, noData],
  );

  const { description, capture } = useChartInsight(layout.chartTitleIs, projectName);

  return (
    <View>
      <ChartComponent
        layout={layout}
        ChartColors={radarChartColors}
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

RadarChart.propTypes = buildChartPropTypes();