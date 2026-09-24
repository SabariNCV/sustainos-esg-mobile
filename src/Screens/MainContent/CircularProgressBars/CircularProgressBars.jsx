import * as Progress from 'react-native-progress';
import { View, Text, StyleSheet, } from "react-native";
import React, { useEffect, useState } from "react";
import { scaleWidth, scaleHeight } from '../../../Constants/dynamicSize';
import { panelnormalizeFont, panelscaleHeight, panelscaleWidth } from '../../../Constants/panelSize';
import { useDispatch, useSelector } from 'react-redux';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { TimingsConversion } from '../TimingsConversion';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { COLORS } from '../../../Constants/Colors';

const CircularProgressBars = (props) => {
  const { progressStylesIs, id,type } = props
  const progressStyles = progressStylesIs[id].dataIs;
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(70);
  const [labelParmValue, setlabelParmValue] = useState("")
  const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
  let parmValueColor = progressStyles.progressColor
  useEffect(() => {
    const newHeight = Number(progressStyles?.position?.y) + Number(progressStyles.height);
    dispatch(updateHeight(newHeight));
  }, [Number(progressStyles?.position?.y), dispatch]);

  const updateColor = (ele) => {
    switch (ele.condition) {
      case "minMax":
        if (parseFloat(labelParmValue) > parseFloat(ele.min) && parseFloat(labelParmValue) < parseFloat(ele.max)) {
          parmValueColor = ele.color;
        }
        break;
      case "greaterThan":
        if (parseFloat(labelParmValue) > parseFloat(ele.min)) {
          parmValueColor = ele.color;
        }
        break;
      case "lessThan":
        if (parseFloat(labelParmValue) < parseFloat(ele.max)) {
          parmValueColor = ele.color;
        }
        break;
      case "greaterThanEquall":
        if (parseFloat(labelParmValue) >= parseFloat(ele.max)) {
          parmValueColor = ele.color;
        }
        break;
      case "lessThanEquall":
        if (parseFloat(labelParmValue) <= parseFloat(ele.max)) {
          parmValueColor = ele.color;
        }
        break;
      default:
        break;
    }
  };
  progressStyles.labelValueRange.map((ele) => updateColor(ele));
  useEffect(() => {
    let refreshTime = 0;
    const refreshFreq = progressStyles.refreshFreq.split(" ")
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
      const paramData = progressStyles
      let fromDateIs, toDateIs
      if (progressStyles.aggregateTime !== "custom") {
        const timeIs = TimingsConversion(progressStyles.aggregateTime)
        fromDateIs = timeIs[0]
        toDateIs = timeIs[1]
      } else {
        fromDateIs = progressStyles.fromDate
        toDateIs = progressStyles.toDate
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
      if (paramData.aggregateTime === "custom") {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDateIs}&to_date=${toDateIs}&aggregation_type=${paramData.aggregateRange}&filter_condition=${JSON.stringify(RequestBody)}`;
      } else {
        url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&aggregation_type=${paramData.aggregateRange}&time_frequency=${paramData.aggregateTime}&filter_condition=${JSON.stringify(RequestBody)}`;
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
          const value = data[parametersId[0]]
          setlabelParmValue(value)
          const maxValue = parseInt(progressStyles.maxValue)
          const minValue = parseInt(progressStyles.minValue)
          if (value >= maxValue) {
            setProgress(100)
          } else if (value <= minValue) {
            setProgress(0)
          } else {
            const valueIs = (100 * value) / maxValue
            setProgress(valueIs)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    if (progressStyles.shapeType === "dynamic" && progressStyles.parameters.length > 0) {
      fetchDataAndRender()
      if (refreshTime !== "None") {
        const intervalId = setInterval(fetchDataAndRender, refreshTime);
        return () => clearInterval(intervalId);
      }
    } else {
      const value = parseInt(progressStyles.staticValue)
      const maxValue = parseInt(progressStyles.maxValue)
      const minValue = parseInt(progressStyles.minValue)
      if (value >= maxValue) {
        setProgress(100)
      } else if (value <= minValue) {
        setProgress(0)
      } else {
        const valueIs = (100 * value) / maxValue
        setProgress(valueIs)
      }
    }
  }, [])

  return (
    <View style={{
      left: type === 'panel' ?  panelscaleWidth(progressStyles?.position?.x - 5) :  scaleWidth(progressStyles?.position?.x),
      top: type === 'panel' ? panelscaleHeight(progressStyles?.position?.y + 5) :scaleHeight(progressStyles?.position?.y),
      position: 'absolute',
    }}>
      {progressStyles?.progressBarType === "Circular" ?
        <Progress.Circle size={type === 'panel' ? panelscaleWidth(progressStyles?.width) : scaleWidth(progressStyles?.width)} progress={progress} color={progressStyles?.progressColor} borderWidth={1} />
        :
        <Progress.Bar width={type === 'panel' ? panelscaleWidth(progressStyles?.width) : scaleWidth(progressStyles?.width)} progress={(progress / 100)} height={type === 'panel' ? panelscaleHeight(progressStyles?.height):scaleHeight(progressStyles?.height)} color={parmValueColor} borderWidth={0.6} borderColor={COLORS.DIVIDER} />}
    </View>
  )
}

export default CircularProgressBars
