import React, { useEffect, useState } from 'react';
import {
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimingsConversion } from '../TimingsConversion';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import ChartComponent from '../../../Components/ChartComponent';
export default function ViolinChart(props) {

  const { chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs } = props;
  const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
  const userDetail = useSelector(state => state.authSlice.userDetails);
  const dispatch = useDispatch();
  const [tracesIs, setTraces] = useState([]);
  const [loading, setloading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [description, setDescription] = useState("");

  {/* <------ Chart styles and title data fetching ------> */ }
  let violinChartColors = basicDetails
  if (paged === 'analytics') {
    violinChartColors = basicDetails
  } else {
    violinChartColors = checkTheCond[chartId]["violinChart-colors"]
  }

  const basicDetails = {
    chartTitle: "Violin Chart", plotAreaBg: "#fff", plotAreaOutline: "#b3b0b0ff", areaBackground: "#fff", areaOutline: "#fff",
    isGridPresent: true, toolTip: true, showLegend: true, legend: { x: 0.5, y: 1.1 }, chartType: "horizontal", barGap: 0.3, donutGap: 0.6, scatterType: "bubble",
    fSize: "18px", fFamily: "Nunito", isBold: false, isItalic: false, isUnderLine: false, isCaseChange: false, isTitleOpen: false,
    fontColor: "#33A9AC", fontBgColor: "#fff", legendTop: false, legendBottom: false, legendLeft: false, legendRight: false, xGridColor: "#000", yGridColor: "#C6D0DC",
    xBold: false, xFontColor: "#b3b0b0ff", xFonntSize: "16", xfFamily: "Nunito", yBold: false, yFontColor: "#b3b0b0ff",
    yFonntSize: "16", yfFamily: "Nunito", reSizeProperties: { x: xIs, y: yIs, width: width, height: height }, textPosition: false, textInside: true, textOutSide: false,
    YGap: 0.3, heatColorRange: "none", HeatpaletNo: 0, parameters: [], refreshFreq: "None", timeRange: "hour", subSup: "Enter The Title", legendType: "code", legendWeight: "14px", legendFamily: "Nunito"
  }

  {/* <------ Removing the web px value to mobile  ------> */ }
  const parseHeight = (value) => {
    if (typeof value === 'string') {
      return value.includes('px') ? parseFloat(value.replace('px', '')) : parseFloat(value);
    }
    return value;
  };

  {/* <------ Initialize the fetching and refresh frequency  ------> */ }
  useEffect(() => {
    setloading(true)
    const height = parseHeight(layout?.rndproperties?.height)
    const newHeight = Number(layout?.rndproperties.y) + Number(height) + 10;
    dispatch(updateHeight(newHeight));
    fetchDataAndRender()
    // setloading(true)
    let refreshTime = 0;
    const refreshFreq = violinChartColors.refreshFreq.split(" ")
    if (refreshFreq[1] === "Second") {
      refreshTime = parseInt(refreshFreq[0]) * 1000
    } else if (refreshFreq[1] === "Minute") {
      refreshTime = parseInt(refreshFreq[0]) * 1000 * 60
    } else if (refreshFreq[1] === "Hours") {
      refreshTime = parseInt(refreshFreq[0]) * 1000 * 60 * 60
    } else {
      refreshTime = "None"
    }
    if (refreshTime !== "None") {
      const intervalId = setInterval(fetchDataAndRender, refreshTime);
      return () => clearInterval(intervalId);
    }

  }, [])

  {/* <------ fetching the data for chart based on  parametersId and time ------> */ }
  const fetchDataAndRender = async () => {
    let paramData = {}
    let fromDate, toDate, timeType;;

    if (paged === 'analytics') {
      paramData = chartList
      fromDate = chartList.fromdateIs
      toDate = chartList.toDateIs

    } else {
      paramData = violinChartColors
      timeType = violinChartColors.timeRange
      if (violinChartColors.aggregateTime === "custom") {

        fromDate = violinChartColors.fromDate
        toDate = violinChartColors.toDate
      } else {
        const timeIs = TimingsConversion(violinChartColors.aggregateTime)
        fromDate = timeIs[0]
        toDate = timeIs[1]
      }

    }

    const markerColor = paramData.parameters.reduce((acc, obj) => {
      acc[obj.parameterId] = obj.parameterColor;
      return acc;
    }, {});
    const parametersName = paramData.parameters.reduce((acc, obj) => {
      acc[obj.parameterId] = obj.name;
      return acc;
    }, {});
    const globalName = paramData.parameters.reduce((acc, obj) => {
      acc[obj.parameterId] = obj.global;
      return acc;
    }, {});
    const parmUnits = paramData.parameters.reduce((acc, obj) => {
      acc[obj.parameterId] = obj.paramUnit
        ;
      return acc;
    }, {});
    const analyticGlobal = paramData.parameters.reduce((acc, obj) => {
      acc[obj.parameterId] = obj.globalCode
        ;
      return acc;
    }, {});

    const defaultColors = ["#00A68F", "#528CFA", "#FF8810", "#C46253", "#7E01A9", "#CF2020", "#FFBB10", "#748C76", "#DF9F4E", "#9B79FF"]
    const analyticColor = paramData.parameters.reduce((acc, obj, index) => {
      acc[obj.parameterId] = defaultColors[index];
      return acc;
    }, {});
    const parametersId = paramData.parameters.map((ele) => ele.parameterId)
    const parameterNames = paramData.parameters.map(parameter => parameter.name);
    const Uomdata = paramData.parameters.map(parameter => parameter.paramUnit);
    const RequestBody = {};
    const filter_tags = [];
    paramData.parameters.forEach(item => {
      const conditions = item.fiterConditionsNewFormat.join(' ');
      RequestBody[item.parameterId] = conditions;
      item.fiterConditionsNewFormat.forEach(condition => {
        const paramId = condition.split(' ')[0];
        if (!parametersId.includes(parseInt(paramId)) && !filter_tags.includes(paramId)) {
          filter_tags.push(paramId);
        }
      });
    });
    RequestBody["filter_tags"] = filter_tags.join(',');
    let url;
    if (paramData.aggregateTime === "custom" ||
      paramData.aggregateTime === "Days" ||
      paramData.aggregateTime === "Hours" ||
      paramData.aggregateTime === "Month" ||
      paramData.aggregateTime === "Past Month") {
      url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDate}&to_date=${toDate}&data_type=boxplot&group_by=${timeType}&filter_condition=${JSON.stringify(RequestBody)}`;
    } else {
      url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&data_type=boxplot&time_frequency=${paramData.aggregateTime}&group_by=${timeType}&filter_condition=${JSON.stringify(RequestBody)}`;
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
      setloading(false)
      const uniqueLegendNames = new Set();
      if (data) {
        const traces = Object.entries(data).map(([date, values]) => {
          const subTraces = Object.entries(values).map(([key, value]) => {
            const legendName = paged === 'analytics' ? analyticGlobal[key] + "(" + parmUnits[key] + ")" : paramData.legendType === "name" ? parametersName[key] + "(" + parmUnits[key] + ")" : globalName[key] + "(" + parmUnits[key] + ")"
            return {
              x: Array(value.length).fill(date),
              y: value,
              hoverinfo: violinChartColors.toolTip ? 'all' : 'none',
              type: 'violin',
              box: {
                visible: true
              },
              yaxis: 'y',
              name: legendName,
              marker: {
                color: paged === 'analytics' ? analyticColor[key] : markerColor[key]
              },
              showlegend: !uniqueLegendNames.has(legendName) && uniqueLegendNames.add(legendName)
            };
          });
          return subTraces;
        }).flat();
        setTraces(traces);

      } else {
        setTraces([])
      }
    }
    catch (error) {
      setNoData(true);
      setloading(false)
      console.error('Error fetching data:', error);
    }
  };

  {/* <------ layout styles for chart ------> */ }
  const layout = {
    autosize: true,
    boxgap: violinChartColors.barGap,
    boxgroupgap: violinChartColors.barGap,
    boxmode: 'group',
    margin: {
      t: 0,
      l: 40,
      r: 20,
      b: 0,
    },
    x: 0.5,
    y: 0.3,
    xaxis: {
      autorange: true,
      showgrid: violinChartColors.isGridPresent,
      nticks: 6,
      gridcolor: violinChartColors.xGridColor,
      gridwidth: 1,
      griddash: 'dot',
      gridshape: 'linear',
      showline: true,
      tickfont: {
        family: violinChartColors.xfFamily,
        size: violinChartColors.xFonntSize - 5,
        color: violinChartColors.xFontColor,
        weight: violinChartColors.xBold ? "bold" : "normal"
      }
    },
    yaxis: {
      autorange: true,
      showgrid: violinChartColors.isGridPresent,
      gridcolor: violinChartColors.yGridColor,
      gridwidth: 1,
      griddash: 'dot',
      gridshape: 'linear',
      showline: true,
      tickfont: {
        family: violinChartColors.yfFamily,
        size: violinChartColors.yFonntSize - 5,
        color: violinChartColors.yFontColor,
        weight: violinChartColors.yBold ? "bold" : "normal"
      }
    },
    showlegend: violinChartColors.showLegend,
    legend: {
      y: violinChartColors.legend.y + 0.25,
      x: violinChartColors.legend.x,
      orientation: 'h',
      xanchor: 'center',
      traceorder: 'normal',
      itemsizing: 'trace',
      font: {
        family: violinChartColors.legendFamily,
        size: parseInt(violinChartColors.legendWeight),
        weight: 'lighter',
      }
    },
    images: [{
      "source": violinChartColors.plotAreaBg,
      "xref": "paper",
      "yref": "paper",
      "x": 0,
      "y": 1,
      "sizex": 1,
      "sizey": 1,
      "sizing": "stretch",
      "opacity": 0.7,
      "layer": "below"
    }],
    paper_bgcolor: violinChartColors.areaBackground,
    plot_bgcolor: violinChartColors.plotAreaBg,
    annotations: noData ? [{
      x: 0.5,
      y: 0.5,
      xref: 'paper',
      yref: 'paper',
      text: 'No data found',
      showarrow: false,
      font: {
        family: violinChartColors.fFamily,
        size: violinChartColors.fSize,
        color: 'red',
      },
    }] : [],
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
          color: violinChartColors.plotAreaOutline,
          width: 1,
        },
      },
    ],
    chartOutline: `1px solid ${violinChartColors.areaOutline}`,
    chartTitleIs: violinChartColors.chartTitle,
    fontSize: violinChartColors.fSize,
    fontFamily: violinChartColors.fFamily,
    isBold: violinChartColors.isBold,
    isItalic: violinChartColors.isItalic,
    isUnderLine: violinChartColors.isUnderLine,
    isCaseChange: violinChartColors.isCaseChange,
    fontColor: violinChartColors.fontColor,
    fontBgColor: violinChartColors.fontBgColor,
    rndproperties: violinChartColors.reSizeProperties
  }

  const capture = (url) => {
    const imagePostUrl = 'https://SustainOS.ai:9012/services/upload_chart/';
    const dataToPost = {
      'image': url,
      'chart_title': layout.chartTitleIs,
      'vertical_name': userDetail?.projectName?.name,
    }
    axios.post(imagePostUrl, dataToPost)
      .then(response => {
        setDescription(response.data.summary)
        // document.getElementById(summaryId).textContent = response.data.summary;
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        setSummaryLoading(false);
      });
  }

  return (
    <View>
      <ChartComponent
        layout={layout}
        ChartColors={violinChartColors}
        tracesIs={tracesIs}
        showtitle={showtitle}
        loading={loading}
        onAIPress={capture}
        aiText={description} />
    </View>
  )
}

