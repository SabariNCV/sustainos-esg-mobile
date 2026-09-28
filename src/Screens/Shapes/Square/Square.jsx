import React, { useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, PixelRatio, TouchableOpacity, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import PropTypes from 'prop-types';
import { SCALERS, resolveShapeStyles } from '../shapeUtils';
import { useShapeColor } from '../useShapeColor';

function Square({ id, squareStylesIs, tabShape = false, type }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const squareStyles = resolveShapeStyles(squareStylesIs, id, tabShape);
  const backgroundColor = useShapeColor(squareStyles);
  const isPanel = type === 'panel';
  const scalers = isPanel ? SCALERS.panel : SCALERS.default;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const position = useMemo(() => {
    const x = PixelRatio.roundToNearestPixel(Number(squareStyles?.position?.x));
    const y = PixelRatio.roundToNearestPixel(Number(squareStyles?.position?.y));
    return {
      top: scalers.height(y),
      left: scalers.width(isPanel ? x : x - 5),
      width: scalers.width(squareStyles?.width),
      height: scalers.height(squareStyles?.height),
    };
  }, [squareStyles?.position, squareStyles?.width, squareStyles?.height, scalers, isPanel]);

  const html = useMemo(
    () => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; }
          .rectangle {
            width: 100%;
            height: 100%;
            background-color: ${backgroundColor};
            clip-path: ${squareStyles?.clipPath};
            border-radius: ${squareStyles?.borderRadius * 2.5}px;
          }
        </style>
      </head>
      <body>
        <div class="rectangle"></div>
      </body>
      </html>
    `,
    [backgroundColor, squareStyles?.clipPath, squareStyles?.borderRadius]
  );

  if (!squareStyles?.position || !squareStyles?.width || !squareStyles?.height) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.animatedView,
        { transform: [{ scale: scaleAnim }] },
        isPanel && { zIndex: squareStyles.chartZindex },
      ]}
    >
      <TouchableOpacity disabled>
        {squareStyles.clipPath ? (
          <View style={[styles.shape, position, styles.transparent, { zIndex: squareStyles.chartZindex }]}>
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
              { backgroundColor, borderRadius: Number(squareStyles?.borderRadius) },
            ]}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

Square.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  squareStylesIs: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  tabShape: PropTypes.bool,
  type: PropTypes.string,
};

const styles = StyleSheet.create({
  animatedView: {
    position: 'absolute',
  },
  shape: {
    position: 'absolute',
    overflow: 'hidden',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  webView: {
    backgroundColor: 'transparent',
    flex: 1,
  },
});

export default Square;