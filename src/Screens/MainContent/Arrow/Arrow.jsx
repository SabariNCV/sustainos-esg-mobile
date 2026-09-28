import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import PropTypes from 'prop-types';
import { scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import { getShapeData, roundPx, clampHorizontal, hasRequiredLayout, } from '../../../Components/shapeUtils';

const ARROW_CLIP_PATH = 'polygon(0 39%, 74% 38%, 74% 0, 100% 50%, 73% 97%, 74% 58%, 0 59%)';

const buildHtml = (color) => `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
html, body { margin: 0; width: 100%; height: 100%; }
.arrow {
  width: 100%;
  height: 100%;
  clip-path: ${ARROW_CLIP_PATH};
  background-color: ${color};
}
</style>
</head>
<body>
<div class="arrow"></div>
</body>
</html>`;

function Arrow({ id, arrowStylesIs, tabShape }) {
  const { width: screenWidth } = useWindowDimensions();
  const shape = getShapeData(arrowStylesIs, id, tabShape);

  const html = useMemo(() => buildHtml(shape?.SquareBg), [shape?.SquareBg]);

  const containerStyle = useMemo(() => {
    if (!hasRequiredLayout(shape)) {
      return null;
    }
    const layout = clampHorizontal(
      {
        top: scaleHeight(roundPx(shape.position.y)),
        left: scaleWidth(roundPx(Number(shape.position.x) - 5)),
        width: scaleWidth(shape.width),
        height: scaleHeight(shape.height),
      },
      screenWidth,
      shape.rotation,
    );
    return { ...layout, transform: [{ rotate: `${shape.rotation}deg` }] };
  }, [shape, screenWidth]);

  if (!containerStyle) {
    return null;
  }

  return (
    <View style={[styles.arrowContainer, containerStyle]} pointerEvents="none">
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
  );
}

Arrow.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  arrowStylesIs: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  tabShape: PropTypes.bool,
};

Arrow.defaultProps = {
  tabShape: false,
};

export default React.memo(Arrow);

const styles = StyleSheet.create({
  arrowContainer: {
    position: 'absolute',
  },
  webView: {
    backgroundColor: 'transparent',
    flex: 1,
  },
});