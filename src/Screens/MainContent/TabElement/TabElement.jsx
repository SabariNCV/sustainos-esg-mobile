import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Tab } from 'react-native-elements';
import PropTypes from 'prop-types';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { normalizeFont, scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import { parseHeight } from '../../../Components/elementUtils';
import { clampHorizontal } from '../../../Components/shapeUtils';
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
import MapElement from '../MapElement/MapElement';
import TableElement from '../TableElement/TableElement';

const EMPTY_LIST = [];
const DEFAULT_TAB_FONT_SIZE = 12;

const CHART_COMPONENTS = {
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
  BoxChart,
  XYchart,
  RangeAreaChart,
  ViolinChart,
  NightingaleChart,
  RadialBarChart,
};

const SHAPE_GROUPS = [
  { key: 'squareData', Component: Square, dataProp: 'squareStylesIs' },
  { key: 'lineData', Component: Line, dataProp: 'lineStylesIs' },
  { key: 'arrowData', Component: Arrow, dataProp: 'arrowStylesIs' },
  { key: 'triangleData', Component: Triangle, dataProp: 'triangleStylesIs', needsShapes: true },
  { key: 'circleData', Component: Circle, dataProp: 'circleStylesIs' },
];

const getField = (record, key) => record?.[key] ?? EMPTY_LIST;

const getTabBackground = (tabIS, isActive) => {
  if (tabIS.tabType !== 'background') {
    return 'transparent';
  }
  return isActive ? tabIS.selectionColor : tabIS.tabColor;
};

const buildTitleStyle = (tabIS, isActive, fontSize) => ({
  fontSize: normalizeFont(fontSize),
  color: isActive ? 'white' : 'black',
  fontWeight: tabIS.isBold ? 'bold' : 'normal',
  fontStyle: tabIS.isItalic ? 'italic' : 'normal',
  textDecorationLine: tabIS.isUnderLine ? 'underline' : 'none',
  textTransform: 'capitalize',
});

function TabElement({ tabId }) {
  const dispatch = useDispatch();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const tabDataFromServer = useSelector((state) => state.mainSlice.tabDataFromserver);
  const shapesData = useSelector((state) => state.mainSlice.shapesStyles);
  const chartDataIs = useSelector((state) => state.mainSlice.chartDataFromserver);
  const labelDataIs = useSelector((state) => state.mainSlice.labelDataFromserver);
  const buttonDataIs = useSelector((state) => state.mainSlice.buttonDataFromserver);
  const tableDataIs = useSelector((state) => state.mainSlice.tableDataFromserver);
  const imageDataIs = useSelector((state) => state.mainSlice.imageDataFromserver);
  const mapDataIs = useSelector((state) => state.mainSlice.mapDataFromserver);
  const maxHeight = useSelector((state) => state.mainSlice.maxHeight);

  const tabIS = tabDataFromServer[tabId]['tab-colors'];
  const tabConfig = tabIS.tabConfig ?? EMPTY_LIST;
  const activeIndex = index < tabConfig.length ? index : 0;
  const record = tabConfig[activeIndex];

  const resize = tabIS.reSizeProperties;
  const tabHeight = parseHeight(resize?.height);
  const tabWidth = parseHeight(resize?.width);
  const positionY = Number(resize?.y);
  const positionX = Number(resize?.x);

  useEffect(() => {
    dispatch(updateHeight(positionY + (tabHeight / 100) * 850 + 20));
  }, [positionY, tabHeight, dispatch]);

  const handleTabChange = useCallback((nextIndex) => setIndex(nextIndex), []);

  const containerStyle = useMemo(
    () => ({
      ...clampHorizontal(
        {
          left: scaleWidth(positionX - 15),
          top: scaleHeight(positionY),
          width: scaleWidth(tabWidth + 10),
          height: scaleHeight(tabHeight),
        },
        screenWidth,
      ),
      backgroundColor: tabIS.bgCh ? tabIS.backgroundColor : '#fff',
    }),
    [positionX, positionY, tabWidth, tabHeight, screenWidth, tabIS.bgCh, tabIS.backgroundColor],
  );

  const tabFontSize = tabIS.fontSize
    ? Number.parseInt(tabIS.fontSize.replace('px', ''), 10)
    : DEFAULT_TAB_FONT_SIZE;
  const isBackgroundTab = tabIS.tabType === 'background';
  const hasTriangles = Boolean(shapesData?.triangleShape) && Object.keys(shapesData.triangleShape).length !== 0;

  const contentStyle = {
    height: maxHeight == null ? scaleHeight(screenHeight) : scaleHeight(maxHeight + 100),
    backgroundColor: 'transparent',
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Tab
        value={activeIndex}
        onChange={handleTabChange}
        indicatorStyle={{ backgroundColor: 'white', height: isBackgroundTab ? 0 : 3 }}
        style={{ backgroundColor: tabIS.tabColor }}
        variant={isBackgroundTab ? 'default' : 'primary'}
      >
        {tabConfig.map((tab, tabIndex) => (
          <Tab.Item
            key={tab.id ?? tab.tabName}
            title={tab.tabName}
            titleStyle={buildTitleStyle(tabIS, activeIndex === tabIndex, tabFontSize)}
            containerStyle={{ backgroundColor: getTabBackground(tabIS, activeIndex === tabIndex) }}
          />
        ))}
      </Tab>

      <View style={{ paddingBottom: Platform.OS === 'ios' ? scaleHeight(200) : 0 }}>
        <View style={contentStyle}>
          {getField(record, 'chartData').map((chart) => {
            const ChartComponent = CHART_COMPONENTS[chart.type];
            return ChartComponent ? (
              <ChartComponent
                key={chart.id}
                chartId={chart.id}
                checkTheCond={chartDataIs}
                paged=""
                showtitle
                type="Chart"
              />
            ) : null;
          })}

          {getField(record, 'labelData').map((item) => (
            <Label key={item.id} labelId={item.id} labelDataIs={labelDataIs} />
          ))}

          {getField(record, 'buttonData').map((item) => (
            <ButtonElement key={item.id} buttonId={item.id} buttonDataIs={buttonDataIs} />
          ))}

          {getField(record, 'tableData').map((item) => (
            <TableElement key={item.id} tableId={item.id} tableDataIs={tableDataIs} />
          ))}

          {getField(record, 'mapData').map((item) => (
            <MapElement key={item.id} mapId={item.id} mapDataIs={mapDataIs} />
          ))}

          {imageDataIs !== undefined &&
            getField(record, 'imageData').map((item) => (
              <Images key={item.id} imageId={item.id} imageDataIs={imageDataIs} />
            ))}

          {SHAPE_GROUPS.map(({ key, Component, dataProp, needsShapes }) => {
            if (needsShapes && !hasTriangles) {
              return null;
            }
            const items = getField(record, key);
            return items.map((item) => (
              <Component
                key={`${key}-${item.id}`}
                id={item.id}
                {...{ [dataProp]: items }}
                subId={record?.id}
                tabShape
              />
            ));
          })}
        </View>
      </View>
    </View>
  );
}

TabElement.propTypes = {
  tabId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default React.memo(TabElement);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});