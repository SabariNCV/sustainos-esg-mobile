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

export default function GaugeChart(props) {

  const { chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type } = props;
  const dispatch = useDispatch();
  const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
  const userDetail = useSelector(state => state.authSlice.userDetails);
  const [gaugeColorValue, setGaugeColorValue] = useState("")
  const [gaugeColor, setGaugeColor] = useState("");
  const [tracesIs, setTraces] = useState([]);
  const [loading, setloading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [description, setDescription] = useState("");

  {/* <------ Chart styles and title data fetching ------> */ }
  let gaugeChartData = basicDetails;

  if (paged === 'analytics') {
    gaugeChartData = basicDetails
  } else {
    gaugeChartData = checkTheCond[chartId]["gaugeChart-colors"]
  }

  const basicDetails = {
    chartTitle: "Gauge Chart", plotAreaBg: "#fff", plotAreaOutline: "#b3b0b0ff", areaBackground: "#fff", areaOutline: "#fff",
    isGridPresent: true, toolTip: true, showLegend: true, legend: { x: 0.5, y: 1.1 }, chartType: "horizontal", barGap: 0.3, donutGap: 0.6, scatterType: "bubble",
    fSize: "18px", fFamily: "Nunito", isBold: false, isItalic: false, isUnderLine: false, isCaseChange: false, legendType: "name", isTitleOpen: false,
    fontColor: "#33A9AC", fontBgColor: "#fff", legendTop: false, legendBottom: false, legendLeft: false, legendRight: false,
    xBold: false, xFontColor: "#b3b0b0ff", xFonntSize: "16", xfFamily: "Nunito", yBold: false, yFontColor: "#b3b0b0ff",
    yFonntSize: "16", yfFamily: "Nunito", reSizeProperties: { x: xIs, y: yIs, width: width, height: height }, textPosition: false, textInside: true, textOutSide: false,
    YGap: 0.3, heatColorRange: "none", HeatpaletNo: 0, parameters: [], refreshFreq: "None", timeRange: "5 Minute", subSup: "Enter The Title", gaugeMin: "",
    gaugeMax: "", gaugeBg: [], gaugecolor: []
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
    let refreshTime = 0;
    const refreshFreq = gaugeChartData.refreshFreq.split(" ")
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

  {/* <------ Apply conditions and update colors using map ------> */ }
  useEffect(() => {
    const getGaugeColor = () => {
      if (gaugeChartData.gaugecolor && gaugeChartData.gaugecolor.length > 0) {
        const newColor = gaugeChartData.gaugecolor[0].color;
        setGaugeColor(newColor);
      }
    };
    getGaugeColor();
  }, [gaugeColorValue]);

  {/* <------ fetching the data for chart based on  parametersId and time ------> */ }
  const fetchDataAndRender = async () => {
    let paramData = {}
    let fromDate, toDate;
    if (paged === 'analytics') {
      paramData = chartList
      fromDate = chartList.fromdateIs
      toDate = chartList.toDateIs
    } else {
      if (type === "panel") {
        paramData = gaugeChartData
        const toDateObj = new Date(eventDatesIs[1]);
        const fromDateObj = new Date(eventDatesIs[0]);
        //calculate the difference between from and todates
        const differenceInMillis = toDateObj.getTime() - fromDateObj.getTime();
        //calculate the half the difference
        const halfDifferenceInMillis = differenceInMillis / 2;
        //Adjust the from date by subtracting with half difference
        const adjustedFromDateObj = new Date(fromDateObj.getTime() - halfDifferenceInMillis);
        //Adjust the to date by adding with half difference
        const adjustedToDateObj = new Date(toDateObj.getTime() + halfDifferenceInMillis);
        //function handles to formate the from and to dates for any kind of time zones

        function formatLocalDate(date) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        fromDate = formatLocalDate(adjustedFromDateObj);
        toDate = formatLocalDate(adjustedToDateObj);
      } else {
        paramData = gaugeChartData
        if (gaugeChartData.aggregateTime === "custom") {
          fromDate = gaugeChartData.fromDate
          toDate = gaugeChartData.toDate
        } else {
          const timeIs = TimingsConversion(gaugeChartData.aggregateTime)
          fromDate = timeIs[0]
          toDate = timeIs[1]
        }
      }
    }
    const parametersId = paramData.parameters.map((ele) => ele.parameterId)
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
      url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDate}&to_date=${toDate}&data_type=pie&aggregation_type=${paramData.aggregateRange}&filter_condition=${JSON.stringify(RequestBody)}`;
    } else {
      url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&data_type=pie&time_frequency=${paramData.aggregateTime}&aggregation_type=${paramData.aggregateRange}&filter_condition=${JSON.stringify(RequestBody)}`;
    }
    try {
      const token = await AsyncStorage.getItem('jwttoken');
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data.data;
      if (data) {
        if (Object.keys(response.data.data).length === 0) {
          setNoData(true);
          setloading(false);
        }
      }
      if (Object.keys(response.data).length === 0) {
        setNoData(true);
        setloading(false);
      }
      if (data) {
        setGaugeColorValue(data[parametersId[0]])
        const traceData = {
          domain: { x: [0, 1], y: [0, 1] },
          value: Object.values(data)[0],
          type: "indicator",
          mode: "gauge+number",
          //delta: { reference: 380 },
          gauge: {
            axis: {
              range: [gaugeChartData.gaugeMin, gaugeChartData.gaugeMax],
              tickmode: "array",
            },
            steps: gaugeChartData.gaugeBg.map(ele => ({
              range: [ele.startval, ele.endVal],
              color: ele.color
            })),
            bar: { color: gaugeChartData?.gaugecolor[0]?.color }
          }
        }
        setloading(false)
        setTraces([traceData]);
      } else {
        setNoData(true);
        setloading(false)
        setTraces([])
      }
    }
    catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  {/* <------ layout styles for chart ------> */ }
  const layout = {
    autosize: true,
    font: {
      family: gaugeChartData.xfFamily,
      size: 8,
      color: gaugeChartData.xFontColor,
      weight: gaugeChartData.xBold ? "bold" : "normal"
    },
    margin: {
      t: 15,
      l: 50,
      r: 50,
      b: 10
    },
    annotations: noData ? [{
      x: 0.5,
      y: 0.5,
      xref: 'paper',
      yref: 'paper',
      text: 'No data found',
      showarrow: false,
      font: {
        family: gaugeChartData.fFamily,
        size: 8,
        color: 'red',
      },
    }] : [],
    images: [{
      "source": gaugeChartData.plotAreaBg,
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
    paper_bgcolor: gaugeChartData.areaBackground,
    plot_bgcolor: gaugeChartData.plotAreaBg,
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
          color: gaugeChartData.plotAreaOutline,
          width: 1,
        },
      },
    ],
    chartOutline: `1px solid ${gaugeChartData.areaOutline}`,
    chartTitleIs: gaugeChartData.chartTitle,
    fontSize: gaugeChartData.fSize,
    fontFamily: gaugeChartData.fFamily,
    isBold: gaugeChartData.isBold,
    isItalic: gaugeChartData.isItalic,
    isUnderLine: gaugeChartData.isUnderLine,
    isCaseChange: gaugeChartData.isCaseChange,
    fontColor: gaugeChartData.fontColor,
    fontBgColor: gaugeChartData.fontBgColor,
    rndproperties: gaugeChartData.reSizeProperties
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
      ChartColors={gaugeChartData} 
      tracesIs={tracesIs} 
      showtitle={showtitle} 
      loading={loading} 
      onAIPress={capture}
      aiText={description}/>
    </View>
  );
}
