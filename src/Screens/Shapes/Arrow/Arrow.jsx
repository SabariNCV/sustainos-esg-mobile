import React, { useMemo } from 'react';
import { View, PixelRatio, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import PropTypes from 'prop-types';
import { scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import { hasRequiredStyles, resolveShapeStyles } from '../shapeUtils';

const ARROW_CLIP_PATH = 'polygon(0 39%, 74% 38%, 74% 0, 100% 50%, 73% 97%, 74% 58%, 0 59%)';

function Arrow({ id, arrowStylesIs, tabShape = false }) {
  const arrowStyles = resolveShapeStyles(arrowStylesIs, id, tabShape);
  const { width, height, SquareBg } = arrowStyles ?? {};

  const html = useMemo(
    () => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .arrow {
            width: ${scaleWidth(width)}px;
            height: ${scaleHeight(height)}px;
            clip-path: ${ARROW_CLIP_PATH};
            background-color: ${SquareBg};
            display: flex;
            justify-content: center;
            align-items: center;
          }
        </style>
      </head>
      <body>
        <div class="arrow"></div>
      </body>
      </html>
    `,
    [width, height, SquareBg]
  );

  if (!hasRequiredStyles(arrowStyles)) {
    return null;
  }

  const { position, rotation } = arrowStyles;

  return (
    <TouchableOpacity disabled>
      <View
        style={[
          styles.arrowContainer,
          {
            top: scaleHeight(PixelRatio.roundToNearestPixel(Number(position.y))),
            left: scaleWidth(PixelRatio.roundToNearestPixel(Number(position.x - 5))),
            width: scaleWidth(width),
            height: scaleHeight(height),
            transform: [{ rotate: `${rotation}deg` }],
          },
        ]}
      >
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
    </TouchableOpacity>
  );
}

Arrow.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  arrowStylesIs: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  tabShape: PropTypes.bool,
};

const styles = StyleSheet.create({
  arrowContainer: {
    position: 'absolute',
  },
  webView: {
    backgroundColor: 'transparent',
    flex: 1,
  },
});

export default Arrow;