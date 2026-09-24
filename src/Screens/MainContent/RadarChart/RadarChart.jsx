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

export default function RadarChart(props) {
  const { chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs } = props;

  const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
  const dispatch = useDispatch();
  const [loading, setloading] = useState(false);
  const [tracesIs, setTraces] = useState([]);
  const [noData, setNoData] = useState(false);

  {/* <------ Chart styles and title data fetching ------> */ }
  let radarChartData = {}
  if (paged === 'analytics') {
    radarChartData = basicDetails
  } else {
    radarChartData = checkTheCond[chartId]["radarChart-colors"]
  }

  const basicDetails = {
    chartTitle: "Radar Chart", plotAreaBg: "#fff", plotAreaOutline: "#b3b0b0ff", areaBackground: "#fff", areaOutline: "#fff",
    isGridPresent: true, toolTip: true, showLegend: true, legend: { x: 0.5, y: 1.1 }, chartType: "horizontal", barGap: 0.3, donutGap: 0.6, scatterType: "bubble",
    fSize: "18px", fFamily: "Nunito", isBold: false, isItalic: false, isUnderLine: false, isCaseChange: false, legendType: "name", isTitleOpen: false,
    fontColor: "#33A9AC", fontBgColor: "#fff", legendTop: false, legendBottom: false, legendLeft: false, legendRight: false, xGridColor: "#000", yGridColor: "#C6D0DC",
    xBold: false, xFontColor: "#b3b0b0ff", xFonntSize: "16", xfFamily: "Nunito", yBold: false, yFontColor: "#b3b0b0ff",
    yFonntSize: "16", yfFamily: "Nunito", reSizeProperties: { x: xIs, y: yIs, width: width, height: height }, textPosition: false, textInside: true, textOutSide: false,
    YGap: 0.3, heatColorRange: "none", HeatpaletNo: 0, parameters: [], refreshFreq: "None", timeRange: "5 Minute", subSup: "Enter The Title", legendWeight: "14px", legendFamily: "Nunito"
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
    const refreshFreq = radarChartData.refreshFreq.split(" ")
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
    let fromDate, toDate;

    if (paged === 'analytics') {
      paramData = chartList
      fromDate = chartList.fromdateIs
      toDate = chartList.toDateIs

    } else {
      paramData = radarChartData
      if (radarChartData.aggregateTime === "custom") {
        fromDate = radarChartData.fromDate
        toDate = radarChartData.toDate
      } else {
        const timeIs = TimingsConversion(radarChartData.aggregateTime)
        fromDate = timeIs[0]
        toDate = timeIs[1]
      }

    }

    const parametersId = paramData.parameters.map((ele) => ele.parameterId)
    const parameterNames = paramData.parameters.map(parameter => parameter.name + "(" + parameter.paramUnit + ")");
    const radarNames = [...parameterNames, parameterNames[0]]
    const Uomdata = paramData.parameters.map(parameter => parameter.paramUnit);
    const RequestBody = {};
    const filter_tags = [];
    const defaultColors = ["#00A68F", "#528CFA", "#FF8810", "#C46253", "#7E01A9", "#CF2020", "#FFBB10", "#748C76", "#DF9F4E", "#9B79FF"]
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
      url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDate}&to_date=${toDate}&data_type=radar&aggregation_type=${paramData.aggregateRange}&filter_condition=${JSON.stringify(RequestBody)}`;
    } else {
      url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&data_type=radar&time_frequency=${paramData.aggregateTime}&aggregation_type=${paramData.aggregateRange}&filter_condition=${JSON.stringify(RequestBody)}`;
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
      if (data) {
        setTraces([
          {
            type: 'scatterpolar',
            r: data.r,
            theta: radarNames,
            fill: 'toself',
            name: 'Group A',
            hoverinfo: radarChartData.toolTip ? 'all' : 'none',
            marker: {
              color: paged === 'analytics' ? defaultColors[0] : radarChartData.radarColor  // Generate color dynamically or customize as needed
            },
          }
        ]);
        setloading(false)

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
    font: {
      family: radarChartData.xfFamily,
      size: 8,
      color: radarChartData.xFontColor,
      weight: radarChartData.xBold ? "bold" : "normal"
    },
    polar: {
      radialaxis: {
        visible: true,
        //range: [0, 50]
      },
      angularaxis: {
        tickfont: {
          family: radarChartData.xfFamily,
          size: 8,
          color: radarChartData.xFontColor,
          weight: radarChartData.xBold ? "bold" : "normal"
        }
    }
    },
    margin: {
      t: 15,
      l: 30,
      r: 20,
      b: 30,
    },
    x: 0.5,
    y: 0.3,
    xaxis: {
      autorange: true,
      showgrid: radarChartData.isGridPresent,
      nticks: 6,
      //zeroline: !lineChartStyles.isGridPresent,
      gridcolor: radarChartData.xGridColor,
      gridwidth: 1,
      griddash: 'dot',
      gridshape: 'linear',
      showline: true,
      tickfont: {
        family: radarChartData.xfFamily,
        size: 2,
        color: radarChartData.xFontColor,
        weight: radarChartData.xBold ? "bold" : "normal"
      },
      titlefont: {
        family: radarChartData.xfFamily, 
        size: 8, 
        color: radarChartData.xFontColor,
        weight: radarChartData.xBold ? "bold" : "normal"
      },
    },
    yaxis: {
      autorange: true,
      showgrid: radarChartData.isGridPresent,
      gridcolor: radarChartData.yGridColor,
      gridwidth: 1,
      griddash: 'dot',
      gridshape: 'linear',
      showline: true,
      tickfont: {
        family: radarChartData.yfFamily,
        size: 2,
        color: radarChartData.yFontColor,
        weight: radarChartData.yBold ? "bold" : "normal"
      },
      titlefont: {
        family: radarChartData.xfFamily, 
        size: 8, 
        color: radarChartData.xFontColor,
        weight: radarChartData.xBold ? "bold" : "normal"
      },
    },
    showlegend: false,
    legend: {
      y: radarChartData.legend.y,
      x: radarChartData.legend.x,
      orientation: 'h',
      xanchor: 'center',
      traceorder: 'normal',
      itemsizing: 'trace',
      font: {
        size: 8,
        weight: 'lighter',
      }
    },
    images: [{
      "source": radarChartData.plotAreaBg,
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
    paper_bgcolor: radarChartData.areaBackground,
    plot_bgcolor: radarChartData.plotAreaBg,
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
          color: radarChartData.plotAreaOutline,
          width: 1,
        },
      },
    ],
    chartOutline: `1px solid ${radarChartData.areaOutline}`,
    chartTitleIs: radarChartData.chartTitle,
    fontSize: 8,
    fontFamily: radarChartData.fFamily,
    isBold: radarChartData.isBold,
    isItalic: radarChartData.isItalic,
    isUnderLine: radarChartData.isUnderLine,
    isCaseChange: radarChartData.isCaseChange,
    fontColor: radarChartData.fontColor,
    fontBgColor: radarChartData.fontBgColor,
    rndproperties: radarChartData.reSizeProperties
  }

  return (
    <View>
      <ChartComponent layout={layout} ChartColors={radarChartData} tracesIs={tracesIs} showtitle={showtitle} loading={loading} />
    </View>
  );

}

