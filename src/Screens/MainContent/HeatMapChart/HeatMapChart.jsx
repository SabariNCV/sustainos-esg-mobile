import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { TimingsConversion } from '../TimingsConversion';
import ChartComponent from '../../../Components/ChartComponent';
import {
  HEATMAP_PALETTES, PANEL, isAnalyticsPage, createBasicDetails, buildChartPropTypes,
  buildChartColors, buildFilterRequestBody, buildRequestUrl, resolveChartRange, loadChartData,
  resolveHoverInfo, buildNoDataAnnotations, buildChartFrame, useChartStore, useChartRefresh,
  useChartInsight,
} from '../../../Components/chartUtils';

const COLORS_KEY = 'heatMapChart-colors';
const HOVER_TEMPLATE = 'Date: %{x}<br>Parameter: %{y}<br>Value: %{z}<extra></extra>';
const BASIC_DETAILS = createBasicDetails('heatMap Chart', {
  xFonntSize: '12', yFonntSize: '12', fSize: '12',
});
const HEAT_LEGEND = {
  x: 0.1,
  y: 1.3,
  traceorder: 'normal',
  orientation: 'h',
  itemsizing: 'trace',
  tracegroupgap: 15,
  bgcolor: 'rgba(0,0,0,0)',
  bordercolor: '#fff',
  borderwidth: 2,
};

const buildHeatAxis = (family, color, bold, size) => ({
  autorange: true,
  showline: true,
  tickfont: { family, size, color, weight: bold ? 'bold' : 'normal' },
});

const buildHeatTrace = ({ data, paramData, paged, colors }) => ({
  z: data[0].z,
  x: data[0].x[0],
  y: paramData.parameters.map((ele) => (isAnalyticsPage(paged) ? ele.globalCode : ele.global)),
  colorscale: HEATMAP_PALETTES[colors?.HeatpaletNo] ?? 'none',
  hoverinfo: resolveHoverInfo(colors?.toolTip),
  type: 'heatmap',
  hoverongaps: false,
  hovertemplate: HOVER_TEMPLATE,
  colorbar: { thickness: 8, side: 'right', tickfont: { size: 8 } },
});

const buildLayout = (colors, noData) => ({
  showscale: false,
  autosize: true,
  barGap: 0.1,
  ygap: colors?.YGap,
  margin: { t: 15, r: 40, b: 30, l: 40 },
  annotations: buildNoDataAnnotations(noData, colors?.fFamily),
  x: 0.1,
  y: 0.3,
  showlegend: true,
  legend: HEAT_LEGEND,
  xaxis: { ...buildHeatAxis(colors?.xfFamily, colors?.xFontColor, colors?.xBold, 6), tickangle: 0 },
  yaxis: buildHeatAxis(colors?.yfFamily, colors?.yFontColor, colors?.yBold, 5),
  ...buildChartFrame(colors, 6),
});

export default function HeatMapChart({
  chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type,
}) {
  const { baseUrl, eventDatesIs, viewToggle, projectName } = useChartStore();
  const [tracesIs, setTracesIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const heatMapChartColors = useMemo(
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
    const paramData = isAnalyticsPage(paged) ? chartList : heatMapChartColors;
    const { fromDate, toDate } = resolveChartRange({
      paged, chartList, colors: heatMapChartColors, isPanel, eventDatesIs, timingsConverter: TimingsConversion,
    });

    const parametersId = paramData.parameters.map((ele) => ele.parameterId);
    const requestBody = buildFilterRequestBody(paramData.parameters, parametersId);
    const url = buildRequestUrl({
      baseUrl, parametersId, paramData, fromDate, toDate, requestBody, isPanel, dataType: 'heatmap',
    });

    await loadChartData({
      url,
      setTracesIs,
      setNoData,
      setLoading,
      buildTraces: (data) => [buildHeatTrace({ data, paramData, paged, colors: heatMapChartColors })],
    });
  }, [baseUrl, paged, chartList, heatMapChartColors, type, eventDatesIs]);

  useChartRefresh({ colors: heatMapChartColors, fetchData: fetchDataAndRender, setLoading, toggle: viewToggle });

  const layout = useMemo(
    () => buildLayout(heatMapChartColors, noData),
    [heatMapChartColors, noData],
  );

  const { description, capture } = useChartInsight(layout.chartTitleIs, projectName);

  return (
    <View>
      <ChartComponent
        layout={layout}
        ChartColors={heatMapChartColors}
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

HeatMapChart.propTypes = buildChartPropTypes();