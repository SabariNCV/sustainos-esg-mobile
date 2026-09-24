import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { Tab } from 'react-native-elements';
import {
  normalizeFont,
  scaleHeight,
  scaleWidth,
} from '../../../Constants/dynamicSize';
import LineChart from '../LineChart/LineChart';
import BarChart from '../BarChart/BarChart';
import ScatterChart from '../ScatterChart/ScatterChart';
import AreaChart from '../AreaChart/AreaChart';
import MixedChart from '../MixedChart/MixedChart';
import HeatMapChart from '../HeatMapChart/HeatMapChart';
import DonutChart from '../DonutChart/DonutChart';
import GaugeChart from '../GaugeChart/GaugeChart';
import RadarChart from '../RadarChart/RadarChart';
import WaterFallChart from '../WaterFallChart/WaterFallChart';
import FunnelChart from '../FunnelChart/FunnelChart';
import ShankeyChart from '../ShankeyChart/ShankeyChart';
import BoxChart from '../BoxChart/BoxChart';
import XYchart from '../XYChart/XYchart';
import RangeAreaChart from '../RangeAreaChart/RangeAreaChart';
import ViolinChart from '../ViolinChart/ViolinChart';
import NightingaleChart from '../NightingaleChart/NightingaleChart';
import RadialBarChart from '../RadialBarChart/RadialBarChart';
import Images from '../Images/Images';
import Label from '../Label/Label';
import ButtonElement from '../ButtonElement/ButtonElement';
import Square from '../../Shapes/Square/Square';
import Triangle from '../../Shapes/Triangle/Triangle';
import Circle from '../../Shapes/Circle/Circle';
import Arrow from '../../Shapes/Arrow/Arrow';
import Line from '../../Shapes/LineShape/LineShape';
// import CircularProgressBars from '../../Shapes/CircularProgressBars/CircularProgressBars';
import MapElement from '../MapElement/MapElement';
import TableElement from '../TableElement/TableElement';
const { height } = Dimensions.get('window');

const TabElement = props => {
  const dispatch = useDispatch();
  const chartComponents = {
    LineChart,
    BarChart,
    ScatterChart,
    AreaChart,
    MixedChart,
    HeatMapChart,
    DonutChart,
    GaugeChart,
    RadarChart,
    WaterFallChart,
    FunnelChart,
    ShankeyChart,
    BoxChart,
    XYchart,
    RangeAreaChart,
    ViolinChart,
    NightingaleChart,
    RadialBarChart,
  };

  const parseHeight = value => {
    if (typeof value === 'string') {
      return value.includes('px')
        ? parseFloat(value.replace('px', ''))
        : parseFloat(value);
    }
    return value;
  };

  const { tabId } = props;
  const [index, setIndex] = React.useState(0);
  const [showPopup, setShowPopup] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const tabdataToUpload = useSelector(
    state => state.mainSlice.tabDataFromserver,
  );
  const shapesData = useSelector(state => state.mainSlice.shapesStyles);
  const chartDataIs = useSelector(
    state => state.mainSlice.chartDataFromserver,
  );
  const labelDataIs = useSelector(
    state => state.mainSlice.labelDataFromserver,
  );
  const buttonDataIs = useSelector(
    state => state.mainSlice.buttonDataFromserver,
  );
  const tableDataIs = useSelector(
    state => state.mainSlice.tableDataFromserver,
  );
  const imageDataIs = useSelector(
    state => state.mainSlice.imageDataFromserver,
  );
  const mapDataIs = useSelector(state => state.mainSlice.mapDataFromserver);
  const [selectedId, setSlectedId] = useState('');
  const containerHeight = useSelector(state => state.mainSlice.maxHeight);
  let tabIS = tabdataToUpload[tabId]['tab-colors'];
  let tabNameIS = tabdataToUpload[tabId]['tab-colors']['tabConfig'];
  let data = tabNameIS.filter(ele => ele.id === selectedId);
  let chartsData =
    data.length > 0 && data[0].chartData ? data[0].chartData : [];
  let labelData = data.length > 0 && data[0].labelData ? data[0].labelData : [];
  let buttonData =
    data.length > 0 && data[0].buttonData ? data[0].buttonData : [];
  let tableData = data.length > 0 && data[0].tableData ? data[0].tableData : [];
  let imageData = data.length > 0 && data[0].imageData ? data[0].imageData : [];
  let mapData = data.length > 0 && data[0].mapData ? data[0].mapData : [];
  let squareIds =
    data.length > 0 && data[0].squareData
      ? data[0].squareData.map(item => item.id)
      : [];
  let circleIds =
    data.length > 0 && data[0].circleData
      ? data[0].circleData.map(item => item.id)
      : [];
  let triangleIds =
    data.length > 0 && data[0].triangleData
      ? data[0].triangleData.map(item => item.id)
      : [];
  let lineIds =
    data.length > 0 && data[0].lineData
      ? data[0].lineData.map(item => item.id)
      : [];
  let arrowIds =
    data.length > 0 && data[0].arrowData
      ? data[0].arrowData.map(item => item.id)
      : [];
  let progressIds =
    data.length > 0 && data[0].progressBarData
      ? data[0].progressBarData.map(item => item.id)
      : [];
  const squareStyles =
    data.length > 0 && data[0].squareData ? data[0].squareData : [];
  const circleStyles =
    data.length > 0 && data[0].circleData ? data[0].circleData : [];
  const triangleStyles =
    data.length > 0 && data[0].triangleData ? data[0].triangleData : [];
  const lineStyles =
    data.length > 0 && data[0].lineData ? data[0].lineData : [];
  const arrowStyles =
    data.length > 0 && data[0].arrowData ? data[0].arrowData : [];
  const progressStyles =
    data.length > 0 && data[0].progressBarData ? data[0].progressBarData : [];
  useEffect(() => {
    if (tabNameIS.length > 0) {
      setSlectedId(tabNameIS[0].id);
    }
  }, [tabNameIS]);

  const containerheight = parseHeight(tabIS?.reSizeProperties?.height);

  useEffect(() => {
    const containerheight = parseHeight(tabIS?.reSizeProperties?.height);
    const newHeight = tabIS?.reSizeProperties?.y + (containerheight / 100) * 850 + 20;
    dispatch(updateHeight(newHeight));
  }, []);

  const handleTabChange = (event) => {
    setIndex(event);
    setSlectedId(tabNameIS[event].id);
    setSlectedId(tabNameIS[event].id);
  };

  const WIDTH = parseHeight(tabIS?.reSizeProperties?.width);

  return (
    <View
      style={[
        styles.tableContainer,
        {
          width: scaleWidth(WIDTH + 10),
          height: scaleHeight(containerheight),
          position: 'absolute',
          top: scaleHeight(tabIS?.reSizeProperties?.y),
          left: scaleWidth(tabIS?.reSizeProperties?.x - 15),
          backgroundColor: tabIS?.bgCh ? tabIS?.backgroundColor : '#fff',
        },
      ]}>
      <Tab
        value={index}
        onChange={(event, newValue) => handleTabChange(event)}
        indicatorStyle={{
          backgroundColor: 'white',
          height: tabIS.tabType === 'background' ? 0 : 3,
        }}
        style={{ backgroundColor: tabIS.tabColor }}
        variant={tabIS.tabType === 'background' ? 'default' : 'primary'}>
        {tabNameIS.map((tab, tabIndex) => (
          <Tab.Item
            key={tab.id || tabIndex}
            title={tab.tabName}
            titleStyle={{
              fontSize: normalizeFont(
                parseInt(tabIS.fontSize?.replace('px', '')),
              ),
              color: index === tabIndex ? 'white' : 'black',
              fontWeight: tabIS.isBold ? 'bold' : 'normal',
              fontStyle: tabIS.isItalic ? 'italic' : 'normal',
              textDecoration: tabIS.isUnderLine ? 'underline' : 'none',
              textTransform: 'capitalize',
            }}
            containerStyle={{
              backgroundColor:
                tabIS.tabType === 'background'
                  ? index === tabIndex
                    ? tabIS.selectionColor
                    : tabIS.tabColor
                  : '',
            }}
          />
        ))}
      </Tab>

      <View
        showsVerticalScrollIndicator={false}
        onScroll={e => {
          setShowPopup(false);
        }}
        onScrollEndDrag={() => setShowPopup(true)}
        contentContainerStyle={{
          height:
            containerHeight !== null
              ? scaleHeight(containerHeight + 100)
              : scaleHeight(height),
          backgroundColor: 'transparent',
        }}
        style={{ paddingBottom: Platform.OS === 'ios' ? scaleHeight(200) : 0 }}>

        {/* <------ Render the Charts that configured in Lens ------> */}
        {chartsData !== undefined &&
          chartsData.map(chartName => {
            const ChartComponent = chartComponents[chartName.type];
            if (!ChartComponent) {
              return null;
            }
            return (
              <ChartComponent
                key={chartName.id}
                chartId={chartName.id}
                checkTheCond={chartDataIs}
                paged=""
                showtitle={true}
                type="Chart"
              />
            );
          })}

        {/* <------ Render the labels that configured in Lens ------> */}
        {labelData !== undefined &&
          labelData?.map(labelName => {
            return (
              <Label
                key={labelName.id}
                labelId={labelName.id}
                labelDataIs={labelDataIs}
              />
            );
          })}

        {/* <------ Render the button that configured in Lens ------> */}
        {buttonData !== undefined &&
          buttonData?.map(buttonName => {
            return (
              <ButtonElement
                key={buttonName.id}
                buttonId={buttonName.id}
                buttonDataIs={buttonDataIs}
              />
            );
          })}

        {/* <------ Render the Table (dynamic,static tables) ------> */}
        {tableData !== undefined &&
          tableData.map(tableName => {
            return (
              <TableElement
                key={tableName.id}
                tableId={tableName.id}
                tableDataIs={tableDataIs}
              />
            );
          })}

        {/* <------ Render the Map element configured in Lens ------> */}
        {mapData !== undefined &&
          mapData?.map(mapName => {
            return (
              <MapElement
                key={mapName?.id}
                mapId={mapName?.id}
                showPopup={showPopup}
                mapDataIs={mapDataIs}
                onTouchStart={handleMapTouchStart}
                onTouchEnd={handleMapTouchEnd}
              />
            );
          })}

        {/* <------ Render the Image element configured in Lens ------> */}
        {imageData !== undefined &&
          imageDataIs !== undefined &&
          imageData.map(imageName => {
            return (
              <Images
                key={imageName.id}
                imageId={imageName.id}
                imageDataIs={imageDataIs}
              />
            );
          })}

        {/* <------ Render all the shapes available Square ------> */}
        {squareIds !== undefined && squareIds.map((ele) => <Square id={ele} key={ele} squareStylesIs={squareStyles} subId = {selectedId} tabShape = {true}/>)}

        {/* <------ Render all the shapes available Line ------> */}
        {lineIds !== undefined &&
          lineIds.map(ele => (
            <Line id={ele} key={ele} lineStylesIs={lineStyles} subId = {selectedId} tabShape = {true}/>
          ))}

        {/* <------ Render all the shapes available Arrow ------> */}
        {arrowIds !== undefined &&
          arrowIds.map(ele => (
            <Arrow id={ele} key={ele} arrowStylesIs={arrowStyles} subId = {selectedId} tabShape = {true}/>
          ))}

        {/* <------ Render all the shapes available Triangle ------> */}
        {triangleIds !== undefined &&
          Object.keys(shapesData.triangleShape).length !== 0 &&
          triangleIds.map(ele => (
            <Triangle id={ele} key={ele} triangleStylesIs={triangleStyles} subId = {selectedId} tabShape = {true}/>
          ))}

        {/* <------ Render all the shapes available Circle ------> */}
        {circleIds !== undefined &&
          circleIds.map(ele => (
            <Circle id={ele} key={ele} circleStylesIs={circleStyles} subId = {selectedId} tabShape = {true}/>
          ))}

      </View>
    </View>
  );
};
export default TabElement;
const styles = StyleSheet.create({
  scene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButton: {
    padding: scaleHeight(10),
    margin: scaleWidth(5),
    borderRadius: scaleWidth(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
