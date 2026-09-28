import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { TimingsConversion } from '../TimingsConversion';
import ChartComponent from '../../../Components/ChartComponent';
import {
  PANEL, isAnalyticsPage, createBasicDetails, buildChartPropTypes, buildChartColors,
  buildFilterRequestBody, buildRequestUrl, resolveChartRange, loadChartData, resolveHoverInfo,
  resolveSeriesColor, buildSeriesName, buildAxesLayout, buildLegend, buildNoDataAnnotations,
  buildChartFrame, useChartStore, useChartRefresh, useChartInsight,
} from '../../../Components/chartUtils';

const COLORS_KEY = 'barChart-colors';
const STACKED_TYPES = new Set(['SH', 'SV']);
const VERTICAL_TYPES = new Set(['V', 'SV']);
const BASIC_DETAILS = createBasicDetails('Bar Chart', { chartType: 'H', legendTop: true });

const buildBarTrace = ({ paramId, index, paramData, paged, data, isVertical, multiaxis }) => {
  const x = [];
  const y = [];
  Object.entries(data).forEach(([timestamp, values]) => {
    const value = values[paramId] || null;
    x.push(isVertical ? timestamp : value);
    y.push(isVertical ? value : timestamp);
  });

  return {
    x,
    y,
    hoverinfo: resolveHoverInfo(paramData?.toolTip),
    name: buildSeriesName({ paged, paramData, index }),
    type: 'bar',
    orientation: isVertical ? 'v' : 'h',
    marker: { color: resolveSeriesColor(paged, index, paramData?.parameters?.[index]) },
    yaxis: multiaxis ? `y${index + 1}` : undefined,
  };
};

const buildLayout = ({ colors, noData, paged, barType }) => ({
  autosize: true,
  barcornerradius: 8,
  barmode: STACKED_TYPES.has(barType) ? 'stack' : 'group',
  bargap: colors?.barGap,
  margin: { l: 30, r: 10, b: 5, t: 5 },
  annotations: buildNoDataAnnotations(noData, colors?.fFamily),
  ...buildAxesLayout(colors, isAnalyticsPage(paged)),
  showlegend: colors?.showLegend,
  legend: buildLegend(colors, { yOffset: 0.2 }),
  ...buildChartFrame(colors),
});

export default function BarChart({
  chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type,
}) {
  const { baseUrl, eventDatesIs, viewToggle, projectName } = useChartStore();
  const [tracesIs, setTracesIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const barChartColors = useMemo(
    () => buildChartColors({
      paged,
      checkTheCond,
      chartId,
      storageKey: COLORS_KEY,
      basicDetails: BASIC_DETAILS,
      sizeProps: { x: xIs, y: yIs, width, height },
      analyticsExtras: { multiaxis: chartList?.multiAxis, parameters: chartList?.parameters },
    }),
    [paged, chartList, checkTheCond, chartId, xIs, yIs, width, height],
  );

  const fetchDataAndRender = useCallback(async () => {
    const isPanel = type === PANEL;
    const paramData = isAnalyticsPage(paged) ? chartList : barChartColors;
    const { fromDate, toDate } = resolveChartRange({
      paged, chartList, colors: barChartColors, isPanel, eventDatesIs, timingsConverter: TimingsConversion,
    });

    const parameters = paramData?.parameters || [];
    const parametersId = parameters.map((ele) => ele?.parameterId);
    const requestBody = buildFilterRequestBody(parameters, parametersId);
    const url = buildRequestUrl({
      baseUrl, parametersId, paramData, fromDate, toDate, requestBody, isPanel, dataType: 'bar',
    });
    const isVertical = VERTICAL_TYPES.has(paramData?.barType);

    await loadChartData({
      url,
      setTracesIs,
      setNoData,
      setLoading,
      buildTraces: (data) => parametersId.map((paramId, index) => buildBarTrace({
        paramId, index, paramData, paged, data, isVertical, multiaxis: barChartColors?.multiaxis,
      })),
    });
  }, [baseUrl, paged, chartList, barChartColors, type, eventDatesIs]);

  useChartRefresh({ colors: barChartColors, fetchData: fetchDataAndRender, setLoading, toggle: viewToggle });

  const barType = isAnalyticsPage(paged) ? chartList?.barType : barChartColors?.barType;
  const layout = useMemo(
    () => buildLayout({ colors: barChartColors, noData, paged, barType }),
    [barChartColors, noData, paged, barType],
  );

  const { description, capture } = useChartInsight(layout.chartTitleIs, projectName);

  return (
    <View>
      <ChartComponent
        layout={layout}
        ChartColors={barChartColors}
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

BarChart.propTypes = buildChartPropTypes();