import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Platform, ActivityIndicator, Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimingsConversion } from '../TimingsConversion';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { styles } from '../styles';
import RNEChartsPro from 'react-native-echarts-pro';
import {
    scaleHeight,
    scaleWidth,
    normalizeFont
} from '../../../Constants/dynamicSize';
import { panelscaleHeight, panelscaleWidth, panelnormalizeFont } from '../../../Constants/panelSize';
import { chartDataFromserver } from '../../../Redux/ReduxSlice/mainSlice';
import { COLORS } from '../../../Constants/Colors';


export default function NightingaleChart(props) {
    const { chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type } = props;
    const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
    const dispatch = useDispatch();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    let nightingaleChartDataIs = basicDetails
    const [loading, setloading] = useState(false);
    const [noData, setNoData] = useState(false);

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 50,
            useNativeDriver: true,
        }).start();
        return () => {
            Animated.spring(scaleAnim, {
                toValue: 0,
                friction: 4,
                tension: 50,
                useNativeDriver: true,
            }).start();
        };
    }, []);

    {/* <------ Chart styles and title data fetching ------> */ }
    if (paged === 'analytics') {
        nightingaleChartDataIs = basicDetails
    } else {
        nightingaleChartDataIs = checkTheCond[chartId]["nightingaleChart-colors"]
    }
    const [option, setOption] = useState({})
    const [nightingaleChartData, setNightingaleChartData] = useState(nightingaleChartDataIs)
    const basicDetails = {
        chartTitle: "NightingaleChart", plotAreaBg: "#fff", plotAreaOutline: "#b3b0b0ff", areaBackground: "#fff", areaOutline: "#fff",
        isGridPresent: true, toolTip: true, showLegend: true, legend: { x: 0.5, y: 1.1 }, chartType: "horizontal", barGap: 0.3, donutGap: 0.6, scatterType: "bubble",
        fSize: "12", fFamily: "Nunito", isBold: false, isItalic: false, isUnderLine: false, isCaseChange: false,
        fontColor: "#33A9AC", fontBgColor: "#fff", legendTop: false, legendBottom: false, legendLeft: false, legendRight: false,
        xBold: false, xFontColor: "#b3b0b0ff", xFonntSize: "12", xfFamily: "Nunito", yBold: false, yFontColor: "#b3b0b0ff",
        yFonntSize: "12", yfFamily: "Nunito", reSizeProperties: { x: xIs, y: yIs, width: width, height: height }, textPosition: false, textInside: true, textOutSide: false,
        YGap: 0.3, heatColorRange: "none", HeatpaletNo: 0, parameters: [], refreshFreq: "None", timeRange: "5 Minute", subSup: "Enter The Title", legendWeight: "14px", legendFamily: "Nunito",
        isTextOutside: false, ftextFamily: "Nunito", isTextBold: false, textfontColor: "#008000", ftextSize: "12"
    }

    {/* <------ Removing the web px value to mobile  ------> */ }
    const parseHeight = (value) => {
        if (typeof value === 'string') {
            return value?.includes('px') ? parseFloat(value?.replace('px', '')) : parseFloat(value);
        }
        return value;
    };

    const getParameterFunc = parm => {
        const data = { ...nightingaleChartData, parameters: parm }
        setNightingaleChartData(data)
        dispatch(chartDataFromserver({ key: chartId, value: { id: chartId, "nightingaleChart-colors": data } }));
    }

    useEffect(() => {
        setloading(true)
        const height = parseHeight(layout?.rndproperties?.height)
        const newHeight = Number(layout?.rndproperties.y) + Number(height) + 10;
        dispatch(updateHeight(newHeight));
        let refreshTime = "None";

        const refreshFreq = nightingaleChartData?.refreshFreq?.split(" ")
        if (refreshFreq) {
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
                const intervalId = setInterval(() => {
                    fetchDataAndRender(false);
                }, refreshTime);
                return () => clearInterval(intervalId);
            }
        }
    }, [nightingaleChartData])


    const fetchDataAndRender = async (filterCondition, timingBtnName, formattedFromDate, formattedToDate) => {
        setloading(true)
        let paramData = {}
        let fromDateIs, toDateIs;
        if (paged === 'analytics') {
            paramData = chartList
            fromDateIs = chartList.fromdateIs
            toDateIs = chartList.toDateIs
            setOption({})
        } else {
            paramData = nightingaleChartData
            if (nightingaleChartData?.aggregateTime !== "custom") {
                const timeIs = TimingsConversion(nightingaleChartData?.aggregateTime)
                fromDateIs = timeIs[0]
                toDateIs = timeIs[1]
            } else {
                fromDateIs = nightingaleChartData?.fromDate
                toDateIs = nightingaleChartData?.toDate
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
        if (paramData.aggregateTime === "custom" || timingBtnName === "custom" ||
            paramData.aggregateTime === "Days" ||
            paramData.aggregateTime === "Hours" ||
            paramData.aggregateTime === "Month" ||
            paramData.aggregateTime === "Past Month") {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${filterCondition ? formattedFromDate : fromDateIs}&to_date=${filterCondition ? formattedToDate : toDateIs}&data_type=pie&aggregation_type=${paramData.aggregateRange}&filter_condition=${JSON.stringify(RequestBody)}`;
        } else {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&data_type=pie&time_frequency=${filterCondition ? timingBtnName : paramData.aggregateTime}&aggregation_type=${paramData.aggregateRange}&filter_condition=${JSON.stringify(RequestBody)}`;
        }
        try {
            const token = await AsyncStorage.getItem('jwttoken');
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setloading(false)
            const commondata = {
                legend: {
                    show: nightingaleChartData?.showLegend,
                    orient: nightingaleChartData?.legend.y === "center" ? "vertical" : "horizontal",
                    top: nightingaleChartData?.legend.y,
                    left: nightingaleChartData?.legend.x,
                    textStyle: {
                        fontSize: 10,
                        fontFamily: nightingaleChartData?.legendFamily || 'Open Sans',
                    },
                },
                tooltip: {
                    show: nightingaleChartData?.toolTip,
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },

                backgroundColor: nightingaleChartData?.areaBackground,
                toolbox: {
                    show: false,
                },
            }
            const data = response.data.data;
            if (data) {
                if (Object.keys(response.data.data).length === 0) {
                    setNoData(true);
                    setOption({ backgroundColor: nightingaleChartData?.areaBackground })
                }
            }
            if (Object.keys(response.data).length === 0) {
                setNoData(true);
                setOption({
                    ...commondata,
                    graphic: [
                        {
                            type: 'text',
                            left: 'center',
                            top: 'center',
                            style: {
                                text: 'No data available',
                                fontSize: 10,
                                fill: 'red',
                                fontFamily: 'Open Sans'
                            }
                        }
                    ],
                    dataZoom: [
                        {
                            type: 'inside'
                        },
                    ],
                    series: []
                })
            } else {
                setNoData(false);
            }
            if (data) {
                const values = Object.values(data);
                const paramName = Object.keys(checkTheCond).length < 1 ? paramData.parameters.map((ele) => ele.global + "(" + ele.paramUnit + ")") : paramData.legendType === "name" ? paramData.parameters.map((ele) => ele.name + "(" + ele.paramUnit + ")") : paramData.parameters.map((ele) => ele.global + "(" + ele.paramUnit + ")");
                const colors = Object.keys(checkTheCond).length < 1 ? defaultColors.map((ele) => ele) : paramData.parameters.map((ele) => ele.parameterColor)
                const valuesArrayIs = values.map((ele, index) => ({
                    value: ele,
                    name: paramName[index],
                    itemStyle: {
                        color: colors[index]
                    }
                }));
                const dataIs = {
                    ...commondata,
                    series: [
                        {
                            name: 'Nightingale Chart',
                            type: 'pie',
                            radius: nightingaleChartData?.donutGap !== 0 ? ['30%', '70%'] : '70%',
                            center: ['50%', '50%'],
                            roseType: 'area',
                            itemStyle: {
                                borderRadius: 8
                            },
                            label: {
                                show: true,
                                position: 'outside',
                                fontSize: 10,
                                fontWeight: nightingaleChartData?.isTextBold ? "bold" : "",
                                color: nightingaleChartData?.textfontColor,
                                fontFamily: nightingaleChartData?.ftextFamily || 'Open Sans',
                            },
                            data: valuesArrayIs
                        }
                    ]
                }
                setOption(dataIs);
            }
            setloading(false)
        } catch (error) {
            console.error('Error fetching datanight:', error);
            setNoData(true);
            setloading(false)
        }
    };

    {/* <------ layout styles for chart ------> */ }

    const layout = {
        autosize: true,
        margin: {
            t: 50,
            l: 30,
            r: 20,
            b: 30,
        },
        images: [{
            "source": nightingaleChartData?.plotAreaBg,
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
        paper_bgcolor: nightingaleChartData?.areaBackground,
        plot_bgcolor: nightingaleChartData?.plotAreaBg,
        showlegend: nightingaleChartData?.showLegend,
        legend: {
            y: nightingaleChartData?.legend.y,
            x: nightingaleChartData?.legend.x,
            xanchor: 'center',
            traceorder: 'normal',
            orientation: 'h',
            font: {
                family: nightingaleChartData?.legendFamily,
                size: parseInt(nightingaleChartData?.legendWeight),
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
                family: nightingaleChartData?.fFamily,
                size: nightingaleChartData?.fSize,
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
                    color: nightingaleChartData?.plotAreaOutline,
                    width: 1,
                },
            },
        ],
        chartOutline: `1px solid ${nightingaleChartData?.areaOutline}`,
        chartTitleIs: nightingaleChartData?.chartTitle,
        fontSize: 10,
        fontFamily: nightingaleChartData?.fFamily,
        isBold: nightingaleChartData?.isBold,
        isItalic: nightingaleChartData?.isItalic,
        isUnderLine: nightingaleChartData?.isUnderLine,
        isCaseChange: nightingaleChartData?.isCaseChange,
        fontColor: nightingaleChartData?.fontColor,
        fontBgColor: nightingaleChartData?.fontBgColor,
        rndproperties: nightingaleChartData?.reSizeProperties
    };

    return (
        <View style={{
            height: type === 'panel' ? panelscaleHeight(225) : scaleHeight(225),
            position: 'absolute',
            alignSelf: 'center',
            width: type === 'panel' ? panelscaleWidth(350) : scaleWidth(350),
        }}>
            {layout?.rndproperties && (
                <Animated.View
                    style={{
                        transform: [{ scale: scaleAnim }],
                        height: type === 'panel' ? panelscaleHeight(parseHeight(layout?.rndproperties?.height)) : scaleHeight(parseHeight(layout?.rndproperties?.height)),
                        ...layout?.rndproperties.y
                            ? { top: type === 'panel' ? panelscaleHeight(Number(layout?.rndproperties?.y)) : scaleHeight(Number(layout?.rndproperties?.y)) }
                            : { marginTop: type === 'panel' ? panelscaleHeight(10) : scaleHeight(10) },
                        ...type === 'panel' ? { left: type === 'panel' ? panelscaleWidth(Number(layout?.rndproperties?.x + 300)) : scaleWidth(Number(layout?.rndproperties?.x)) }
                            : {}
                    }}
                >
                    {showtitle && (
                        <View
                            style={[
                                styles.headerbox,
                                {
                                    shadowColor: Platform.OS === 'ios' ? COLORS.ASH : '#000',
                                    backgroundColor: layout.fontBgColor ? layout.fontBgColor : '#ffffff',
                                    borderTopLeftRadius: nightingaleChartDataIs?.isBorderRadius ? 10 : 1,
                                    borderTopRightRadius: nightingaleChartDataIs?.isBorderRadius ? 10 : 1,
                                },
                            ]}
                        >
                            <Text style={[styles.charttitle, { fontSize: type == 'panel' ? panelnormalizeFont(16) : normalizeFont(14), color: layout.fontColor }]}>
                                {nightingaleChartDataIs?.chartTitle}
                            </Text>
                        </View>
                    )}
                    <View
                        style={{
                            alignSelf: 'flex-start',
                            justifyContent: 'center',
                            width: type == 'panel' ? panelscaleWidth(350) : scaleWidth(350),
                            height: type == 'panel' ? panelscaleHeight(parseHeight(layout?.rndproperties?.height) - 40) : scaleHeight(parseHeight(layout?.rndproperties?.height) - 40),
                            shadowColor: Platform.OS === 'ios' ? COLORS.ASH : '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.8,
                            shadowRadius: 2,
                            elevation: 2,
                            borderColor: '#D3D3D3',
                            borderBottomLeftRadius: nightingaleChartDataIs?.isBorderRadius ? 10 : 1,
                            borderBottomRightRadius: nightingaleChartDataIs?.isBorderRadius ? 10 : 1,
                            backgroundColor: nightingaleChartDataIs?.areaBackground ? nightingaleChartDataIs?.areaBackground : COLORS.WHITE,
                        }}
                    >
                        {loading ? (
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: COLORS.WHITE,
                                    borderBottomRightRadius: nightingaleChartDataIs?.isBorderRadius ? 10 : 1,
                                    borderBottomLeftRadius: nightingaleChartDataIs?.isBorderRadius ? 10 : 1,
                                }}
                            >
                                <ActivityIndicator size={'small'} color={COLORS.HEADER} />
                            </View>
                        ) : (
                            <View
                                style={{
                                    height: type === 'panel' ? panelscaleHeight(parseHeight(layout?.rndproperties?.height) - 60) : scaleHeight(parseHeight(layout?.rndproperties?.height) - 60),
                                }}
                            >
                                <RNEChartsPro option={option} height={type === 'panel' ? panelscaleHeight(parseHeight(layout?.rndproperties?.height) - 60) : scaleHeight(parseHeight(layout?.rndproperties?.height) - 60)} />
                            </View>
                        )}
                    </View>
                </Animated.View>
            )}


        </View>
    );

}
