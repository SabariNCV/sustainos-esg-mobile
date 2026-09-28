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

const colors_key = 'areaChart-colors';
const X_AXIS_EXTRAS = { nticks: 6 };
const basic_details_chart = createBasicDetails('Area Chart', {
  fSize: '18px', xFonntSize: '16', yFonntSize: '16', legendTop: true,
});

const buildAreaTrace = ({ paramId, index, paramData, page, data, colors }) => {
  const { x, y } = collectSeries(data, paramId);

  return {
    x,
    y,
    name: buildSeriesName({ paged: page, paramData, index }),
    fill: 'tozeroy',
    type: 'scatter',
    hoverinfo: resolveHoverInfo(colors?.toolTip),
    line: {
      dash: 'solid',
      width: 1.5,
      color: resolveSeriesColor(page, index, paramData.parameters[index]),
    },
    yaxis: colors?.multiaxis ? `y${index + 1}` : 'y',
  };
};

const buildLayout = (colors, noData, page) => ({
  autosize: true,
  margin: { t: 5, r: 20, b: 30, l: 25 },
  annotations: buildNoDataAnnotations(noData, colors?.fFamily),
  ...buildAxesLayout(colors, isAnalyticsPage(page), X_AXIS_EXTRAS),
  showlegend: colors?.showLegend,
  legend: buildLegend(colors, { yOffset: 0.2 }),
  ...buildChartFrame(colors, colors?.fSize),
});

export default function AreaChart({
  chartId, chartList, checkTheCond, page, showtitle, width, height, xIs, yIs, type,
}) {
  const { baseUrl, eventDatesIs, viewToggle, projectName } = useChartStore();
  const [tracesIs, setTracesIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const areaChartColors = useMemo(
    () => buildChartColors({
      paged: page,
      checkTheCond,
      chartId,
      storageKey: colors_key,
      basicDetails: basic_details_chart,
      sizeProps: { x: xIs, y: yIs, width, height },
    }),
    [page, checkTheCond, chartId, xIs, yIs, width, height],
  );

  const fetchDataAndRender = useCallback(async () => {
    const isPanel = type === type_panel;
    const paramData = isAnalyticsPage(page) ? chartList : areaChartColors;
    const { fromDate, toDate } = resolveChartRange({
      paged: page, chartList, colors: areaChartColors, isPanel, eventDatesIs, timingsConverter: TimingsConversion,
    });

    const parameters = paramData?.parameters || [];
    const parametersId = parameters.map((ele) => ele?.parameterId);
    const requestBody = buildFilterRequestBody(parameters, parametersId);
    const url = buildRequestUrl({
      baseUrl, parametersId, paramData, fromDate, toDate, requestBody, isPanel, dataType: 'area',
    });

    await loadChartData({
      url,
      setTracesIs,
      setNoData,
      setLoading,
      buildTraces: (data) => parametersId.map((paramId, index) => buildAreaTrace({
        paramId, index, paramData, page, data, colors: areaChartColors,
      })),
    });
  }, [baseUrl, page, chartList, areaChartColors, type, eventDatesIs]);

  useChartRefresh({ colors: areaChartColors, fetchData: fetchDataAndRender, setLoading, toggle: viewToggle });

  const layout = useMemo(
    () => buildLayout(areaChartColors, noData, page),
    [areaChartColors, noData, page],
  );

  const { description, capture } = useChartInsight(layout.chartTitleIs, projectName);

  return (
    <View>
      <ChartComponent
        layout={layout}
        ChartColors={areaChartColors}
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

AreaChart.propTypes = buildChartPropTypes('page');