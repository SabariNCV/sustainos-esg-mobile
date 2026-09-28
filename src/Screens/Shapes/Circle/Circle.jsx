import React from 'react';
import { View, PixelRatio, StyleSheet } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import PropTypes from 'prop-types';
import { scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import { hasRequiredStyles, resolveShapeStyles } from '../shapeUtils';
import { useShapeColor } from '../useShapeColor';

const EVENTS_PAGE_NAME = ' > Events';

function Circle({ id, circleStylesIs, tabShape = false, projectDetails }) {
  const circleStyles = resolveShapeStyles(circleStylesIs, id, tabShape);
  const fillColor = useShapeColor(circleStyles, projectDetails?.PageName === EVENTS_PAGE_NAME);

  if (!hasRequiredStyles(circleStyles)) {
    return null;
  }

  const { position, width, height } = circleStyles;

  return (
    <View
      style={[
        styles.container,
        {
          top: scaleHeight(PixelRatio.roundToNearestPixel(Number(position.y))),
          left: scaleWidth(PixelRatio.roundToNearestPixel(Number(position.x))),
          width: scaleWidth(width),
          height: scaleHeight(height),
        },
      ]}
    >
      <Svg height={scaleHeight(height)} width={scaleWidth(width)}>
        <Ellipse
          cx={scaleWidth(width / 2)}
          cy={scaleHeight(height / 2)}
          rx={scaleWidth(width / 2.01)}
          ry={scaleHeight(height / 2.02)}
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
  projectDetails: PropTypes.shape({ PageName: PropTypes.string }),
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
});

export default Circle;