import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import ChartComponent from '../../../Components/ChartComponent';
import {
  buildAxesLayout, buildChartColors, buildChartFrame, buildChartPropTypes, buildLegend,
  buildNoDataAnnotations, buildRecentUrl, loadChartData, resolveHoverInfo,
  useChartInsight, useChartRefresh, useChartStore,
} from '../../../Components/chartUtils';

const STORAGE_KEY = 'waterFallChart-colors';
const RECENT_MINUTES = 2;
const WINDOW_START = 30;
const WINDOW_END = 35;
const X_AXIS_EXTRAS = { nticks: 6, type: 'category' };
const MARGIN = { t: 15, l: 50, r: 50 };
const LEGEND_OPTIONS = { fontSize: 14 };
const passThrough = (payload) => payload;

const buildWaterfallTraces = (data, parameters, toolTip) => data.map((item, index) => {
  const entries = Object.values(item).flat().slice(WINDOW_START, WINDOW_END);
  const parameter = parameters[index];
  return {
    x: entries.map((entry) => entry.date_time),
    y: entries.map((entry) => entry.value),
    hoverinfo: resolveHoverInfo(toolTip),
    type: 'waterfall',
    orientation: 'v',
    name: parameter?.global,
    yaxis: 'y',
    line: { dash: 'solid', width: 1 },
    marker: { color: parameter?.parameterColor },
    connector: { line: { color: parameter?.parameterColor } },
  };
});

const buildLayout = (colors, noData) => ({
  autosize: true,
  margin: MARGIN,
  annotations: buildNoDataAnnotations(noData, colors?.fFamily),
  ...buildAxesLayout(colors, false, X_AXIS_EXTRAS),
  showlegend: colors?.showLegend,
  legend: buildLegend(colors, LEGEND_OPTIONS),
  ...buildChartFrame(colors),
});

export default function WaterFallChart({
  chartId, checkTheCond, showtitle, width, height, xIs, yIs,
}) {
  const { baseUrl, viewToggle, projectName } = useChartStore();
  const [tracesIs, setTracesIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const colors = useMemo(
    () => buildChartColors({
      checkTheCond,
      chartId,
      storageKey: STORAGE_KEY,
      sizeProps: { x: xIs, y: yIs, width, height },
    }),
    [checkTheCond, chartId, xIs, yIs, width, height],
  );

  const fetchData = useCallback(async () => {
    const parameters = colors?.parameters ?? [];
    const parametersId = parameters.map((parameter) => parameter.parameterId);
    const url = buildRecentUrl({ baseUrl, parametersId, minutes: RECENT_MINUTES });

    await loadChartData({
      url,
      selectData: passThrough,
      buildTraces: (data) => buildWaterfallTraces(data, parameters, colors?.toolTip),
      setTracesIs,
      setNoData,
      setLoading,
    });
  }, [baseUrl, colors]);

  useChartRefresh({ colors, fetchData, setLoading, toggle: viewToggle });

  const layout = useMemo(() => buildLayout(colors, noData), [colors, noData]);
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

WaterFallChart.propTypes = buildChartPropTypes();