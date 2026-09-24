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


export default function RadialBarChart(props) {
    const { chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type } = props;
    const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
    const dispatch = useDispatch();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    let radialBarChartColorsIs = basicDetails
    const [tracesIs, setTraces] = useState([]);
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
        radialBarChartColorsIs = basicDetails
    } else {
        radialBarChartColorsIs = checkTheCond[chartId]["radialBarChart-colors"]
    }
    const [option, setOption] = useState({})
    const [radialBarChartColors, setRadialBarChartColors] = useState(radialBarChartColorsIs)

    const basicDetails = {
        chartTitle: "RadialBar Chart", plotAreaBg: "#fff", plotAreaOutline: "#b3b0b0ff", areaBackground: "#fff", areaOutline: "#fff",
        isGridPresent: true, toolTip: true, showLegend: true, legend: { x: 0.5, y: 1.1 }, chartType: "horizontal", barGap: 0.3, donutGap: 0.6, scatterType: "bubble",
        fSize: "18px", fFamily: "Nunito", isBold: false, isItalic: false, isUnderLine: false, isCaseChange: false, isTitleOpen: false,
        fontColor: "#33A9AC", fontBgColor: "#fff", legendTop: false, legendBottom: false, legendLeft: false, legendRight: false, xGridColor: "#000", yGridColor: "#C6D0DC",
        xBold: false, xFontColor: "#b3b0b0ff", xFonntSize: "16", xfFamily: "Nunito", yBold: false, yFontColor: "#b3b0b0ff",
        yFonntSize: "16", yfFamily: "Nunito", reSizeProperties: { x: xIs, y: yIs, width: width, height: height }, textPosition: false, textInside: true, textOutSide: false,
        YGap: 0.3, heatColorRange: "none", HeatpaletNo: 0, parameters: [], refreshFreq: "None", timeRange: "hour", subSup: "Enter The Title", legendType: "code", legendWeight: "14px", legendFamily: "Nunito"
    }

    {/* <------ Removing the web px value to mobile  ------> */ }
    const parseHeight = (value) => {
        if (typeof value === 'string') {
            return value?.includes('px') ? parseFloat(value?.replace('px', '')) : parseFloat(value);
        }
        return value;
    };

    const getParameterFunc = parm => {
        const data = { ...radialBarChartColors, parameters: parm }
        setRadialBarChartColors(data)
        dispatch(chartDataFromserver({ key: chartId, value: { id: chartId, "radialBarChart-colors": data } }));
    }

    useEffect(() => {
        setloading(true)
        const height = parseHeight(layout?.rndproperties?.height)
        const newHeight = Number(layout?.rndproperties.y) + Number(height) + 10;
        dispatch(updateHeight(newHeight));
        let refreshTime = "None";

        const refreshFreq = radialBarChartColors?.refreshFreq?.split(" ")
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
    }, [radialBarChartColors])

    const fetchDataAndRender = async (filterCondition, timingBtnName, formattedFromDate, formattedToDate) => {
        let paramData = {}
        let fromDateIs, toDateIs;
        if (paged === 'analytics') {
            paramData = chartList
            fromDateIs = chartList.fromdateIs
            toDateIs = chartList.toDateIs
            setTraces([])
        } else {
            paramData = radialBarChartColors
            if (radialBarChartColors?.aggregateTime !== "custom") {
                const timeIs = TimingsConversion(radialBarChartColors?.aggregateTime)
                fromDateIs = timeIs[0]
                toDateIs = timeIs[1]
            } else {
                fromDateIs = radialBarChartColors?.fromDate
                toDateIs = radialBarChartColors?.toDate
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
            const names = paged === 'Analytics' ? paramData.parameters.map((ele) => ele.global + "(" + ele.paramUnit + ")") : paramData.legendType === "name" ? paramData.parameters.map((ele) => ele.name + "(" + ele.paramUnit + ")") : paramData.parameters.map((ele) => ele.global + "(" + ele.paramUnit + ")")
            const commondata = {
                angleAxis: {
                    axisLabel: {
                        fontSize: 10,
                        fontWeight: radialBarChartColors?.yBold ? "bold" : "normal",
                        color: radialBarChartColors?.yFontColor,
                        fontFamily: radialBarChartColors?.yfFamily
                    },
                    splitLine: {
                        show: radialBarChartColors?.isGridPresent,
                        lineStyle: {
                            color: radialBarChartColors?.xGridColor,
                        }
                    }
                },
                radiusAxis: {
                    type: 'category',
                    data: names,
                    z: 10,
                    axisLabel: {
                        show: true,
                        interval: 0,
                        rotate: 0,
                        fontSize: 10,
                        fontWeight: radialBarChartColors?.xBold ? "bold" : "normal",
                        color: radialBarChartColors?.xFontColor,
                        fontFamily: radialBarChartColors?.xfFamily
                    }
                },
                polar: {},
                backgroundColor: radialBarChartColors?.areaBackground,
                legend: {
                    data: names,
                    show: radialBarChartColors?.showLegend,
                    orient: radialBarChartColors?.legend.y === "center" ? "vertical" : "horizontal",
                    top: radialBarChartColors?.legend.y,
                    left: radialBarChartColors?.legend.x,
                    textStyle: {
                        fontSize: 10,
                        fontFamily: radialBarChartColors?.legendFamily || 'Open Sans',
                    },
                },
                tooltip: {
                    trigger: 'item',
                    show: radialBarChartColors?.toolTip,
                    formatter: function (params) {
                        return `${params.seriesName}: ${params.value}`;
                    }
                },
            }
            const data = response.data.data;
            if (data) {
                if (Object.keys(response.data.data).length === 0) {
                    setNoData(true);
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
                    ]
                })
            } else {
                setNoData(false);
            }
            if (data) {

                const valuesArray = Object.values(data)
                const seriesData = names.map((name, index) => {
                    const data = Array(names.length).fill(0);
                    data[index] = valuesArray[index];
                    return {
                        type: 'bar',
                        data: data,
                        coordinateSystem: 'polar',
                        name: name,
                        stack: "a",
                        itemStyle: {
                            color: paramData.parameters[index].parameterColor
                        }
                    };
                });

                const option = {
                    ...commondata,
                    series: seriesData,

                };
                setOption(option)

            }
            setloading(false)
        } catch (error) {
            console.error('Error fetching dataradial:', error);
            setNoData(true);
            setloading(false)
        }
    };

    {/* <------ layout styles for chart ------> */ }

    const layout = {
        autosize: true,
        boxgap: radialBarChartColors?.barGap,
        boxgroupgap: radialBarChartColors?.barGap,
        boxmode: 'group',
        margin: {
            t: 15,
            l: 40,
            r: 20,
            b: 30,
        },
        x: 0.5,
        y: 0.3,
        ...(radialBarChartColors?.multiaxis ? (() => {
            let leftPosition = 0;
            let rightPosition = 1;
            const spacing = 0.03;
            let leftPositionMax = leftPosition;
            let rightPositionMax = rightPosition;

            const yAxisConfigs = Object.fromEntries(
                radialBarChartColors?.parameters.map((parameter, index) => {
                    const position = (index + 1) % 2 !== 0 ? leftPosition : rightPosition;
                    if ((index + 1) % 2 !== 0) {
                        leftPosition += spacing;
                        leftPositionMax = Math.max(leftPositionMax, leftPosition);
                    } else {
                        rightPosition -= spacing;
                        rightPositionMax = Math.min(rightPositionMax, rightPosition);
                    }

                    return [
                        `yaxis${index + 1}`,
                        {
                            title: parameter.paramUnit,
                            titlefont: { color: parameter.parameterColor },
                            tickfont: { color: parameter.parameterColor },
                            overlaying: index === 0 ? undefined : "y",
                            position,
                            showline: true,
                            zeroline: false,
                        },
                    ];
                })
            );

            return {
                ...yAxisConfigs,
                xaxis: {
                    domain: [leftPositionMax - 0.03, rightPositionMax + 0.03],
                    autorange: true,
                    showgrid: radialBarChartColors?.isGridPresent,
                    gridcolor: radialBarChartColors?.xGridColor,
                    gridwidth: 1,
                    griddash: "dot",
                    gridshape: "linear",
                    showline: true,
                    tickfont: {
                        family: radialBarChartColors?.xfFamily,
                        size: radialBarChartColors?.xFonntSize,
                        color: radialBarChartColors?.xFontColor,
                        weight: radialBarChartColors?.xBold ? "bold" : "normal",
                    },
                    tickangle: 0,
                },
            };
        })() : (radialBarChartColors?.isChartAxisPresent || radialBarChartColors?.isChartAxisPresent === undefined) ? {
            xaxis: {
                autorange: true,
                showgrid: radialBarChartColors?.isGridPresent,
                gridcolor: radialBarChartColors?.xGridColor,
                gridwidth: 1,
                griddash: 'dot',
                gridshape: 'linear',
                showline: true,
                tickfont: {
                    family: radialBarChartColors?.xfFamily,
                    size: radialBarChartColors?.xFonntSize,
                    color: radialBarChartColors?.xFontColor,
                    weight: radialBarChartColors?.xBold ? "bold" : "normal",
                },
                tickangle: 0,
            },
            yaxis: {
                autorange: true,
                showgrid: radialBarChartColors?.isGridPresent,
                gridcolor: radialBarChartColors?.yGridColor,
                gridwidth: 1,
                griddash: 'dot',
                gridshape: 'linear',
                showline: true,
                tickfont: {
                    family: radialBarChartColors?.yfFamily,
                    size: radialBarChartColors?.yFonntSize,
                    color: radialBarChartColors?.yFontColor,
                    weight: radialBarChartColors?.yBold ? "bold" : "normal",
                },
            }
        } : {
            xaxis: {
                showgrid: false,
                zeroline: false,
                showline: false,
                showticklabels: false,
            },
            yaxis: {
                showgrid: false,
                zeroline: false,
                showline: false,
                showticklabels: false,
            },
        }),
        showlegend: radialBarChartColors?.showLegend,
        legend: {
            y: radialBarChartColors?.legend.y,
            x: radialBarChartColors?.legend.x,
            orientation: 'h',
            xanchor: 'center',
            traceorder: 'normal',
            itemsizing: 'trace',
            font: {
                family: radialBarChartColors?.legendFamily,
                size: parseInt(radialBarChartColors?.legendWeight),
                weight: 'lighter',
            }
        },
        images: [{
            "source": radialBarChartColors?.plotAreaBg,
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
        paper_bgcolor: radialBarChartColors?.areaBackground,
        plot_bgcolor: radialBarChartColors?.plotAreaBg,
        annotations: noData ? [{
            x: 0.5,
            y: 0.5,
            xref: 'paper',
            yref: 'paper',
            text: 'No data found',
            showarrow: false,
            font: {
                family: radialBarChartColors?.fFamily,
                size: radialBarChartColors?.fSize,
                color: 'red',
            },
        }] : [],
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
                    color: radialBarChartColors?.plotAreaOutline,
                    width: 1,
                },
            },
        ],
        chartOutline: `1px solid ${radialBarChartColors?.areaOutline}`,
        chartTitleIs: radialBarChartColors?.chartTitle,
        fontSize: 10,
        fontFamily: radialBarChartColors?.fFamily,
        isBold: radialBarChartColors?.isBold,
        isItalic: radialBarChartColors?.isItalic,
        isUnderLine: radialBarChartColors?.isUnderLine,
        isCaseChange: radialBarChartColors?.isCaseChange,
        fontColor: radialBarChartColors?.fontColor,
        fontBgColor: radialBarChartColors?.fontBgColor,
        rndproperties: radialBarChartColors?.reSizeProperties
    }

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
                                    backgroundColor: layout.fontBgColor,
                                    borderTopLeftRadius: radialBarChartColorsIs?.isBorderRadius ? 10 : 1,
                                    borderTopRightRadius: radialBarChartColorsIs?.isBorderRadius ? 10 : 1,
                                },
                            ]}
                        >
                            <Text style={[styles.charttitle, { fontSize: type == 'panel' ? panelnormalizeFont(16) : normalizeFont(14), color: layout.fontColor }]}>
                                {radialBarChartColorsIs?.chartTitle}
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
                            borderBottomLeftRadius: radialBarChartColorsIs?.isBorderRadius ? 10 : 1,
                            borderBottomRightRadius: radialBarChartColorsIs?.isBorderRadius ? 10 : 1,
                            backgroundColor: radialBarChartColorsIs?.areaBackground ? radialBarChartColorsIs?.areaBackground : COLORS.WHITE,
                        }}
                    >
                        {loading ? (
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: COLORS.WHITE,
                                    borderBottomRightRadius: radialBarChartColorsIs?.isBorderRadius ? 10 : 1,
                                    borderBottomLeftRadius: radialBarChartColorsIs?.isBorderRadius ? 10 : 1,
                                }}>
                                <ActivityIndicator size={'small'} color={COLORS.HEADER} />
                            </View>
                        ) : (
                            <View
                                style={{
                                    height: type === 'panel' ? panelscaleHeight(parseHeight(layout?.rndproperties?.height) - 60) : scaleHeight(parseHeight(layout?.rndproperties?.height) - 60),
                                    backgroundColor: COLORS.WHITE,
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
