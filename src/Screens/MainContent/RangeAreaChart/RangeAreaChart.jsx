import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimingsConversion } from '../TimingsConversion';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import ChartComponent from '../../../Components/ChartComponent';

export default function RangeAreaChart(props) {
  const {
    chartId,
    chartList,
    checkTheCond,
    paged,
    showtitle,
    width,
    height,
    xIs,
    yIs,
  } = props;
  const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
  const dispatch = useDispatch();
  const [tracesIs, setTraces] = useState([]);
  const [loading, setloading] = useState(false);
  const [noData, setNoData] = useState(false);

  const basicDetails = {
    chartTitle: 'RangeAreaChart',
    plotAreaBg: '#fff',
    plotAreaOutline: '#b3b0b0ff',
    areaBackground: '#fff',
    areaOutline: '#fff',
    isGridPresent: true,
    toolTip: true,
    showLegend: true,
    legend: { x: 0.5, y: 1.1 },
    chartType: 'horizontal',
    barGap: 0.3,
    donutGap: 0.6,
    scatterType: 'bubble',
    fSize: '18px',
    fFamily: 'Nunito',
    isBold: false,
    isItalic: false,
    isUnderLine: false,
    isCaseChange: false,
    isTitleOpen: false,
    fontColor: '#33A9AC',
    fontBgColor: '#fff',
    legendTop: true,
    legendBottom: false,
    legendLeft: false,
    legendRight: false,
    xGridColor: '#000',
    yGridColor: '#C6D0DC',
    xBold: false,
    xFontColor: '#b3b0b0ff',
    xFonntSize: '16',
    xfFamily: 'Nunito',
    yBold: false,
    yFontColor: '#b3b0b0ff',
    yFonntSize: '16',
    yfFamily: 'Nunito',
    reSizeProperties: { x: xIs, y: yIs, width: width, height: height },
    textPosition: false,
    textInside: true,
    textOutSide: false,
    YGap: 0.3,
    heatColorRange: 'none',
    HeatpaletNo: 0,
    parameters: [],
    refreshFreq: 'None',
    timeRange: '5 Minute',
    subSup: 'Enter The Title',
    legendWeight: '14px',
    legendFamily: 'Nunito',
  };

  {
    /* <------ Chart styles and title data fetching ------> */
  }
  let rangeAreaChartData = basicDetails;

  if (paged === 'analytics') {
    rangeAreaChartData = basicDetails;
  } else {
    rangeAreaChartData = checkTheCond[chartId]['rangeAreaChart-colors'];
  }

  {
    /* <------ Removing the web px value to mobile  ------> */
  }
  const parseHeight = value => {
    if (typeof value === 'string') {
      return value.includes('px')
        ? parseFloat(value.replace('px', ''))
        : parseFloat(value);
    }
    return value;
  };

  {
    /* <------ Initialize the fetching and refresh frequency  ------> */
  }
  useEffect(() => {
    setloading(true);
    const height = parseHeight(layout?.rndproperties?.height);
    const newHeight = Number(layout?.rndproperties.y) + Number(height) + 10;
    dispatch(updateHeight(newHeight));
    fetchDataAndRender();
    // setloading(true)
    let refreshTime = 0;
    const refreshFreq = rangeAreaChartData.refreshFreq.split(' ');
    if (refreshFreq[1] === 'Second') {
      refreshTime = parseInt(refreshFreq[0]) * 1000;
    } else if (refreshFreq[1] === 'Minute') {
      refreshTime = parseInt(refreshFreq[0]) * 1000 * 60;
    } else if (refreshFreq[1] === 'Hours') {
      refreshTime = parseInt(refreshFreq[0]) * 1000 * 60 * 60;
    } else {
      refreshTime = 'None';
    }

    if (refreshTime !== 'None') {
      const intervalId = setInterval(fetchDataAndRender, refreshTime);
      return () => clearInterval(intervalId);
    }
  }, []);

  {
    /* <------ fetching the data for chart based on  parametersId and time ------> */
  }
  const fetchDataAndRender = async () => {
    let paramData = {};
    let fromDate, toDate, timeType;

    if (paged === 'analytics') {
      paramData = chartList;
      fromDate = chartList.fromdateIs;
      toDate = chartList.toDateIs;
    } else {
      paramData = rangeAreaChartData;
      timeType = rangeAreaChartData.timeRange;
      if (rangeAreaChartData.aggregateTime === 'custom') {
        fromDate = rangeAreaChartData.fromDate;
        toDate = rangeAreaChartData.toDate;
      } else {
        const timeIs = TimingsConversion(rangeAreaChartData.aggregateTime);
        fromDate = timeIs[0];
        toDate = timeIs[1];
      }
    }

    const parametersId = paramData.parameters.map(ele => ele.parameterId);
    const parameterNames = paramData.parameters.map(
      parameter => parameter.name,
    );
    const Uomdata = paramData.parameters.map(parameter => parameter.paramUnit);
    // const symbolIs = scatterIS.parameters.map((ele)=>ele.symbol)
    const RequestBody = {};
    const filter_tags = [];
    const bounds = {};
    const defaultColors = [
      '#00A68F',
      '#528CFA',
      '#FF8810',
      '#C46253',
      '#7E01A9',
      '#CF2020',
      '#FFBB10',
      '#748C76',
      '#DF9F4E',
      '#9B79FF',
    ];
    paramData.parameters.forEach(item => {
      const conditions = item.fiterConditionsNewFormat.join(' ');
      RequestBody[item.parameterId] = conditions;
      bounds[item.parameterId] = { "ub": item.upperBoundValue, "lb": item.lowerBoundValue }
      item.fiterConditionsNewFormat.forEach(condition => {
        const paramId = condition.split(' ')[0];
        if (!parametersId.includes(parseInt(paramId)) && !filter_tags.includes(paramId)) {
          filter_tags.push(paramId);
        }
      });
    });
    const boundString = JSON.stringify(bounds);
    RequestBody['filter_tags'] = filter_tags.join(',');
    let url;
    if (
      paramData.aggregateTime === 'custom' ||
      paramData.aggregateTime === 'Days' ||
      paramData.aggregateTime === 'Hours' ||
      paramData.aggregateTime === 'Month' ||
      paramData.aggregateTime === 'Past Month'
    ) {
      url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDate}&to_date=${toDate}&data_type=range&group_by=${timeType}&bounds=${boundString}&filter_condition=${JSON.stringify(
        RequestBody,
      )}`;
    } else {
      url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&data_type=range&time_frequency=${paramData.aggregateTime
        }&group_by=${timeType}&bounds=${boundString}&filter_condition=${JSON.stringify(
          RequestBody,
        )}`;
    }
    try {
      const token = await AsyncStorage.getItem('jwttoken');
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data.data;
      if (Object.keys(response.data).length === 0) {
        setNoData(true);
        setloading(false);
      } else {
        setNoData(false);
      }
      setloading(false);
      if (data) {
        const traces = [];
        parametersId.forEach((key, ind) => {
          const trace1 = {
            x: [],
            y: [],
            yaxis: rangeAreaChartData.multiaxis ? `y${ind + 1}` : undefined,
            showlegend: false,
            name: Object.keys(checkTheCond).length < 1 ? chartList.parametrList[ind].global + "(" + paramData.parameters[ind].paramUnit + ")" : paramData.legendType === "name" ? paramData.parameters[ind].name + "(" + paramData.parameters[ind].paramUnit + ")" : paramData.parameters[ind].global + "(" + paramData.parameters[ind].paramUnit + ")",
            marker: {
              color: "red",
            },
          };
          const trace2 = {
            x: [],
            y: [],
            showlegend: false,
            yaxis: rangeAreaChartData.multiaxis ? `y${ind + 1}` : undefined,
            name: Object.keys(checkTheCond).length < 1 ? chartList.parametrList[ind].global + "(" + paramData.parameters[ind].paramUnit + ")" : paramData.legendType === "name" ? paramData.parameters[ind].name + "(" + paramData.parameters[ind].paramUnit + ")" : paramData.parameters[ind].global + "(" + paramData.parameters[ind].paramUnit + ")",
            marker: {
              color: Object.keys(checkTheCond).length < 1 ? defaultColors[ind] : paramData.parameters[ind].parameterColor,
            },
          };
          const trace3 = {
            x: [],
            y: [],
            yaxis: rangeAreaChartData.multiaxis ? `y${ind + 1}` : undefined,
            fill: 'tonexty',
            name: Object.keys(checkTheCond).length < 1 ? chartList.parametrList[ind].global + "(" + paramData.parameters[ind].paramUnit + ")" : paramData.legendType === "name" ? paramData.parameters[ind].name + "(" + paramData.parameters[ind].paramUnit + ")" : paramData.parameters[ind].global + "(" + paramData.parameters[ind].paramUnit + ")",
            marker: {
              color: Object.keys(checkTheCond).length < 1 ? defaultColors[ind] : paramData.parameters[ind].parameterColor,
            },
          };
          Object.entries(data).forEach(([timestamp, values]) => {
            const latest = values[parametersId[ind]]["latest"];
            const minIs = values[parametersId[ind]]["lower_bound"];
            const maxIs = values[parametersId[ind]]["upper_bound"];
            if (latest && minIs && maxIs) {
              trace1.x.push(timestamp);
              trace1.y.push(latest || null);
              trace2.x.push(timestamp)
              trace2.y.push(minIs || null);
              trace3.x.push(timestamp)
              trace3.y.push(maxIs || null);
            }
          });

          traces.push(trace1, trace2, trace3);
        });
        setTraces(traces);

        // parametersId.forEach((key, ind) => {
        //   const trace1 = {
        //     x: [],
        //     y: [],
        //     showlegend: false,
        //     name:
        //       Object.keys(checkTheCond).length < 1
        //         ? chartList.parametrList[ind].globalCode +
        //         '(' +
        //         paramData.parameters[ind].paramUnit +
        //         ')'
        //         : paramData.legendType === 'name'
        //           ? paramData.parameters[ind].name +
        //           '(' +
        //           paramData.parameters[ind].paramUnit +
        //           ')'
        //           : paramData.parameters[ind].global +
        //           '(' +
        //           paramData.parameters[ind].paramUnit +
        //           ')',
        //     marker: {
        //       color: 'red',
        //     },
        //   };
        //   const trace2 = {
        //     x: [],
        //     y: [],
        //     showlegend: false,
        //     name:
        //       Object.keys(checkTheCond).length < 1
        //         ? chartList.parametrList[ind].globalCode +
        //         '(' +
        //         paramData.parameters[ind].paramUnit +
        //         ')'
        //         : paramData.legendType === 'name'
        //           ? paramData.parameters[ind].name +
        //           '(' +
        //           paramData.parameters[ind].paramUnit +
        //           ')'
        //           : paramData.parameters[ind].global +
        //           '(' +
        //           paramData.parameters[ind].paramUnit +
        //           ')',
        //     marker: {
        //       color:
        //         Object.keys(checkTheCond).length < 1
        //           ? defaultColors[ind]
        //           : paramData.parameters[ind].parameterColor,
        //     },
        //   };
        //   const trace3 = {
        //     x: [],
        //     y: [],
        //     fill: 'tonexty',
        //     name:
        //       Object.keys(checkTheCond).length < 1
        //         ? chartList.parametrList[ind].globalCode +
        //         '(' +
        //         paramData.parameters[ind].paramUnit +
        //         ')'
        //         : paramData.legendType === 'name'
        //           ? paramData.parameters[ind].name +
        //           '(' +
        //           paramData.parameters[ind].paramUnit +
        //           ')'
        //           : paramData.parameters[ind].global +
        //           '(' +
        //           paramData.parameters[ind].paramUnit +
        //           ')',
        //     marker: {
        //       color:
        //         Object.keys(checkTheCond).length < 1
        //           ? defaultColors[ind]
        //           : paramData.parameters[ind].parameterColor,
        //     },
        //   };
        //   Object.entries(data).forEach(([timestamp, values]) => {
        //     const latest = values[parametersId[ind]]['latest'];
        //     const minIs = values[parametersId[ind]]['lower_bound'];
        //     const maxIs = values[parametersId[ind]]['upper_bound'];
        //     trace1.x.push(timestamp);
        //     trace1.y.push(latest || null);
        //     trace2.x.push(timestamp);
        //     trace2.y.push(minIs || null);
        //     trace3.x.push(timestamp);
        //     trace3.y.push(maxIs || null);
        //   });

        //   traces.push(trace1, trace2, trace3);
        // });
        // setTraces(traces);
      } else {
        setTraces([]);
      }
    } catch (error) {
      setNoData(true);
      setloading(false);
      console.error('Error fetching data:', error);
    }
  };

  {
    /* <------ layout styles for chart ------> */
  }
  const layout = {
    autosize: true,
    margin: {
      t: 15,
      l: 40,
      r: 20,
      b: 50,
    },
    annotations: noData
      ? [
        {
          x: 0.5,
          y: 0.5,
          xref: 'paper',
          yref: 'paper',
          text: 'No data found',
          showarrow: false,
          font: {
            family: rangeAreaChartData.fFamily,
            size: rangeAreaChartData.fSize,
            color: 'red',
          },
        },
      ]
      : [],
    x: 0.5,
    y: 0.3,
    xaxis: {
      autorange: true,
      showgrid: rangeAreaChartData.isGridPresent,
      nticks: 6,
      //zeroline: !rangeAreaChartData.isGridPresent,
      gridcolor: rangeAreaChartData.xGridColor,
      gridwidth: 1,
      griddash: 'dot',
      gridshape: 'linear',
      showline: true,
      tickfont: {
        family: rangeAreaChartData.xfFamily,
        size: rangeAreaChartData.xFonntSize - 5,
        color: rangeAreaChartData.xFontColor,
        weight: rangeAreaChartData.xBold ? 'bold' : 'normal',
      },
      tickangle: -0,
    },
    yaxis: {
      autorange: true,
      showgrid: rangeAreaChartData.isGridPresent,
      gridcolor: rangeAreaChartData.yGridColor,
      gridwidth: 1,
      griddash: 'dot',
      gridshape: 'linear',
      showline: true,
      tickfont: {
        family: rangeAreaChartData.yfFamily,
        size: rangeAreaChartData.yFonntSize - 5,
        color: rangeAreaChartData.yFontColor,
        weight: rangeAreaChartData.yBold ? 'bold' : 'normal',
      },
    },
    showlegend: rangeAreaChartData.showLegend,
    legend: {
      y: rangeAreaChartData.legend.y + 0.3,
      x: rangeAreaChartData.legend.x,
      orientation: 'h',
      xanchor: 'center',
      traceorder: 'normal',
      itemsizing: 'trace',
      font: {
        size: 8,
        weight: 'lighter',
      },
    },
    images: [
      {
        source: rangeAreaChartData.plotAreaBg,
        xref: 'paper',
        yref: 'paper',
        x: 0,
        y: 1,
        sizex: 1,
        sizey: 1,
        sizing: 'stretch',
        opacity: 0.7,
        layer: 'below',
      },
    ],
    paper_bgcolor: rangeAreaChartData.areaBackground,
    plot_bgcolor: rangeAreaChartData.plotAreaBg,
    shapes: [
      {
        type: 'rect',
        x0: 0,
        x1: 1.0,
        y0: 0,
        y1: 1.0,
        xref: 'paper',
        yref: 'paper',
        line: {
          color: rangeAreaChartData.plotAreaOutline,
          width: 1,
        },
      },
    ],
    chartOutline: `1px solid ${rangeAreaChartData.areaOutline}`,
    chartTitleIs: rangeAreaChartData.chartTitle,
    fontSize: rangeAreaChartData.fSize,
    fontFamily: rangeAreaChartData.fFamily,
    isBold: rangeAreaChartData.isBold,
    isItalic: rangeAreaChartData.isItalic,
    isUnderLine: rangeAreaChartData.isUnderLine,
    isCaseChange: rangeAreaChartData.isCaseChange,
    fontColor: rangeAreaChartData.fontColor,
    fontBgColor: rangeAreaChartData.fontBgColor,
    rndproperties: rangeAreaChartData.reSizeProperties,
  };

  return (
    <>
      <ChartComponent
        layout={layout}
        ChartColors={rangeAreaChartData}
        tracesIs={tracesIs}
        showtitle={showtitle}
        loading={loading}
      />
    </>
  );
}
