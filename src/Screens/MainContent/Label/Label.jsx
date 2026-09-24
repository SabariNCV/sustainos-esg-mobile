import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, PixelRatio, Platform } from 'react-native';
import { scaleHeight, scaleWidth, normalizeFont } from '../../../Constants/dynamicSize';
import { panelscaleHeight, panelscaleWidth, panelnormalizeFont } from '../../../Constants/panelSize';
import { FONTS } from "../../../Constants/Fonts";
import { useDispatch, useSelector } from 'react-redux';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { TimingsConversion } from '../TimingsConversion';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function Label(props) {
    const { labelId, labelDataIs, type } = props;
    const dispatch = useDispatch();
    const labelIS = labelDataIs[labelId]?.["label-colors"];
    const [labelParmValue, setLabelParmValue] = useState("");
    const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
    const userDetail = useSelector(state => state.authSlice.userDetails);

    const width = useMemo(() => labelIS?.reSizeProperties?.x, [labelIS]);
    const refreshFrequency = useMemo(() => {
        const freq = labelIS?.refreshFreq?.split(" ");
        if (!freq) return null;
        const value = parseInt(freq[0]);
        switch (freq[1]) {
            case 'Second':
                return value * 1000;
            case 'Minute':
                return value * 60000;
            case 'Hour':
                return value * 3600000;
            default:
                return null;
        }
    }, [labelIS?.refreshFreq]);

    useEffect(() => {
        if (!labelIS || !labelIS?.reSizeProperties?.y) return;

        const newHeight = Number(labelIS.reSizeProperties.y) + 100;
        dispatch(updateHeight(newHeight));
    }, [labelIS, dispatch]);

    useEffect(() => {
        const fetchDataAndRender = async () => {
            if (!labelIS || !labelIS.parameters?.length) return;

            let paramData = { ...labelIS };
            let fromDateIs, toDateIs;

            if (userDetail.PageName === "Events") {
                const eventDatesIs = getEventDates();
                fromDateIs = eventDatesIs[0].toISOString().slice(0, 19).replace('T', ' ');
                toDateIs = eventDatesIs[1].toISOString().slice(0, 19).replace('T', ' ');
            } else {
                const timeIs = labelIS.aggregateTime !== "custom" ? TimingsConversion(labelIS.aggregateTime) : [labelIS.fromDate, labelIS.toDate];
                fromDateIs = timeIs[0];
                toDateIs = timeIs[1];
            }

            const parametersId = paramData.parameters.map(ele => ele.parameterId);
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

            if (paramData.aggregateTime === "custom" || userDetail.PageName === "Events") {
                url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDateIs}&to_date=${toDateIs}&aggregation_type=${paramData.aggregateRange}&filter_condition=${JSON.stringify(RequestBody)}`;
            } else {
                url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&time_frequency=${paramData.aggregateTime}&aggregation_type=${paramData.aggregateRange}&filter_condition=${JSON.stringify(RequestBody)}`;
            }

            const token = await AsyncStorage.getItem('jwttoken');
            try {
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = response.data.data;
                if (data) {
                    const value = data[parametersId[0]];
                    if (value !== labelParmValue) {
                        setLabelParmValue(value);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (labelIS?.labelType === "dynamic" && labelIS?.parameters?.length > 0) {
            if (refreshFrequency !== null) {
                const intervalId = setInterval(fetchDataAndRender, refreshFrequency);
                return () => clearInterval(intervalId);
            }
            fetchDataAndRender();
        }
    }, [labelIS, BASE_URL, userDetail, refreshFrequency, labelParmValue]);

    if (!labelIS?.reSizeProperties) return null;


    const parseFontSize = (fontSize) => {
        if (typeof fontSize === 'string') {
            return parseInt(fontSize.replace('px', ''), 10);
        }
        console.warn("Unexpected fontSize value:", fontSize);
        return 12;
    };


    const parseWidth = (width) => {
        if (typeof width === 'string') {
            return parseInt(width.replace('px', ''), 10);
        }
        return 100;
    };

   const reduceFontSize = (size, reduceBy = 1) => {
    const reduced = size - reduceBy;
    return reduced > 0 ? reduced : size;
};

const fontSize = labelIS?.fontSize
    ? reduceFontSize(parseFontSize(labelIS.fontSize))
    : 10;
    const widthh = labelIS?.reSizeProperties?.width ? parseWidth(labelIS?.reSizeProperties?.width)+ 40 : 100;

    return (
        <View
            style={[styles.image, {
                backgroundColor: labelIS.fontBgColor,
                flex: 0,
                top: type === "panel"
                    ? panelscaleHeight(PixelRatio.roundToNearestPixel(Number(labelIS.reSizeProperties.y + 10)))
                        : scaleHeight(PixelRatio.roundToNearestPixel(Number(labelIS.reSizeProperties.y + 5 ))),
                left: type === "panel"
                    ? panelscaleWidth(Number(labelIS.reSizeProperties.x))
                        : scaleWidth(PixelRatio.roundToNearestPixel(Number(labelIS.reSizeProperties.x) - 5)),
                zIndex: labelIS.chartZindex,
            }]}
        >
            <>
                {labelIS?.reSizeProperties?.width && (
                    <Text
                        style={{
                            color: labelIS?.fontColor || 'black',
                            fontFamily: FONTS.SEGOEUISEMIBOLD,
                            fontWeight: labelIS?.isBold ? 'bold' : '500',
                            fontSize: type === "panel"
                                ? panelnormalizeFont(fontSize)
                                : normalizeFont(fontSize),
                            
                        }}
                    >
                        {labelIS?.parameters?.length > 0
                            ? (labelParmValue === "" ? "!!" : labelParmValue)
                            : (labelIS?.labelTitle || "??")}
                    </Text>
                )}
            </>
        </View>
    );
}

const styles = StyleSheet.create({
    image: {
        alignSelf: 'baseline',
        position: 'absolute',
    },
});
