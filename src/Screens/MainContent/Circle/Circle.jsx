import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import { useShapeValue } from '../../../Components/useShapeValue';
import { getShapeData, resolveShapeColor, roundPx, clampHorizontal, hasRequiredLayout, } from '../../../Components/shapeUtils';

const EVENTS_PAGE_NAME = ' > Events';

function Circle({ id, circleStylesIs, tabShape, pageName }) {
  const baseUrl = useSelector((state) => state.mainSlice.baseUrlIs);
  const { width: screenWidth } = useWindowDimensions();

  const shape = getShapeData(circleStylesIs, id, tabShape);
  const shapeValue = useShapeValue(shape, baseUrl, pageName === EVENTS_PAGE_NAME);

  const fillColor = useMemo(
    () => resolveShapeColor(shapeValue, shape?.shapeValueRange, shape?.SquareBg),
    [shapeValue, shape?.shapeValueRange, shape?.SquareBg],
  );

  const layout = useMemo(() => {
    if (!hasRequiredLayout(shape)) {
      return null;
    }
    return clampHorizontal(
      {
        top: scaleHeight(roundPx(shape.position.y)),
        left: scaleWidth(roundPx(shape.position.x)),
        width: scaleWidth(shape.width),
        height: scaleHeight(shape.height),
      },
      screenWidth,
    );
  }, [shape, screenWidth]);

  if (!layout) {
    return null;
  }

  return (
    <View
      style={[styles.container, layout, { zIndex: shape.chartZindex }]}
      pointerEvents="none"
    >
      <Svg width={layout.width} height={layout.height}>
        <Ellipse
          cx={layout.width / 2}
          cy={layout.height / 2}
          rx={layout.width / 2.01}
          ry={layout.height / 2.02}
          fill={fillColor}
        />
      </Svg>
    </View>
  );
}

Circle.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  circleStylesIs: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  tabShape: PropTypes.bool,
  pageName: PropTypes.string,
};

Circle.defaultProps = {
  tabShape: false,
  pageName: '',
};

export default React.memo(Circle);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});