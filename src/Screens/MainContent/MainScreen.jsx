import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { View, ScrollView, Animated, BackHandler, RefreshControl, Dimensions, TouchableOpacity, Platform, StatusBar, StyleSheet } from 'react-native';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import FastImage from 'react-native-fast-image';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollViewIndicator } from '@fanchenbao/react-native-scroll-indicator';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainPlaceHolder from './MainPlaceHolder';
import CustomHeader from '../../Components/CustomHeader';
import { scaleHeight, scaleWidth, normalizeFont } from '../../Constants/dynamicSize';
import { IMAGES } from '../../Constants/Images';
import { COLORS } from '../../Constants/Colors';
import { FONTS } from '../../Constants/Fonts';
import { chartDataFromserver, labelDataFromserver, imageDataFromserver, buttonDataFromserver, tableDataFromserver, tabDataFromserver, tabInfo, mapDataFromserver, shapesStyles, squarestyles, linestyles, arrowstyles, trianglestyles, circlestyles, progressBarStyles, ChartsInfo, mapInfo, buttonInfo, imageInfo, labelInfo, tableInfo, panelbg, panelbuttonDataFromserver, panelmapDataFromserver, panelchartDataFromserver, panelimageDataFromserver, panellabelDataFromserver, openPanel, panelshapesStyles, panelDataIdsFromStore, panelChartsInfo, panellabelInfo, panelimageInfo, panelbuttonInfo, panelmapInfo, openLoadedpanel, paneltableDataFromserver, paneltableInfo } from '../../Redux/ReduxSlice/mainSlice';
import LineChart from './LineChart/LineChart';
import BarChart from './BarChart/BarChart';
import ScatterChart from './ScatterChart/ScatterChart';
import AreaChart from './AreaChart/AreaChart';
import MixedChart from './MixedChart/MixedChart';
import HeatMapChart from './HeatMapChart/HeatMapChart';
import DonutChart from './DonutChart/DonutChart';
import GaugeChart from './GaugeChart/GaugeChart';
import RadarChart from './RadarChart/RadarChart';
import WaterFallChart from './WaterFallChart/WaterFallChart';
import FunnelChart from './FunnelChart/FunnelChart';
import BoxChart from './BoxChart/BoxChart';
import XYchart from './XYChart/XYchart';
import RangeAreaChart from './RangeAreaChart/RangeAreaChart';
import ViolinChart from './ViolinChart/ViolinChart';
import RadialBarChart from './RadialBarChart/RadialBarChart';
import Images from './Images/Images';
import Label from './Label/Label';
import ButtonElement from './ButtonElement/ButtonElement';
import Square from './Square/Square';
import Triangle from './Triangle/Triangle';
import Circle from './Circle/Circle';
import Arrow from './Arrow/Arrow';
import Line from './LineShape/Line';
import CircularProgressBars from './CircularProgressBars/CircularProgressBars';
// import Emission from '../Emissions/Emission';
// import Reports from '../Reports/Reports';
// import Events from '../Events/Events';
// import Analytics from './Analytics/Analytics';
// import ManualEntry from '../ManualEntry/ManualEntry';
// import GnrReport from '../GnrReport/GnrReport';
// import MapElement from './MapElement/MapElement';
// import TableElement from './TableElement/TableElement';
// import TabElement from './TabElement/TabElement';
// import Summary from '../Evonith/Summary/Summary';
// import LiveStatus from '../Evonith/LiveStatus/LiveStatus';


const { width, height } = Dimensions.get('window');

const EXCLUDED_LENS_PAGES = ['Scope 3', 'Emission', 'GNR', 'Reports', 'Analytics', 'Events', 'Manual Data Entry', 'Manual Entry', 'GnrReport', 'EVSL Overview - Cloud', 'EVSL Live Status - Cloud', 'EVSL - AWS Live Status', 'EVSL - AWS Overview'];

const isLensPage = name => !!name && name !== '' && !EXCLUDED_LENS_PAGES.includes(name);

const CHART_COMPONENTS = { LineChart, BarChart, ScatterChart, AreaChart, MixedChart, HeatMapChart, DonutChart, GaugeChart, RadarChart, WaterFallChart, FunnelChart, BoxChart, XYchart, RangeAreaChart, ViolinChart, RadialBarChart };

const BUTTON_WIDTH = 50;
const BUTTON_HEIGHT = 50;

const DragAndDropCard = ({ onPress }) => (
  <Animated.View
    style={[
      styles.floatingButton,
      {
        position: 'absolute',
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT,
      },
    ]}
  >
    <TouchableOpacity onPress={onPress} style={styles.newbox} activeOpacity={0.8}>
      <FastImage source={IMAGES.bot} style={styles.bot} resizeMode="contain" />
    </TouchableOpacity>
  </Animated.View>
);

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const MainScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const scrollViewRef = useRef(null);
  const isMountedRef = useRef(true);
  const fetchIdRef = useRef(0);
  const animation = useRef(new Animated.Value(0)).current;
  const slideAnim = useState(new Animated.Value(0))[0];
  const [showBar, setShowBar] = useState(false);
  const [buttonTitle, setbuttonTitle] = useState('');
  const [bgColor, setbgColor] = useState('');
  const [loading, setLoading] = useState(true);
  const [loader, setLoader] = useState(false);
  const [squareIds, setSquareIds] = useState([]);
  const [lineIds, setLineIds] = useState([]);
  const [arrowIds, setArrowIds] = useState([]);
  const [circleIds, setCircleIds] = useState([]);
  const [triangleIds, setTriangleIds] = useState([]);
  const [progressIds, setProgressIds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [panelloading, setpanelLoading] = useState(false);
  const [panel, setPanel] = useState(false);

  const projectId = useSelector((state) => state.authSlice.userDetails?.projectName?.id);
  const containerHeight = useSelector(state => state.mainSlice.maxHeight);
  const lineChartData = useSelector(state => state.mainSlice.chartDataFromserver);
  const shapesData = useSelector(state => state.mainSlice.shapesStyles);
  const userDetail = useSelector(state => state.authSlice.userDetails);
  const pagetitle = userDetail?.PageName;
  const Header = "Selector";
  const PageName = useSelector(state => state.authSlice.pageName);
  const chartsData = useSelector(state => state.mainSlice.chartDataFromserver.charsIs);
  const labelCompData = useSelector(state => state.mainSlice.labelInfo);
  const imageCompData = useSelector(state => state.mainSlice.imageInfo);
  const labelDataIs = useSelector(state => state.mainSlice.labelDataFromserver);
  const imageDataIs = useSelector(state => state.mainSlice.imageDataFromserver);
  const buttonCompData = useSelector(state => state.mainSlice.buttonInfo);
  const mapCompData = useSelector(state => state.mainSlice.mapInfo);
  const buttonDataIs = useSelector(state => state.mainSlice.buttonDataFromserver);
  const tableCompData = useSelector(state => state.mainSlice.tableInfo);
  const tableDataIs = useSelector(state => state.mainSlice.tableDataFromserver);
  const tabDataIs = useSelector((state) => state.mainSlice.tabDataFromserver);
  const tabCompData = useSelector(state => state.mainSlice.tabInfo);
  const mapDataIs = useSelector(state => state.mainSlice.mapDataFromserver);
  const squareStyles = useSelector(state => state.mainSlice.squarestyles);
  const triangleStyles = useSelector(state => state.mainSlice.trianglestyles);
  const circleStyles = useSelector(state => state.mainSlice.circlestyles);
  const lineStyles = useSelector(state => state.mainSlice.linestyles);
  const arrowStyles = useSelector(state => state.mainSlice.arrowstyles);
  const progressBarStylesIs = useSelector(state => state.mainSlice.progressBarStyles);
  const BASE_URL = useSelector(state => state.mainSlice.baseUrlIs);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, []),
  );

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: panel ? 0 : 400,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [panel, slideAnim]);

  const debouncedHeader = useDebounce(Header, 300);

  const ChartDataFromserver = useCallback((id) => {
    return new Promise(async (resolve, reject) => {
      const requestId = ++fetchIdRef.current;
      try {
        const url = `https://sustainos.ai:9017/ncarp_lens_app/api/page_list/?project=${userDetail?.projectName?.name}&id=${id}`;
        let token = await AsyncStorage.getItem('jwttoken');
        const result = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isMountedRef.current || requestId !== fetchIdRef.current) {
          resolve();
          return;
        }

        let data = result?.data;
        const dataFromServer = data?.message[0]?.json?.chartInfo;
        const serverLabelData = data?.message[0]?.json?.labelData;
        const serverImageData = data?.message[0]?.json?.imageData;
        const serverButtonData = data?.message[0]?.json?.buttonData;
        const serverMapData = data?.message[0]?.json?.mapData;
        const serverTableData = data?.message[0]?.json?.tableData;
        const serverTabData = data?.message[0]?.json?.tabData;

        if (data?.message[0]?.json.charsIs !== undefined) {
          dispatch(ChartsInfo(data?.message[0]?.json?.charsIs));
        }
        if (data?.message[0]?.json?.labelsIs !== undefined) {
          dispatch(labelInfo(data?.message[0]?.json?.labelsIs));
        }
        if (data?.message[0]?.json?.imagesIs !== undefined) {
          dispatch(imageInfo(data?.message[0]?.json?.imagesIs));
        }
        if (data?.message[0]?.json?.buttonIs !== undefined) {
          dispatch(buttonInfo(data?.message[0]?.json?.buttonIs));
        }
        if (data?.message[0].json?.mapIs !== undefined) {
          dispatch(mapInfo(data?.message[0]?.json?.mapIs));
        }
        if (data.message[0].json.tableData !== undefined) {
          dispatch(tableDataFromserver({ value: serverTableData }));
        }
        if (data.message[0].json.tableIs !== undefined) {
          dispatch(tableInfo(data.message[0].json.tableIs));
        }
        if (data.message[0].json.tabIs !== undefined) {
          dispatch(tabInfo(data.message[0].json.tabIs));
        }

        const shapesDataFromServer = data?.message[0]?.json?.shapesData;
        setbgColor(data?.message[0]?.background);
        dispatch(chartDataFromserver({ value: dataFromServer }));
        dispatch(labelDataFromserver({ value: serverLabelData }));
        dispatch(imageDataFromserver({ value: serverImageData }));
        dispatch(buttonDataFromserver({ value: serverButtonData }));
        dispatch(mapDataFromserver({ value: serverMapData }));
        dispatch(shapesStyles({ value: shapesDataFromServer }));
        dispatch(tableDataFromserver({ value: serverTableData }));
        dispatch(tabDataFromserver({ value: serverTabData }));
        setShowBar(true);
        resolve();
      } catch (error) {
        console.error('Error fetching chart data:', error);
        if (isMountedRef.current && requestId === fetchIdRef.current) {
          setShowBar(false);
        }
        reject(error);
      } finally {
        if (isMountedRef.current && requestId === fetchIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    });
  }, [BASE_URL, userDetail?.projectName?.name, dispatch]);

  const fetchData = useCallback(async () => {
    try {
      setbgColor('#fff');
      if (userDetail?.pageId !== undefined && isLensPage(PageName)) {
        await ChartDataFromserver(userDetail?.pageId);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching datacc:', error);
      setLoading(false);
    }
  }, [userDetail?.pageId, PageName, ChartDataFromserver]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [debouncedHeader]);

  useEffect(() => {
    if (shapesData.squareShape !== undefined && Object.keys(shapesData.squareShape).length !== 0) {
      setSquareIds(Object.keys(shapesData.squareShape));
      dispatch(squarestyles({ value: shapesData.squareShape }));
    } else {
      setSquareIds([]);
      dispatch(squarestyles({}));
    }
    if (shapesData.lineShape !== undefined && Object.keys(shapesData.lineShape).length !== 0) {
      setLineIds(Object.keys(shapesData.lineShape));
      dispatch(linestyles({ value: shapesData.lineShape }));
    } else {
      setLineIds([]);
      dispatch(linestyles({}));
    }
    if (shapesData.arrowShape !== undefined && Object.keys(shapesData.arrowShape).length !== 0) {
      setArrowIds(Object.keys(shapesData.arrowShape));
      dispatch(arrowstyles({ value: shapesData.arrowShape }));
    } else {
      setArrowIds([]);
      dispatch(arrowstyles({}));
    }
    if (shapesData.triangleShape !== undefined && Object.keys(shapesData.triangleShape).length !== 0) {
      setTriangleIds(Object.keys(shapesData.triangleShape));
      dispatch(trianglestyles({ value: shapesData.triangleShape }));
    } else {
      setTriangleIds([]);
      dispatch(trianglestyles({}));
    }
    if (shapesData.circleShape !== undefined && Object.keys(shapesData.circleShape).length !== 0) {
      setCircleIds(Object.keys(shapesData.circleShape));
      dispatch(circlestyles({ value: shapesData.circleShape }));
    } else {
      setCircleIds([]);
      dispatch(circlestyles({}));
    }
    if (shapesData.progressBar !== undefined && Object.keys(shapesData.progressBar).length !== 0) {
      setProgressIds(Object.keys(shapesData.progressBar));
      dispatch(progressBarStyles({ value: shapesData.progressBar }));
    } else {
      setProgressIds([]);
      dispatch(progressBarStyles({}));
    }
  }, [Header, pagetitle, shapesData, userDetail?.pageId, dispatch]);

  const fetchPanel = useCallback(async (id) => {
    setpanelLoading(true);
    let token = await AsyncStorage.getItem('jwttoken');
    try {
      const response = await axios.get(`https://sustainos.ai:9000/ncarp_lens_app/api/panel_details/?project_id=${projectId}&id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!isMountedRef.current) return;

      let panelDataIds = [];
      const dataFromServer = response.data[0].json_data.chartInfo;
      const shapesDataFromServer = response.data[0].json_data.shapesData;
      const serverLabelData = response.data[0].json_data.labelData;
      const serverButtonData = response.data[0].json_data.buttonData;
      const serverMapData = response.data[0].json_data.mapData;
      const serverTabData = response.data[0].json_data.tabData;
      const serverImageData = response.data[0].json_data.imageData;
      panelDataIds?.push(
        ...Object.keys(shapesDataFromServer?.squareShape),
        ...Object.keys(shapesDataFromServer?.arrowShape),
        ...Object.keys(shapesDataFromServer?.circleShape),
        ...Object.keys(shapesDataFromServer?.lineShape),
        ...Object.keys(shapesDataFromServer?.progressBar),
        ...Object.keys(shapesDataFromServer?.triangleShape),
      );
      if (response.data[0].json_data.charsIs !== undefined) {
        const charsIs = response.data[0].json_data.charsIs;
        charsIs.map((ele) => panelDataIds.push(ele.id));
        dispatch(panelChartsInfo(charsIs));
      }
      if (response.data[0].json_data.labelsIs !== undefined) {
        const labelsIs = response.data[0].json_data.labelsIs;
        labelsIs.map((ele) => panelDataIds.push(ele.id));
        dispatch(panellabelInfo(labelsIs));
      }
      if (response.data[0].json_data.buttonIs !== undefined) {
        const buttonIs = response.data[0].json_data.buttonIs;
        buttonIs.map((ele) => panelDataIds.push(ele.id));
        dispatch(panelbuttonInfo(buttonIs));
      }
      if (response.data[0].json_data.mapIs !== undefined) {
        const mapIs = response.data[0].json_data.mapIs;
        mapIs.map((ele) => panelDataIds.push(ele.id));
        dispatch(panelmapInfo(mapIs));
      }
      if (response.data[0].json_data.imagesIs !== undefined) {
        const imageIs = response.data[0].json_data.imagesIs;
        imageIs.map((ele) => panelDataIds.push(ele.id));
        dispatch(panelimageInfo(imageIs));
      }
      dispatch(panelbg(response.data[0].background));
      dispatch(panelchartDataFromserver({ value: dataFromServer }));
      dispatch(panelshapesStyles({ value: shapesDataFromServer }));
      dispatch(panellabelDataFromserver({ value: serverLabelData }));
      dispatch(panelbuttonDataFromserver({ value: serverButtonData }));
      dispatch(panelmapDataFromserver({ value: serverMapData }));
      dispatch(panelimageDataFromserver({ value: serverImageData }));
      dispatch(openPanel(true));
      dispatch(openLoadedpanel(true));
      dispatch(panelDataIdsFromStore(panelDataIds));
      setpanelLoading(false);
      setPanel(true);
    } catch (error) {
      console.error('An error occurred:', error);
      if (isMountedRef.current) {
        setpanelLoading(false);
      }
    }
  }, [BASE_URL, projectId, dispatch]);

  const fetchPage = useCallback((id) => {
    setpanelLoading(true);
    return new Promise(async (resolve, reject) => {
      try {
        const url = `${BASE_URL}ncarp_lens_app/api/page_list/?project=${userDetail?.projectName?.name}&id=${id}`;
        let token = await AsyncStorage.getItem('jwttoken');
        const result = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!isMountedRef.current) {
          resolve();
          return;
        }
        let data = result?.data;
        const dataFromServer = data?.message[0]?.json?.chartInfo;
        const serverLabelData = data?.message[0]?.json?.labelData;
        const serverImageData = data?.message[0]?.json?.imageData;
        const serverButtonData = data?.message[0]?.json?.buttonData;
        const serverMapData = data?.message[0]?.json?.mapData;
        const serverTableData = data?.message[0]?.json?.tableData;
        const serverTabData = data?.message[0]?.json?.tabData;
        if (data?.message[0]?.json.charsIs !== undefined) {
          dispatch(panelChartsInfo(data?.message[0]?.json?.charsIs));
        }
        if (data?.message[0]?.json?.labelsIs !== undefined) {
          dispatch(panellabelInfo(data?.message[0]?.json?.labelsIs));
        }
        if (data?.message[0]?.json?.imagesIs !== undefined) {
          dispatch(panelimageInfo(data?.message[0]?.json?.imagesIs));
        }
        if (data?.message[0]?.json?.buttonIs !== undefined) {
          dispatch(panelbuttonInfo(data?.message[0]?.json?.buttonIs));
        }
        if (data.message[0].json.tableData !== undefined) {
          dispatch(paneltableDataFromserver({ value: serverTableData }));
        }
        if (data.message[0].json.tableIs !== undefined) {
          dispatch(paneltableInfo(data.message[0].json.tableIs));
        }
        const shapesDataFromServer = data?.message[0]?.json?.shapesData;
        dispatch(panelbg(data?.message[0]?.background));
        dispatch(panelchartDataFromserver({ value: dataFromServer }));
        dispatch(panellabelDataFromserver({ value: serverLabelData }));
        dispatch(panelimageDataFromserver({ value: serverImageData }));
        dispatch(panelbuttonDataFromserver({ value: serverButtonData }));
        dispatch(panelmapDataFromserver({ value: serverMapData }));
        dispatch(panelshapesStyles({ value: shapesDataFromServer }));
        dispatch(tableDataFromserver({ value: serverTableData }));
        dispatch(tabDataFromserver({ value: serverTabData }));
        setPanel(true);
        resolve();
      } catch (error) {
        console.error('Error fetching chart data:', error);
        reject(error);
      } finally {
        if (isMountedRef.current) {
          setpanelLoading(false);
        }
      }
    });
  }, [BASE_URL, userDetail?.projectName?.name, dispatch]);

  const handleMapTouchStart = useCallback((event) => {
    if (event.nativeEvent.touches.length > 1) {
      scrollViewRef?.current?.setNativeProps({ scrollEnabled: false });
    }
  }, []);

  const handleMapTouchEnd = useCallback(() => {
    scrollViewRef?.current?.setNativeProps({ scrollEnabled: true });
  }, []);

  const resetAnimation = useCallback(() => {
    animation.setValue(0);
    setLoader(true);
  }, [animation]);

  const handleNavigation = useCallback(() => {
    setLoader(true);
    setTimeout(() => {
      navigation.navigate('ChatScreen');
    }, 750);
    Animated.timing(animation, {
      toValue: Math.sqrt(width * 2 + height * 2.15) * 2,
      duration: 1500,
      useNativeDriver: false,
    }).start(async () => {
      setLoader(false);
    });
  }, [animation, navigation]);

  const renderConditionalScreen = useCallback((name) => {
    switch (name) {
      case 'Emission':
        return <Emission />;
      case 'Analytics':
        return <Analytics />;
      case 'Reports':
        return <Reports />;
      case 'Events':
        return <Events />;
      case 'Manual Data Entry':
        return <ManualEntry />;
      case 'GNR':
        return <GnrReport />;
      case 'EVSL - AWS Overview':
        return <Summary />;
      case 'EVSL - AWS Live Status':
        return <LiveStatus />;
      case 'EVSL Overview - Cloud':
        return <Summary />;
      case 'EVSL Live Status - Cloud':
        return <LiveStatus />;
      default:
        return null;
    }
  }, []);

  const renderChart = useCallback((chart) => {
    const ChartComponent = CHART_COMPONENTS[chart.type];
    console.log("%%%%%%%%%%",ChartComponent)
    return ChartComponent ? (
      <ChartComponent
        key={chart.id}
        chartId={chart.id}
        checkTheCond={lineChartData}
        paged=""
        showtitle={true}
        type="Chart"
      />
    ) : null;
  }, [lineChartData]);

  const renderLabel = useCallback((label) => (
    <Label key={label.id} labelId={label.id} labelDataIs={labelDataIs} />
  ), [labelDataIs]);

  const handleButtonPress = useCallback((id, type) => {
    if (type === 'panel') {
      fetchPanel(id);
    } else if (type === 'page') {
      fetchPage(id);
    }
  }, [fetchPanel, fetchPage]);

  const renderButton = useCallback((button) => (
    <ButtonElement key={button.id} buttonId={button.id} buttonDataIs={buttonDataIs} buttonPress={handleButtonPress} />
  ), [buttonDataIs, handleButtonPress]);

  const renderTable = useCallback((table) => (
    <TableElement key={table.id} tableId={table.id} tableDataIs={tableDataIs} />
  ), [tableDataIs]);

  const renderMap = useCallback((map) => (
    <MapElement
      key={map.id}
      mapId={map.id}
      showPopup={showPopup}
      mapDataIs={mapDataIs}
      onTouchStart={handleMapTouchStart}
      onTouchEnd={handleMapTouchEnd}
    />
  ), [showPopup, mapDataIs, handleMapTouchStart, handleMapTouchEnd]);

  const renderImage = useCallback((image) => (
    <Images key={image.id} imageId={image.id} imageDataIs={imageDataIs} />
  ), [imageDataIs]);

  const renderShapes = useCallback((shapesDataArg, ids) => (
    <>
      {shapesDataArg.squareShape && ids.square.map(id => (
        <Square key={id} id={id} squareStylesIs={squareStyles} bgColor={bgColor} />
      ))}
      {shapesDataArg.lineShape && ids.line.map(id => (
        <Line key={id} id={id} lineStylesIs={lineStyles} />
      ))}
      {shapesDataArg.arrowShape && ids.arrow.map(id => (
        <Arrow key={id} id={id} arrowStylesIs={arrowStyles} />
      ))}
      {shapesDataArg.triangleShape && ids.triangle.map(id => (
        <Triangle key={id} id={id} triangleStylesIs={triangleStyles} />
      ))}
      {shapesDataArg.circleShape && ids.circle.map(id => (
        <Circle key={id} id={id} circleStylesIs={circleStyles} />
      ))}
      {shapesDataArg.progressBar && ids.progressBar.map(id => (
        <CircularProgressBars key={id} id={id} progressStylesIs={progressBarStylesIs} />
      ))}
    </>
  ), [squareStyles, bgColor, lineStyles, arrowStyles, triangleStyles, circleStyles, progressBarStylesIs]);

  const hideModal = useCallback(() => {
    setPanel(false);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const shapeIds = useMemo(() => ({
    square: squareIds,
    line: lineIds,
    arrow: arrowIds,
    triangle: triangleIds,
    circle: circleIds,
    progressBar: progressIds,
  }), [squareIds, lineIds, arrowIds, triangleIds, circleIds, progressIds]);

  const innerContainerStyle = useMemo(() => ({
    height: containerHeight != null ? scaleHeight(containerHeight + 100) : scaleHeight(height),
    backgroundColor: 'transparent',
  }), [containerHeight]);

  const shouldShowLens = isLensPage(PageName);

  return (
    <View style={styles.chartContainer}>
      {console.log("ProjectId",userDetail?.projectName?.name,projectId)}
      <StatusBar backgroundColor="transparent" translucent={true} />
      <SafeAreaView style={{ backgroundColor: COLORS.NEW_HEADER, height: Platform.OS === 'ios' ? 40 : scaleHeight(40) }} edges={['top']} />
      {console.log("heythere",PageName, shouldShowLens, chartsData)}
      {renderConditionalScreen(PageName) || (
        <View style={{ flex: 1, backgroundColor: COLORS.WHITE }}>
          {shouldShowLens && (
            <View style={{ flex: 1, backgroundColor: bgColor || COLORS.BACKGROUND }}>
              <CustomHeader title={Header} navigation={navigation} icon="menu" />
              {loading ? (
                <View style={styles.loading}>
                  {[1, 2, 3].map(index => (
                    <MainPlaceHolder key={index} topSpace={10} height={145} bottom={200} radius={10} />
                  ))}
                </View>
              ) : (
                Header && (
                  <ScrollView
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    onScroll={() => setShowPopup(false)}
                    onScrollEndDrag={() => setShowPopup(true)}
                    contentContainerStyle={{ flexGrow: 1 }}
                    style={{ flex: 1, paddingBottom: Platform.OS === 'ios' ? scaleHeight(20) : scaleHeight(200) }}
                    refreshControl={
                      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                  >
                    
                    <ScrollViewIndicator
                      contentContainerStyle={{ flex: 1 }}
                      indStyle={{ width: showBar ? scaleWidth(5) : 0, paddingRight: scaleWidth(1) }}
                    >
                      {console.log('*********',chartsData)}
                      <View style={innerContainerStyle}>
                        {chartsData?.map(chart => renderChart(chart))}
                        {labelCompData?.map(label => renderLabel(label))}
                        {buttonCompData?.map(button => renderButton(button))}
                        {/* {tableCompData?.map(table => renderTable(table))}
                        {tabCompData?.map(tab => <TabElement key={tab.id} tabId={tab.id} tabDataIs={tabDataIs} />)}
                        {mapCompData?.map(map => renderMap(map))} */}
                        {imageCompData?.map(image => renderImage(image))}
                        {renderShapes(shapesData, shapeIds)}
                      </View>
                    </ScrollViewIndicator>
                  </ScrollView>
                )
              )}
            </View>
          )}
        
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    backgroundColor: COLORS.WHITE,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    width: 45,
    borderRadius: 50,
    borderColor: COLORS.NEW_HEADER,
    borderWidth: 3,
    top: Platform.OS === 'ios' ? '80%' : '70%',
    left: '80%',
  },
  shadowbox: {
    height: 225,
    position: 'absolute',
    alignSelf: 'center',
    width: scaleWidth(350),
  },
  chartheader: {
    textAlign: 'left',
    color: 'grey',
    fontWeight: '500',
    marginTop: scaleHeight(25),
    fontFamily: FONTS.SEGOEUIBOLD,
  },
  titlebox: {
    backgroundColor: COLORS.HEADERBG,
    width: '100%',
    height: scaleHeight(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  charttitle: {
    textAlign: 'left',
    fontSize: normalizeFont(14),
    fontWeight: '800',
    color: COLORS.GREEN1,
    marginLeft: scaleWidth(10),
    fontFamily: FONTS.SEGOEUISEMIBOLD,
    marginVertical: scaleHeight(10),
  },
  buttontitle: {
    textAlign: 'center',
    width: '95%',
    fontSize: normalizeFont(18),
    fontWeight: 'bold',
    color: COLORS.WHITE,
    fontFamily: FONTS.SEGOEUISEMIBOLD,
  },
  AiImagetitle: {
    textAlign: 'left',
    width: '95%',
    fontSize: normalizeFont(22),
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginLeft: scaleWidth(10),
    fontFamily: FONTS.SEGOEUISEMIBOLD,
    marginVertical: scaleHeight(10),
  },
  button: {
    backgroundColor: COLORS.CHAT_BLUE,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '90%',
  },
  headerbox: {
    backgroundColor: COLORS.WHITE,
    shadowColor: Platform.OS === 'ios' ? '#fff' : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 10,
    borderColor: '#D3D3D3',
    width: '100%',
    alignSelf: 'center',
  },
  divider: {
    height: scaleHeight(3),
    backgroundColor: COLORS.HEADERBG,
    marginTop: scaleHeight(10),
  },
  box: {
    backgroundColor: '#fff',
    width: '93%',
    alignSelf: 'center',
  },
  newbox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bot: {
    height: 35,
    width: 35,
  },
  Modalbox: {
    position: 'absolute',
    backgroundColor: COLORS.WHITE,
    right: scaleWidth(40),
    bottom: Platform.OS === 'ios' ? 0 : 5,
    borderColor: COLORS.BLUE_BG,
    borderWidth: 1,
  },
  backgroundImage: {
    width: scaleWidth(280),
    overflow: 'hidden',
  },
  container1: {
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  weatherContainer: {
    backgroundColor: COLORS.WHITE,
    width: scaleWidth(250),
    height: 100,
  },
  tableContainer: {
    padding: 10,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
  },
  close: {
    height: scaleHeight(20),
    width: scaleWidth(20),
    tintColor: COLORS.WHITE,
  },
  EventText: {
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginVertical: scaleHeight(10),
    marginLeft: scaleWidth(40),
    width: scaleWidth(250),
    textAlign: 'center',
  },
  insightView: {
    backgroundColor: COLORS.BLUE_NEW,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insights: {
    fontWeight: 'bold',
    marginVertical: scaleHeight(10),
    color: COLORS.WHITE,
    marginLeft: scaleWidth(20),
    fontSize: normalizeFont(14),
  },
  closeview: {
    height: scaleHeight(40),
    width: scaleWidth(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontWeight: 'bold',
    left: 10,
    color: COLORS.BLACK,
    fontFamily: FONTS.SEGOEUISEMIBOLD,
  },
  container: {
    backgroundColor: COLORS.WHITE,
    width: 200,
  },
  containere: {
    width: 100,
    height: 50,
    overflow: 'hidden',
    flex: 1,
  },
  loading: {
    alignContent: 'center',
    justifyContent: 'center',
  },
  chartContainer: {
    flex: 1,
  },
  plotly: {
    width: '100%',
    height: 50,
    flex: 1,
  },
  head: {
    height: 40,
    backgroundColor: '#f1f8ff',
  },
  text: {
    margin: 6,
  },
  wrapper: {
    flexDirection: 'row',
  },
  cell: {},
  border: {
    borderWidth: 1,
    borderColor: '#c8e1ff',
  },
  modalContainer: {
    backgroundColor: 'transparent',
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLayer: {
    circleRadiusTransition: { duration: 5000, delay: 0 },
    circleColor: COLORS.HEADER,
  },
  bookmodalView: {
    backgroundColor: COLORS.WHITE,
    alignSelf: 'center',
    shadowColor: Platform.OS === 'ios' ? '#fff' : COLORS.BLACKK,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    borderColor: COLORS.GREY,
    borderWidth: 0.1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    elevation: 5,
    overflow: 'hidden',
    height: height / 1.45,
  },
  modalView: {
    backgroundColor: COLORS.NEW_HEADER,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
});

export default MainScreen;