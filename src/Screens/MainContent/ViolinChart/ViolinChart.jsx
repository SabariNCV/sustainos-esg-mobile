import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { TimingsConversion } from '../TimingsConversion';
import ChartComponent from '../../../Components/ChartComponent';
import {
  PANEL, buildAxesLayout, buildChartColors, buildChartFrame, buildChartPropTypes,
  buildFilterRequestBody, buildLegend, buildNoDataAnnotations, buildParameterMaps, buildRequestUrl,
  createBasicDetails, getLegendName, isAnalyticsPage, loadChartData, resolveChartRange,
  resolveHoverInfo, useChartInsight, useChartRefresh, useChartStore,
} from '../../../Components/chartUtils';

const STORAGE_KEY = 'violinChart-colors';
const X_AXIS_EXTRAS = { nticks: 6 };
const MARGIN = { t: 0, l: 40, r: 20, b: 0 };
const LEGEND_Y_OFFSET = 0.25;

const BASIC_DETAILS = createBasicDetails('Violin Chart', {
  fSize: '18px', xFonntSize: '16', yFonntSize: '16', timeRange: 'hour', legendType: 'code',
});

const buildViolinTraces = ({ data, maps, paged, legendType, toolTip }) => {
  const seenLegends = new Set();
  return Object.entries(data).flatMap(([date, values]) => Object.entries(values).map(([key, value]) => {
    const name = getLegendName({ paged, key, legendType, ...maps });
    const showlegend = !seenLegends.has(name);
    seenLegends.add(name);
    return {
      x: Array(value.length).fill(date),
      y: value,
      hoverinfo: resolveHoverInfo(toolTip),
      type: 'violin',
      box: { visible: true },
      yaxis: 'y',
      name,
      marker: { color: isAnalyticsPage(paged) ? maps.analyticColor[key] : maps.markerColor[key] },
      showlegend,
    };
  }));
};

const buildLayout = (colors, noData, paged) => ({
  autosize: true,
  boxgap: colors?.barGap,
  boxgroupgap: colors?.barGap,
  boxmode: 'group',
  margin: MARGIN,
  annotations: buildNoDataAnnotations(noData, colors?.fFamily),
  ...buildAxesLayout(colors, isAnalyticsPage(paged), X_AXIS_EXTRAS),
  showlegend: colors?.showLegend,
  legend: buildLegend(colors, {
    yOffset: LEGEND_Y_OFFSET,
    fontSize: Number.parseInt(colors?.legendWeight, 10),
  }),
  ...buildChartFrame(colors),
});

export default function ViolinChart({
  chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type,
}) {
  const { baseUrl, eventDatesIs, viewToggle, projectName } = useChartStore();
  const [tracesIs, setTracesIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const colors = useMemo(
    () => buildChartColors({
      paged,
      checkTheCond,
      chartId,
      storageKey: STORAGE_KEY,
      basicDetails: BASIC_DETAILS,
      sizeProps: { x: xIs, y: yIs, width, height },
    }),
    [paged, checkTheCond, chartId, xIs, yIs, width, height],
  );

  const fetchData = useCallback(async () => {
    const isPanel = type === PANEL;
    const paramData = isAnalyticsPage(paged) ? chartList : colors;
    const { fromDate, toDate } = resolveChartRange({
      paged, chartList, colors, isPanel, eventDatesIs, timingsConverter: TimingsConversion,
    });

    const parametersId = paramData.parameters.map((parameter) => parameter.parameterId);
    const requestBody = buildFilterRequestBody(paramData.parameters, parametersId);
    const maps = buildParameterMaps(paramData.parameters);
    const url = buildRequestUrl({
      baseUrl,
      parametersId,
      paramData,
      fromDate,
      toDate,
      requestBody,
      isPanel,
      dataType: 'boxplot',
      extraParams: `&group_by=${colors?.timeRange}`,
    });

    await loadChartData({
      url,
      buildTraces: (data) => buildViolinTraces({
        data, maps, paged, legendType: colors?.legendType, toolTip: colors?.toolTip,
      }),
      setTracesIs,
      setNoData,
      setLoading,
    });
  }, [baseUrl, paged, chartList, colors, type, eventDatesIs]);

  useChartRefresh({ colors, fetchData, setLoading, toggle: viewToggle });

  const layout = useMemo(() => buildLayout(colors, noData, paged), [colors, noData, paged]);
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

ViolinChart.propTypes = buildChartPropTypes();