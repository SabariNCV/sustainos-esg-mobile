import React from 'react';
import { View, PixelRatio, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import { hasRequiredStyles, resolveShapeStyles } from '../shapeUtils';
import { useShapeColor } from '../useShapeColor';

function Triangle({ id, triangleStylesIs, tabShape = false }) {
  const triangleStyles = resolveShapeStyles(triangleStylesIs, id, tabShape);
  const fillColor = useShapeColor(triangleStyles);

  if (!hasRequiredStyles(triangleStyles)) {
    return null;
  }

  const { position, width, height, rotation } = triangleStyles;

  return (
    <View
      style={[
        styles.triangle,
        {
          top: scaleHeight(PixelRatio.roundToNearestPixel(Number(position.y))),
          left: scaleWidth(PixelRatio.roundToNearestPixel(Number(position.x))),
          transform: [{ rotate: `${rotation}deg` }],
          borderLeftWidth: width / 2,
          borderRightWidth: width / 2,
          borderBottomWidth: height / 1.1,
          borderBottomColor: fillColor,
        },
      ]}
    />
  );
}

Triangle.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  triangleStylesIs: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  tabShape: PropTypes.bool,
};

const styles = StyleSheet.create({
  triangle: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

export default Triangle;