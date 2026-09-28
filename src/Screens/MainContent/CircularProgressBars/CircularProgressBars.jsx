import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import * as Progress from 'react-native-progress';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { scaleWidth, scaleHeight } from '../../../Constants/dynamicSize';
import { panelscaleHeight, panelscaleWidth } from '../../../Constants/panelSize';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { COLORS } from '../../../Constants/Colors';
import { useShapeValue } from '../../../Components/useShapeValue';
import { getShapeData, resolveShapeColor, clampHorizontal, calculateProgress, } from '../../../Components/shapeUtils';

const CircularProgressBars = ({ progressStylesIs, id, type }) => {
  const dispatch = useDispatch();
  const baseUrl = useSelector((state) => state.mainSlice.baseUrlIs);
  const { width: screenWidth } = useWindowDimensions();
  const isPanel = type === 'panel';

  const shape = getShapeData(progressStylesIs, id, false);
  const isDynamic = shape.shapeType === 'dynamic' && shape.parameters.length > 0;
  const dynamicValue = useShapeValue(shape, baseUrl);

  const positionY = Number(shape.position?.y);
  const shapeHeight = Number(shape.height);

  useEffect(() => {
    dispatch(updateHeight(positionY + shapeHeight));
  }, [positionY, shapeHeight, ]);

  const color = useMemo(
    () => resolveShapeColor(dynamicValue, shape.labelValueRange, shape.progressColor),
    [dynamicValue, shape.labelValueRange, shape.progressColor],
  );

  const progress = useMemo(() => {
    const value = Number.parseFloat(isDynamic ? dynamicValue : shape.staticValue);
    const min = Number.parseInt(shape.minValue, 10);
    const max = Number.parseInt(shape.maxValue, 10);
    return calculateProgress(value, min, max);
  }, [isDynamic, dynamicValue, shape.staticValue, shape.minValue, shape.maxValue]);

  const layout = useMemo(() => {
    const scaleX = isPanel ? panelscaleWidth : scaleWidth;
    const scaleY = isPanel ? panelscaleHeight : scaleHeight;
    const x = Number(shape.position?.x);
    const y = Number(shape.position?.y);
    return clampHorizontal(
      {
        left: isPanel ? scaleX(x - 5) : scaleX(x),
        top: isPanel ? scaleY(y + 5) : scaleY(y),
        width: scaleX(shape.width),
        height: scaleY(shape.height),
      },
      screenWidth,
    );
  }, [shape.position?.x, shape.position?.y, shape.width, shape.height, isPanel, screenWidth]);

  return (
    <View style={[styles.container, { left: layout.left, top: layout.top }]}>
      {shape.progressBarType === 'Circular' ? (
        <Progress.Circle
          size={layout.width}
          progress={progress / 100}
          color={color}
          borderWidth={1}
        />
      ) : (
        <Progress.Bar
          width={layout.width}
          height={layout.height}
          progress={progress / 100}
          color={color}
          borderWidth={0.6}
          borderColor={COLORS.DIVIDER}
        />
      )}
    </View>
  );
};

CircularProgressBars.propTypes = {
  progressStylesIs: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  type: PropTypes.string,
};

CircularProgressBars.defaultProps = {
  type: undefined,
};

export default React.memo(CircularProgressBars);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});