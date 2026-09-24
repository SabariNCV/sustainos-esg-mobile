import React, { useEffect, useState } from 'react';
import { View, StyleSheet, PixelRatio } from 'react-native';
import { scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import {
  panelscaleHeight,
  panelscaleWidth
} from '../../../Constants/panelSize';
import Svg, { Ellipse } from 'react-native-svg';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimingsConversion } from '../TimingsConversion';
import axios from 'axios';

const Circle = (props) => {
  const { id, circleStylesIs, type } = props
  const circleStyles = circleStylesIs[id]?.dataIs;
  const dispatch = useDispatch();

  useEffect(() => {
    const newHeight = Number(circleStyles?.position?.y) + Number(circleStyles?.height);
    dispatch(updateHeight(newHeight));
  }, [Number(circleStyles?.position?.y), dispatch]);

  const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
  let parmValueColor = circleStyles?.SquareBg;
  const [shapeParmValue, setShapeParmValue] = useState("");
  const eventDatesIs = useSelector(state => state.mainSlice.eventDate);

  const updateColor = (ele) => {
    switch (ele?.condition) {
      case "minMax":
        if (parseFloat(shapeParmValue) > parseFloat(ele?.min) && parseFloat(shapeParmValue) < parseFloat(ele?.max)) {
          parmValueColor = ele?.color;
        }
        break;
      case "greaterThan":
        if (parseFloat(shapeParmValue) > parseFloat(ele?.min)) {
          parmValueColor = ele?.color;
        }
        break;
      case "lessThan":
        if (parseFloat(shapeParmValue) < parseFloat(ele?.max)) {
          parmValueColor = ele?.color;
        }
        break;
      case "greaterThanEquall":
        if (parseFloat(shapeParmValue) >= parseFloat(ele?.max)) {
          parmValueColor = ele?.color;
        }
        break;
      case "lessThanEquall":
        if (parseFloat(shapeParmValue) <= parseFloat(ele?.max)) {
          parmValueColor = ele?.color;
        }
        break;
      case "text":
        if (String(shapeParmValue) == String(ele?.max)) {
          parmValueColor = ele?.color;
        }
        break;
      default:
        break;
    }
  };

  circleStyles?.shapeValueRange.map((ele) => updateColor(ele));


  useEffect(() => {


    let refreshTime = 0;
    const refreshFreq = circleStyles?.refreshFreq?.split(" ");
    if (refreshFreq && refreshFreq.length === 2) {
      const value = parseInt(refreshFreq[0]);
      const unit = refreshFreq[1];
      if (unit === "Second") {
        refreshTime = value * 1000;
      } else if (unit === "Minute") {
        refreshTime = value * 1000 * 60;
      } else if (unit === "Hours") {
        refreshTime = value * 1000 * 60 * 60;
      } else {
        refreshTime = "None";
      }
    } else {
      refreshTime = "None";
    }

    const fetchDataAndRender = async () => {
      let paramData = {};
      let fromDateIs, toDateIs;
      if (type === 'panel') {
        paramData = circleStyles;
        toDateIs = eventDatesIs[1]?.toISOString()?.slice(0, 19)?.replace("T", " ");
        fromDateIs = eventDatesIs[0]?.toISOString()?.slice(0, 19)?.replace("T", " ");
      } else {
        paramData = circleStyles;
        if (circleStyles?.aggregateTime !== "custom") {
          const timeIs = TimingsConversion(circleStyles?.aggregateTime);
          fromDateIs = timeIs[0];
          toDateIs = timeIs[1];
        } else {
          fromDateIs = circleStyles?.fromDate;
          toDateIs = circleStyles?.toDate;
        }
      }
      const parametersId = paramData.parameters.map((ele) => ele?.parameterId);
      const RequestBody = {};
      const filter_tags = [];
      paramData.parameters.forEach((item) => {
        const conditions = item.fiterConditionsNewFormat.join(" ");
        RequestBody[item.parameterId] = conditions;
        item.fiterConditionsNewFormat.forEach((condition) => {
          const paramId = condition.split(" ")[0];
          if (!parametersId.includes(parseInt(paramId)) && !filter_tags.includes(paramId)) {
            filter_tags.push(paramId);
          }
        });
      });
      RequestBody["filter_tags"] = filter_tags.join(",");
      let url;
      if (paramData.aggregateTime === "custom" || type === 'panel') {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDateIs}&to_date=${toDateIs}&aggregation_type=${paramData.aggregateRange}&filter_condition=${JSON.stringify(RequestBody)}`;
      } else {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&time_frequency=${paramData?.aggregateTime}&aggregation_type=${paramData?.aggregateRange}&filter_condition=${JSON.stringify(RequestBody)}`;
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
          setShapeParmValue(data[parametersId[0]]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (circleStyles?.shapeType === "dynamic" && circleStyles?.parameters.length > 0) {
      fetchDataAndRender();
      if (refreshTime !== "None") {
        const intervalId = setInterval(fetchDataAndRender, refreshTime);
        return () => clearInterval(intervalId);
      }
    }
  }, []);

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
          flex: 0,
          top: type === "panel" ? panelscaleHeight(PixelRatio.roundToNearestPixel(Number(circleStyles?.position?.y))) : scaleHeight(PixelRatio.roundToNearestPixel(Number(circleStyles?.position?.y))),
          left: type === "panel" ? panelscaleWidth(PixelRatio.roundToNearestPixel(Number(circleStyles?.position?.x))) : scaleWidth(PixelRatio.roundToNearestPixel(Number(circleStyles?.position?.x))),
          width: type === "panel" ? panelscaleWidth(circleStyles?.width) : scaleWidth(circleStyles?.width),
          height: type === "panel" ? panelscaleHeight(circleStyles?.height) : scaleHeight(circleStyles?.height),
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center'
        }
        ]}>
          <Svg height={type === "panel" ? panelscaleHeight(circleStyles?.height) : scaleHeight(circleStyles?.height)} width={type === "panel" ? panelscaleWidth(circleStyles?.width) : scaleWidth(circleStyles?.width)}>
            <Ellipse cx={type === "panel" ? panelscaleWidth(circleStyles?.width / 2) : scaleWidth(circleStyles?.width / 2)} cy={type === "panel" ? panelscaleHeight(circleStyles?.height / 2) : scaleHeight(circleStyles?.height / 2)} rx={type === "panel" ? panelscaleWidth(circleStyles?.width / 2.01) : scaleWidth(circleStyles?.width / 2.01)} ry={type === "panel" ? panelscaleHeight(circleStyles?.height / 2.02) : scaleHeight(circleStyles?.height / 2.02)} fill={parmValueColor} />
          </Svg>
        </View>
      }
    </>
  )
}
export default Circle
const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
    position: 'absolute'
  }
})

