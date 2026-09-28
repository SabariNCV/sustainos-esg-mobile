import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import { useShapeValue } from '../../../Components/useShapeValue';
import { getShapeData, resolveShapeColor, roundPx, clampHorizontal, hasRequiredLayout, } from '../../../Components/shapeUtils';

function Triangle({ id, triangleStylesIs, tabShape }) {
  const baseUrl = useSelector((state) => state.mainSlice.baseUrlIs);
  const { width: screenWidth } = useWindowDimensions();

  const shape = getShapeData(triangleStylesIs, id, tabShape);
  const shapeValue = useShapeValue(shape, baseUrl);

  const fillColor = useMemo(
    () => resolveShapeColor(shapeValue, shape?.shapeValueRange, shape?.SquareBg),
    [shapeValue, shape?.shapeValueRange, shape?.SquareBg],
  );

  const triangleStyle = useMemo(() => {
    if (!hasRequiredLayout(shape)) {
      return null;
    }
    const { left, width } = clampHorizontal(
      {
        left: scaleWidth(roundPx(shape.position.x)),
        width: Number(shape.width),
      },
      screenWidth,
      shape.rotation,
    );
    return {
      top: scaleHeight(roundPx(shape.position.y)),
      left,
      transform: [{ rotate: `${shape.rotation}deg` }],
      borderLeftWidth: width / 2,
      borderRightWidth: width / 2,
      borderBottomWidth: Number(shape.height) / 1.1,
      borderBottomColor: fillColor,
    };
  }, [shape, fillColor, screenWidth]);

  if (!triangleStyle) {
    return null;
  }

  return <View style={[styles.triangle, triangleStyle]} pointerEvents="none" />;
}

Triangle.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  triangleStylesIs: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  tabShape: PropTypes.bool,
};

Triangle.defaultProps = {
  tabShape: false,
};

export default React.memo(Triangle);

const styles = StyleSheet.create({
  triangle: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});