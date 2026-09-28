import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import PropTypes from 'prop-types';
import { scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import { panelscaleHeight, panelscaleWidth } from '../../../Constants/panelSize';
import { getShapeData, roundPx, clampHorizontal, hasRequiredLayout, } from '../../../Components/shapeUtils';

function Line({ id, lineStylesIs, tabShape, type }) {
  const { width: screenWidth } = useWindowDimensions();
  const isPanel = type === 'panel';
  const shape = getShapeData(lineStylesIs, id, tabShape);

  const lineStyle = useMemo(() => {
    if (!hasRequiredLayout(shape)) {
      return null;
    }
    const scaleX = isPanel ? panelscaleWidth : scaleWidth;
    const scaleY = isPanel ? panelscaleHeight : scaleHeight;
    const layout = clampHorizontal(
      {
        top: scaleY(roundPx(shape.position.y)),
        left: scaleX(roundPx(Number(shape.position.x) - 5)),
        width: scaleX(shape.width),
        height: scaleY(shape.height),
      },
      screenWidth,
      shape.rotation,
    );
    return {
      ...layout,
      transform: [{ rotate: `${shape.rotation}deg` }],
      backgroundColor: shape.SquareBg,
      zIndex: shape.chartZindex,
    };
  }, [shape, isPanel, screenWidth]);

  if (!lineStyle) {
    return null;
  }

  return <View style={[styles.line, lineStyle]} pointerEvents="none" />;
}

Line.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  lineStylesIs: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  tabShape: PropTypes.bool,
  type: PropTypes.string,
};

Line.defaultProps = {
  tabShape: false,
  type: undefined,
};

export default React.memo(Line);

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    flex: 0,
  },
});