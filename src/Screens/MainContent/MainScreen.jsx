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
import {
  chartDataFromserver, labelDataFromserver, imageDataFromserver, buttonDataFromserver, tableDataFromserver, tabDataFromserver, tabInfo,
  mapDataFromserver, shapesStyles, squarestyles, linestyles, arrowstyles, trianglestyles, circlestyles, progressBarStyles, ChartsInfo, mapInfo, buttonInfo,
  imageInfo, labelInfo, tableInfo, panelbg, panelbuttonDataFromserver, panelmapDataFromserver, panelchartDataFromserver, panelimageDataFromserver, panellabelDataFromserver,
  openPanel, panelshapesStyles, panelDataIdsFromStore, panelChartsInfo, panellabelInfo, panelimageInfo, panelbuttonInfo, panelmapInfo, openLoadedpanel, paneltableDataFromserver,
  paneltableInfo,
} from '../../Redux/ReduxSlice/mainSlice';
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
import MapElement from './MapElement/MapElement';
import TableElement from './TableElement/TableElement';
import TabElement from './TabElement/TabElement';
const { width, height } = Dimensions.get('window');
const CHART_COMPONENTS = { LineChart, BarChart, ScatterChart, AreaChart, MixedChart, HeatMapChart, DonutChart, GaugeChart, RadarChart, WaterFallChart, FunnelChart, BoxChart, XYchart, RangeAreaChart, ViolinChart, RadialBarChart };
const BUTTON_WIDTH = 50;
const BUTTON_HEIGHT = 50;
const PAGE_LIST_PATH = 'ncarp_lens_app/api/page_list/';
const PANEL_DETAILS_URL = 'https://sustainos.ai:9000/ncarp_lens_app/api/panel_details/';

const buildAuthHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const fetchPageListData = async (baseUrl, projectName, id) => {
  const token = await AsyncStorage.getItem('jwttoken');
  const url = `${baseUrl}${PAGE_LIST_PATH}?project=${projectName}&id=${id}`;
  const result = await axios.get(url, buildAuthHeaders(token));
  return result?.data?.message?.[0];
};

const DragAndDropCard = ({ onPress }) => (
  <Animated.View style={[styles.floatingButton, { position: 'absolute', width: BUTTON_WIDTH, height: BUTTON_HEIGHT }]}>
    <TouchableOpacity onPress={onPress} style={styles.newbox} activeOpacity={0.8}>
      <FastImage source={IMAGES.bot} style={styles.bot} resizeMode="contain" />
    </TouchableOpacity>
  </Animated.View>
);

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
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
  const [panelLoading, setpanelLoading] = useState(false);
  const [panel, setPanel] = useState(false);

  const projectId = useSelector((state) => state.authSlice.userDetails?.projectName?.id);
  const containerHeight = useSelector((state) => state.mainSlice.maxHeight);
  const lineChartData = useSelector((state) => state.mainSlice.chartDataFromserver);
  const shapesData = useSelector((state) => state.mainSlice.shapesStyles);
  const userDetail = useSelector((state) => state.authSlice.userDetails);
  const PageName = useSelector((state) => state.authSlice.pageName);
  const chartsData = useSelector((state) => state.mainSlice.chartDataFromserver.charsIs);
  const labelCompData = useSelector((state) => state.mainSlice.labelInfo);
  const imageCompData = useSelector((state) => state.mainSlice.imageInfo);
  const labelDataIs = useSelector((state) => state.mainSlice.labelDataFromserver);
  const imageDataIs = useSelector((state) => state.mainSlice.imageDataFromserver);
  const buttonCompData = useSelector((state) => state.mainSlice.buttonInfo);
  const mapCompData = useSelector((state) => state.mainSlice.mapInfo);
  const buttonDataIs = useSelector((state) => state.mainSlice.buttonDataFromserver);
  const tableCompData = useSelector((state) => state.mainSlice.tableInfo);
  const tableDataIs = useSelector((state) => state.mainSlice.tableDataFromserver);
  const tabDataIs = useSelector((state) => state.mainSlice.tabDataFromserver);
  const tabCompData = useSelector((state) => state.mainSlice.tabInfo);
  const mapDataIs = useSelector((state) => state.mainSlice.mapDataFromserver);
  const squareStyles = useSelector((state) => state.mainSlice.squarestyles);
  const triangleStyles = useSelector((state) => state.mainSlice.trianglestyles);
  const circleStyles = useSelector((state) => state.mainSlice.circlestyles);
  const lineStyles = useSelector((state) => state.mainSlice.linestyles);
  const arrowStyles = useSelector((state) => state.mainSlice.arrowstyles);
  const progressBarStylesIs = useSelector((state) => state.mainSlice.progressBarStyles);
  const BASE_URL = useSelector((state) => state.mainSlice.baseUrlIs);

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

  const debouncedHeader = useDebounce(PageName, 300);

  const ChartDataFromserver = useCallback(async (id) => {
    const requestId = ++fetchIdRef.current;
    try {
      const message = await fetchPageListData(BASE_URL, userDetail?.projectName?.name, id);
      if (!isMountedRef.current || requestId !== fetchIdRef.current) return;

      const json = message?.json;
      if (json?.charsIs !== undefined) dispatch(ChartsInfo(json.charsIs));
      if (json?.labelsIs !== undefined) dispatch(labelInfo(json.labelsIs));
      if (json?.imagesIs !== undefined) dispatch(imageInfo(json.imagesIs));
      if (json?.buttonIs !== undefined) dispatch(buttonInfo(json.buttonIs));
      if (json?.mapIs !== undefined) dispatch(mapInfo(json.mapIs));
      if (json?.tableIs !== undefined) dispatch(tableInfo(json.tableIs));
      if (json?.tabIs !== undefined) dispatch(tabInfo(json.tabIs));

      setbgColor(message?.background);
      dispatch(chartDataFromserver({ value: json?.chartInfo }));
      dispatch(labelDataFromserver({ value: json?.labelData }));
      dispatch(imageDataFromserver({ value: json?.imageData }));
      dispatch(buttonDataFromserver({ value: json?.buttonData }));
      dispatch(mapDataFromserver({ value: json?.mapData }));
      dispatch(shapesStyles({ value: json?.shapesData }));
      dispatch(tableDataFromserver({ value: json?.tableData }));
      dispatch(tabDataFromserver({ value: json?.tabData }));
      setShowBar(true);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      if (isMountedRef.current && requestId === fetchIdRef.current) setShowBar(false);
    } finally {
      if (isMountedRef.current && requestId === fetchIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [BASE_URL, userDetail?.projectName?.name, dispatch]);

  const fetchData = useCallback(async () => {
    try {
      setbgColor('#fff');
      if (userDetail?.pageId !== undefined) {
        await ChartDataFromserver(userDetail?.pageId);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [userDetail?.pageId, PageName, ChartDataFromserver]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [debouncedHeader, fetchData]);

  useEffect(() => {
    const shapeConfig = [
      { key: 'squareShape', setIds: setSquareIds, action: squarestyles },
      { key: 'lineShape', setIds: setLineIds, action: linestyles },
      { key: 'arrowShape', setIds: setArrowIds, action: arrowstyles },
      { key: 'triangleShape', setIds: setTriangleIds, action: trianglestyles },
      { key: 'circleShape', setIds: setCircleIds, action: circlestyles },
      { key: 'progressBar', setIds: setProgressIds, action: progressBarStyles },
    ];

    shapeConfig.forEach(({ key, setIds, action }) => {
      const shape = shapesData?.[key];
      if (shape && Object.keys(shape).length !== 0) {
        setIds(Object.keys(shape));
        dispatch(action({ value: shape }));
      } else {
        setIds([]);
        dispatch(action({}));
      }
    });
  }, [shapesData, dispatch]);

  const fetchPanel = useCallback(async (id) => {
    setpanelLoading(true);
    try {
      const token = await AsyncStorage.getItem('jwttoken');
      const response = await axios.get(`${PANEL_DETAILS_URL}/?project_id=${projectId}&id=${id}`, buildAuthHeaders(token));
      if (!isMountedRef.current) return;

      const jsonData = response.data[0].json_data;
      const panelDataIds = [];
      const shapesDataFromServer = jsonData.shapesData;
      panelDataIds.push(
        ...Object.keys(shapesDataFromServer?.squareShape || {}),
        ...Object.keys(shapesDataFromServer?.arrowShape || {}),
        ...Object.keys(shapesDataFromServer?.circleShape || {}),
        ...Object.keys(shapesDataFromServer?.lineShape || {}),
        ...Object.keys(shapesDataFromServer?.progressBar || {}),
        ...Object.keys(shapesDataFromServer?.triangleShape || {}),
      );

      const entityConfig = [
        { key: 'charsIs', action: panelChartsInfo },
        { key: 'labelsIs', action: panellabelInfo },
        { key: 'buttonIs', action: panelbuttonInfo },
        { key: 'mapIs', action: panelmapInfo },
        { key: 'imagesIs', action: panelimageInfo },
      ];
      entityConfig.forEach(({ key, action }) => {
        const entities = jsonData[key];
        if (entities !== undefined) {
          entities.forEach((ele) => panelDataIds.push(ele.id));
          dispatch(action(entities));
        }
      });

      dispatch(panelbg(response.data[0].background));
      dispatch(panelchartDataFromserver({ value: jsonData.chartInfo }));
      dispatch(panelshapesStyles({ value: shapesDataFromServer }));
      dispatch(panellabelDataFromserver({ value: jsonData.labelData }));
      dispatch(panelbuttonDataFromserver({ value: jsonData.buttonData }));
      dispatch(panelmapDataFromserver({ value: jsonData.mapData }));
      dispatch(panelimageDataFromserver({ value: jsonData.imageData }));
      dispatch(openPanel(true));
      dispatch(openLoadedpanel(true));
      dispatch(panelDataIdsFromStore(panelDataIds));
      setPanel(true);
    } catch (error) {
      console.error('Error fetching panel data:', error);
    } finally {
      if (isMountedRef.current) setpanelLoading(false);
    }
  }, [projectId, dispatch]);

  const fetchPage = useCallback(async (id) => {
    setpanelLoading(true);
    try {
      const message = await fetchPageListData(BASE_URL, userDetail?.projectName?.name, id);
      if (!isMountedRef.current) return;

      const json = message?.json;
      if (json?.charsIs !== undefined) dispatch(panelChartsInfo(json.charsIs));
      if (json?.labelsIs !== undefined) dispatch(panellabelInfo(json.labelsIs));
      if (json?.imagesIs !== undefined) dispatch(panelimageInfo(json.imagesIs));
      if (json?.buttonIs !== undefined) dispatch(panelbuttonInfo(json.buttonIs));
      if (json?.tableData !== undefined) dispatch(paneltableDataFromserver({ value: json.tableData }));
      if (json?.tableIs !== undefined) dispatch(paneltableInfo(json.tableIs));

      dispatch(panelbg(message?.background));
      dispatch(panelchartDataFromserver({ value: json?.chartInfo }));
      dispatch(panellabelDataFromserver({ value: json?.labelData }));
      dispatch(panelimageDataFromserver({ value: json?.imageData }));
      dispatch(panelbuttonDataFromserver({ value: json?.buttonData }));
      dispatch(panelmapDataFromserver({ value: json?.mapData }));
      dispatch(panelshapesStyles({ value: json?.shapesData }));
      dispatch(tableDataFromserver({ value: json?.tableData }));
      dispatch(tabDataFromserver({ value: json?.tabData }));
      setPanel(true);
    } catch (error) {
      console.error('Error fetching page data:', error);
    } finally {
      if (isMountedRef.current) setpanelLoading(false);
    }
  }, [BASE_URL, userDetail?.projectName?.name, dispatch]);

  const handleMapTouchStart = useCallback((event) => {
    if (event.nativeEvent.touches.length > 1) {
      scrollViewRef?.current?.setNativeProps({ scrollEnabled: false });
    }
  }, []);

  const handleMapTouchEnd = useCallback(() => {
    scrollViewRef?.current?.setNativeProps({ scrollEnabled: true });
  }, []);

  const handleNavigation = useCallback(() => {
    setLoader(true);
    setTimeout(() => {
      navigation.navigate('ChatScreen');
    }, 750);
    Animated.timing(animation, {
      toValue: Math.sqrt(width * 2 + height * 2.15) * 2,
      duration: 1500,
      useNativeDriver: false,
    }).start(() => {
      setLoader(false);
    });
  }, [animation, navigation]);

  const renderChart = useCallback((chart) => {
    const ChartComponent = CHART_COMPONENTS[chart.type];
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
      {shapesDataArg.squareShape && ids.square.map((id) => (
        <Square key={id} id={id} squareStylesIs={squareStyles} bgColor={bgColor} />
      ))}
      {shapesDataArg.lineShape && ids.line.map((id) => (
        <Line key={id} id={id} lineStylesIs={lineStyles} />
      ))}
      {shapesDataArg.arrowShape && ids.arrow.map((id) => (
        <Arrow key={id} id={id} arrowStylesIs={arrowStyles} />
      ))}
      {shapesDataArg.triangleShape && ids.triangle.map((id) => (
        <Triangle key={id} id={id} triangleStylesIs={triangleStyles} />
      ))}
      {shapesDataArg.circleShape && ids.circle.map((id) => (
        <Circle key={id} id={id} circleStylesIs={circleStyles} />
      ))}
      {shapesDataArg.progressBar && ids.progressBar.map((id) => (
        <CircularProgressBars key={id} id={id} progressStylesIs={progressBarStylesIs} />
      ))}
    </>
  ), [squareStyles, bgColor, lineStyles, arrowStyles, triangleStyles, circleStyles, progressBarStylesIs]);

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
    height: containerHeight != null ? scaleHeight(containerHeight + 300) : scaleHeight(height),
    backgroundColor: 'transparent',
  }), [containerHeight]);

  return (
    <View style={styles.chartContainer}>
      <StatusBar backgroundColor="transparent" translucent={true} />
      <SafeAreaView style={{ backgroundColor: COLORS.NEW_HEADER, height: Platform.OS === 'ios' ? 40 : scaleHeight(40) }} edges={['top']} />
      <View style={{ flex: 1, backgroundColor: COLORS.WHITE }}>
          <View style={{ flex: 1, backgroundColor: bgColor || COLORS.BACKGROUND }}>
            <CustomHeader title={PageName} navigation={navigation} icon="menu" />
            {loading ? (
              <View style={styles.loading}>
                {[1, 2, 3].map((index) => (
                  <MainPlaceHolder key={index} topSpace={10} height={145} bottom={200} radius={10} />
                ))}
              </View>
            ) : (
              PageName && (
                <ScrollView
                  ref={scrollViewRef}
                  showsVerticalScrollIndicator={false}
                  onScroll={() => setShowPopup(false)}
                  onScrollEndDrag={() => setShowPopup(true)}
                  contentContainerStyle={{ flexGrow: 1 }}
                  style={{ flex: 1, paddingBottom: Platform.OS === 'ios' ? scaleHeight(20) : scaleHeight(200) }}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                  <ScrollViewIndicator contentContainerStyle={{ flex: 1 }} indStyle={{ width: showBar ? scaleWidth(5) : 0, paddingRight: scaleWidth(1) }}>
                    <View style={innerContainerStyle}>
                      {chartsData?.map((chart) => renderChart(chart))}
                      {labelCompData?.map((label) => renderLabel(label))}
                      {buttonCompData?.map((button) => renderButton(button))}
                      {tableCompData?.map((table) => renderTable(table))}
                      {tabCompData?.map((tab) => <TabElement key={tab.id} tabId={tab.id} tabDataIs={tabDataIs} />)}
                      {mapCompData?.map((map) => renderMap(map))}
                      {imageCompData?.map((image) => renderImage(image))}
                      {renderShapes(shapesData, shapeIds)}
                    </View>
                  </ScrollViewIndicator>
                </ScrollView>
              )
            )}
            <DragAndDropCard onPress={handleNavigation} />
          </View>
      </View>
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