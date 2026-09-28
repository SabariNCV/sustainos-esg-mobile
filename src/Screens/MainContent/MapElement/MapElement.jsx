import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Image, TouchableWithoutFeedback, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import MapboxGL from '@rnmapbox/maps';
import { MAPBOX_ACCESS_TOKEN, WEATHER_API_KEY } from '../../../Constants/ApiKeys';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { fas } from '@fortawesome/pro-solid-svg-icons';
import { normalizeFont, scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import { COLORS } from '../../../Constants/Colors';
import { FONTS } from '../../../Constants/Fonts';
import { IMAGES } from '../../../Constants/Images';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { styles as sharedStyles } from '../styles';
import { parseHeight, evaluateColorRange } from '../../../Components/elementUtils';
import { fetchParameterData, useParameterData } from '../../../Components/useParameterData';
import { TrendChart, ValueLabel, ValueShape, ValueProgressBar } from '../../../Components/ParameterControls';

MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

const WEATHER_URL = 'https://api.weatherapi.com/v1/forecast.json';
const FALLBACK_LOCATION = { lon: 0, lat: 0 };
const DEFAULT_WEATHER = { temperature: 'Loading', time: 'Loading' };
const FAILED_WEATHER = { temperature: '-', time: '-' };
const CHART_MODES = { 'Line Chart': 'line', 'Bar Chart': 'bar' };
const WEATHER_TIME_FORMAT = 'YYYY-MM-DD HH:mm';
const DEFAULT_CENTER = { center: [0, 0], zoom: 2 };

const formatWeatherTime = (value) => {
  const parsed = moment(value, WEATHER_TIME_FORMAT, true);
  return parsed.isValid() ? parsed.format('MMM D, YYYY h:mm A') : String(value);
};

const formatTemperature = (value) => (value === '-' || value === 'Loading' ? String(value) : `${value}°C`);

const resolveZoom = (maxDelta, count) => {
  if (count === 1) {
    return 10;
  }
  if (maxDelta > 5) {
    return 2;
  }
  if (maxDelta > 1) {
    return 4;
  }
  if (maxDelta > 0.5) {
    return 6;
  }
  return 8;
};

const getBoundsCenterZoom = (locations) => {
  if (!locations || locations.length === 0) {
    return DEFAULT_CENTER;
  }

  const coordinates = locations
    .map((loc) => [Number.parseFloat(loc.location.lat), Number.parseFloat(loc.location.lon)])
    .filter(([lat, lng]) => !Number.isNaN(lat) && !Number.isNaN(lng));

  if (coordinates.length === 0) {
    return DEFAULT_CENTER;
  }

  const lats = coordinates.map(([lat]) => lat);
  const lngs = coordinates.map(([, lng]) => lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const maxDelta = Math.max(maxLat - minLat, maxLng - minLng);

  return {
    center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
    zoom: resolveZoom(maxDelta, locations.length),
  };
};

const buildIconSource = (ele) => {
  if (!ele.parmDataIs || Object.keys(ele.parmDataIs).length === 0) {
    return null;
  }
  return {
    id: ele.parmDataIs.parameterId,
    timeRange: ele.timeRange,
    fromDate: ele.fromDate,
    toDate: ele.toDate,
    aggregate: ele.aggregate,
  };
};

const loadLocation = async (baseUrl, ele) => {
  try {
    const data = await fetchParameterData(baseUrl, { id: ele.id });
    const raw = data?.[ele.id];
    if (!raw) {
      return { ...ele, location: FALLBACK_LOCATION };
    }
    const parsed = JSON.parse(raw.replace(/'/g, '"'));
    return { ...ele, location: { lon: parsed.lon, lat: parsed.lat } };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { ...ele, location: FALLBACK_LOCATION };
  }
};

function PopupControl({ ele, baseUrl }) {
  const chartMode = CHART_MODES[ele.controlType];

  if (chartMode) {
    return (
      <View style={localStyles.chartWrapper}>
        <TrendChart ele={ele} baseUrl={baseUrl} mode={chartMode} style={localStyles.chart} />
      </View>
    );
  }

  switch (ele.controlType) {
    case 'Numeric':
      return (
        <View style={localStyles.numericWrapper}>
          <ValueLabel ele={ele} baseUrl={baseUrl} textStyle={localStyles.numericText} />
        </View>
      );
    case 'Square':
      return (
        <ValueShape
          ele={ele}
          baseUrl={baseUrl}
          style={[localStyles.shapeMargin, { width: ele.shapeSize, height: ele.shapeSize }]}
        />
      );
    case 'Circle':
      return (
        <View
          style={[
            localStyles.shapeMargin,
            {
              width: ele.shapeSize,
              height: ele.shapeSize,
              backgroundColor: ele.chartColor,
              borderRadius: ele.shapeSize / 2,
            },
          ]}
        />
      );
    case 'Progress Bar':
      return (
        <ValueProgressBar
          ele={ele}
          baseUrl={baseUrl}
          labelSuffix="%"
          containerStyle={localStyles.progressContainer}
          labelStyle={localStyles.progressLabel}
          trackStyle={localStyles.progressTrack}
        />
      );
    default:
      return null;
  }
}

PopupControl.propTypes = {
  ele: PropTypes.shape({
    controlType: PropTypes.string,
    shapeSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    chartColor: PropTypes.string,
  }).isRequired,
  baseUrl: PropTypes.string,
};

const Popup = React.memo(function Popup({ settings, mapIS, weather, baseUrl, onClose }) {
  if (!settings?.parametersList?.length) {
    return null;
  }

  const weatherRows = [
    { id: 'temperature', label: 'Temperature', text: formatTemperature(weather.temperature) },
    { id: 'time', label: 'Time', text: formatWeatherTime(weather.time) },
  ];

  return (
    <View style={sharedStyles.container}>
      <View style={[localStyles.popupHeader, { backgroundColor: mapIS.popupfontBgColor || '#C43E1C' }]}>
        <Text style={[sharedStyles.cellText, localStyles.popupTitle]}>{mapIS.popupText}</Text>
        <TouchableOpacity style={sharedStyles.closeview} onPress={onClose}>
          <Image source={IMAGES.close} style={[sharedStyles.close, { tintColor: COLORS.WHITE }]} />
        </TouchableOpacity>
      </View>
      {settings.parametersList
        .filter((ele) => ele.data_type_name !== 'Geospatial')
        .map((ele) => (
          <View key={ele.id} style={sharedStyles.row}>
            <Text style={sharedStyles.cellText}>{ele.global_code}:</Text>
            <View>
              <PopupControl ele={ele} baseUrl={baseUrl} />
            </View>
          </View>
        ))}
      {weatherRows.map((row) => (
        <View key={row.id} style={sharedStyles.row}>
          <Text style={sharedStyles.cellText}>{row.label}:</Text>
          <Text style={[sharedStyles.cellText, localStyles.weatherValue]}>{row.text}</Text>
        </View>
      ))}
    </View>
  );
});

Popup.propTypes = {
  settings: PropTypes.shape({ parametersList: PropTypes.array }),
  mapIS: PropTypes.shape({ popupfontBgColor: PropTypes.string, popupText: PropTypes.string }).isRequired,
  weather: PropTypes.shape({
    temperature: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    time: PropTypes.string,
  }).isRequired,
  baseUrl: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

const IconColorElement = React.memo(function IconColorElement({ ele, baseUrl }) {
  const source = useMemo(() => buildIconSource(ele), [ele]);
  const data = useParameterData(baseUrl, source, 'aggregate', ele.refreshFreq);
  const value = data?.[source?.id] ?? '';
  const rangeColor = evaluateColorRange(ele.geoSpacialColortable, value);

  return (
    <FontAwesomeIcon
      icon={fas[ele.iconIs || 'faAngleRight']}
      size={25}
      color={rangeColor === '#000' ? ele.iconColor : rangeColor}
    />
  );
});

IconColorElement.propTypes = {
  ele: PropTypes.shape({
    iconIs: PropTypes.string,
    iconColor: PropTypes.string,
    refreshFreq: PropTypes.string,
  }).isRequired,
  baseUrl: PropTypes.string,
};

function MapElement({ mapId, mapDataIs, onTouchStart, onTouchEnd }) {
  const dispatch = useDispatch();
  const { width: screenWidth } = useWindowDimensions();
  const baseUrl = useSelector((state) => state.mainSlice.baseUrlIs);
  const mapIS = mapDataIs[mapId]?.['map-colors'];
  const [locations, setLocations] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupSettings, setPopupSettings] = useState(null);
  const [weather, setWeather] = useState(DEFAULT_WEATHER);

  const resize = mapIS?.reSizeProperties;
  const containerHeight = resize?.height ? parseHeight(resize.height) : 100;
  const positionY = Number(resize?.y);

  useEffect(() => {
    dispatch(updateHeight(positionY + parseHeight(resize?.height) + 10));
  }, [positionY, resize?.height, dispatch]);

  useEffect(() => {
    let active = true;
    const details = mapIS?.locationDetails ?? [];
    Promise.all(details.map((ele) => loadLocation(baseUrl, ele))).then((result) => {
      if (active) {
        setLocations(result);
      }
    });
    return () => {
      active = false;
    };
  }, [baseUrl, mapIS?.locationDetails]);

  const { center, zoom } = useMemo(() => getBoundsCenterZoom(locations), [locations]);

  const waterColor = mapIS?.banderRowColor;
  const buildingColor = mapIS?.buildingBackgroundColor;
  const roadColor = mapIS?.bandedColumnColor;
  const boundariesColor = mapIS?.backgroundColor;
  const natureColor = mapIS?.natureColor;
  const landColor = mapIS?.headerColor;

  const layerStyles = useMemo(
    () => ({
      water: { fillColor: waterColor, fillOpacity: 0.6 },
      building: { fillExtrusionColor: buildingColor, fillExtrusionHeight: ['get', 'height'], fillExtrusionOpacity: 0.6 },
      road: { fillColor: roadColor, fillOpacity: 0.6 },
      boundaries: { lineColor: boundariesColor, lineWidth: 1 },
      nature: { fillColor: natureColor, fillOpacity: 0.1 },
      land: { backgroundColor: landColor },
    }),
    [waterColor, buildingColor, roadColor, boundariesColor, natureColor, landColor],
  );

  const handleMarkerSelect = useCallback(async (longitude, latitude, settings) => {
    setPopupSettings(settings);
    try {
      const response = await axios.get(WEATHER_URL, {
        params: { key: WEATHER_API_KEY, q: `${latitude},${longitude}`, aqi: 'yes', days: 4 },
      });
      setWeather({
        temperature: response.data.current.temp_c,
        time: response.data.location.localtime,
      });
    } catch (error) {
      setWeather(FAILED_WEATHER);
      console.error('Error fetching weather data:', error);
    } finally {
      setShowPopup(true);
    }
  }, []);

  const handleClosePopup = useCallback(() => {
    setPopupSettings(null);
    setShowPopup(false);
  }, []);

  if (!mapIS) {
    return null;
  }

  const radius = mapIS.isBorderRadius ? 10 : 1;
  const containerWidth = Math.min(scaleWidth(350), screenWidth);
  const top = scaleHeight(resize?.y ? Number(resize.y) + 5 : 10);

  return (
    <View
      style={[
        localStyles.container,
        {
          top,
          width: containerWidth,
          height: containerHeight - 80,
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
        },
      ]}
    >
      <View
        style={[
          sharedStyles.headerbox,
          {
            shadowColor: Platform.OS === 'ios' ? COLORS.ASH : '#000',
            backgroundColor: mapIS.fontBgColor,
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
          },
        ]}
      >
        <Text style={[sharedStyles.charttitle, { color: mapIS.fontColor }]}>{mapIS.mapTitle}</Text>
      </View>
      <View style={{ borderBottomLeftRadius: radius, borderBottomRightRadius: radius }}>
        <MapboxGL.MapView
          zoomEnabled
          attributionEnabled={false}
          logoEnabled={false}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={[localStyles.map, { height: containerHeight - 100 }]}
          onStartShouldSetResponder={() => true}
          styleURL={mapIS.mapType}
        >
          <MapboxGL.Camera
            centerCoordinate={center}
            animationMode="flyTo"
            animationDuration={1000}
            zoomLevel={zoom}
            pitch={mapIS.locationDetails?.length > 1 ? 30 : 80}
          />

          {locations.map((ele, index) => {
            const settings = mapIS.settingsParms?.[index];
            const select = () => handleMarkerSelect(ele.location.lon, ele.location.lat, settings);
            return (
              <MapboxGL.PointAnnotation
                key={`marker-${ele.id}`}
                id={`marker-${ele.id}`}
                coordinate={[Number.parseFloat(ele.location.lon), Number.parseFloat(ele.location.lat)]}
                onSelected={select}
              >
                <View style={localStyles.marker}>
                  <TouchableWithoutFeedback onPress={select}>
                    <IconColorElement ele={ele} baseUrl={baseUrl} />
                  </TouchableWithoutFeedback>
                </View>
              </MapboxGL.PointAnnotation>
            );
          })}

          {waterColor !== undefined && <MapboxGL.FillLayer id="custom-water-layer" style={layerStyles.water} />}
          {buildingColor !== undefined && (
            <MapboxGL.FillExtrusionLayer id="building3d" sourceLayerID="building" style={layerStyles.building} />
          )}
          {roadColor !== undefined && (
            <MapboxGL.FillLayer id="roadFillColor" sourceLayerID="road" style={layerStyles.road} />
          )}
          {boundariesColor !== undefined && (
            <MapboxGL.LineLayer id="boundaries" sourceLayerID="admin" style={layerStyles.boundaries} />
          )}
          {natureColor !== undefined && (
            <MapboxGL.FillLayer id="nature" sourceLayerID="landcover" style={layerStyles.nature} />
          )}
          {mapIS.mapType !== 'mapbox://styles/mapbox/satellite-v9' && landColor !== undefined && (
            <MapboxGL.FillLayer id="custom" sourceLayerID="admin" style={layerStyles.land} />
          )}
        </MapboxGL.MapView>

        {showPopup ? (
          <View style={localStyles.popupWrapper}>
            <View style={sharedStyles.modalContainer}>
              <Popup
                settings={popupSettings}
                mapIS={mapIS}
                weather={weather}
                baseUrl={baseUrl}
                onClose={handleClosePopup}
              />
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

MapElement.propTypes = {
  mapId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  mapDataIs: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  onTouchStart: PropTypes.func,
  onTouchEnd: PropTypes.func,
};

MapElement.defaultProps = {
  onTouchStart: undefined,
  onTouchEnd: undefined,
};

export default React.memo(MapElement);

const localStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    maxWidth: '100%',
    backgroundColor: COLORS.WHITE,
  },
  map: {
    borderRadius: 30,
  },
  marker: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupWrapper: {
    position: 'absolute',
    top: 30,
    alignSelf: 'center',
    maxWidth: '100%',
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 30,
    alignItems: 'center',
  },
  popupTitle: {
    textAlign: 'center',
    color: COLORS.WHITE,
  },
  weatherValue: {
    fontSize: normalizeFont(14),
    marginLeft: 10,
    fontWeight: '400',
  },
  chartWrapper: {
    height: scaleHeight(40),
    width: scaleWidth(100),
    marginLeft: scaleWidth(15),
  },
  chart: {
    height: scaleHeight(40),
    width: scaleWidth(100),
  },
  numericWrapper: {
    height: 30,
    width: 100,
    left: 15,
    top: 1,
  },
  numericText: {
    margin: 5,
    fontFamily: FONTS.SEGOEUISEMIBOLD,
  },
  shapeMargin: {
    marginLeft: scaleWidth(15),
  },
  progressContainer: {
    marginLeft: scaleWidth(25),
  },
  progressLabel: {
    color: '#fff',
    position: 'absolute',
    zIndex: 1,
    height: 20,
    fontSize: 10,
    left: 20,
    fontFamily: FONTS.SEGOEUISEMIBOLD,
  },
  progressTrack: {
    width: scaleWidth(100),
    height: 12,
    backgroundColor: '#808080',
    borderRadius: 5,
  },
});