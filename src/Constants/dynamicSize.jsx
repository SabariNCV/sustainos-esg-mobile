import { Dimensions, Platform, PixelRatio } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get('window');
const ScaleHeight = SCREEN_HEIGHT / 850;
const ScaleWidth = SCREEN_WIDTH / 395;

const MIN_TABLET_ASPECT_RATIO = 1.3;

function computeIsTablet() {
  const { width, height } = Dimensions.get('window');

  const longSide = Math.max(width, height);
  const shortSide = Math.min(width, height);
  const aspectRatio = longSide / shortSide;

  if (aspectRatio < MIN_TABLET_ASPECT_RATIO) {
    return false;
  }

  const pixelDensity = PixelRatio.get();

  if (Platform.OS === 'ios') {
    return Platform.isPad === true;
  }

  const minDimension = shortSide;
  if (pixelDensity < 2 && minDimension >= 1000) return true;
  if (pixelDensity === 2 && minDimension >= 1920) return true;
  return minDimension >= 600;
}

export const getIsTablet = computeIsTablet;

export const isTabletModule = { current: computeIsTablet() };

Dimensions.addEventListener('change', () => {
  isTabletModule.current = computeIsTablet();
});

export const isTablet = computeIsTablet();

export function normalizeFont(size) {
  const tabletOffset = getIsTablet() ? 5 : 0;
  const newSize = size + tabletOffset;

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1.5;
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}

export const scaleHeight = (height) => Math.round(height * ScaleHeight);

export const scaleWidth = (width) => Math.round(width * ScaleWidth);