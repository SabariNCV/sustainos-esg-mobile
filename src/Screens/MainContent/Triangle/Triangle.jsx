import React, { useEffect, useState } from 'react';
import {
    View,
    PixelRatio,
    StyleSheet,
} from 'react-native';
import { scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import {
    panelscaleHeight,
    panelscaleWidth
} from '../../../Constants/panelSize';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimingsConversion } from '../TimingsConversion';
import axios from 'axios';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
export default function Triangle(props) {
    const { id, triangleStylesIs,type } = props
    const triangleStyles = triangleStylesIs[id].dataIs
    const dispatch = useDispatch();
    useEffect(() => {
        const newHeight = Number(triangleStyles?.position?.y) + Number(triangleStyles?.height);
        dispatch(updateHeight(newHeight));
    }, [Number(triangleStyles?.position?.y), dispatch]);
    const [shapeParmValue, setShapeParmValue] = useState("");
    let parmValueColor = triangleStyles?.SquareBg;
    const eventDatesIs = useSelector(state => state.mainSlice.eventDate);
    const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
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

    triangleStyles?.shapeValueRange.map((ele) => updateColor(ele));

    useEffect(() => {
        let refreshTime = 0;
        const refreshFreq = triangleStyles?.refreshFreq.split(" ");
        if (refreshFreq[1] === "Second") {
            refreshTime = parseInt(refreshFreq[0]) * 1000;
        } else if (refreshFreq[1] === "Minute") {
            refreshTime = parseInt(refreshFreq[0]) * 1000 * 60;
        } else if (refreshFreq[1] === "Hours") {
            refreshTime = parseInt(refreshFreq[0]) * 1000 * 60 * 60;
        } else {
            refreshTime = "None";
        }

        const fetchDataAndRender = async () => {
            let paramData = {};
            let fromDateIs, toDateIs;
            if (type === "panel") {
                paramData = triangleStyles;
                toDateIs = eventDatesIs[1]?.toISOString()?.slice(0, 19)?.replace("T", " ");
                fromDateIs = eventDatesIs[0]?.toISOString()?.slice(0, 19)?.replace("T", " ");
            } else {
                paramData = triangleStyles;
                if (triangleStyles?.aggregateTime !== "custom") {
                    const timeIs = TimingsConversion(triangleStyles?.aggregateTime);
                    fromDateIs = timeIs[0];
                    toDateIs = timeIs[1];
                } else {
                    fromDateIs = triangleStyles?.fromDate;
                    toDateIs = triangleStyles?.toDate;
                }
            }
            const parametersId = paramData.parameters.map((ele) => ele?.parameterId);
            const RequestBody = {};
            const filter_tags = [];
            paramData.parameters.forEach((item) => {
                const conditions = item?.fiterConditionsNewFormat.join(" ");
                RequestBody[item?.parameterId] = conditions;
                item?.fiterConditionsNewFormat?.forEach((condition) => {
                    const paramId = condition?.split(" ")[0];
                    if (!parametersId?.includes(parseInt(paramId)) && !filter_tags.includes(paramId)) {
                        filter_tags.push(paramId);
                    }
                });
            });
            RequestBody["filter_tags"] = filter_tags.join(",");
            let url;
            if (
                paramData.aggregateTime === "custom" ||
                type === "panel"
            ) {
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
                const data = response?.data?.data;
                if (data) {
                    setShapeParmValue(data[parametersId[0]]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        if (triangleStyles?.shapeType === "dynamic" && triangleStyles?.parameters?.length > 0) {
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
                triangleStyles?.position &&
                triangleStyles?.width &&
                triangleStyles?.height &&
                triangleStyles?.SquareBg &&
                triangleStyles?.rotation != null
                &&
                <View style={[styles.image,
                {
                    top: type === "panel" ? panelscaleHeight(PixelRatio.roundToNearestPixel(Number(triangleStyles?.position?.y))):scaleHeight(PixelRatio.roundToNearestPixel(Number(triangleStyles?.position?.y))),
                    left: type === "panel" ?  panelscaleWidth(PixelRatio.roundToNearestPixel(Number(triangleStyles?.position?.x))) : scaleWidth(PixelRatio.roundToNearestPixel(Number(triangleStyles?.position?.x))),
                    transform: [
                        { rotate: `${triangleStyles?.rotation}deg` },],
                    width: 0,
                    height: 0,
                    borderLeftWidth: triangleStyles?.width / 2,
                    borderRightWidth: triangleStyles?.width / 2,
                    borderBottomWidth: triangleStyles?.height / 1.1,
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderBottomColor: parmValueColor,
                }
                ]} />
            }
        </>
    )
}

const styles = StyleSheet.create({
    image: {
        alignSelf: 'center',
        position: 'absolute'
    }
})
