import React, { useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import { panelscaleHeight, panelscaleWidth } from '../../../Constants/panelSize';
import { useShapeValue } from '../../../Components/useShapeValue';
import { getShapeData, resolveShapeColor, roundPx, clampHorizontal, hasRequiredLayout, } from '../../../Components/shapeUtils';

const buildHtml = (color, clipPath, borderRadius) => `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
body { margin: 0; }
.rectangle {
  width: 100%;
  height: 100%;
  background-color: ${color};
  clip-path: ${clipPath};
  border-radius: ${Number(borderRadius || 0) * 2.5}px;
}
</style>
</head>
<body>
<div class="rectangle"></div>
</body>
</html>`;

function Square({ id, squareStylesIs, tabShape, type }) {
  const baseUrl = useSelector((state) => state.mainSlice.baseUrlIs);
  const { width: screenWidth } = useWindowDimensions();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const isPanel = type === 'panel';

  const shape = getShapeData(squareStylesIs, id, tabShape);
  const shapeValue = useShapeValue(shape, baseUrl);

  const fillColor = useMemo(
    () => resolveShapeColor(shapeValue, shape?.shapeValueRange, shape?.SquareBg),
    [shapeValue, shape?.shapeValueRange, shape?.SquareBg],
  );

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const position = useMemo(() => {
    if (!hasRequiredLayout(shape, false)) {
      return null;
    }
    const scaleX = isPanel ? panelscaleWidth : scaleWidth;
    const scaleY = isPanel ? panelscaleHeight : scaleHeight;
    const offsetX = isPanel ? 0 : 5;
    return clampHorizontal(
      {
        top: scaleY(roundPx(shape.position.y)),
        left: scaleX(roundPx(shape.position.x) - offsetX),
        width: scaleX(shape.width),
        height: scaleY(shape.height),
      },
      screenWidth,
    );
  }, [shape, isPanel, screenWidth]);

  const html = useMemo(
    () => buildHtml(fillColor, shape?.clipPath, shape?.borderRadius),
    [fillColor, shape?.clipPath, shape?.borderRadius],
  );

  if (!position) {
    return null;
  }

  const containerStyle = [
    styles.animatedView,
    { transform: [{ scale: scaleAnim }] },
    isPanel ? { zIndex: shape.chartZindex } : null,
  ];

  return (
    <Animated.View style={containerStyle} pointerEvents="none">
      {shape.clipPath ? (
        <View style={[styles.shape, position, { zIndex: shape.chartZindex }]}>
          <WebView
            originWhitelist={['*']}
            source={{ html }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            style={styles.webView}
            scrollEnabled={false}
            scalesPageToFit={false}
          />
        </View>
      ) : (
        <View
          style={[
            styles.shape,
            position,
            { backgroundColor: fillColor, borderRadius: Number(shape.borderRadius) },
          ]}
        />
      )}
    </Animated.View>
  );
}

Square.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  squareStylesIs: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  tabShape: PropTypes.bool,
  type: PropTypes.string,
};

Square.defaultProps = {
  tabShape: false,
  type: undefined,
};

export default React.memo(Square);

const styles = StyleSheet.create({
  animatedView: {
    position: 'absolute',
  },
  shape: {
    position: 'absolute',
    overflow: 'hidden',
  },
  webView: {
    backgroundColor: 'transparent',
    flex: 1,
  },
});