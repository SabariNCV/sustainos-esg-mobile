import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { TimingsConversion } from '../TimingsConversion';
import ChartComponent from '../../../Components/ChartComponent';
import {
  default_chart_colors, type_panel, isAnalyticsPage, createBasicDetails, buildChartPropTypes,
  buildChartColors, buildFilterRequestBody, buildRequestUrl, resolveChartRange, loadChartData,
  resolveHoverInfo, buildParameterMaps, getLegendName, buildAxesLayout, buildLegend,
  buildNoDataAnnotations, buildChartFrame, useChartStore, useChartRefresh, useChartInsight,
} from '../../../Components/chartUtils';

const colors_key = 'boxChart-colors';
const VERTICAL_TYPES = new Set(['V', '']);
const basic_details_chart = createBasicDetails('Box Chart', { timeRange: 'hour', legendType: 'code' });

const buildBoxTraces = ({ data, paramData, paged, parametersId, multiaxis }) => {
  const maps = buildParameterMaps(paramData.parameters, default_chart_colors);
  const isVertical = VERTICAL_TYPES.has(paramData.barType);
  const usedLegendNames = new Set();

  return Object.entries(data).flatMap(([date, values]) => Object.entries(values).map(([key, value]) => {
    const legendName = getLegendName({ paged, key, legendType: paramData.legendType, ...maps });
    const showlegend = !usedLegendNames.has(legendName);
    usedLegendNames.add(legendName);
    const category = new Array(value.length).fill(date);
    const paramIndex = parametersId.indexOf(Number.parseInt(key, 10));

    return {
      x: isVertical ? category : value,
      y: isVertical ? value : category,
      hoverinfo: resolveHoverInfo(paramData.toolTip),
      type: 'box',
      orientation: isVertical ? 'v' : 'h',
      boxpoints: 'all',
      pointpos: 0,
      yaxis: multiaxis ? `y${paramIndex + 1}` : undefined,
      name: legendName,
      marker: { color: isAnalyticsPage(paged) ? maps.analyticColor[key] : maps.markerColor[key] },
      showlegend,
    };
  }));
};

const buildLayout = (colors, noData) => ({
  autosize: true,
  boxgap: colors?.barGap,
  boxgroupgap: colors?.barGap,
  boxmode: 'group',
  margin: { l: 35, r: 20, b: 0, t: 0 },
  x: 0.5,
  y: 0.3,
  ...buildAxesLayout(colors, true),
  showlegend: colors?.showLegend,
  legend: buildLegend(colors, { yOffset: 0.2 }),
  annotations: buildNoDataAnnotations(noData, colors?.fFamily),
  ...buildChartFrame(colors),
});

export default function BoxChart({
  chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type,
}) {
  const { baseUrl, eventDatesIs, viewToggle, projectName } = useChartStore();
  const [tracesIs, setTracesIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const boxChartColors = useMemo(
    () => buildChartColors({
      paged,
      checkTheCond,
      chartId,
      storageKey: colors_key,
      basicDetails: basic_details_chart,
      sizeProps: { x: xIs, y: yIs, width, height },
      analyticsExtras: { multiaxis: chartList?.multiAxis, parameters: chartList?.parameters },
    }),
    [paged, chartList, checkTheCond, chartId, xIs, yIs, width, height],
  );

  const fetchDataAndRender = useCallback(async () => {
    const isPanel = type === type_panel;
    const paramData = isAnalyticsPage(paged) ? chartList : boxChartColors;
    const { fromDate, toDate } = resolveChartRange({
      paged, chartList, colors: boxChartColors, isPanel, eventDatesIs, timingsConverter: TimingsConversion,
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
      dataType: 'boxplot',
      extraParams: `&group_by=${boxChartColors?.timeRange}`,
    });

    await loadChartData({
      url,
      setTracesIs,
      setNoData,
      setLoading,
      buildTraces: (data) => buildBoxTraces({
        data, paramData, paged, parametersId, multiaxis: boxChartColors?.multiaxis,
      }),
    });
  }, [baseUrl, paged, chartList, boxChartColors, type, eventDatesIs]);

  useChartRefresh({ colors: boxChartColors, fetchData: fetchDataAndRender, setLoading, toggle: viewToggle });

  const layout = useMemo(
    () => buildLayout(boxChartColors, noData),
    [boxChartColors, noData],
  );

  const { description, capture } = useChartInsight(layout.chartTitleIs, projectName);

  return (
    <View>
      <ChartComponent
        layout={layout}
        ChartColors={boxChartColors}
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

BoxChart.propTypes = buildChartPropTypes();