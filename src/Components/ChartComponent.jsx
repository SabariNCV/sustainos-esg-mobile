import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, Platform, ActivityIndicator, Animated, TouchableOpacity, ImageBackground } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { fas } from '@fortawesome/pro-solid-svg-icons';
import { chartStyles as styles } from './styles';
import CustomPlotly from './CustomPlotly';
import { scaleHeight, scaleWidth, normalizeFont } from '../Constants/dynamicSize';
import { COLORS } from '../Constants/Colors';
import { IMAGES } from '../Constants/Images';
import { panelscaleHeight, panelscaleWidth, panelnormalizeFont } from '../Constants/panelSize';
import ViewShot, { captureRef } from "react-native-view-shot";
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const SHADOW_COLOR = Platform.OS === 'ios' ? COLORS.ASH : '#000';
const BORDER_COLOR = '#D3D3D3';

const getRadius = (isBorderRadius) => (isBorderRadius ? 10 : 1);

const parseHeight = (value) => {
  if (typeof value === 'string') {
    return value.includes('px') ? Number.parseFloat(value.replace('px', '')) : Number.parseFloat(value);
  }
  return value;
};

const sanitizeAiText = (raw) => {
  if (!raw || typeof raw !== 'string') return '';

  let text = raw;
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');
  text = text
    .split('\n')
    .map((line) => line.replace(/^\s*\/\/.*$/, ''))
    .join('\n');
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  return text;
};

const getAnimatedWrapperHeight = (rnd, screen, type) => {
  if (screen === 'analytics') return 200;
  return type === 'panel'
    ? panelscaleHeight(parseHeight(rnd?.height))
    : scaleHeight(parseHeight(rnd?.height));
};

const getPanelBodyHeight = (rndHeight, screen, type) => {
  if (screen === 'analytics') return 200;
  return type === 'panel'
    ? panelscaleHeight(parseHeight(rndHeight) - 40)
    : scaleHeight(parseHeight(rndHeight) - 40);
};

const getPlotHeight = (rndHeight, type) => {
  if (!rndHeight) return 200;
  return type === 'panel'
    ? panelscaleHeight(parseHeight(rndHeight) - 60)
    : scaleHeight(parseHeight(rndHeight) - 60);
};

const getInsightsBoxHeight = (rndHeight, screen, type) => {
  if (screen === 'analytics') return scaleHeight(200);
  return type === 'panel'
    ? panelscaleHeight(parseHeight(rndHeight))
    : scaleHeight(parseHeight(rndHeight));
};

const getInsightsBgHeight = (rndHeight, screen, type) => {
  if (screen === 'analytics') return 200;
  return type === 'panel'
    ? panelscaleHeight(parseHeight(rndHeight) - 80)
    : scaleHeight(parseHeight(rndHeight));
};

const ChartLoader = ({ radius }) => (
  <View
    style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.WHITE,
      borderBottomRightRadius: radius,
      borderBottomLeftRadius: radius,
    }}
  >
    <ActivityIndicator size="small" color={COLORS.HEADER} />
  </View>
);

const ChartPlot = ({ traces, layout, height, radius }) => (
  <View style={{ height, backgroundColor: COLORS.WHITE }}>
    <CustomPlotly
      data={traces}
      layout={{ ...layout, hovermode: 'closest' }}
      style={{
        height,
        borderBottomRightRadius: radius,
        borderBottomLeftRadius: radius,
      }}
    />
  </View>
);

const InsightsPanel = ({ visible, loading, text, onClose, boxHeight, bgHeight }) => {
  if (!visible) return null;

  return (
    <View style={[styles.Modalbox, { borderTopLeftRadius: 10, borderTopRightRadius: 10, height: boxHeight }]}>
      <ImageBackground
        source={IMAGES.BgChartImage}
        style={[styles.backgroundImage, { height: bgHeight }]}
        resizeMode="contain"
      >
      <View style={styles.insightView}>
        <Text style={styles.insights}>Insights</Text>
        <TouchableOpacity
          onPress={onClose}
          style={{ justifyContent: 'center' }}
        >
          <FontAwesomeIcon
            icon={faXmark}
            size={16}
            color={COLORS.WHITE}
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
      </View>
      
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.HEADER} />
          </View>
        ) : (
          <Text style={[styles.charttitle, { letterSpacing: 0.6, fontSize: normalizeFont(12),marginHorizontal: 20 }]}>{text}</Text>
        )}
      </ImageBackground>
    </View>
  );
};

const ChartComponent = (props) => {
  const { onAIPress, onZoom } = props;
  const type = props?.type;
  const screen = props?.screen;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const currentPlotlyRef = useRef(null);
  const plotlyRef = useRef(null);
  const ref = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const radius = getRadius(props?.ChartColors?.isBorderRadius);
  const rndproperties = props?.layout?.rndproperties;

  const cleanedAiText = useMemo(() => sanitizeAiText(props?.aiText), [props?.aiText]);

  const handleImage = useCallback(async () => {
    const willOpen = !showModal;
    setShowModal(willOpen);

    if (!willOpen) return;

    setAiLoading(true);
    try {
      const base64 = await captureRef(ref, {
        format: 'png',
        quality: 0.8,
        result: 'base64'
      });
      const imageUri = `data:image/png;base64,${base64}`;
      onAIPress(imageUri);
    } catch (error) {
      console.error(error);
      setAiLoading(false);
    }
  }, [showModal, onAIPress]);

  const closeInsights = useCallback(() => setShowModal(false), []);

  const handleZoom = useCallback((eventData) => {
    if (typeof onZoom === 'function') {
      onZoom(eventData);
    }
  }, [onZoom]);

  useEffect(() => {
    if (showModal && props?.aiText !== '' && props?.aiText !== undefined && props?.aiText !== null) {
      setAiLoading(false);
    }
  }, [props?.aiText, showModal]);

  useEffect(() => {
    currentPlotlyRef.current = plotlyRef.current;
    const animation = Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    });

    animation.start();

    const plotlyInstance = plotlyRef.current;
    if (plotlyInstance) {
      plotlyInstance.on('relayout', handleZoom);
    }

    return () => {
      if (plotlyInstance) {
        plotlyInstance.removeListener('relayout', handleZoom);
      }

      scaleAnim.stopAnimation(() => {
        Animated.spring(scaleAnim, {
          toValue: 0,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
        }).start();
      });
    };
  }, [handleZoom, scaleAnim]);

  const containerStyle = useMemo(() => ({
    height: screen === 'analytics' ? scaleHeight(400) : type === 'panel' ? panelscaleHeight(225) : scaleHeight(225),
    position: screen === 'analytics' ? 'relative' : 'absolute',
    alignSelf: 'center',
    width: type === 'panel' ? panelscaleWidth(350) : scaleWidth(350)
  }), [screen, type]);

  const chartBoxStyle = useMemo(() => ({
    alignSelf: 'flex-start',
    justifyContent: 'center',
    width: scaleWidth(350),
    height: 200,
    marginTop: scaleHeight(100),
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    borderColor: BORDER_COLOR,
    borderBottomLeftRadius: radius,
    borderBottomRightRadius: radius,
    backgroundColor: props?.ChartColors?.areaBackground ? props?.ChartColors?.areaBackground : COLORS.WHITE,
  }), [radius, props?.ChartColors?.areaBackground]);

  const animatedWrapperStyle = useMemo(() => {
    if (!rndproperties) return null;
    const height = getAnimatedWrapperHeight(rndproperties, screen, type);
    const positionStyle = rndproperties.y
      ? { top: type === 'panel' ? panelscaleHeight(Number(rndproperties.y)) : scaleHeight(Number(rndproperties.y)) }
      : { marginTop: type === 'panel' ? panelscaleHeight(10) : scaleHeight(10) };
    const leftStyle = type === 'panel' ? { left: panelscaleWidth(Number(rndproperties.x + 300)) } : {};

    return {
      transform: [{ scale: scaleAnim }],
      height,
      ...positionStyle,
      ...leftStyle,
    };
  }, [rndproperties, screen, type, scaleAnim]);

  const panelBoxStyle = useMemo(() => ({
    alignSelf: 'flex-start',
    justifyContent: 'center',
    width: type === 'panel' ? panelscaleWidth(350) : scaleWidth(350),
    height: getPanelBodyHeight(rndproperties?.height, screen, type),
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    borderColor: BORDER_COLOR,
    borderBottomLeftRadius: radius,
    borderBottomRightRadius: radius,
    backgroundColor: props?.ChartColors?.areaBackground ? props?.ChartColors?.areaBackground : COLORS.WHITE,
  }), [type, screen, rndproperties?.height, radius, props?.ChartColors?.areaBackground]);

  const plotHeight = getPlotHeight(rndproperties?.height, type);
  const insightsBoxHeight = getInsightsBoxHeight(rndproperties?.height, screen, type);
  const insightsBgHeight = getInsightsBgHeight(rndproperties?.height, screen, type);

  return (
    <View style={containerStyle}>
      {screen === 'analytics' ? (
        <ViewShot ref={ref} options={{ fileName: 'Your-File-Name', format: 'jpg', quality: 0.9 }} pointerEvents="box-none">
          <View style={chartBoxStyle}>
            {props?.loading ? (
              <ChartLoader radius={radius} />
            ) : (
              <ChartPlot traces={props?.tracesIs} layout={props?.layout} height={200} radius={radius} />
            )}
          </View>
        </ViewShot>
      ) : (
        rndproperties && (
          <Animated.View style={animatedWrapperStyle}>
            {props?.showtitle && (
              <View
                style={[
                  styles.headerbox,
                  {
                    shadowColor: SHADOW_COLOR,
                    backgroundColor: props?.layout.fontBgColor,
                    borderTopLeftRadius: radius,
                    borderTopRightRadius: radius,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent:'space-between',
                    paddingHorizontal: 10
                  },
                ]}
              >
                <Text
                  style={[
                    styles.charttitle,
                    {
                      width: type === 'panel' ? panelscaleWidth(240) : scaleWidth(275),
                      fontSize: type === 'panel' ? panelnormalizeFont(16) : normalizeFont(14),
                      color: props?.layout.fontColor
                    }
                  ]}
                >
                  {props?.ChartColors?.chartTitle}
                </Text>

                <TouchableOpacity
                  onPress={handleImage}
                  style={{ marginLeft: 20, height: (40), justifyContent: 'center' }}
                >
                  <FontAwesomeIcon
                    icon={fas.faMicrochipAi}
                    size={16}
                    color={COLORS.WHITE}
                    style={{ marginLeft: 10, backgroundColor: COLORS.NEW_HEADER }}
                  />
                </TouchableOpacity>
              </View>
            )}

            <ViewShot ref={ref} options={{ fileName: 'Your-File-Name', format: 'jpg', quality: 0.9 }} pointerEvents="box-none">
              <View style={panelBoxStyle}>
                {props?.loading ? (
                  <ChartLoader radius={radius} />
                ) : (
                  <ChartPlot traces={props?.tracesIs} layout={props?.layout} height={plotHeight} radius={radius} />
                )}
              </View>
            </ViewShot>

            <InsightsPanel
              visible={showModal}
              loading={aiLoading}
              text={cleanedAiText}
              onClose={closeInsights}
              boxHeight={insightsBoxHeight}
              bgHeight={insightsBgHeight}
            />
          </Animated.View>
        )
      )}
    </View>
  );
};

export default ChartComponent;