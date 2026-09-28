import React from 'react';
import { View, PixelRatio, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { SCALERS, hasRequiredStyles, resolveShapeStyles } from '../shapeUtils';

function Line({ id, lineStylesIs, tabShape = false, type }) {
  const lineStyles = resolveShapeStyles(lineStylesIs, id, tabShape);

  if (!hasRequiredStyles(lineStyles)) {
    return null;
  }

  const scalers = type === 'panel' ? SCALERS.panel : SCALERS.default;
  const { position, width, height, rotation, SquareBg, chartZindex } = lineStyles;

  return (
    <View
      style={[
        styles.line,
        {
          top: scalers.height(PixelRatio.roundToNearestPixel(Number(position.y))),
          left: scalers.width(PixelRatio.roundToNearestPixel(Number(position.x - 5))),
          width: scalers.width(width),
          height: scalers.height(height),
          transform: [{ rotate: `${rotation}deg` }],
          backgroundColor: SquareBg,
          zIndex: chartZindex,
        },
      ]}
    />
  );
}

Line.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  lineStylesIs: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  tabShape: PropTypes.bool,
  type: PropTypes.string,
};

const styles = StyleSheet.create({
  line: {
    flex: 0,
    position: 'absolute',
    alignSelf: 'center',
  },
});

export default Line;