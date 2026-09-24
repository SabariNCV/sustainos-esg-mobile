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
export default function HeatMapChart(props) {

  const { chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs } = props;
  const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
  const userDetail = useSelector(state => state.authSlice.userDetails);
  const dispatch = useDispatch();
  let heatMapChartData = {};
  const [tracesIs, setTraces] = useState([]);
  const [loading, setloading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [description, setDescription] = useState("");

  {/* <------ Chart styles and title data fetching ------> */ }
  if (paged === 'analytics') {
    heatMapChartData = basicDetails
  } else {
    heatMapChartData = checkTheCond[chartId]["heatMapChart-colors"]
  }

  const basicDetails = {
    chartTitle: "heatMap Chart", plotAreaBg: "#fff", plotAreaOutline: "#b3b0b0ff", areaBackground: "#fff", areaOutline: "#fff",
    isGridPresent: true, toolTip: true, showLegend: true, legend: { x: 0.5, y: 1.1 }, chartType: "horizontal", barGap: 0.3, donutGap: 0.6, scatterType: "bubble",
    fSize: "12", fFamily: "Nunito", isBold: false, isItalic: false, isUnderLine: false, isCaseChange: false,
    fontColor: "#33A9AC", fontBgColor: "#fff", legendTop: false, legendBottom: false, legendLeft: false, legendRight: false,
    xBold: false, xFontColor: "#b3b0b0ff", xFonntSize: "12", xfFamily: "Nunito", yBold: false, yFontColor: "#b3b0b0ff",
    yFonntSize: "12", yfFamily: "Nunito", reSizeProperties: { x: xIs, y: yIs, width: width, height: height }, textPosition: false, textInside: true, textOutSide: false,
    YGap: 0.3, heatColorRange: "none", HeatpaletNo: 0, parameters: [], refreshFreq: "None", timeRange: "5 Minute", subSup: "Enter The Title"
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
    const refreshFreq = heatMapChartData.refreshFreq.split(" ")
    if (refreshFreq && refreshFreq[1] === "Second") {
      refreshTime = refreshFreq && parseInt(refreshFreq[0]) * 1000
    } else if (refreshFreq && refreshFreq[1] === "Minute") {
      refreshTime = refreshFreq && parseInt(refreshFreq[0]) * 1000 * 60
    } else if (refreshFreq && refreshFreq[1] === "Hours") {
      refreshTime = refreshFreq && parseInt(refreshFreq[0]) * 1000 * 60 * 60
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
      paramData = heatMapChartData
      if (heatMapChartData.aggregateTime === "custom") {
        fromDate = heatMapChartData.fromDate
        toDate = heatMapChartData.toDate
      } else {
        const timeIs = TimingsConversion(heatMapChartData.aggregateTime)
        fromDate = timeIs[0]
        toDate = timeIs[1]
      }
    }

    const paramCode = paramData.parameters.map((ele) => ele.global)
    const analyticParamCode = paramData.parameters.map((ele) => ele.globalCode)
    const parametersId = paramData.parameters.map((ele) => ele.parameterId)
    const parameterNames = paramData.parameters.map(parameter => parameter.name)
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
      url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDate}&to_date=${toDate}&data_type=heatmap&filter_condition=${JSON.stringify(RequestBody)}`;
    } else {
      url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&data_type=heatmap&time_frequency=${paramData.aggregateTime}&filter_condition=${JSON.stringify(RequestBody)}`;
    }
    try {

      const token = await AsyncStorage.getItem('jwttoken');
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setloading(false)
      if (Object.keys(response.data).length === 0) {
        setNoData(true);
        setloading(false);
      } else {
        setNoData(false);
      }
      const data = response.data.data;
      const sequential1 = [[0, '#C5E2EC'], [0.2, '#9DC4D3'], [0.5, '#74A7B9'], [0.8, '#48879D'], [1, '#236D86']];
      const sequential2 = [[0, '#00F5E7'], [0.2, '#00F8E0'], [0.5, '#00F3D4'], [0.8, '#00DEC4'], [1, '#34E9CC']];
      const sequential3 = [[0, '#FACBC5'], [0.2, '#F89B89'], [0.5, '#F25B2C'], [0.8, '#D95737'], [1, '#943D22']];
      const diverging1 = [[0, '#448C82'], [0.2, '#A7C1A4'], [0.5, '#F0EBD7'], [0.8, '#E6A777'], [1, '#C35E34']];
      const diverging2 = [[0, '#FDFFE1'], [0.2, '#F6C250'], [0.5, '#E54788'], [0.8, '#8D0F9B'], [1, '#4B1D93']];
      const diverging3 = [[0, '#6824FF'], [0.2, '#1C93EF'], [0.5, '#83FFB3'], [0.8, '#FD9B4F'], [1, '#FE3116']];
      const qualitative1 = [[0, '#8E025B'], [0.2, '#A20169'], [0.5, '#F8B9D8'], [0.8, '#DA5632'], [1, '#913D21']];
      const qualitative2 = [[0, '#006C74'], [0.2, '#018A99'], [0.5, '#97D6DB'], [0.8, '#0091AD'], [1, '#006E7E']];
      const qualitative3 = [[0, '#4A1668'], [0.2, '#5A2889'], [0.5, '#AC92BE'], [0.8, '#F3893A'], [1, '#E3701F']];
      let colorscale
      if (heatMapChartData.HeatpaletNo === 0) {
        colorscale = "none"
      } else if (heatMapChartData.HeatpaletNo === 1) {
        colorscale = sequential1
      } else if (heatMapChartData.HeatpaletNo === 2) {
        colorscale = sequential2
      } else if (heatMapChartData.HeatpaletNo === 3) {
        colorscale = sequential3
      } else if (heatMapChartData.HeatpaletNo === 4) {
        colorscale = diverging1
      } else if (heatMapChartData.HeatpaletNo === 5) {
        colorscale = diverging2
      } else if (heatMapChartData.HeatpaletNo === 6) {
        colorscale = diverging3
      } else if (heatMapChartData.HeatpaletNo === 7) {
        colorscale = qualitative1
      } else if (heatMapChartData.HeatpaletNo === 8) {
        colorscale = qualitative2
      } else if (heatMapChartData.HeatpaletNo === 9) {
        colorscale = qualitative3
      }

      if (data) {
        setTraces(
          [{
            z: data[0].z,
            x: data[0].x[0],
            y: paged === 'analytics' ? analyticParamCode : paramCode,
            colorscale: colorscale,
            "hoverinfo": heatMapChartData.toolTip ? 'all' : 'none',
            type: 'heatmap',
            hoverongaps: false,
            hovertemplate: 'Date: %{x}<br>Parameter: %{y}<br>Value: %{z}<extra></extra>',
            colorbar: {
              thickness: 8, // Width of the colorbar
              side: 'right',
              tickfont: {
                size: 8 // Font size of tick labels
              }
            }

          }]
        )
      } else {
        setTraces([])
      }
    }
    catch (error) {
      setloading(false)
      console.error('Error fetching data:', error);
    }
  };

  {/* <------ layout styles for chart ------> */ }
  const layout = {
    showscale: false,
    autosize: true,
    barGap: 0.1,
    ygap: heatMapChartData.YGap,
    margin: {
      t: 15,
      r: 40,
      b: 30,
      l: 40
    },
    annotations: noData ? [{
      x: 0.5,
      y: 0.5,
      xref: 'paper',
      yref: 'paper',
      text: 'No data found',
      showarrow: false,
      font: {
        family: heatMapChartData.fFamily,
        size: 8,
        color: 'red',
      },
    }] : [],
    x: 0.1,
    y: 0.3,
    showlegend: true,
    legend: {
      x: 0.1,
      y: 1.3,
      traceorder: 'normal',
      orientation: 'h',
      itemsizing: 'trace',
      tracegroupgap: 15,
      bgcolor: 'rgba(0,0,0,0)',
      bordercolor: '#fff',
      borderwidth: 2,
    },
    images: [{
      "source": heatMapChartData.plotAreaBg,
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
    paper_bgcolor: heatMapChartData.areaBackground,
    plot_bgcolor: heatMapChartData.plotAreaBg,
    xaxis: {
      autorange: true,
      showline: true,
      tickfont: {
        family: heatMapChartData.xfFamily,
        size: 6,
        color: heatMapChartData.xFontColor,
        weight: heatMapChartData.xBold ? "bold" : "normal"
      },
      tickangle: -0,
      //tickformat: '%H:%M',
    },
    yaxis: {
      autorange: true,
      showline: true,
      tickfont: {
        family: heatMapChartData.yfFamily,
        size: 5,
        color: heatMapChartData.yFontColor,
        weight: heatMapChartData.yBold ? "bold" : "normal"
      },
    },
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
          color: heatMapChartData.plotAreaOutline,
          width: 1,
        },
      },
    ],
    chartOutline: `1px solid ${heatMapChartData.areaOutline}`,
    chartTitleIs: heatMapChartData.chartTitle,
    fontSize: 6,
    fontFamily: heatMapChartData.fFamily,
    isBold: heatMapChartData.isBold,
    isItalic: heatMapChartData.isItalic,
    isUnderLine: heatMapChartData.isUnderLine,
    isCaseChange: heatMapChartData.isCaseChange,
    fontColor: heatMapChartData.fontColor,
    fontBgColor: heatMapChartData.fontBgColor,
    rndproperties: heatMapChartData.reSizeProperties,

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
      ChartColors={heatMapChartData} 
      tracesIs={tracesIs} 
      showtitle={showtitle} 
      loading={loading} 
      onAIPress={capture}
      aiText={description}/>
    </View>

  );
}

