import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    PixelRatio,
    TouchableOpacity,
    Image,
    TouchableWithoutFeedback,
    Platform
} from 'react-native';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import CustomPlotly from '../../../Components/CustomPlotly';
import MapboxGL from '@rnmapbox/maps';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { fas } from '@fortawesome/pro-solid-svg-icons';
import {
    normalizeFont,
    scaleHeight,
    scaleWidth,
} from '../../../Constants/dynamicSize';
import { COLORS } from '../../../Constants/Colors';
import { FONTS } from '../../../Constants/Fonts';
import { IMAGES } from '../../../Constants/Images';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { styles } from '../styles';
MapboxGL.setAccessToken(
    'sk.eyJ1IjoiYnNrLW5jdi10b29sa2l0cyIsImEiOiJjbHZ1dDIwNmQxb3Z5MnJycmp2b3JjODE0In0.i20ygdcCKF3w0xTispwyWg',
);

{/* <------ Getting the color of the Elements ------>  */ }
function ColorFunction(ele, labelVal) {
    let parmValueColor = "#000"
    const updateColor = (ele) => {
        switch (ele.condition) {
            case "minMax":
                if (parseFloat(labelVal) > parseFloat(ele.min) && parseFloat(labelVal) < parseFloat(ele.max)) {
                    parmValueColor = ele.color;
                }
                break;
            case "greaterThan":
                if (parseFloat(labelVal) > parseFloat(ele.max)) {
                    parmValueColor = ele.color;
                }
                break;
            case "lessThan":
                if (parseFloat(labelVal) < parseFloat(ele.max)) {
                    parmValueColor = ele.color;
                }
                break;
            case "greaterThanEquall":
                if (parseFloat(labelVal) >= parseFloat(ele.max)) {
                    parmValueColor = ele.color;
                }
                break;
            case "lessThanEquall":
                if (parseFloat(labelVal) <= parseFloat(ele.max)) {
                    parmValueColor = ele.color;
                }
                break;
            default:
                break;
        }
    };
    ele.colorTable.map((ele) => updateColor(ele));
    return parmValueColor
}

{/* <------ Modal when click on the marker ------>  */ }
const Popup = React.memo(({ dataIs, mapIS, array, setDataIs, setshowpopup }) => {
    useEffect(() => {
    }, [dataIs, mapIS]);
    const BASEURL = useSelector(state => state.mainSlice.baseUrlIs);
    return (
        <View>
            {dataIs?.parametersList?.length > 0 && (
                <View style={styles.container}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 30, alignItems: 'center', backgroundColor: mapIS.popupfontBgColor || "#C43E1C" }}>
                        <Text style={[styles.cellText, { textAlign: 'center', color: COLORS.WHITE }]}>{mapIS.popupText}</Text>
                        <TouchableOpacity style={styles.closeview} onPress={() => { setDataIs([]); setshowpopup(false); }}>
                            <View>
                                <Image source={IMAGES.close} style={[styles.close, { tintColor: COLORS.WHITE }]} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    {dataIs.parametersList.map((ele, index) =>
                        ele.data_type_name !== 'Geospatial' && (
                            <View key={index} style={styles.row}>
                                <Text style={styles.cellText}>{ele.global_code}:</Text>
                                <View>
                                    {ele.controlType === 'Numeric' && <StaticLabelElement ele={ele} BASE_URL={BASEURL} />}
                                    {ele.controlType === 'Line Chart' && <LineChartElement ele={ele} BASE_URL={BASEURL} />}
                                    {ele.controlType === 'Bar Chart' && <BarChartElement ele={ele} BASE_URL={BASEURL} />}
                                    {ele.controlType === 'Square' && <StaticSquareElement ele={ele} BASE_URL={BASEURL} />}
                                    {ele.controlType === 'Circle' && <StaticCircleElement ele={ele} BASE_URL={BASEURL} />}
                                    {ele.controlType === 'Progress Bar' && <StaticProgressBarElement ele={ele} BASE_URL={BASEURL} />}
                                </View>
                            </View>
                        )
                    )}
                    {array.map((ele, index) =>
                        <View key={index} style={styles.row}>
                            <Text style={styles.cellText}>{ele.parameter}:</Text>
                            <View>
                                <Text style={[styles.cellText, { fontSize: normalizeFont(14), marginLeft: 10, fontWeight: '400' }]}>
                                    {ele?.parameter === 'Time' ? moment(ele?.value).format('MMM D, YYYY h:mm A') : `${ele?.value}°C`}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}, (prevProps, nextProps) => {
    return prevProps.dataIs === nextProps.dataIs && prevProps.showpopup === nextProps.showpopup;
});

{/* <------ Line Chart element inside the popup ------>  */ }
const LineChartElement = React.memo(({ ele, BASE_URL }) => {
    const [tracesIs, setTraces] = useState([])
    useEffect(() => {
        fetchDataAndRender(ele);
    }, [ele, BASE_URL])

    const fetchDataAndRender = async (dataIs) => {
        let url;
        if (dataIs.timeRange === "custom") {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs.id}&from_date=${dataIs.fromDate}&to_date=${dataIs.toDate}&data_type=line`;
        } else {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs.id}&data_type=line&time_frequency=${dataIs.timeRange}`;
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
                const traces = [];
                [dataIs.id].forEach((key, ind) => {
                    const trace = {
                        x: [],
                        y: [],
                        mode: 'lines',
                        "hoverinfo": 'none',
                        line: {
                            dash: 'solid',
                            width: 1.5,
                            color: dataIs.chartColor
                        }
                    };
                    Object.entries(data).forEach(([timestamp, values]) => {
                        const valueObj = values[dataIs.id];
                        trace.x.push(timestamp);
                        trace.y.push(valueObj || null);
                    });
                    traces.push(trace);
                    setTraces(traces);
                });
            }

        } catch (error) {
        }
    };
    const layoutIs = {
        margin: {
            t: 0,
            l: 0,
            r: 0,
            b: 0,
        },
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
        showlegend: false,
    }

    return (
        <>
            <View style={{ height: scaleHeight(40), width: scaleWidth(100), marginLeft: scaleWidth(15) }}>
                <CustomPlotly
                    data={tracesIs}
                    layout={layoutIs}
                    style={{ height: scaleHeight(40), width: scaleWidth(100) }}
                />
            </View>
        </>
    );
});

{/* <------ Bar Chart element inside the popup ------>  */ }
const BarChartElement = React.memo(({ ele, BASE_URL }) => {
    const [tracesbarIs, setTracesbar] = useState([]);
    useEffect(() => {
        fetchDataAndRender(ele);
    }, [ele, BASE_URL])

    const fetchDataAndRender = async dataIs => {
        let url;
        if (dataIs?.timeRange === 'custom') {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs?.id}&from_date=${dataIs?.fromDate}&to_date=${dataIs?.toDate}&data_type=bar`;
        } else {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs?.id}&data_type=bar&time_frequency=${dataIs?.timeRange}`;
        }
        try {
            const jwtToken = await AsyncStorage.getItem('jwttoken');
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });
            const data = response.data?.data;
            if (data) {
                const traces = [];
                [dataIs?.id].forEach((key, ind) => {
                    const trace = {
                        x: [],
                        y: [],
                        type: 'bar',
                        orientation: 'v',
                        hoverinfo: 'none',
                        marker: {
                            color: dataIs?.chartColor,
                        },
                    };
                    Object.entries(data).forEach(([timestamp, values]) => {
                        const valueObj = values[dataIs?.id];
                        trace.x.push(timestamp);
                        trace.y.push(valueObj || null);
                    });
                    traces.push(trace);
                });
                setTracesbar(traces);
            }
        } catch (error) {

        }
    };

    const layoutIsbar = {
        margin: {
            t: 0,
            l: 0,
            r: 0,
            b: 0,
        },
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
        showlegend: false,
    }

    return (
        <View style={{ height: scaleHeight(40), width: scaleWidth(100), marginLeft: scaleWidth(15) }}>
            <CustomPlotly
                data={tracesbarIs}
                layout={layoutIsbar}
                style={{ height: scaleHeight(40), width: scaleWidth(100) }}
            />
        </View>
    );
});

{/* <------ Label element inside the popup ------>  */ }
const StaticLabelElement = React.memo(({ ele, BASE_URL }) => {

    const [staticlabelVal, setstaticLabelVal] = useState('');
    useEffect(() => {
        fetchDataAndRender(ele);
    }, [ele, BASE_URL]);

    const fetchDataAndRender = async (data) => {
        const jwtToken = await AsyncStorage.getItem('jwttoken');
        let url;

        if (data.timeRange === 'custom') {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${data.id}&from_date=${data.fromDate}&to_date=${data.toDate}&aggregation_type=${data.aggregate}`;
        } else {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${data.id}&time_frequency=${data.timeRange}&aggregation_type=${data.aggregate}`;
        }

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            const dataIs = response.data?.data;
            if (dataIs && dataIs[data.id] !== undefined) {
                const formattedValue = dataIs[data.id].toFixed(data?.decimalValue);
                setstaticLabelVal(formattedValue);
            } else {
                setstaticLabelVal('');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    const parmValueColor = ColorFunction(ele, staticlabelVal);

    return (
        <View style={{ height: 30, width: 100, left: 15, top: 1 }}>
            <Text style={{ color: parmValueColor ? parmValueColor : '#000', margin: 5, fontFamily: FONTS.SEGOEUISEMIBOLD }}>
                {staticlabelVal}
            </Text>
        </View>
    );
});

{/* <------ Progress element inside the popup ------>  */ }
const StaticProgressBarElement = React.memo(({ ele, BASE_URL }) => {
    const [labelParamValue, setLabelParamValue] = useState('');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        fetchDataAndRender(ele);
    }, [ele, BASE_URL]);

    const fetchDataAndRender = async (data) => {
        const jwtToken = await AsyncStorage.getItem('jwttoken');
        let url;
        if (ele?.timeRange === 'custom') {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${data?.id}&from_date=${data?.fromDate}&to_date=${data?.toDate}&aggregation_type=${data?.aggregate}`;
        } else {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${data?.id}&time_frequency=${data?.timeRange}&aggregation_type=${data?.aggregate}`;
        }

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            const data = response.data?.data;
            if (data) {
                const value = data[ele?.id];
                setLabelParamValue(value);
                const maxValue = parseInt(ele?.maxVal);
                const minValue = parseInt(ele?.minVal);
                if (value >= maxValue) {
                    setProgress(100);
                } else if (value <= minValue) {
                    setProgress(0);
                } else {
                    const valueIs = (100 * value) / maxValue;
                    setProgress(valueIs);

                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const parmValueColor = ColorFunction(ele, labelParamValue);

    return (
        <View style={{ marginLeft: scaleWidth(25) }}>
            <Text
                style={{
                    color: '#fff',
                    position: 'absolute',
                    zIndex: 1,
                    height: 20,
                    fontSize: 10,
                    left: 20,
                    fontFamily: FONTS.SEGOEUISEMIBOLD
                }}>
                {labelParamValue}%
            </Text>
            <View
                style={{
                    width: scaleWidth(100),
                    height: 12,
                    backgroundColor: '#808080',
                    borderRadius: 5,
                }}>
                <View
                    style={{
                        width: `${Number(labelParamValue)}%`,
                        height: '100%',
                        backgroundColor: parmValueColor,
                        borderRadius: 5,
                    }} />
            </View>
        </View>
    );
});

{/* <------ Square element inside the popup ------>  */ }
const StaticSquareElement = React.memo(({ ele, BASE_URL }) => {
    const [paramSquareValue, setParamSquareValue] = useState(null);
    useEffect(() => {
        if (ele) {
            fetchDataAndRender(ele);
        }
    }, [ele, BASE_URL]);

    const fetchDataAndRender = async (dataIs) => {
        const jwtToken = await AsyncStorage.getItem('jwttoken');
        let url;

        if (dataIs?.timeRange === 'custom') {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs?.id}&from_date=${dataIs?.fromDate}&to_date=${dataIs?.toDate}&aggregation_type=${dataIs?.aggregate}`;
        } else {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs?.id}&time_frequency=${dataIs?.timeRange}&aggregation_type=${dataIs?.aggregate}`;
        }

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });
            const data = response.data?.data;
            if (data) {
                setParamSquareValue(data[data?.id]);
                value = data[data?.id]
            } else {
                setParamSquareValue('');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const parmValueColor = ColorFunction(ele, paramSquareValue);
    return (
        <View
            style={{
                width: ele.shapeSize,
                height: ele.shapeSize,
                backgroundColor: parmValueColor,
                marginLeft: scaleWidth(15),
            }}
        >
        </View>
    );
});

{/* <------ Circle element inside the popup ------>  */ }
const StaticCircleElement = React.memo(({ ele, BASE_URL }) => {
    const [paramValue, setParamValue] = useState(null);

    useEffect(() => {
        if (ele) {
            fetchDataAndRender(ele);
        }
    }, [ele, BASE_URL]);

    const fetchDataAndRender = async (dataIs) => {

        const jwtToken = await AsyncStorage.getItem('jwttoken');
        let url;

        if (dataIs?.timeRange === 'custom') {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs?.id}&from_date=${dataIs?.fromDate}&to_date=${dataIs?.toDate}&aggregation_type=${dataIs?.aggregate}`;
        } else {
            url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs?.id}&time_frequency=${dataIs?.timeRange}&aggregation_type=${dataIs?.aggregate}`;
        }

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });
            const data = response.data?.data;
            if (data) {
                setParamValue(data[ele?.id]);
            } else {
                setParamValue('');
            }
        } catch (error) {
            console.error('Error fetching datamahaaa:', error);
        }
    };

    const parmValueColor = ColorFunction(ele, paramValue);

    return (
        <View
            style={{
                width: ele.shapeSize,
                height: ele.shapeSize,
                backgroundColor: ele.chartColor,
                marginLeft: scaleWidth(15),
                borderRadius: ele.shapeSize / 2,
            }}
        />
    );
});

const MapElement = props => {
    const { mapId, mapDataIs } = props;
    const dispatch = useDispatch();
    const BASEURL = useSelector(state => state.mainSlice.baseUrlIs);
    const mapIS =
        (mapDataIs[mapId] && mapDataIs[mapId]['map-colors']) !== undefined &&
        mapDataIs[mapId]['map-colors'];
    const waterColor = mapIS?.banderRowColor;
    const buildingColor = mapIS?.buildingBackgroundColor;
    const roadColor = mapIS?.bandedColumnColor;
    const boundriesColor = mapIS?.backgroundColor;
    const natureColor = mapIS?.natureColor;
    const landColor = mapIS?.headerColor;
    const parseHeight = value => {
        if (value !== null) {
            if (typeof value === 'string') {
                return value?.includes('px')
                    ? parseFloat(value?.replace('px', ''))
                    : parseFloat(value);
            }
            return value;
        }
    };
    const containerheight = mapIS?.reSizeProperties?.height ? parseHeight(mapIS?.reSizeProperties?.height) : 100;
    const [ModifiedLocationDetails, setModifiedLocationDetails] = useState([])
    const [showpopup, setshowpopup] = useState(false);
    const [array, setArray] = useState([
        { id: 1, parameter: 'Temperature', value: "Loading" },
        { id: 2, parameter: 'Time', value: "Loading" }
    ])
    const [dataIs, setDataIs] = useState([]);
    {/* <------ getting the container height based on last element y and height position ------>  */ }
    useEffect(() => {
        const height = parseHeight(mapIS?.reSizeProperties?.height)
        const newHeight = Number(mapIS?.reSizeProperties?.y) + height + 10;
        dispatch(updateHeight(newHeight));
    }, [])

    {/* <------ Fetching the locations to place the map ------>  */ }
    useEffect(() => {
        fetchLocations()
    }, [])

    const getBoundsCenterZoom = (locations) => {
        if (!locations || locations.length === 0) return null;
      
        let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
      
        locations.forEach(loc => {
          const lat = parseFloat(loc.location.lat);
          const lng = parseFloat(loc.location.lon);
          if (!isNaN(lat) && !isNaN(lng)) {
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
          }
        });
      
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
      
        // Approximate zoom logic (React Native doesn't have fitBounds directly)
        const deltaLat = maxLat - minLat;
        const deltaLng = maxLng - minLng;
        const maxDelta = Math.max(deltaLat, deltaLng);
      
        let zoom = 8;
        if (maxDelta > 0.5) zoom = 6;
        if (maxDelta > 1) zoom = 4;
        if (maxDelta > 5) zoom = 2;
        if (locations.length === 1) zoom = 10;
      
        return {
          center: [centerLng, centerLat],
          zoom,
        };
      };
    

      const { center, zoom } = getBoundsCenterZoom(ModifiedLocationDetails) || {
        center: [0, 0],
        zoom: 2,
      };

    const layerStyles = {
        building: {
            fillExtrusionColor: buildingColor,
            fillExtrusionHeight: ['get', 'height'],
            fillExtrusionOpacity: 0.6,
        },
    };

    // const models = {
    //     car: require('./src/assets/industry.glb'),
    // };

    // const modelLayerStyle = {
    //     modelId: 'car',
    //     modelScale: [50, 50, 50],
    // };

    const fetchLocations = async () => {
        const updatedLocationDetails = [];

        for (const ele of mapIS.locationDetails) {
            let url = `${BASEURL}dataservice_app/api/parameter_values/?id=${ele.id}`;
            try {
                const token = await AsyncStorage.getItem('jwttoken');
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = response.data.data;

                if (data && data[ele.id]) {
                    const correctedStr = data[ele.id].replace(/'/g, '"');
                    const parsedData = JSON.parse(correctedStr);

                    const updatedEle = {
                        ...ele,
                        location: {
                            lon: parsedData.lon,
                            lat: parsedData.lat,
                        },
                    };

                    updatedLocationDetails.push(updatedEle);
                } else {
                    updatedLocationDetails.push({
                        ...ele,
                        location: { lon: 0, lat: 0 },
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                updatedLocationDetails.push({
                    ...ele,
                    location: { lon: 0, lat: 0 },
                });
            }
        }
        setModifiedLocationDetails(updatedLocationDetails);
    };

    {/* <------ Based on the locations icon styles and icon name api ------>  */ }
    const IconColorElement = ({ ele, BASE_URL, long, lat, datais }) => {
        const [paramValue, setParamValue] = useState('');
        const [jwtToken, setJwtToken] = useState(null);
        const parmValueColor1 = ColorFunction(
            { colorTable: ele.geoSpacialColortable },
            paramValue,
        );
        useEffect(() => {
            const fetchJwtToken = async () => {
                const token = await AsyncStorage.getItem('jwttoken');
                setJwtToken(token);
            };

            fetchJwtToken();
        }, []);

        useEffect(() => {
            if (jwtToken && Object.keys(ele.parmDataIs).length > 0) {
                let refreshTime = 0;
                const refreshFreq = ele.refreshFreq.split(' ');
                if (refreshFreq[1] === 'Second') {
                    refreshTime = parseInt(refreshFreq[0]) * 1000;
                } else if (refreshFreq[1] === 'Minute') {
                    refreshTime = parseInt(refreshFreq[0]) * 1000 * 60;
                } else if (refreshFreq[1] === 'Hours') {
                    refreshTime = parseInt(refreshFreq[0]) * 1000 * 60 * 60;
                }

                const fetchDataAndRenderWrapper = () => fetchDataAndRender(ele);
                fetchDataAndRenderWrapper();

                if (refreshTime > 0) {
                    const intervalId = setInterval(
                        fetchDataAndRenderWrapper,
                        refreshTime,
                    );
                    return () => clearInterval(intervalId);
                }
            } else {
                //console.log('No parameters found to fetch or JWT token not set.');
            }
        }, [jwtToken, ele]);

        const fetchDataAndRender = async dataIs => {
            let url;
            if (dataIs?.timeRange === 'custom') {
                url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs?.parmDataIs?.parameterId}&from_date=${dataIs?.fromDate}&to_date=${dataIs?.toDate}&aggregation_type=${dataIs?.aggregate}`;
            } else {
                url = `${BASE_URL}dataservice_app/api/parameter_values/?id=${dataIs?.parmDataIs?.parameterId}&time_frequency=${dataIs?.timeRange}&aggregation_type=${dataIs?.aggregate}`;
            }
            try {
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                });
                const data = response?.data?.data;
                setParamValue(data ? data[ele?.parmDataIs?.parameterId] : '');
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        return (
            <FontAwesomeIcon
                icon={fas[ele.iconIs ? ele.iconIs : 'faAngleRight']}
                size={25}
                color={parmValueColor1 === "#000" ? ele.iconColor : parmValueColor1}
            />
        );
    };

    {/* <------ Clicked element temperature and current time ------>  */ }
    const Weather = async (latitude, longitude, data, index) => {
        await setDataIs(data)
        const apiKey = '3aec67bab2dd42b0b9264334240103';
        try {
            const response = await axios.get(
                `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&aqi=yes&days=4`
            );
            const temperature = response.data.current.temp_c;
            const time = response.data.location.localtime;
            array[0].value = temperature;
            array[1].value = time;
            setshowpopup(true)

        } catch (error) {
            array[0].value = "-";
            array[1].value = "-";
            setshowpopup(true)
            console.log('Error fetching weather data');
            return;
        }
    };

    {/* <------ Onpress the marker event ------>  */ }
    const handleMarkerClick = async (longitude, latitude, data, index) => {
        Weather(latitude, longitude, data, index)
    };


    return (
        <View
            style={{
                position: 'absolute',
                top: scaleHeight(mapIS?.reSizeProperties?.y ? PixelRatio.roundToNearestPixel(Number(mapIS?.reSizeProperties?.y + 5),) : 10,),
                width: scaleWidth(350),
                height: containerheight - 80,
                backgroundColor: COLORS.WHITE,
                borderTopLeftRadius: mapIS?.isBorderRadius ? 10 : 1,
                borderTopRightRadius: mapIS?.isBorderRadius ? 10 : 1,
                alignSelf: 'center',
            }}>

            <View
                style={[
                    styles.headerbox,
                    {
                        shadowColor: Platform.OS === 'ios' ? COLORS.ASH : '#000',
                        backgroundColor: mapIS?.fontBgColor,
                        borderTopLeftRadius: mapIS?.isBorderRadius ? 10 : 1,
                        borderTopRightRadius: mapIS?.isBorderRadius ? 10 : 1,
                    },
                ]}>
                <Text style={[styles.charttitle, { color: mapIS?.fontColor }]}>{mapIS?.mapTitle}</Text>
            </View>
            <View style={{
                borderBottomLeftRadius: mapIS?.isBorderRadius ? 10 : 1,
                borderBottomRightRadius: mapIS?.isBorderRadius ? 10 : 1,
            }}>
                <MapboxGL.MapView
                    zoomEnabled={true}
                    attributionEnabled={false}
                    logoEnabled={false}
                    onTouchStart={props?.onTouchStart}
                    onTouchEnd={props?.onTouchEnd}
                    style={{ height: containerheight - 100, borderRadius: 30 }}
                    onStartShouldSetResponder={() => true}
                    styleURL={mapIS?.mapType}
                >
                    {ModifiedLocationDetails?.map((ele, index) => (
                        <React.Fragment key={index}>
                            <MapboxGL.Camera
                                // centerCoordinate={[
                                //     parseFloat(Number(ele?.location?.lon)),
                                //     parseFloat(Number(ele?.location?.lat)),
                                // ]}
                                centerCoordinate={center}
                                animationMode={'flyTo'}
                                animationDuration={1000}
                                zoomLevel={mapIS.locationDetails?.length > 1 ? 1 : 8}
                                pitch={mapIS.locationDetails?.length > 1 ? 30 : 80}
                            />

                            <MapboxGL.PointAnnotation
                                key={`marker-${index}`}
                                id={`marker-${index}`}
                                coordinate={[
                                    parseFloat(Number(ele?.location?.lon)),
                                    parseFloat(Number(ele?.location?.lat)),
                                ]}
                                onSelected={() => {
                                    handleMarkerClick(
                                        ele?.location?.lon,
                                        ele?.location?.lat,
                                        mapIS.settingsParms[index],
                                        index
                                    );
                                }}
                            >
                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    <TouchableWithoutFeedback
                                        onPress={() => {
                                            handleMarkerClick(
                                                ele?.location?.lon,
                                                ele?.location?.lat,
                                                mapIS.settingsParms[index],
                                                index
                                            );
                                        }}
                                    >
                                        <IconColorElement
                                            ele={ele}
                                            BASE_URL={BASEURL}
                                            long={ele?.location?.lon}
                                            lat={ele?.location?.lat}
                                            datais={mapIS.settingsParms[index]}
                                        />
                                    </TouchableWithoutFeedback>
                                </View>
                            </MapboxGL.PointAnnotation>
                        </React.Fragment>
                    ))}

                    {/* Other layers */}
                    {waterColor !== undefined && (
                        <MapboxGL.FillLayer
                            id="custom-water-layer"
                            style={{
                                fillColor: waterColor,
                                fillOpacity: 0.6,
                            }}
                        />
                    )}

                    {buildingColor !== undefined && (
                        <MapboxGL.FillExtrusionLayer
                            id="building3d"
                            sourceLayerID="building"
                            style={layerStyles.building}
                        />
                    )}

                    {roadColor !== undefined && (
                        <MapboxGL.FillLayer
                            id="roadFillColor"
                            sourceLayerID="road"
                            style={{
                                fillColor: roadColor,
                                fillOpacity: 0.6,
                            }}
                        />
                    )}

                    {boundriesColor !== undefined && (
                        <MapboxGL.LineLayer
                            id="boundaries"
                            sourceLayerID="admin"
                            style={{
                                lineColor: boundriesColor,
                                lineWidth: 1,
                            }}
                        />
                    )}

                    {natureColor !== undefined && (
                        <MapboxGL.FillLayer
                            id="nature"
                            sourceLayerID="landcover"
                            style={{
                                fillColor: natureColor,
                                fillOpacity: 0.1,
                            }}
                        />
                    )}

                    {mapIS.mapType !== 'mapbox://styles/mapbox/satellite-v9' && landColor !== undefined && (
                        <MapboxGL.FillLayer
                            id="custom"
                            sourceLayerID="admin"
                            style={{ backgroundColor: landColor }}
                        />
                    )}
                </MapboxGL.MapView>

                {showpopup &&
                    <View style={{
                        position: 'absolute',
                        top: 30,
                        alignSelf: 'center'
                    }}>
                        <View style={styles.modalContainer}>
                            <Popup
                                dataIs={dataIs}
                                mapIS={mapIS}
                                array={array}
                                setDataIs={setDataIs}
                                setshowpopup={setshowpopup}
                            />
                        </View>
                    </View>
                }

            </View>
        </View>
    );
};

export default MapElement;
