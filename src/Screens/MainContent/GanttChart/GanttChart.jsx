import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import ChartComponent from '../../../Components/ChartComponent';
import {
  createBasicDetails, buildChartPropTypes, buildChartColors, buildRecentUrl, loadChartData,
  resolveHoverInfo, buildAxesLayout, buildLegend, buildNoDataAnnotations, buildChartFrame,
  useChartStore, useChartRefresh, useChartInsight,
} from '../../../Components/chartUtils';

const colors_key = 'ganttChart-colors';
const RECENT_MINUTES = 2;
const POINT_WINDOW_START = 7;
const POINT_WINDOW_END = 9;
const basic_details_chart = createBasicDetails('Gantt Chart');

const selectAll = (payload) => payload;

const buildGanttTraces = ({ data, parameters, colors }) => data.map((item, index) => {
  const points = Object.values(item).flat().slice(POINT_WINDOW_START, POINT_WINDOW_END);
  return {
    x: points.map((point) => point.date_time),
    y: points.map((point) => point.value),
    hoverinfo: resolveHoverInfo(colors?.toolTip),
    type: 'scatter',
    showlegend: true,
    name: parameters[index]?.global,
    marker: { color: parameters[index]?.parameterColor },
  };
});

const buildLayout = (colors, noData) => ({
  autosize: true,
  margin: { t: 15, l: 50, r: 50 },
  hovermode: 'closest',
  annotations: buildNoDataAnnotations(noData, colors?.fFamily),
  ...buildAxesLayout(colors, false),
  showlegend: colors?.showLegend,
  legend: buildLegend(colors, { fontSize: 14 }),
  ...buildChartFrame(colors, colors?.fSize),
});

export default function GanttChart({
  chartId, checkTheCond, paged, showtitle, width, height, xIs, yIs, type,
}) {
  const { baseUrl, viewToggle, projectName } = useChartStore();
  const [tracesIs, setTracesIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const ganttChartColors = useMemo(
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
    const parameters = ganttChartColors?.parameters || [];
    const parametersId = parameters.map((ele) => ele.parameterId);
    const url = buildRecentUrl({ baseUrl, parametersId, minutes: RECENT_MINUTES });

    await loadChartData({
      url,
      setTracesIs,
      setNoData,
      setLoading,
      selectData: selectAll,
      buildTraces: (data) => buildGanttTraces({ data, parameters, colors: ganttChartColors }),
    });
  }, [baseUrl, ganttChartColors]);

  useChartRefresh({ colors: ganttChartColors, fetchData: fetchDataAndRender, setLoading, toggle: viewToggle });

  const layout = useMemo(
    () => buildLayout(ganttChartColors, noData),
    [ganttChartColors, noData],
  );

  const { description, capture } = useChartInsight(layout.chartTitleIs, projectName);

  return (
    <View>
      <ChartComponent
        layout={layout}
        ChartColors={ganttChartColors}
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

GanttChart.propTypes = buildChartPropTypes();