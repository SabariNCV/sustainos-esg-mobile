import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimingsConversion } from '../TimingsConversion';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import ChartComponent from '../../../Components/ChartComponent';

export default function MixedChart(props) {

    const { chartId, chartList, checkTheCond, page, showtitle, width, height, xIs, yIs, type } = props
    const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
    const dispatch = useDispatch();
    const [tracesIs, setTraces] = useState([]);
    const [noData, setNoData] = useState(false);
    const [loading, setloading] = useState(false);
    const [description, setDescription] = useState("");
    const eventDatesIs = useSelector(state => state.mainSlice.eventDate);
    const userDetail = useSelector(state => state.authSlice.userDetails);
    const basicDetails = {
        chartTitle: "Mixed Chart", plotAreaBg: "#fff", plotAreaOutline: "#b3b0b0ff", areaBackground: "#fff", areaOutline: "#fff",
        isGridPresent: true, toolTip: true, showLegend: true, legend: { x: 0.5, y: 1.1 }, chartType: "horizontal", barGap: 0.3, donutGap: 0.6, scatterType: "bubble",
        fSize: "10", fFamily: "Nunito", isBold: false, isItalic: false, isUnderLine: false, isCaseChange: false, legendType: "name", isTitleOpen: false,
        fontColor: "#33A9AC", fontBgColor: "#fff", legendTop: false, legendBottom: false, legendLeft: false, legendRight: false, xGridColor: "#000", yGridColor: "#C6D0DC",
        xBold: false, xFontColor: "#b3b0b0ff", xFonntSize: "10", xfFamily: "Nunito", yBold: false, yFontColor: "#b3b0b0ff",
        yFonntSize: "10", yfFamily: "Nunito", reSizeProperties: { x: xIs, y: yIs, width: width, height: height }, textPosition: false, textInside: true, textOutSide: false,
        YGap: 0.3, heatColorRange: "none", HeatpaletNo: 0, parameters: [], refreshFreq: "None", timeRange: "5 Minute", subSup: "Enter The Title", legendWeight: "14px", legendFamily: "Nunito"
    }

    {/* <------ Chart styles and title data fetching ------> */ }
    let mixedChartDataIs = {}
    if (page === 'analytics') {
        mixedChartDataIs = basicDetails
    } else {
        mixedChartDataIs = checkTheCond[chartId]["mixedChart-colors"]
    }

    const [mixedChartData, setMixedChartData] = useState(mixedChartDataIs)
    useEffect(() => {
        setMixedChartData(mixedChartDataIs)
    }, [chartList])

    {/* <------ Removing the web px value to mobile  ------> */ }
    const parseHeight = (value) => {
        if (typeof value === 'string') {
            return value.includes('px') ? parseFloat(value.replace('px', '')) : parseFloat(value);
        }
        return value;
    };

    {/* <------ Initialize the fetching and refresh frequency  ------> */ }
    useEffect(() => {
        setloading(true)
        const height = parseHeight(layout?.rndproperties?.height)
        const newHeight = Number(layout?.rndproperties.y) + Number(height) + 10;
        dispatch(updateHeight(newHeight));
        fetchDataAndRender()
        let refreshTime = 0;
        const refreshFreq = mixedChartData?.refreshFreq.split(" ")
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
            const intervalId = setInterval(fetchDataAndRender, refreshTime);
            return () => clearInterval(intervalId);
        }
    }, [])

    {/* <------ fetching the data for chart based on  parametersId and time ------> */ }
    const fetchDataAndRender = async () => {

        let paramData = {}
        let fromDate, toDate;
        if (page === 'analytics') {
            paramData = chartList
            fromDate = chartList.fromdateIs
            toDate = chartList.toDateIs
        } else {
            if (type === "panel") {
                paramData = areaChartData
                const toDateObj = new Date(eventDatesIs[1]);
                const fromDateObj = new Date(eventDatesIs[0]);
                console.log("correctaaa", toDateObj, fromDateObj)
                // <------ calculate the difference between from and todates  ------>
                const differenceInMillis = toDateObj.getTime() - fromDateObj.getTime();
                // <------ calculate the half the difference ------>
                const halfDifferenceInMillis = differenceInMillis / 2;
                // <------ Adjust the from date by subtracting with half difference ------>
                const adjustedFromDateObj = new Date(fromDateObj.getTime() - halfDifferenceInMillis);
                // <------ Adjust the to date by adding with half difference ------>
                const adjustedToDateObj = new Date(toDateObj.getTime() + halfDifferenceInMillis);
                // <------ function handles to formate the from and to dates for any kind of time zones ------>

                function formatLocalDate(date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const seconds = String(date.getSeconds()).padStart(2, '0');
                    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                }

                fromDate = formatLocalDate(adjustedFromDateObj);
                toDate = formatLocalDate(adjustedToDateObj);
            } else {
                paramData = mixedChartData
                if (mixedChartData?.aggregateTime === "custom") {
                    fromDate = mixedChartData?.fromDate
                    toDate = mixedChartData?.toDate
                } else {
                    const timeIs = TimingsConversion(mixedChartData?.aggregateTime)
                    fromDate = timeIs[0]
                    toDate = timeIs[1]
                }
            }
        }
        const parametersId = paramData.parameters.map((ele) => ele.parameterId)
        const chartType = paramData.parameters.map((ele) => ele.chartType)
        const defaultColors = ["#00A68F", "#528CFA", "#FF8810", "#C46253", "#7E01A9", "#CF2020", "#FFBB10", "#748C76", "#DF9F4E", "#9B79FF"]
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
        if (paramData.aggregateTime === "custom" ||
            paramData.aggregateTime === "Days" ||
            paramData.aggregateTime === "Hours" ||
            paramData.aggregateTime === "Month" ||
            paramData.aggregateTime === "Past Month") {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDate}&to_date=${toDate}&data_type=line&filter_condition=${JSON.stringify(RequestBody)}`;
        } else {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&data_type=line&time_frequency=${paramData.aggregateTime}&filter_condition=${JSON.stringify(RequestBody)}`;
        }
        try {
            const token = await AsyncStorage.getItem('jwttoken');
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = response.data.data;
            if (Object.keys(response.data).length === 0) {
                setNoData(true);
                setloading(false);
            } else {
                setNoData(false);
            }

            if (data) {
                const traces = [];
                parametersId.forEach((key, ind) => {
                    const trace = {
                        x: [],
                        y: [],
                        name: page === 'analytics' ? chartList.parametrList[ind].globalCode + "(" + paramData.parameters[ind].paramUnit + ")" : paramData.legendType === "name" ? paramData.parameters[ind].name + "(" + paramData.parameters[ind].paramUnit + ")" : paramData.parameters[ind].global + "(" + paramData.parameters[ind].paramUnit + ")",
                        type: chartType[ind] === "area" ? "scatter" : chartType[ind],
                        fill: chartType[ind] === "area" ? "tozeroy" : 'none',
                        mode: chartType[ind] === "area" ? "none" : chartType[ind] === "scatter" ? 'markers' : 'lines',
                        yaxis: mixedChartData?.multiaxis ? `y${ind + 1}` : undefined,
                        line: {
                            dash: 'solid',
                            width: 1.5,
                            color: page === 'analytics' ? defaultColors[ind] : paramData.parameters[ind].parameterColor
                        }
                    };
                    Object.entries(data).forEach(([timestamp, values]) => {
                        const valueObj = values[parametersId[ind]];
                        trace.x.push(timestamp);
                        trace.y.push(valueObj || null);
                    });

                    traces.push(trace);
                });
                setloading(false)
                setTraces(traces);

            } else {
                setNoData(true);
                setloading(false)
                setTraces([])
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    {/* <------ layout styles for chart ------> */ }

    const layout = {
        autosize: true,
        margin: {
            t: 5,
            l: 40,
            r: 20,
            b: 40,
        },
        annotations: noData ? [{
            x: 0.5,
            y: 0.5,
            xref: 'paper',
            yref: 'paper',
            text: 'No data found',
            showarrow: false,
            font: {
                family: mixedChartData?.fFamily,
                size: 10,
                color: 'red',
            },
        }] : [],
        x: 0.5,
        y: 0.3,
        ...(mixedChartData?.multiaxis ? (() => {
            let leftPosition = 0; // Starting position for left-aligned y-axes
            let rightPosition = 0.98; // Starting position for right-aligned y-axes
            const spacing = 0.06 // Spacing between each y-axis
            let leftPositionMax = leftPosition; // Track maximum left position
            let rightPositionMax = rightPosition; // Track maximum right position

            const yAxisConfigs = Object.fromEntries(
                mixedChartData?.parameters.map((parameter, index) => {
                    let position, isLeft
                    if (page === 'Analytics') {
                        position = (index + 1) % 2 !== 0 ? leftPosition : rightPosition;
                        isLeft = (index + 1) % 2 !== 0
                    } else {
                        isLeft = parameter.yaxisPosition === "left";
                        position = isLeft ? leftPosition : rightPosition;
                    }
                    if (isLeft) {
                        leftPosition += spacing; // Increment for each left y-axis
                        leftPositionMax = Math.max(leftPositionMax, leftPosition); // Track max left position
                    } else {
                        rightPosition -= spacing; // Decrement for each right y-axis
                        rightPositionMax = Math.min(rightPositionMax, rightPosition); // Track min right position
                    }

                    return [
                        `yaxis${index + 1}`,
                        {
                            title: parameter.paramUnit,
                            titlefont: { color: parameter.parameterColor, size: 8 },
                            tickfont: { color: parameter.parameterColor, size: 8 },
                            //side: parameter.yaxisPosition || "left",
                            overlaying: index === 0 ? undefined : "y",
                            position,
                            showline: true,
                            zeroline: false,
                            showgrid: mixedChartData?.isGridPresent && index === 0
                        },
                    ];
                })
            );

            return {
                ...yAxisConfigs,
                xaxis: {
                    domain: [leftPositionMax - 0.03, rightPositionMax + 0.03],
                    autorange: true,
                    showgrid: mixedChartData?.isGridPresent,
                    gridcolor: mixedChartData?.xGridColor,
                    gridwidth: 1,
                    griddash: "dot",
                    gridshape: "linear",
                    showline: true,
                    tickfont: {
                        family: mixedChartData?.xfFamily,
                        size: 10,
                        color: mixedChartData?.xFontColor,
                        weight: mixedChartData?.xBold ? "bold" : "normal",
                    },
                    tickangle: 0,
                },
            };
        })() : (mixedChartData?.isChartAxisPresent || mixedChartData?.isChartAxisPresent === undefined) ? {
            xaxis: {
                autorange: true,
                showgrid: mixedChartData?.isGridPresent,
                gridcolor: mixedChartData?.xGridColor,
                gridwidth: 1,
                griddash: 'dot',
                gridshape: 'linear',
                showline: true,
                tickfont: {
                    family: mixedChartData?.xfFamily,
                    size: 10,
                    color: mixedChartData?.xFontColor,
                    weight: mixedChartData?.xBold ? "bold" : "normal",
                },
                tickangle: 0,
            },
            yaxis: {
                autorange: true,
                showgrid: mixedChartData?.isGridPresent,
                gridcolor: mixedChartData?.yGridColor,
                gridwidth: 1,
                griddash: 'dot',
                gridshape: 'linear',
                showline: true,
                tickfont: {
                    family: mixedChartData?.yfFamily,
                    size: 10,
                    color: mixedChartData?.yFontColor,
                    weight: mixedChartData?.yBold ? "bold" : "normal",
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
        showlegend: mixedChartData?.showLegend,
        legend: {
            y: mixedChartData?.legend.y + 0.2,
            x: mixedChartData?.legend.x,
            orientation: 'h',
            xanchor: 'center',
            traceorder: 'normal',
            itemsizing: 'trace',
            font: {
                family: mixedChartData?.legendFamily,
                size: 10,
                weight: 'lighter',
            }
        },
        images: [{
            "source": mixedChartData?.plotAreaBg,
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
        paper_bgcolor: mixedChartData?.areaBackground,
        plot_bgcolor: mixedChartData?.plotAreaBg,
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
                    color: mixedChartData?.plotAreaOutline,
                    width: 1,
                },
            },
        ],
        chartOutline: `1px solid ${mixedChartData?.areaOutline}`,
        chartTitleIs: mixedChartData?.chartTitle,
        fontSize: 10,
        fontFamily: mixedChartData?.fFamily,
        isBold: mixedChartData?.isBold,
        isItalic: mixedChartData?.isItalic,
        isUnderLine: mixedChartData?.isUnderLine,
        isCaseChange: mixedChartData?.isCaseChange,
        fontColor: mixedChartData?.fontColor,
        fontBgColor: mixedChartData?.fontBgColor,
        rndproperties: mixedChartData?.reSizeProperties
    }

    const capture = (url) => {
        const imagePostUrl = 'https://SustainOS.ai:9012/services/upload_chart/';
        const dataToPost = {
            'image': url,
            'chart_title': layout.chartTitleIs,
            'vertical_name': userDetail?.projectName?.name,
        }
        axios.post(imagePostUrl, dataToPost)
            .then(response => {
                setDescription(response.data.summary)
                // document.getElementById(summaryId).textContent = response.data.summary;
            })
            .catch(error => {
                console.error('Error:', error);
            })
            .finally(() => {
                setSummaryLoading(false);
            });
    }

    return (
        <View>
            <ChartComponent 
            layout={layout} 
            ChartColors={mixedChartData} 
            tracesIs={tracesIs} 
            showtitle={showtitle} 
            loading={loading} 
            onAIPress={capture}
            aiText={description}/>
        </View>
    )
}

