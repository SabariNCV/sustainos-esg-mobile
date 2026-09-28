import React, { useRef, useEffect, useState } from 'react';
import { View, PixelRatio,StyleSheet } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import { useSelector } from "react-redux";
import axios from "axios";
import { scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import { TimingsConversion } from '../../MainContent/TimingsConversion';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Circle(props) {
  const { id, circleStylesIs, tabShape } = props
  let circleStyles;
  if (tabShape) {
    circleStyles = circleStylesIs.filter(ele => ele.id === id)[0].dataIs
  } else {
    circleStyles = circleStylesIs[id].dataIs;
  }
  console.log("fwfwrfwefwr",circleStyles)
  let parmValueColor = circleStyles.SquareBg
  const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
  const [shapeParmValue, setShapeParmValue] = useState("")

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

  circleStyles.shapeValueRange.map((ele) => updateColor(ele));

  useEffect(() => {
    let refreshTime = 0;
    const refreshFreq = circleStyles.refreshFreq.split(" ")
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

      paramData = circleStyles
      if (circleStyles.aggregateTime !== "custom") {
        const timeIs = TimingsConversion(circleStyles.aggregateTime)
        fromDateIs = timeIs[0]
        toDateIs = timeIs[1]
      } else {
        fromDateIs = circleStyles.fromDate
        toDateIs = circleStyles.toDate
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
      if (paramData.aggregateTime === "custom" || projectDetails.PageName === " > Events") {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDateIs}&to_date=${toDateIs}&aggregation_type=${paramData.aggregateRange}&filter_condition=${JSON.stringify(RequestBody)}`;
      } else {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&time_frequency=${paramData.aggregateTime}&aggregation_type=${paramData.aggregateRange}&filter_condition=${JSON.stringify(RequestBody)}`;
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
          setShapeParmValue(data[parametersId[0]])
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    if (circleStyles.shapeType === "dynamic" && circleStyles.parameters.length > 0) {
      fetchDataAndRender()
      if (refreshTime !== "None") {
        const intervalId = setInterval(fetchDataAndRender, refreshTime);
        return () => clearInterval(intervalId);
      }
    }
  }, [])


  return (
    <>
      {
        circleStyles?.position &&
        circleStyles?.width &&
        circleStyles?.height &&
        circleStyles?.SquareBg &&
        circleStyles?.rotation != null
        &&
        <View style={[styles.image,
        {
          top: scaleHeight(PixelRatio.roundToNearestPixel(Number(circleStyles?.position?.y))),
          left: scaleWidth(PixelRatio.roundToNearestPixel(Number(circleStyles?.position?.x))),
          width: scaleWidth(circleStyles?.width),
          height: scaleHeight(circleStyles?.height),
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          backgroundColor:'red'
        }
        ]}>
          <Svg height={scaleHeight(circleStyles?.height)} width={scaleWidth(circleStyles?.width)}>
            <Ellipse cx={scaleWidth(circleStyles?.width / 2)} cy={scaleHeight(circleStyles?.height / 2)} rx={scaleWidth(circleStyles?.width / 2.01)} ry={scaleHeight(circleStyles?.height / 2.02)} fill={'#000'} />
          </Svg>
        </View>
      }
    </>
  );
}

export default Circle;
const styles = StyleSheet.create({
    image: {
        alignSelf: 'center',
        position: 'absolute'
    }
})
