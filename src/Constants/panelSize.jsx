import { Dimensions, Platform, PixelRatio } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get('window');
const ScaleHeight = SCREEN_HEIGHT / 1400;
const ScaleWidth = SCREEN_WIDTH / 650;
const font = SCREEN_WIDTH / 600;
export function panelnormalizeFont(size) {
  const newSize = size * font;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1.5;
  }
}

export const panelscaleHeight = (height) => Math.round(height * ScaleHeight);

export const panelscaleWidth = (width) => Math.round(width * ScaleWidth);