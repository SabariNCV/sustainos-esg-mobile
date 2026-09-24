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
export default function DonutChart(props) {

  const { chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type } = props;
  const dispatch = useDispatch();
  const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
  const userDetail = useSelector(state => state.authSlice.userDetails);
  const [noData, setNoData] = useState(false);
  const [tracesIs, setTraces] = useState([]);
  const [loading, setloading] = useState(false);
  const [description, setDescription] = useState("");
  let donutChartData = {};

  {/* <------ Chart styles and title data fetching ------> */ }
  if (paged === 'analytics') {
    donutChartData = basicDetails
  } else {
    donutChartData = checkTheCond[chartId]["donutChart-colors"]
  }

  const basicDetails = {
    chartTitle: "Donut Chart", plotAreaBg: "#fff", plotAreaOutline: "#b3b0b0ff", areaBackground: "#fff", areaOutline: "#fff",
    isGridPresent: true, toolTip: true, showLegend: true, legend: { x: 0.5, y: 1.1 }, chartType: "horizontal", barGap: 0.3, donutGap: 0.6, scatterType: "bubble",
    fSize: "18px", fFamily: "Nunito", isBold: false, isItalic: false, isUnderLine: false, isCaseChange: false,
    fontColor: "#33A9AC", fontBgColor: "#fff", legendTop: false, legendBottom: false, legendLeft: false, legendRight: false,
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
    let refreshTime = 1000;
    const refreshFreq = donutChartData.refreshFreq.split(" ")
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
      if (type === "panel") {
        paramData = donutChartData
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
        paramData = donutChartData
        fromDate = donutChartData.fromDate
        toDate = donutChartData.toDate
        paramData = donutChartData
        if (donutChartData.aggregateTime === "custom") {
          fromDate = donutChartData.fromDate
          toDate = donutChartData.toDate
        } else {
          const timeIs = TimingsConversion(donutChartData.aggregateTime)
          fromDate = timeIs[0]
          toDate = timeIs[1]
        }

      }
    }

    const parametersId = paramData.parameters.map((ele) => ele.parameterId)
    const parameterNames = paramData.parameters.map(parameter => parameter.name);
    const defaultColors = ["#00A68F", "#528CFA", "#FF8810", "#C46253", "#7E01A9", "#CF2020", "#FFBB10", "#748C76", "#DF9F4E", "#9B79FF"]
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

        const traceData = {
          values: Object.values(data),
          labels: paged === 'analytics' ? paramData.parameters.map((ele) => ele.globalCode + "(" + ele.paramUnit + ")") : paramData.legendType === "name" ? paramData.parameters.map((ele) => ele.name + "(" + ele.paramUnit + ")") : paramData.parameters.map((ele) => ele.global + "(" + ele.paramUnit + ")"),
          hoverinfo: donutChartData.toolTip ? 'all' : 'none',
          hole: donutChartData.donutGap,
          type: 'pie',
          textinfo: "percent",
          insidetextorientation: "radial",
          textposition: donutChartData?.isTextOutside === true ? 'outside' : 'inside',
          textfont: {
            size: 12,
          },
          marker: {
            colors: paged === 'analytics' ? defaultColors.map((ele) => ele) : paramData.parameters.map((ele) => ele.parameterColor)
          }
        }

        setloading(false)
        setTraces([traceData]);

      } else {
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
    margin: {
      t: 10,
      l: 20,
      r: 20,
      b: 10,
    },
    images: [{
      "source": donutChartData.plotAreaBg,
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
    paper_bgcolor: donutChartData.areaBackground,
    plot_bgcolor: donutChartData.plotAreaBg,
    showlegend: donutChartData.showLegend,
    legend: {
      y: donutChartData.legend.y,
      x: donutChartData.legend.x,
      xanchor: 'center',
      traceorder: 'normal',
      orientation: 'h',
      font: {
        family: donutChartData.legendFamily,
        size: 8,
        weight: 'lighter',
      }
    },
    annotations: noData ? [{
      x: 0.5,
      y: 0.5,
      xref: 'paper',
      yref: 'paper',
      text: 'No data found',
      showarrow: false,
      font: {
        family: donutChartData.fFamily,
        size: donutChartData.fSize,
        color: 'red',
      },
    }] : [],
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
          color: donutChartData.plotAreaOutline,
          width: 1,
        },
      },
    ],
    chartOutline: `1px solid ${donutChartData.areaOutline}`,
    chartTitleIs: donutChartData.chartTitle,
    fontSize: donutChartData.fSize,
    fontFamily: donutChartData.fFamily,
    isBold: donutChartData.isBold,
    isItalic: donutChartData.isItalic,
    isUnderLine: donutChartData.isUnderLine,
    isCaseChange: donutChartData.isCaseChange,
    fontColor: donutChartData.fontColor,
    fontBgColor: donutChartData.fontBgColor,
    rndproperties: donutChartData.reSizeProperties
  };

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
      ChartColors={donutChartData} 
      tracesIs={tracesIs} 
      showtitle={showtitle} 
      loading={loading} 
      onAIPress={capture}
      aiText={description}/>
    </View>
  );
}
