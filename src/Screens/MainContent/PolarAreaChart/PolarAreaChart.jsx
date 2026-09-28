import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import ChartComponent from '../../../Components/ChartComponent';
import {
  createBasicDetails, buildChartPropTypes, buildChartColors, buildRecentUrl, loadChartData,
  resolveHoverInfo, buildNoDataAnnotations, buildChartFrame, useChartStore, useChartRefresh,
  useChartInsight,
} from '../../../Components/chartUtils';

const COLORS_KEY = 'polarAreaChart-colors';
const RECENT_MINUTES = 2;
const POLAR_LEGEND = { orientation: 'h', x: 0, y: -0.5 };
const BASIC_DETAILS = createBasicDetails('Polar Area Chart');

const selectAll = (payload) => payload;

const buildPolarTraces = ({ data, parameters, colors }) => data.map((item, index) => ({
  r: Object.values(item).flat().map((point) => point.value),
  hoverinfo: resolveHoverInfo(colors?.toolTip),
  type: 'scatterpolar',
  mode: 'lines',
  name: parameters[index]?.global,
  fill: 'toself',
  fillcolor: parameters[index]?.parameterColor,
  line: { color: 'black' },
}));

const buildLayout = (colors, noData) => ({
  autosize: true,
  font: { family: colors?.fFamily, size: 10 },
  polar: { radialaxis: { visible: true } },
  margin: { l: 60, r: 20 },
  annotations: buildNoDataAnnotations(noData, colors?.fFamily),
  legend: POLAR_LEGEND,
  ...buildChartFrame(colors),
});

export default function PolarAreaChart({
  chartId, checkTheCond, paged, showtitle, width, height, xIs, yIs, type,
}) {
  const { baseUrl, viewToggle, projectName } = useChartStore();
  const [tracesIs, setTracesIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const polarAreaChartColors = useMemo(
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
    const parameters = polarAreaChartColors?.parameters || [];
    const parametersId = parameters.map((ele) => ele.parameterId);
    const url = buildRecentUrl({ baseUrl, parametersId, minutes: RECENT_MINUTES });

    await loadChartData({
      url,
      setTracesIs,
      setNoData,
      setLoading,
      selectData: selectAll,
      buildTraces: (data) => buildPolarTraces({ data, parameters, colors: polarAreaChartColors }),
    });
  }, [baseUrl, polarAreaChartColors]);

  useChartRefresh({ colors: polarAreaChartColors, fetchData: fetchDataAndRender, setLoading, toggle: viewToggle });

  const layout = useMemo(
    () => buildLayout(polarAreaChartColors, noData),
    [polarAreaChartColors, noData],
  );

  const { description, capture } = useChartInsight(layout.chartTitleIs, projectName);

  return (
    <View>
      <ChartComponent
        layout={layout}
        ChartColors={polarAreaChartColors}
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

PolarAreaChart.propTypes = buildChartPropTypes();