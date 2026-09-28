import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, PixelRatio, TouchableOpacity, Animated } from 'react-native';
import { useSelector } from "react-redux";
import axios from "axios";
import { scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import { panelscaleHeight, panelscaleWidth } from '../../../Constants/panelSize';
import { TimingsConversion } from '../../MainContent/TimingsConversion';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

function Square(props) {
  const { id, squareStylesIs, tabShape, type } = props
  const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [shapeParmValue, setShapeParmValue] = useState("")

  let squareStyles;
  if (tabShape) {
    squareStyles = squareStylesIs.filter(ele => ele.id === id)[0].dataIs
  } else {
    squareStyles = squareStylesIs[id].dataIs;
  }

  const updateColor = (ele) => {
    switch (ele.condition) {
      case "minMax":
        if (parseFloat(shapeParmValue) > parseFloat(ele.min) && parseFloat(shapeParmValue) < parseFloat(ele.max)) {
          parmValueColor = ele.color;
        }
        break;
      case "greaterThan":
        if (parseFloat(shapeParmValue) > parseFloat(ele.min)) {
          parmValueColor = ele.color;
        }
        break;
      case "lessThan":
        if (parseFloat(shapeParmValue) < parseFloat(ele.max)) {
          parmValueColor = ele.color;
        }
        break;
      case "greaterThanEquall":
        if (parseFloat(shapeParmValue) >= parseFloat(ele.max)) {
          parmValueColor = ele.color;
        }
        break;
      case "lessThanEquall":
        if (parseFloat(shapeParmValue) <= parseFloat(ele.max)) {
          parmValueColor = ele.color;
        }
        break;
      default:

        break;
    }
  };

  squareStyles.shapeValueRange.map((ele) => updateColor(ele));

  useEffect(() => {
    let refreshTime = 0;
    const refreshFreq = squareStyles.refreshFreq.split(" ")
    if (refreshFreq[1] === "Second") {
      refreshTime = parseInt(refreshFreq[0]) * 1000
    } else if (refreshFreq[1] === "Minute") {
      refreshTime = parseInt(refreshFreq[0]) * 1000 * 60
    } else if (refreshFreq[1] === "Hours") {
      refreshTime = parseInt(refreshFreq[0]) * 1000 * 60 * 60
    } else {
      refreshTime = "None"
    }

    const fetchDataAndRender = async () => {
      let paramData = {}
      let fromDateIs, toDateIs;

      paramData = squareStyles
      if (squareStyles.aggregateTime !== "custom") {
        const timeIs = TimingsConversion(squareStyles.aggregateTime)
        fromDateIs = timeIs[0]
        toDateIs = timeIs[1]
      } else {
        fromDateIs = squareStyles.fromDate
        toDateIs = squareStyles.toDate
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
      const token = await AsyncStorage.getItem('jwttoken');
      if (paramData.aggregateTime === "custom") {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDateIs}&to_date=${toDateIs}&aggregation_type=${paramData.aggregateRange}&filter_condition=${JSON.stringify(RequestBody)}`;
      } else {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&time_frequency=${paramData.aggregateTime}&aggregation_type=${paramData.aggregateRange}&filter_condition=${JSON.stringify(RequestBody)}`;
      }
      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data.data;
        if (data) {
          setShapeParmValue(data[parametersId[0]])
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    if (squareStyles.shapeType === "dynamic" && squareStyles.parameters.length > 0) {
      fetchDataAndRender()
      if (refreshTime !== "None") {
        const intervalId = setInterval(fetchDataAndRender, refreshTime);
        return () => clearInterval(intervalId);
      }
    }
  }, [])

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, []);

  const position = useMemo(() => ({
    top: type === "panel" ? panelscaleHeight(PixelRatio.roundToNearestPixel(Number(squareStyles?.position?.y))) : scaleHeight(PixelRatio.roundToNearestPixel(Number(squareStyles?.position?.y))),
    left: type === "panel" ? panelscaleWidth(PixelRatio.roundToNearestPixel(Number(squareStyles?.position?.x))) : scaleWidth(PixelRatio.roundToNearestPixel(Number(squareStyles?.position?.x)) - 5),
    width: type === "panel" ? panelscaleWidth(squareStyles?.width) : scaleWidth(squareStyles?.width),
    height: type === "panel" ? panelscaleHeight(squareStyles?.height) : scaleHeight(squareStyles?.height),
  }), [squareStyles, type]);

  const html = useMemo(() => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              margin: 0;
            }
            .rectangle {
              width: 100%;
              height: 100%;
              background-color: ${squareStyles?.SquareBg};
              clip-path: ${squareStyles?.clipPath};
              border-radius: ${squareStyles?.borderRadius * 2.5}px;
            }
          </style>
        </head>
        <body>
          <div class="rectangle"></div>
        </body>
        </html>
      `;
  }, [squareStyles?.SquareBg, squareStyles?.clipPath, squareStyles?.borderRadius]);

  if (!squareStyles?.position || !squareStyles?.width || !squareStyles?.height) {
    return null;
  }

  return (

    <Animated.View style={[styles.animatedView, {
      transform: [{ scale: scaleAnim }],
      ...((props?.type === 'panel') && { zIndex: squareStyles.chartZindex })
    }]}>
      <TouchableOpacity disabled={true}>
        {squareStyles.clipPath ? (
          <View style={[styles.image, { ...position, backgroundColor: 'transparent', zIndex: squareStyles.chartZindex }]}>
            <WebView
              originWhitelist={['*']}
              source={{ html }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              style={styles.webView}
              scrollEnabled={false}
              scalesPageToFit={false}
            />
          </View>
        ) : (
          <View style={[styles.image, { ...position, backgroundColor: squareStyles.SquareBg, borderRadius: Number(squareStyles?.borderRadius) }]}>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>

  );
}

export default Square;
const styles = StyleSheet.create({
  animatedView: {
    position: 'absolute',
  },
  image: {
    position: 'absolute',
    overflow: 'hidden',
  },
  webView: {
    backgroundColor: 'transparent',
    flex: 1,
  },
});
