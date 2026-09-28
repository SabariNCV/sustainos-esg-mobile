import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { FONTS } from '../../../Constants/Fonts';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { parseFontSize } from '../../../Components/elementUtils';
import { getScalers } from '../../../Components/scalers';
import { useShapeValue } from '../../../Components/useShapeValue';
import { buildEventRange, roundPx, fitTextBox } from '../../../Components/shapeUtils';

const DEFAULT_FONT_SIZE = 10;

const reduceFontSize = (size, reduceBy = 1) => {
  const reduced = size - reduceBy;
  return reduced > 0 ? reduced : size;
};

const resolveLabelText = (labelIS, value) => {
  if (labelIS.parameters?.length > 0) {
    return value === '' ? '!!' : String(value);
  }
  return labelIS.labelTitle || '??';
};

function Label({ labelId, labelDataIs, type }) {
  const dispatch = useDispatch();
  const { width: screenWidth } = useWindowDimensions();
  const labelIS = labelDataIs[labelId]?.['label-colors'];
  const baseUrl = useSelector((state) => state.mainSlice.baseUrlIs);
  const pageName = useSelector((state) => state.authSlice.userDetails?.PageName);
  const eventDates = useSelector((state) => state.mainSlice.eventDate);
  const isEventsPage = pageName === 'Events';

  const eventRange = useMemo(
    () => (isEventsPage ? buildEventRange(eventDates) : null),
    [isEventsPage, eventDates],
  );
  const labelValue = useShapeValue(labelIS, baseUrl, isEventsPage, eventRange);
  const positionY = labelIS?.reSizeProperties?.y;

  useEffect(() => {
    if (positionY) {
      dispatch(updateHeight(Number(positionY) + 100));
    }
  }, [positionY, ]);

  const boxStyle = useMemo(() => {
    const resize = labelIS?.reSizeProperties;
    if (!resize) {
      return null;
    }
    const { sw, sh } = getScalers(type);
    const isPanel = type === 'panel';
    const rawLeft = isPanel ? Number(resize.x) : roundPx(Number(resize.x) + 15);
    const top = sh(roundPx(Number(resize.y) + (isPanel ? 10 : 5)));
    return { top, ...fitTextBox(sw(rawLeft), screenWidth) };
  }, [labelIS?.reSizeProperties, type, screenWidth]);

  if (!boxStyle) {
    return null;
  }

  const { sf } = getScalers(type);
  const fontSize = labelIS.fontSize ? reduceFontSize(parseFontSize(labelIS.fontSize)) : DEFAULT_FONT_SIZE;

  return (
    <View
      style={[
        styles.container,
        boxStyle,
        { backgroundColor: labelIS.fontBgColor, zIndex: labelIS.chartZindex },
      ]}
    >
      {labelIS.reSizeProperties.width ? (
        <Text
          style={{
            color: labelIS.fontColor || 'black',
            fontFamily: FONTS.SEGOEUISEMIBOLD,
            fontWeight: labelIS.isBold ? 'bold' : '500',
            fontSize: sf(fontSize),
          }}
        >
          {resolveLabelText(labelIS, labelValue)}
        </Text>
      ) : null}
    </View>
  );
}

Label.propTypes = {
  labelId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  labelDataIs: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  type: PropTypes.string,
};

Label.defaultProps = {
  type: undefined,
};

export default React.memo(Label);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'baseline',
  },
});