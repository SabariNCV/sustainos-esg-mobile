import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator, Animated } from 'react-native';
import {
  normalizeFont,
  scaleHeight,
  scaleWidth,
} from '../../../Constants/dynamicSize';
import { styles } from '../styles';
import { useDispatch, useSelector } from 'react-redux';
import { FONTS } from '../../../Constants/Fonts';
import { COLORS } from '../../../Constants/Colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { TimingsConversion } from '../TimingsConversion';
import CustomPlotly from '../../../Components/CustomPlotly';

export default function RadarChart(props) {
  const { chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs } = props;
  const [tracesIs, setTraces] = useState([]);
  const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
  const [loading, setloading] = useState(false)
  const dispatch = useDispatch();

  let ganttChartData = {};
  ganttChartData = checkTheCond[chartId]["ganttChart-colors"]
  useEffect(() => {
    setloading(true)
    const height = parseHeight(layout?.rndproperties?.height)
    const newHeight = Number(layout?.rndproperties.y) + Number(height) + 10;
    dispatch(updateHeight(newHeight));
    fetchDataAndRender()

  }, [])
  const [noData, setNoData] = useState(false);
  const fetchDataAndRender = async () => {
    const currentTimestamp = Date.now();
    const twoMinutesEarlierTimestamp = currentTimestamp - (2 * 60 * 1000);
    const date = new Date(currentTimestamp);
    const currentDate = new Date(twoMinutesEarlierTimestamp);
    const toDate = date.toISOString().slice(0, 19).replace('T', ' ');
    const fromDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
    const markerColor = ganttChartData.parameters.map((ele) => ele.parameterColor)
    const parametersName = ganttChartData.parameters.map((ele) => ele.global)
    const parametersId = ganttChartData.parameters.map((ele) => ele.parameterId)
    try {
      const token = await AsyncStorage.getItem('jwttoken');
      const response = await axios.get(`${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDate}&to_date=${toDate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = response?.data;
      if (data) {
        setloading(false);
        const traceData = data?.map((item, index) => {
          return {
            x: Object.values(item).flatMap(dataArray => dataArray.map(item => item.date_time)).slice(7, 9),
            y: Object.values(item).flatMap(dataArray => dataArray.map(item => item.value)).slice(7, 9),
            hoverinfo: ganttChartData.toolTip ? 'all' : 'none',
            type: 'scatter',
            showlegend: true,
            name: parametersName[index],
            marker: {
              color: markerColor[index],
            },
          };
        });
        setTraces(traceData);
      }


    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const layout = {
    autosize: true,
    margin: {
      t: 15,
      l: 50,
      r: 50,
    },
    'hovermode': 'closest',
    'shapes': [
      {
        type: 'rect',
        x0: 0,
        x1: 1.0,
        y0: 0,
        y1: 1.0,
        xref: 'paper',
        yref: 'paper',
        line: {
          color: ganttChartData.plotAreaOutline,
          width: 1,
        },
      },

    ],
    showlegend: ganttChartData.showLegend,
    legend: {
      y: ganttChartData.legend.y,
      x: ganttChartData.legend.x,
      orientation: 'h',
      xanchor: 'center',
      traceorder: 'normal',
      itemsizing: 'trace',
      font: {
        size: 14,
        weight: 'lighter',
      }
    },
    xaxis: {
      autorange: true,
      showgrid: ganttChartData.isGridPresent,
      gridcolor: ganttChartData.xGridColor,
      gridwidth: 1,
      griddash: 'dot',
      gridshape: 'linear',
      showline: true,
      tickfont: {
        family: ganttChartData.xfFamily,
        size: ganttChartData.xFonntSize - 5,
        color: ganttChartData.xFontColor,
        weight: ganttChartData.xBold ? "bold" : "normal"
      }
    },
    yaxis: {
      autorange: true,
      showgrid: ganttChartData.isGridPresent,
      gridcolor: ganttChartData.yGridColor,
      gridwidth: 1,
      griddash: 'dot',
      gridshape: 'linear',
      showline: true,
      tickfont: {
        family: ganttChartData.yfFamily,
        size: ganttChartData.yFonntSize - 5,
        color: ganttChartData.yFontColor,
        weight: ganttChartData.yBold ? "bold" : "normal"
      }
    }
    ,
    images: [{
      "source": ganttChartData.plotAreaBg,
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
    paper_bgcolor: ganttChartData.areaBackground,
    plot_bgcolor: ganttChartData.plotAreaBg,
    chartOutline: `1px solid ${ganttChartData.areaOutline}`,
    chartTitleIs: ganttChartData.chartTitle,
    fontSize: ganttChartData.fSize,
    fontFamily: ganttChartData.fFamily,
    isBold: ganttChartData.isBold,
    isItalic: ganttChartData.isItalic,
    isUnderLine: ganttChartData.isUnderLine,
    isCaseChange: ganttChartData.isCaseChange,
    fontColor: ganttChartData.fontColor,
    fontBgColor: ganttChartData.fontBgColor,
    rndproperties: ganttChartData.reSizeProperties
  };
  const parseHeight = (value) => {
    if (typeof value === 'string') {
      return value.includes('px') ? parseFloat(value.replace('px', '')) : parseFloat(value);
    }
    return value;
  };

  return (
    <View style={styles.shadowbox}>
      {layout?.rndproperties &&
        <View style={{
          height: scaleHeight(parseHeight(layout?.rndproperties?.height)),
          ...layout?.rndproperties.y ? {
            top: scaleHeight(Number(layout?.rndproperties?.y))
          } : {
            marginTop: scaleHeight(10)
          }

        }}>
          {showtitle && (
            <View style={[styles.headerbox, , { borderTopLeftRadius: donutChartData?.isBorderRadius ? 10 : 1, borderTopRightRadius: donutChartData?.isBorderRadius ? 10 : 1 }]}>
              <Text style={[styles.charttitle]}>{donutChartData?.chartTitle}</Text>
            </View>
          )}
          <View
            style={{
              alignSelf: 'flex-start',
              justifyContent: 'center',
              width: scaleWidth(350),
              height: scaleHeight(parseHeight(layout?.rndproperties?.height) - 40),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 2,
              elevation: 2,
              borderColor: '#D3D3D3',
              borderBottomLeftRadius: donutChartData?.isBorderRadius ? 10 : 1,
              borderBottomRightRadius: donutChartData?.isBorderRadius ? 10 : 1,
              backgroundColor: COLORS.WHITE
            }}>
            {loading ?
              <View style={{
                flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.WHITE, borderBottomLeftRadius: donutChartData?.isBorderRadius ? 10 : 1,
                borderBottomRightRadius: donutChartData?.isBorderRadius ? 10 : 1,
              }}>
                <ActivityIndicator size={'small'} color={COLORS.HEADER} />
              </View>
              :
              <View style={{ height: scaleHeight(parseHeight(layout?.rndproperties?.height) - 60), backgroundColor: COLORS.WHITE }}>
                <CustomPlotly
                  data={tracesIs}
                  layout={layout}
                  style={{
                    height: scaleHeight(parseHeight(layout?.rndproperties?.height) - 40),
                    borderBottomLeftRadius: gaugeChartData?.isBorderRadius ? 10 : 1,
                    borderBottomRightRadius: gaugeChartData?.isBorderRadius ? 10 : 1,
                  }}
                />
              </View>}

          </View>
        </View>
      }
    </View>
  );

}

