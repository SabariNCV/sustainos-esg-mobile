import React, { useCallback, useEffect, useMemo } from 'react';
import { Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { FONTS } from '../../../Constants/Fonts';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { parseFontSize } from '../../../Components/elementUtils';
import { getScalers } from '../../../Components/scalers';
import { clampHorizontal } from '../../../Components/shapeUtils';

const DEFAULT_FONT_SIZE = 12;

function ButtonElement({ buttonId, buttonDataIs, type, buttonPress }) {
  const dispatch = useDispatch();
  const { width: screenWidth } = useWindowDimensions();
  const buttonIS = buttonDataIs?.[buttonId]?.['button-colors'];
  const resize = buttonIS?.reSizeProperties;
  const positionY = Number(resize?.y);
  const panelId = buttonIS?.panelId;
  const pageId = buttonIS?.pageId?.id;

  useEffect(() => {
    dispatch(updateHeight(positionY + 100));
  }, [positionY]);

  const handlePress = useCallback(() => {
    if (panelId) {
      buttonPress?.(panelId, 'panel');
    } else {
      buttonPress?.(pageId ?? 0, 'page');
    }
  }, [panelId, pageId, buttonPress]);

  const layout = useMemo(() => {
    if (!resize) {
      return null;
    }
    const { sw, sh } = getScalers(type);
    const offsetX = type === 'panel' ? 20 : 0;
    return clampHorizontal(
      {
        left: sw(Number(resize.x) + offsetX),
        top: sh(Number(resize.y)),
        width: sw(Number.parseInt(resize.width, 10)),
        height: sh(Number.parseInt(resize.height, 10)),
      },
      screenWidth,
    );
  }, [resize, type, screenWidth]);

  if (!buttonIS || !layout) {
    return null;
  }

  const { sw, sf } = getScalers(type);
  const fontSize = buttonIS.fontSize ? parseFontSize(buttonIS.fontSize) : DEFAULT_FONT_SIZE;

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.button,
        layout,
        {
          borderRadius: sw(Number.parseInt(buttonIS.borderRadius, 10)),
          backgroundColor: buttonIS.fontBgColor,
          zIndex: buttonIS.chartZindex,
        },
      ]}
    >
      <Text
        numberOfLines={1}
        style={{
          color: buttonIS.fontColor,
          fontFamily: FONTS.SEGOEUISEMIBOLD,
          fontWeight: buttonIS.isBold ? 'bold' : '500',
          fontSize: sf(fontSize),
          marginHorizontal: sw(type === 'panel' ? 6 : 5),
        }}
      >
        {buttonIS.buttonTitle}
      </Text>
    </TouchableOpacity>
  );
}

ButtonElement.propTypes = {
  buttonId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  buttonDataIs: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  type: PropTypes.string,
  buttonPress: PropTypes.func,
};

ButtonElement.defaultProps = {
  buttonDataIs: undefined,
  type: undefined,
  buttonPress: undefined,
};

export default React.memo(ButtonElement);

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});