import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { TimingsConversion } from '../TimingsConversion';
import ChartComponent from '../../../Components/ChartComponent';
import {
  PANEL, isAnalyticsPage, createBasicDetails, buildChartPropTypes, buildChartColors,
  buildFilterRequestBody, buildRequestUrl, resolveChartRange, loadChartData,
  resolveSeriesColor, buildSeriesName, collectSeries, buildAxesLayout, buildLegend,
  buildNoDataAnnotations, buildChartFrame, useChartStore, useChartRefresh, useChartInsight,
} from '../../../Components/chartUtils';

const COLORS_KEY = 'mixedChart-colors';
const AREA_TYPE = 'area';
const MODE_BY_TYPE = { area: 'none', scatter: 'markers' };
const BASIC_DETAILS = createBasicDetails('Mixed Chart');

const buildMixedTrace = ({ paramId, index, paramData, page, data, multiaxis }) => {
  const { x, y } = collectSeries(data, paramId);
  const parameter = paramData.parameters[index];
  const seriesType = parameter.chartType;
  const isArea = seriesType === AREA_TYPE;

  return {
    x,
    y,
    name: buildSeriesName({ paged: page, paramData, index }),
    type: isArea ? 'scatter' : seriesType,
    fill: isArea ? 'tozeroy' : 'none',
    mode: MODE_BY_TYPE[seriesType] ?? 'lines',
    yaxis: multiaxis ? `y${index + 1}` : undefined,
    line: {
      dash: 'solid',
      width: 1.5,
      color: resolveSeriesColor(page, index, parameter),
    },
  };
};

const buildLayout = (colors, noData, page) => ({
  autosize: true,
  margin: { t: 5, l: 40, r: 20, b: 40 },
  annotations: buildNoDataAnnotations(noData, colors?.fFamily),
  x: 0.5,
  y: 0.3,
  ...buildAxesLayout(colors, isAnalyticsPage(page)),
  showlegend: colors?.showLegend,
  legend: buildLegend(colors, { yOffset: 0.2 }),
  ...buildChartFrame(colors),
});

export default function MixedChart({
  chartId, chartList, checkTheCond, page, showtitle, width, height, xIs, yIs, type,
}) {
  const { baseUrl, eventDatesIs, viewToggle, projectName } = useChartStore();
  const [tracesIs, setTracesIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const mixedChartColors = useMemo(
    () => buildChartColors({
      paged: page,
      checkTheCond,
      chartId,
      storageKey: COLORS_KEY,
      basicDetails: BASIC_DETAILS,
      sizeProps: { x: xIs, y: yIs, width, height },
    }),
    [page, checkTheCond, chartId, xIs, yIs, width, height],
  );

  const fetchDataAndRender = useCallback(async () => {
    const isPanel = type === PANEL;
    const paramData = isAnalyticsPage(page) ? chartList : mixedChartColors;
    const { fromDate, toDate } = resolveChartRange({
      paged: page, chartList, colors: mixedChartColors, isPanel, eventDatesIs, timingsConverter: TimingsConversion,
    });

    const parametersId = paramData.parameters.map((ele) => ele.parameterId);
    const requestBody = buildFilterRequestBody(paramData.parameters, parametersId);
    const url = buildRequestUrl({
      baseUrl, parametersId, paramData, fromDate, toDate, requestBody, isPanel, dataType: 'line',
    });

    await loadChartData({
      url,
      setTracesIs,
      setNoData,
      setLoading,
      buildTraces: (data) => parametersId.map((paramId, index) => buildMixedTrace({
        paramId, index, paramData, page, data, multiaxis: mixedChartColors?.multiaxis,
      })),
    });
  }, [baseUrl, page, chartList, mixedChartColors, type, eventDatesIs]);

  useChartRefresh({ colors: mixedChartColors, fetchData: fetchDataAndRender, setLoading, toggle: viewToggle });

  const layout = useMemo(
    () => buildLayout(mixedChartColors, noData, page),
    [mixedChartColors, noData, page],
  );

  const { description, capture } = useChartInsight(layout.chartTitleIs, projectName);

  return (
    <View>
      <ChartComponent
        layout={layout}
        ChartColors={mixedChartColors}
        tracesIs={tracesIs}
        showtitle={showtitle}
        loading={loading}
        type={type}
        screen={page}
        onAIPress={capture}
        aiText={description}
      />
    </View>
  );
}

MixedChart.propTypes = buildChartPropTypes('page');