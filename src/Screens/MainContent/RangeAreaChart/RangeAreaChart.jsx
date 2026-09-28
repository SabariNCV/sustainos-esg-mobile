import React, { useCallback, useMemo, useState } from 'react';
import { TimingsConversion } from '../TimingsConversion';
import ChartComponent from '../../../Components/ChartComponent';
import {
  type_panel, buildAxesLayout, buildBoundsMap, buildChartColors, buildChartFrame, buildChartPropTypes,
  buildFilterRequestBody, buildLegend, buildNoDataAnnotations, buildRequestUrl, buildSeriesName,
  createBasicDetails, isAnalyticsPage, loadChartData, resolveChartRange, resolveSeriesColor,
  useChartRefresh, useChartStore,
} from '../../../Components/chartUtils';

const STORAGE_KEY = 'rangeAreaChart-colors';
const X_AXIS_EXTRAS = { nticks: 6 };
const MARGIN = { t: 15, l: 40, r: 20, b: 50 };
const LEGEND_OPTIONS = { yOffset: 0.3, fontSize: 8 };

const basic_details_chart = createBasicDetails('RangeAreaChart', {
  fSize: '18px', xFonntSize: '16', yFonntSize: '16', legendTop: true,
});

const buildRangeTraces = ({ data, parametersId, paramData, paged, multiaxis }) => parametersId.flatMap((paramId, index) => {
  const parameter = paramData.parameters[index];
  const name = buildSeriesName({ paged, paramData, index });
  const color = resolveSeriesColor(paged, index, parameter);
  const yaxis = multiaxis ? `y${index + 1}` : undefined;

  const latest = { x: [], y: [], yaxis, showlegend: false, name, marker: { color: 'red' } };
  const lower = { x: [], y: [], yaxis, showlegend: false, name, marker: { color } };
  const upper = { x: [], y: [], yaxis, fill: 'tonexty', name, marker: { color } };

  Object.entries(data).forEach(([timestamp, values]) => {
    const point = values?.[paramId];
    if (point?.latest && point?.lower_bound && point?.upper_bound) {
      latest.x.push(timestamp);
      latest.y.push(point.latest);
      lower.x.push(timestamp);
      lower.y.push(point.lower_bound);
      upper.x.push(timestamp);
      upper.y.push(point.upper_bound);
    }
  });

  return [latest, lower, upper];
});

const buildLayout = (colors, noData, paged) => ({
  autosize: true,
  margin: MARGIN,
  annotations: buildNoDataAnnotations(noData, colors?.fFamily),
  ...buildAxesLayout(colors, isAnalyticsPage(paged), X_AXIS_EXTRAS),
  showlegend: colors?.showLegend,
  legend: buildLegend(colors, LEGEND_OPTIONS),
  ...buildChartFrame(colors),
});

export default function RangeAreaChart({
  chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type,
}) {
  const { baseUrl, eventDatesIs, viewToggle } = useChartStore();
  const [tracesIs, setTracesIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const colors = useMemo(
    () => buildChartColors({
      paged,
      checkTheCond,
      chartId,
      storageKey: STORAGE_KEY,
      basicDetails: basic_details_chart,
      sizeProps: { x: xIs, y: yIs, width, height },
      analyticsExtras: { multiaxis: chartList?.multiAxis, parameters: chartList?.parameters },
    }),
    [paged, checkTheCond, chartId, chartList, xIs, yIs, width, height],
  );

  const fetchData = useCallback(async () => {
    const isPanel = type === type_panel;
    const paramData = isAnalyticsPage(paged) ? chartList : colors;
    const { fromDate, toDate } = resolveChartRange({
      paged, chartList, colors, isPanel, eventDatesIs, timingsConverter: TimingsConversion,
    });

    const parametersId = paramData.parameters.map((parameter) => parameter.parameterId);
    const requestBody = buildFilterRequestBody(paramData.parameters, parametersId);
    const bounds = JSON.stringify(buildBoundsMap(paramData.parameters));
    const url = buildRequestUrl({
      baseUrl,
      parametersId,
      paramData,
      fromDate,
      toDate,
      requestBody,
      isPanel,
      dataType: 'range',
      extraParams: `&group_by=${colors?.timeRange}&bounds=${bounds}`,
    });

    await loadChartData({
      url,
      buildTraces: (data) => buildRangeTraces({
        data, parametersId, paramData, paged, multiaxis: colors?.multiaxis,
      }),
      setTracesIs,
      setNoData,
      setLoading,
    });
  }, [baseUrl, paged, chartList, colors, type, eventDatesIs]);

  useChartRefresh({ colors, fetchData, setLoading, toggle: viewToggle });

  const layout = useMemo(() => buildLayout(colors, noData, paged), [colors, noData, paged]);

  return (
    <ChartComponent
      layout={layout}
      ChartColors={colors}
      tracesIs={tracesIs}
      showtitle={showtitle}
      loading={loading}
    />
  );
}

RangeAreaChart.propTypes = buildChartPropTypes();