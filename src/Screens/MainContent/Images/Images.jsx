import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    Image
} from 'react-native';
import {
    scaleHeight,
    scaleWidth,
} from '../../../Constants/dynamicSize';
import {
    panelscaleHeight,
    panelscaleWidth
} from '../../../Constants/panelSize';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { SvgXml } from 'react-native-svg';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimingsConversion } from '../TimingsConversion';

export default function Images(props) {
    const { imageId, imageDataIs, type } = props;
    const imageIs = imageDataIs?.[imageId]?.["image-colors"] ?? {};
    const dispatch = useDispatch();

    useEffect(() => {
        const newHeight = Number(imageIs?.reSizeProperties?.y) + Number(imageIs?.reSizeProperties?.height);
        dispatch(updateHeight(newHeight));
    }, [Number(imageIs?.reSizeProperties?.y), dispatch]);

    const eventDatesIs = useSelector(state => state.mainSlice.eventDate);
    const isSvg = (uri) => {
        return uri?.startsWith('data:image/svg+xml') || uri?.endsWith('.svg');
    };
    let parmValueColor = "";
    const [labelParmValue, setlabelParmValue] = useState("");
    const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
    const updateColor = (ele) => {
        switch (ele?.condition) {
            case "minMax":
                if (parseFloat(labelParmValue) > parseFloat(ele?.min) && parseFloat(labelParmValue) < parseFloat(ele?.max)) {
                    parmValueColor = ele?.color;
                }
                break;
            case "greaterThan":
                if (parseFloat(labelParmValue) > parseFloat(ele?.min)) {
                    parmValueColor = ele?.color;
                }
                break;
            case "lessThan":
                if (parseFloat(labelParmValue) < parseFloat(ele?.max)) {
                    parmValueColor = ele?.color;
                }
                break;
            case "greaterThanEquall":
                if (parseFloat(labelParmValue) >= parseFloat(ele?.max)) {
                    parmValueColor = ele?.color;
                }
                break;
            case "lessThanEquall":
                if (parseFloat(labelParmValue) <= parseFloat(ele?.max)) {
                    parmValueColor = ele?.color;
                }
                break;
            case "text":
                if (String(labelParmValue) == String(ele?.max)) {
                    parmValueColor = ele?.color;
                }
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        let refreshTime = 0;
        const refreshFreq = imageIs?.refreshFreq?.split(" ");
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
            let paramData, fromDateIs, toDateIs;
            if (type === 'panel') {
                paramData = imageIs;
                toDateIs = eventDatesIs[1]?.toISOString()?.slice(0, 19)?.replace("T", " ");
                fromDateIs = eventDatesIs[0]
                    ?.toISOString()
                    ?.slice(0, 19)
                    ?.replace("T", " ");
            } else {
                paramData = imageIs;

                if (imageIs?.aggregateTime !== "custom") {
                    const timeIs = TimingsConversion(imageIs?.aggregateTime);
                    fromDateIs = timeIs[0];
                    toDateIs = timeIs[1];
                } else {
                    fromDateIs = imageIs?.fromDate;
                    toDateIs = imageIs?.toDate;
                }
            }

            const parametersId = paramData?.parameters?.map((ele) => ele?.parameterId);
            const RequestBody = {};
            const filter_tags = [];
            paramData?.parameters?.forEach((item) => {
                const conditions = item?.fiterConditionsNewFormat?.join(" ");
                RequestBody[item?.parameterId] = conditions;
                item?.fiterConditionsNewFormat?.forEach((condition) => {
                    const paramId = condition?.split(" ")[0];
                    if (!parametersId?.includes(parseInt(paramId)) && !filter_tags?.includes(paramId)) {
                        filter_tags?.push(paramId);
                    }
                });
            });
            RequestBody["filter_tags"] = filter_tags?.join(",");
            let url;
            if (paramData.aggregateTime === "custom" || type === 'panel') {
                url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDateIs}&to_date=${toDateIs}&aggregation_type=${paramData.aggregateRange}&filter_condition=${JSON.stringify(RequestBody)}`;
            } else {
                url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&time_frequency=${paramData?.aggregateTime}&aggregation_type=${paramData.aggregateRange}&filter_condition=${JSON.stringify(RequestBody)}`;
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
                    const value = data[parametersId[0]];
                    setlabelParmValue(value);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        if (imageIs?.shapeType === "dynamic" && imageIs?.parameters?.length > 0) {
            fetchDataAndRender();
            if (refreshTime !== "None") {
                const intervalId = setInterval(fetchDataAndRender, refreshTime);
                return () => clearInterval(intervalId);
            }
        }
    }, [imageIs?.parameters, imageIs?.aggregateTime, imageIs?.aggregateRange]);

    // Apply conditions and update colors using map
    imageIs?.labelValueRange?.map((ele) => updateColor(ele));

    return (
        <>
            {
                imageIs?.reSizeProperties &&
                <View style={[styles.image,
                {
                    left: type === "panel" ? panelscaleWidth(Number(imageIs?.reSizeProperties?.x < 50 ? imageIs?.reSizeProperties?.x : imageIs?.reSizeProperties?.x - 15)) : scaleWidth(Number(imageIs?.reSizeProperties?.x < 50 ? imageIs?.reSizeProperties?.x : imageIs?.reSizeProperties?.x)),
                    top: type === "panel" ? panelscaleHeight(Number(imageIs?.reSizeProperties?.y)) : scaleHeight(Number(imageIs?.reSizeProperties?.y)),
                    zIndex: imageIs?.chartZindex,
                }
                ]}>
                    {imageIs?.SquareBg && isSvg(parmValueColor !== "" ? parmValueColor : imageIs?.SquareBg) ? (
                        <View
                            style={{
                                overflow: 'hidden',
                                height: type === "panel"
                                    ? panelscaleHeight(parseInt(imageIs?.reSizeProperties?.height))
                                    : scaleHeight(parseInt(imageIs?.reSizeProperties?.height)),
                                width: type === "panel"
                                    ? panelscaleWidth(parseInt(imageIs?.reSizeProperties?.width))
                                    : scaleHeight(parseInt(imageIs?.reSizeProperties?.width)),
                            }}
                        >
                            <SvgXml
                                xml={Buffer.from(parmValueColor !== "" ? parmValueColor : imageIs?.SquareBg?.split(',')[1], 'base64')?.toString('utf-8')}
                                height={type === "panel" ? panelscaleHeight(parseInt(imageIs?.reSizeProperties?.height)) : scaleHeight(parseInt(imageIs?.reSizeProperties?.height))}
                                width={type === "panel" ? panelscaleHeight(parseInt(imageIs?.reSizeProperties?.width)) : scaleWidth(parseInt(imageIs?.reSizeProperties?.width))}
                                style={styles.svg} viewBox="0 0 100 100" />
                        </View>
                    ) : (

                        <Image
                            resizeMode={imageIs.contain === 'cover' ? 'cover' : 'contain'}
                            style={{
                                zIndex: imageIs?.chartZindex,
                                overflow: 'hidden',
                                borderRadius: imageIs?.borderRadius ? Number(imageIs?.borderRadius) : 1,
                                height: type === "panel" ? panelscaleHeight(parseInt(imageIs?.reSizeProperties?.height)) : scaleHeight(parseInt(imageIs?.reSizeProperties?.height) + 3),
                                width: type === "panel" ? panelscaleHeight(parseInt(imageIs?.reSizeProperties?.width)) : scaleWidth(parseInt(imageIs?.reSizeProperties?.width) - 3)
                            }} source={imageIs !== null && { uri: parmValueColor !== "" ? parmValueColor : imageIs?.SquareBg }} />
                    )}

                </View>
            }</>
    )
}

const styles = StyleSheet.create({
    image: {
        alignSelf: 'center',
        position: 'absolute'
    },
    svg: {
        resizeMode: 'contain',
    },
})