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

export default function WaterFallChart(props) {
  const { chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs } = props;
  const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
  const userDetail = useSelector(state => state.authSlice.userDetails);
  const dispatch = useDispatch();
  const [tracesIs, setTraces] = useState([]);
  const [loading, setloading] = useState(false)
  const [noData, setNoData] = useState(false);
  const [description, setDescription] = useState("");

  {/* <------ Chart styles and title data fetching ------> */ }
  let waterFallChartData = {};
  waterFallChartData = checkTheCond[chartId]["waterFallChart-colors"]

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
    const refreshFreq = waterFallChartData.refreshFreq.split(" ")
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
    const currentTimestamp = Date.now();
    const twoMinutesEarlierTimestamp = currentTimestamp - (2 * 60 * 1000);
    const date = new Date(currentTimestamp);
    const currentDate = new Date(twoMinutesEarlierTimestamp);
    const toDate = date.toISOString().slice(0, 19).replace('T', ' ');
    const fromDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
    const markerColor = waterFallChartData.parameters.map((ele) => ele.parameterColor)
    const parametersName = waterFallChartData.parameters.map((ele) => ele.global)
    const parametersId = waterFallChartData.parameters.map((ele) => ele.parameterId)
    try {
      const token = await AsyncStorage.getItem('jwttoken');
      const response = await axios.get(`${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDate}&to_date=${toDate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = response.data;
      if (data) {
        setloading(false)
        const traceData = data?.map((item, index) => {
          return {
            x: Object.values(item).flatMap(dataArray => dataArray.map(item => item.date_time)).slice(30, 35),
            y: Object.values(item).flatMap(dataArray => dataArray.map(item => item.value)).slice(30, 35),
            hoverinfo: waterFallChartData.toolTip ? 'all' : 'none',
            type: "waterfall",
            orientation: "v",
            name: parametersName[index],
            yaxis: 'y',
            line: {
              dash: 'solid',
              width: 1,
            },
            marker: {
              color: markerColor[index],
            },
            connector: {
              line: {
                color: markerColor[index]
              }
            },
          };
        });
        setTraces(traceData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  {/* <------ layout styles for chart ------> */ }
  const layout = {
    autosize: true,
    margin: {
      t: 15,
      l: 50,
      r: 50,
    },
    x: 0.5,
    y: 0.3,
    xaxis: {
      autorange: true,
      showgrid: waterFallChartData.isGridPresent,
      nticks: 6,
      //zeroline: !lineChartStyles.isGridPresent,
      gridcolor: waterFallChartData.xGridColor,
      type: "category",
      gridwidth: 1,
      griddash: 'dot',
      gridshape: 'linear',
      showline: true,
      tickfont: {
        family: waterFallChartData.xfFamily,
        size: waterFallChartData.xFonntSize - 5,
        color: waterFallChartData.xFontColor,
        weight: waterFallChartData.xBold ? "bold" : "normal"
      }
    },
    yaxis: {
      autorange: true,
      type: "linear",
      showgrid: waterFallChartData.isGridPresent,
      gridcolor: waterFallChartData.yGridColor,
      gridwidth: 1,
      griddash: 'dot',
      gridshape: 'linear',
      showline: true,
      tickfont: {
        family: waterFallChartData.yfFamily,
        size: waterFallChartData.yFonntSize - 5,
        color: waterFallChartData.yFontColor,
        weight: waterFallChartData.yBold ? "bold" : "normal"
      }
    },
    showlegend: waterFallChartData.showLegend,
    legend: {
      y: waterFallChartData.legend.y,
      x: waterFallChartData.legend.x,
      orientation: 'h',
      xanchor: 'center',
      traceorder: 'normal',
      itemsizing: 'trace',
      font: {
        size: 14,
        weight: 'lighter',
      }
    },
    images: [{
      "source": waterFallChartData.plotAreaBg,
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
    paper_bgcolor: waterFallChartData.areaBackground,
    plot_bgcolor: waterFallChartData.plotAreaBg,
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
          color: waterFallChartData.plotAreaOutline,
          width: 1,
        },
      },
    ],
    chartOutline: `1px solid ${waterFallChartData.areaOutline}`,
    chartTitleIs: waterFallChartData.chartTitle,
    fontSize: waterFallChartData.fSize,
    fontFamily: waterFallChartData.fFamily,
    isBold: waterFallChartData.isBold,
    isItalic: waterFallChartData.isItalic,
    isUnderLine: waterFallChartData.isUnderLine,
    isCaseChange: waterFallChartData.isCaseChange,
    fontColor: waterFallChartData.fontColor,
    fontBgColor: waterFallChartData.fontBgColor,
    rndproperties: waterFallChartData.reSizeProperties
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
        ChartColors={waterFallChartData}
        tracesIs={tracesIs}
        showtitle={showtitle}
        loading={loading}
        onAIPress={capture}
        aiText={description} />
    </View>
  );

}

