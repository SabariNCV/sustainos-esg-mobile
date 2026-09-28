import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { TimingsConversion } from '../TimingsConversion';
import ChartComponent from '../../../Components/ChartComponent';
import {
  type_panel, isAnalyticsPage, createBasicDetails, buildChartPropTypes, buildChartColors,
  buildFilterRequestBody, buildRequestUrl, resolveChartRange, loadChartData, resolveHoverInfo,
  resolveSeriesColor, buildSeriesName, collectSeries, buildAxesLayout, buildLegend,
  buildNoDataAnnotations, buildChartFrame, useChartStore, useChartRefresh, useChartInsight,
} from '../../../Components/chartUtils';

const colors_key = 'scatterChart-colors';
const ANALYTICS_MARKER_SIZE = 12;
const SCATTER_MARKER_SIZE = 7;
const basic_details_chart = createBasicDetails('Scatter Chart', { legendTop: true });

const calculateBubbleSize = (values, minSize = 5, maxSize = 20) => {
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  return values.map((value) => {
    const normalizedValue = (value - minValue) / (maxValue - minValue || 1);
    return normalizedValue * (maxSize - minSize) + minSize;
  });
};

const resolveMarkerSize = (paged, scatterType, sizes) => {
  if (isAnalyticsPage(paged)) {
    return ANALYTICS_MARKER_SIZE;
  }
  return scatterType === 'scatter' ? SCATTER_MARKER_SIZE : sizes;
};

const buildScatterTrace = ({ paramId, index, paramData, paged, data, colors, sizes }) => {
  const { x, y } = collectSeries(data, paramId);
  const parameter = paramData.parameters[index];

  return {
    x,
    y,
    name: buildSeriesName({ paged, paramData, index }),
    mode: 'markers',
    type: 'scatter',
    rangemode: 'tozero',
    hoverinfo: resolveHoverInfo(paramData.toolTip),
    marker: {
      size: resolveMarkerSize(paged, colors?.scatterType, sizes),
      colorscale: 'Viridis',
      color: resolveSeriesColor(paged, index, parameter),
      symbol: isAnalyticsPage(paged) ? '' : parameter?.symbol,
    },
    yaxis: colors?.multiaxis ? `y${index + 1}` : undefined,
  };
};

const buildScatterTraces = ({ data, parametersId, paramData, paged, colors }) => {
  const pointCount = Object.keys(data).length;
  const allValues = parametersId.flatMap((paramId) => Object.values(data).map((values) => values[paramId] || null));
  const sizes = calculateBubbleSize(allValues);
  return parametersId.map((paramId, index) => buildScatterTrace({
    paramId,
    index,
    paramData,
    paged,
    data,
    colors,
    sizes: sizes.slice(index * pointCount, (index + 1) * pointCount),
  }));
};

const buildLayout = (colors, noData, paged) => ({
  dragmode: 'zoom',
  margin: { l: 30, r: 30, b: 15, t: 5 },
  annotations: buildNoDataAnnotations(noData, colors?.fFamily),
  ...buildAxesLayout(colors, isAnalyticsPage(paged)),
  showlegend: colors?.showLegend,
  legend: buildLegend(colors, { orientation: 'v' }),
  ...buildChartFrame(colors),
});

export default function ScatterChart({
  chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type,
}) {
  const { baseUrl, eventDatesIs, viewToggle, projectName } = useChartStore();
  const [tracesIs, setTracesIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const scatterChartColors = useMemo(
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
    const paramData = isAnalyticsPage(paged) ? chartList : scatterChartColors;
    const { fromDate, toDate } = resolveChartRange({
      paged, chartList, colors: scatterChartColors, isPanel, eventDatesIs, timingsConverter: TimingsConversion,
    });

    const parametersId = paramData.parameters.map((ele) => ele.parameterId);
    const requestBody = buildFilterRequestBody(paramData.parameters, parametersId);
    const url = buildRequestUrl({
      baseUrl, parametersId, paramData, fromDate, toDate, requestBody, isPanel, dataType: 'scatter',
    });

    await loadChartData({
      url,
      setTracesIs,
      setNoData,
      setLoading,
      buildTraces: (data) => buildScatterTraces({
        data, parametersId, paramData, paged, colors: scatterChartColors,
      }),
    });
  }, [baseUrl, paged, chartList, scatterChartColors, type, eventDatesIs]);

  useChartRefresh({ colors: scatterChartColors, fetchData: fetchDataAndRender, setLoading, toggle: viewToggle });

  const layout = useMemo(
    () => buildLayout(scatterChartColors, noData, paged),
    [scatterChartColors, noData, paged],
  );

  const { description, capture } = useChartInsight(layout.chartTitleIs, projectName);

  return (
    <View>
      <ChartComponent
        layout={layout}
        ChartColors={scatterChartColors}
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

ScatterChart.propTypes = buildChartPropTypes();