import React, { useEffect, useState } from 'react';
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { TimingsConversion } from '../TimingsConversion';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import ChartComponent from '../../../Components/ChartComponent';
export default function XYchart(props) {

  const { chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs } = props;
  const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
  const userDetail = useSelector(state => state.authSlice.userDetails);
  const dispatch = useDispatch();
  let scatterChartData = {};
  const [loading, setloading] = useState(false);
  const [tracesIs, setTraces] = useState([]);
  const [noData, setNoData] = useState(false);
  const [equation, setEquation] = useState('');
  const [squareVal, setSquareVal] = useState("");
  const [xParmname, setXParmName] = useState("");
  const [yParmName, setYParmName] = useState("");
  const [description, setDescription] = useState("");

  {/* <------ Chart styles and title data fetching ------> */ }
  if (paged === 'analytics') {
    scatterChartData = basicDetails
  } else {
    scatterChartData = checkTheCond[chartId]["XYChart-colors"]
  }

  {/* <------ Removing the web px value to mobile  ------> */ }
  const parseHeight = (value) => {
    if (typeof value === 'string') {
      return value.includes('px') ? parseFloat(value.replace('px', '')) : parseFloat(value);
    }
    return value;
  };

  const basicDetails = {
    chartTitle: "XY Chart", plotAreaBg: "#fff", plotAreaOutline: "#b3b0b0ff", areaBackground: "#fff", areaOutline: "#fff",
    isGridPresent: true, toolTip: true, showLegend: true, legend: { x: 0.5, y: 1.1 }, chartType: "horizontal", barGap: 0.3, donutGap: 0.6, scatterType: "bubble",
    fSize: "18px", fFamily: "Nunito", isBold: false, isItalic: false, isUnderLine: false, isCaseChange: false, xGridColor: "#000", yGridColor: "#C6D0DC",
    fontColor: "#33A9AC", fontBgColor: "#fff", legendTop: true, legendBottom: false, legendLeft: false, legendRight: false,
    xBold: false, xFontColor: "#b3b0b0ff", xFonntSize: "16", xfFamily: "Nunito", yBold: false, yFontColor: "#b3b0b0ff",
    yFonntSize: "16", yfFamily: "Nunito", reSizeProperties: { x: xIs, y: yIs, width: width, height: height }, textPosition: false, textInside: true, textOutSide: false,
    YGap: 0.3, heatColorRange: "none", HeatpaletNo: 0, parameters: [], refreshFreq: "None", timeRange: "5 Minute", subSup: "Enter The Title", xParm: "", yParm: "", xyLine: true, legendWeight: "14px", legendFamily: "Nunito"
  }

  {/* <------ Initialize the fetching and refresh frequency  ------> */ }
  useEffect(() => {
    setloading(true)
    const height = parseHeight(layout?.rndproperties?.height)
    const newHeight = Number(layout?.rndproperties.y) + Number(height) + 10;
    dispatch(updateHeight(newHeight));
    fetchDataAndRender()
    let refreshTime = 0;
    const refreshFreq = scatterChartData.refreshFreq.split(" ")
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
    let xy_chart = {}
    if (paged === 'analytics') {
      paramData = chartList
      fromDate = chartList.fromdateIs
      toDate = chartList.toDateIs
      xy_chart = { "x": chartList.xType, "y": chartList.yType }
    } else {
      paramData = scatterChartData
      if (scatterChartData.aggregateTime === "custom") {
        fromDate = scatterChartData.fromDate
        toDate = scatterChartData.toDate
      } else {
        const timeIs = TimingsConversion(scatterChartData.aggregateTime)
        fromDate = timeIs[0]
        toDate = timeIs[1]
      }
      xy_chart = { "x": scatterChartData.xParm, "y": scatterChartData.yParm }
      const xname = scatterChartData.parameters.filter((ele) => ele.parameterId === scatterChartData.xParm)
      if (xname.length > 0) {
        setXParmName(xname[0].name)
      }
      const yname = scatterChartData.parameters.filter((ele) => ele.parameterId === scatterChartData.yParm)
      if (yname.length > 0) {
        setYParmName(yname[0].name)
      }
    }

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
    RequestBody["xy_chart"] = xy_chart

    let url;
    if (paramData.aggregateTime === "custom" ||
      paramData.aggregateTime === "Days" ||
      paramData.aggregateTime === "Hours" ||
      paramData.aggregateTime === "Month" ||
      paramData.aggregateTime === "Past Month") {
      url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDate}&to_date=${toDate}&data_type=xy&filter_condition=${JSON.stringify(RequestBody)}`;
    } else {
      url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&data_type=xy&time_frequency=${paramData.aggregateTime}&filter_condition=${JSON.stringify(RequestBody)}`;
    }
    try {
      const token = await AsyncStorage.getItem('jwttoken');

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      if (Object.keys(response.data).length === 0) {
        setNoData(true);
        setloading(false);
      } else {
        setNoData(false);
      }
      setSquareVal(data["R-squared"])
      setEquation(data.Equation)
      if (data) {
        if (!scatterChartData.xyLine) {
          const trace = [
            {
              x: data.x_values,
              y: data.y_values,
              mode: 'markers',
              type: 'scatter',
              marker: {
                color: '#1682BC'
              },
            },
          ];
          setTraces(trace)
        } else {
          const trace = [
            {
              x: data.trend_x_range,
              y: data.trend_y_range,
              mode: 'lines',
              type: 'scatter',
              line: {
                color: '#FF0101'
              },
            },
            {
              x: data.x_values,
              y: data.y_values,
              mode: 'markers',
              type: 'scatter',
              marker: {
                color: '#1682BC'
              },
            },
          ];
          setloading(false)
          setTraces(trace)
          // dispatch(setuom(uomData))
        }
      } else {
        setTraces([])
      }
    } catch (error) {
      setNoData(true);
      setloading(false);
      console.error('Error fetching data:', error);
    }
  };

  {/* <------ layout styles for chart ------> */ }
  const layout = {
    autosize: true,
    margin: {
      t: 15,
      l: 40,
      r: 20,
      b: 50,
    },
    annotations: annotations,
    xaxis: {
      autorange: true,
      showgrid: scatterChartData.isGridPresent,
      gridcolor: scatterChartData.xGridColor,
      gridwidth: 1,
      griddash: 'dot',
      gridshape: 'linear',
      showline: true,
      title: xParmname, // Custom x-axis title
      automargin: true, // Automatically adjust margin for the title
      tickfont: {
        family: scatterChartData.xfFamily,
        size: 10,
        color: scatterChartData.xFontColor,
        weight: scatterChartData.xBold ? "bold" : "normal"
      },
      titlefont: {
        family: scatterChartData.xfFamily,
        size: 10,
        color: scatterChartData.xFontColor,
        weight: scatterChartData.xBold ? "bold" : "normal"
      },
    },
    yaxis: {
      autorange: true,
      showgrid: scatterChartData.isGridPresent,
      gridcolor: scatterChartData.yGridColor,
      gridwidth: 1,
      griddash: 'dot',
      gridshape: 'linear',
      showline: true,
      title: yParmName, // Custom x-axis title
      automargin: true, // 
      tickfont: {
        family: scatterChartData.yfFamily,
        size: 10,
        color: scatterChartData.yFontColor,
        weight: scatterChartData.yBold ? "bold" : "normal"
      },
      titlefont: {
        family: scatterChartData.xfFamily,
        size: 10,
        color: scatterChartData.xFontColor,
        weight: scatterChartData.xBold ? "bold" : "normal"
      },
    },
    showlegend: false,
    legend: {
      y: scatterChartData.legend.y,
      x: scatterChartData.legend.x,
      xanchor: 'center',
      orientation: 'v',
      font: {
        family: scatterChartData.legendFamily,
        size: 10,
        weight: 'lighter',
      }
    },
    images: [{
      "source": scatterChartData.plotAreaBg,
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
    paper_bgcolor: scatterChartData.areaBackground,
    plot_bgcolor: scatterChartData.plotAreaBg,
    shapes: [
      {
        type: 'rect',
        x0: 0,
        x1: 1,
        y0: 0,
        y1: 1,
        xref: 'paper',
        yref: 'paper',
        line: {
          color: scatterChartData.plotAreaOutline,
          width: 1,
        },
      },
    ],
    chartOutline: `1px solid ${scatterChartData.areaOutline}`,
    chartTitleIs: scatterChartData.chartTitle,
    fontSize: 10,
    fontFamily: scatterChartData.fFamily,
    isBold: scatterChartData.isBold,
    isItalic: scatterChartData.isItalic,
    isUnderLine: scatterChartData.isUnderLine,
    isCaseChange: scatterChartData.isCaseChange,
    fontColor: scatterChartData.fontColor,
    fontBgColor: scatterChartData.fontBgColor,
    rndproperties: scatterChartData.reSizeProperties
  };

  {/* <------ Equation value for xy chart  ------> */ }
  const annotations = [];
  if (noData) {
    annotations.push({
      x: 0.5,
      y: 0.5,
      xref: 'paper',
      yref: 'paper',
      text: 'No data found',
      showarrow: false,
      font: {
        family: scatterChartData.fFamily,
        size: scatterChartData.fSize - 5,
        color: 'red',
      },
    });
  } else if (scatterChartData.xyEq && scatterChartData.xyLine) {
    annotations.push(
      {
        x: 0.01, // X coordinate of the annotation (0 means left side of the plot)
        y: 0.99, // Y coordinate of the annotation (1 means top side of the plot)
        xref: 'paper', // Reference point for the x coordinate
        yref: 'paper', // Reference point for the y coordinate
        text: "Y = " + equation, // Text content of the annotation
        showarrow: false, // Whether to display an arrow with the annotation
        font: {
          family: scatterChartData.eqFontfamily,
          size: parseInt(scatterChartData.eqFontSize), // Font size of the annotation
          color: scatterChartData.eqCo,
        },
      },
      {
        x: 0.01, // X coordinate of the annotation (0 means left side of the plot)
        y: 0.93, // Y coordinate of the annotation (1 means top side of the plot)
        xref: 'paper', // Reference point for the x coordinate
        yref: 'paper', // Reference point for the y coordinate
        text: "R-squared = " + squareVal, // Text content of the annotation
        showarrow: false, // Whether to display an arrow with the annotation
        font: {
          family: scatterChartData.eqFontfamily,
          size: 12, // Font size of the annotation
          color: scatterChartData.eqCo,
        },
      }
    );
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
        ChartColors={scatterChartData}
        tracesIs={tracesIs}
        showtitle={showtitle}
        loading={loading}
        onAIPress={capture}
        aiText={description} />
    </View>
  );
}
