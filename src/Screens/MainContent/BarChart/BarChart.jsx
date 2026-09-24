import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimingsConversion } from '../TimingsConversion';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import ChartComponent from '../../../Components/ChartComponent';


export default function BarChart(props) {

    const { chartId, chartList, checkTheCond, paged, showtitle, width, height, xIs, yIs, type } = props
    const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);
    const viewButtonTogling = useSelector((state) => state.mainSlice.analyticalPageView);
    const dispatch = useDispatch();
    let barChartColorsIs = {};
    const [tracesIs, setTraces] = useState([]);
    const [loading, setloading] = useState(false)
    const [noData, setNoData] = useState(false);
    const [parmMultiAxis, setParamMultiAxis] = useState(false);
    const eventDatesIs = useSelector(state => state.mainSlice.eventDate);
    const userDetail = useSelector(state => state.authSlice.userDetails);
    const [description, setDescription] = useState("");
    {/* <------ Chart styles and title data fetching ------> */ }
    if (paged === 'analytics') {
        barChartColorsIs = {
            ...basicDetails,
            multiaxis: chartList?.multiAxis,
            parameters: chartList?.parameters,
          };
    } else {
        barChartColorsIs = checkTheCond[chartId]["barChart-colors"]
    }
    const [barChartColors, setBarChartColors] = useState(barChartColorsIs);

    useEffect(() => {
        setBarChartColors(barChartColors)
    }, [chartList])

    const basicDetails = {
        chartTitle: "Bar Chart", plotAreaBg: "#fff", plotAreaOutline: "#b3b0b0ff", areaBackground: "#fff", areaOutline: "#fff",
        isGridPresent: true, toolTip: true, showLegend: true, legend: { x: 0.5, y: 1.1 }, chartType: "H", barGap: 0.3, donutGap: 0.6, scatterType: "bubble",
        fSize: "10", fFamily: "Nunito", isBold: false, isItalic: false, isUnderLine: false, isCaseChange: false, isTitleOpen: false, xGridColor: "#000", yGridColor: "#C6D0DC",
        fontColor: "#33A9AC", fontBgColor: "#fff", legendTop: true, legendBottom: false, legendLeft: false, legendRight: false,
        xBold: false, xFontColor: "#b3b0b0ff", xFonntSize: "10", xfFamily: "Nunito", yBold: false, yFontColor: "#b3b0b0ff",
        yFonntSize: "10", yfFamily: "Nunito", reSizeProperties: { x: xIs, y: yIs, width: width, height: height }, textPosition: false, textInside: true, textOutSide: false,
        YGap: 0.3, heatColorRange: "none", HeatpaletNo: 0, parameters: [], refreshFreq: "None", timeRange: "5 Minute", subSup: "Enter The Title", legendWeight: "14px", legendFamily: "Nunito"
    }




    {/* <------ Removing the web px value to mobile  ------> */ }
    const parseHeight = (value) => {
        if (typeof value === 'string') {
            return value?.includes('px') ? parseFloat(value?.replace('px', '')) : parseFloat(value);
        }
        return value;
    };

    {/* <------ Initialize the fetching and refresh frequency  ------> */ }
    useEffect(() => {
        setloading(true)
        const height = parseHeight(layout?.rndproperties?.height)
        const newHeight = Number(layout?.rndproperties?.y) + Number(height) + 10;
        dispatch(updateHeight(newHeight));
        fetchDataAndRender()
        let refreshTime = 0;
        const refreshFreq = barChartColors?.refreshFreq?.split(" ")
        if (refreshFreq && refreshFreq[1] === "Second") {
            refreshTime = refreshFreq && parseInt(refreshFreq[0]) * 1000
          } else if (refreshFreq && refreshFreq[1] === "Minute") {
            refreshTime = refreshFreq && parseInt(refreshFreq[0]) * 1000 * 60
          } else if (refreshFreq && refreshFreq[1] === "Hours") {
            refreshTime = refreshFreq && parseInt(refreshFreq[0]) * 1000 * 60 * 60
          } else {
            refreshTime = "None"
          }

        if (refreshTime !== "None") {
            const intervalId = setInterval(fetchDataAndRender, refreshTime);
            return () => clearInterval(intervalId);
        }
    }, [viewButtonTogling])

    {/* <------ fetching the data for chart based on  parametersId and time ------> */ }
    const fetchDataAndRender = async () => {
        let paramData = {}
        let fromDate, toDate;
        if (paged === 'analytics') {
            paramData = chartList
            fromDate = chartList?.fromdateIs
            toDate = chartList?.toDateIs
        } else {
            if (type === "panel") {
                paramData = barChartColors
                const toDateObj = new Date(eventDatesIs[1]);
                const fromDateObj = new Date(eventDatesIs[0]);
                console.log("correctaaa", toDateObj, fromDateObj)
                // <------ calculate the difference between from and todates  ------>
                const differenceInMillis = toDateObj?.getTime() - fromDateObj.getTime();
                // <------ calculate the half the difference ------>
                const halfDifferenceInMillis = differenceInMillis / 2;
                // <------ Adjust the from date by subtracting with half difference ------>
                const adjustedFromDateObj = new Date(fromDateObj?.getTime() - halfDifferenceInMillis);
                // <------ Adjust the to date by adding with half difference ------>
                const adjustedToDateObj = new Date(toDateObj?.getTime() + halfDifferenceInMillis);
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
                paramData = barChartColors
                if (barChartColors?.aggregateTime === "custom") {
                    fromDate = barChartColors?.fromDate
                    toDate = barChartColors?.toDate
                } else {
                    const timeIs = TimingsConversion(barChartColors?.aggregateTime)
                    fromDate = timeIs[0]
                    toDate = timeIs[1]
                }
            }
        }

        const parametersId = paramData?.parameters?.map((ele) => ele?.parameterId)
        const parameterNames = paramData?.parameters?.map(parameter => parameter?.name);
        const Uomdata = paramData?.parameters?.map(parameter => parameter?.paramUnit);
        const defaultColors = ["#00A68F", "#528CFA", "#FF8810", "#C46253", "#7E01A9", "#CF2020", "#FFBB10", "#748C76", "#DF9F4E", "#9B79FF"]
        const RequestBody = {};
        const filter_tags = [];
        paramData?.parameters?.forEach(item => {
            const conditions = item?.fiterConditionsNewFormat?.join(' ');
            RequestBody[item?.parameterId] = conditions;
            item?.fiterConditionsNewFormat?.forEach(condition => {
                const paramId = condition?.split(' ')[0];
                if (!parametersId?.includes(parseInt(paramId)) && !filter_tags?.includes(paramId)) {
                    filter_tags?.push(paramId);
                }
            });
        });
        RequestBody["filter_tags"] = filter_tags?.join(',');
        let url;
        if (paramData?.aggregateTime === "custom" ||
            paramData?.aggregateTime === "Days" ||
            paramData?.aggregateTime === "Hours" ||
            paramData?.aggregateTime === "Month" ||
            paramData?.aggregateTime === "Past Month") {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&from_date=${fromDate}&to_date=${toDate}&data_type=bar&filter_condition=${JSON?.stringify(RequestBody)}`;
        } else {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${parametersId}&data_type=bar&time_frequency=${paramData?.aggregateTime}&filter_condition=${JSON?.stringify(RequestBody)}`;
        }
        try {
            const token = await AsyncStorage.getItem('jwttoken');
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = response?.data?.data;
            if (Object?.keys(response?.data)?.length === 0) {
                setNoData(true);
                setloading(false)
            } else {
                setNoData(false);
            }

            if (data) {
                const traces = [];
                parametersId?.forEach((key, ind) => {
                    const trace = {
                        x: [],
                        y: [],
                        "hoverinfo": paramData?.toolTip ? 'all' : 'none',
                        name: paged === 'analytics' ? chartList?.parametrList[ind]?.globalCode + "(" + paramData?.parameters[ind]?.paramUnit + ")" : paramData?.legendType === "name" ? paramData?.parameters[ind]?.name + "(" + paramData?.parameters[ind]?.paramUnit + ")" : paramData?.parameters[ind]?.global + "(" + paramData?.parameters[ind]?.paramUnit + ")",
                        type: 'bar',
                        orientation: paged === 'analytics' ? chartList?.barType === 'V' || chartList?.barType === 'SV' ? 'v' : 'h' : paramData?.barType === 'V' || paramData?.barType === 'SV' ? 'v' : 'h',
                        marker: {
                            color: paged === 'analytics' ? defaultColors[ind] : paramData?.parameters[ind]?.parameterColor   // Generate color dynamically or customize as needed
                        },
                        yaxis: barChartColors?.multiaxis ? `y${ind + 1}` : undefined
                    };
                    Object?.entries(data)?.forEach(([timestamp, values]) => {
                        const valueObj = values[parametersId[ind]];
                        trace?.x?.push((paged === 'analytics' ? chartList?.barType === 'V' || chartList?.barType === 'SV' : paramData?.barType === "V" || paramData?.barType === "SV") ? timestamp : valueObj || null);
                        trace?.y?.push((paged === 'analytics' ? chartList?.barType === 'V' || chartList?.barType === 'SV' : paramData?.barType === "V" || paramData?.barType === "SV") ? valueObj || null : timestamp);
                    });

                    traces?.push(trace);
                });
                setloading(false)
                setTraces(traces);

            } else {
                setTraces([])
            }

        } catch (error) {
            setNoData(true);
            console?.error('Error fetching data:', error);
        }
    };
    {/* <------ layout styles for chart ------> */ }
    const layout = {
        autosize: true,
        barcornerradius: 8,
        barmode: barChartColors?.barType === "SH" || barChartColors?.barType === "SV" || (chartList !== undefined ? chartList?.barType === "SH" : false) || (chartList !== undefined ? chartList.barType === "SV" : false) ? 'stack' : "group",
        bargap: barChartColors?.barGap,
        margin: {
            l: 30,
            r: 10,
            b: 5,
            t: 5
        },
        annotations: noData ? [{
            x: 0.5,
            y: 0.5,
            xref: 'paper',
            yref: 'paper',
            text: 'No data found',
            showarrow: false,
            font: {
                family: barChartColors?.fFamily,
                size: 10,
                color: 'red',
            },
        }] : [],
        ...(barChartColors?.multiaxis ? (() => {
            let leftPosition = 0; // <------ Starting position for left-aligned y-axes ------>
            let rightPosition = 0.98; //  <------ Starting position for right-aligned y-axes ------>
            const spacing = 0.06 // <------ Spacing between each y-axis ------>
            let leftPositionMax = leftPosition; // <------ Track maximum left position ------>
            let rightPositionMax = rightPosition; // <------ Track maximum right position ------>

            const yAxisConfigs = Object.fromEntries(
                barChartColors?.parameters && barChartColors?.parameters.map((parameter, index) => {
                    let position, isLeft
                    if (paged === 'analytics' || parmMultiAxis) {
                        position = (index + 1) % 2 !== 0 ? leftPosition : rightPosition;
                        isLeft = (index + 1) % 2 !== 0
                    } else {
                        isLeft = parameter.yaxisPosition === "left";
                        position = isLeft ? leftPosition : rightPosition;
                    }
                    if (isLeft) {
                        leftPosition += spacing; // <------ Increment for each left y-axis ------>
                        leftPositionMax = Math.max(leftPositionMax, leftPosition); // <------ Track max left position ------>
                    } else {
                        rightPosition -= spacing; // <------ Decrement for each right y-axis ------>
                        rightPositionMax = Math.min(rightPositionMax, rightPosition); // <------ Track min right position ------>
                    }

                    return [
                        `yaxis${index + 1}`,
                        {
                            title: parameter.paramUnit,
                            titlefont: { color: parameter.parameterColor, size: 8 },
                            tickfont: { color: parameter.parameterColor, size: 10 },
                            overlaying: index === 0 ? undefined : "y",
                            position,
                            showline: true,
                            zeroline: false,
                            showgrid: barChartColors?.isGridPresent && index === 0
                        },
                    ];
                })
            );

            return {
                ...yAxisConfigs,
                xaxis: {
                    domain: [leftPositionMax - 0.03, rightPositionMax + 0.03],
                    autorange: true,
                    showgrid: barChartColors?.isGridPresent,
                    gridcolor: barChartColors?.xGridColor,
                    gridwidth: 1,
                    griddash: "dot",
                    gridshape: "linear",
                    showline: true,
                    tickfont: {
                        family: barChartColors?.xfFamily,
                        size: 10,
                        color: barChartColors?.xFontColor,
                        weight: barChartColors?.xBold ? "bold" : "normal",
                    },
                    tickangle: 0,
                },
            };
        })() : (barChartColors?.isChartAxisPresent || barChartColors?.isChartAxisPresent === undefined) ? {
            xaxis: {
                autorange: true,
                showgrid: barChartColors?.isGridPresent,
                gridcolor: barChartColors?.xGridColor,
                gridwidth: 1,
                griddash: 'dot',
                gridshape: 'linear',
                showline: true,
                tickfont: {
                    family: barChartColors?.xfFamily,
                    size: 10,
                    color: barChartColors?.xFontColor,
                    weight: barChartColors?.xBold ? "bold" : "normal",
                },
                tickangle: 0,
            },
            yaxis: {
                autorange: true,
                showgrid: barChartColors?.isGridPresent,
                gridcolor: barChartColors?.yGridColor,
                gridwidth: 1,
                griddash: 'dot',
                gridshape: 'linear',
                showline: true,
                tickfont: {
                    family: barChartColors?.yfFamily,
                    size: 10,
                    color: barChartColors?.yFontColor,
                    weight: barChartColors?.yBold ? "bold" : "normal",
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
        showlegend: barChartColors?.showLegend,
        legend: {
            y: barChartColors?.legend?.y + 0.2,
            x: barChartColors?.legend?.x,
            orientation: 'h',
            xanchor: 'center',
            traceorder: 'normal',
            itemsizing: 'trace',
            font: {
                family: barChartColors?.legendFamily,
                size: 10,
                weight: 'lighter',
            }
        },
        images: [{
            "source": barChartColors?.plotAreaBg,
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
        paper_bgcolor: barChartColors?.areaBackground,
        plot_bgcolor: barChartColors?.plotAreaBg,
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
                    color: barChartColors?.plotAreaOutline,
                    width: 1,
                },
            },
        ],
        chartOutline: `1px solid ${barChartColors?.areaOutline}`,
        chartTitleIs: barChartColors?.chartTitle,
        fontSize: 10,
        fontFamily: barChartColors?.fFamily,
        isBold: barChartColors?.isBold,
        isItalic: barChartColors?.isItalic,
        isUnderLine: barChartColors?.isUnderLine,
        isCaseChange: barChartColors?.isCaseChange,
        fontColor: barChartColors?.fontColor,
        fontBgColor: barChartColors?.fontBgColor,
        rndproperties: barChartColors?.reSizeProperties
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
            ChartColors={barChartColors} 
            tracesIs={tracesIs} 
            showtitle={showtitle} 
            loading={loading} 
            screen={paged}
            onAIPress={capture}
            aiText={description}/>
        </View>
    )
}

