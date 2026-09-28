import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { SvgXml, SvgUri } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { Buffer } from 'buffer';
import PropTypes from 'prop-types';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { evaluateColorRange } from '../../../Components/elementUtils';
import { getScalers } from '../../../Components/scalers';
import { useShapeValue } from '../../../Components/useShapeValue';
import { buildEventRange, clampHorizontal } from '../../../Components/shapeUtils';

const EMPTY_IMAGE = {};
const SVG_DATA_PREFIX = 'data:image/svg+xml';

const decodeSvgDataUri = (uri) => Buffer.from(uri.split(',')[1] ?? '', 'base64').toString('utf-8');

function ImageContent({ source, width, height, borderRadius }) {
  const svgXml = useMemo(
    () => (source?.startsWith(SVG_DATA_PREFIX) ? decodeSvgDataUri(source) : null),
    [source],
  );

  if (!source) {
    return null;
  }
  if (svgXml) {
    return <SvgXml xml={svgXml} width={width} height={height} viewBox="0 0 100 100" />;
  }
  if (source.endsWith('.svg')) {
    return <SvgUri uri={source} width={width} height={height} />;
  }
  return <Image resizeMode="contain" style={{ width, height, borderRadius }} source={{ uri: source }} />;
}

ImageContent.propTypes = {
  source: PropTypes.string,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  borderRadius: PropTypes.number.isRequired,
};

ImageContent.defaultProps = {
  source: undefined,
};

function Images({ imageId, imageDataIs, type }) {
  const imageIs = imageDataIs?.[imageId]?.['image-colors'] ?? EMPTY_IMAGE;
  const dispatch = useDispatch();
  const { width: screenWidth } = useWindowDimensions();
  const eventDates = useSelector((state) => state.mainSlice.eventDate);
  const baseUrl = useSelector((state) => state.mainSlice.baseUrlIs);
  const isPanel = type === 'panel';

  const eventRange = useMemo(() => (isPanel ? buildEventRange(eventDates) : null), [isPanel, eventDates]);
  const paramValue = useShapeValue(imageIs, baseUrl, isPanel, eventRange);

  const resize = imageIs.reSizeProperties;
  const positionY = Number(resize?.y);
  const rawHeight = Number(resize?.height);

  useEffect(() => {
    if (Number.isFinite(positionY) && Number.isFinite(rawHeight)) {
      dispatch(updateHeight(positionY + rawHeight));
    }
  }, [positionY, rawHeight, dispatch]);

  const colorSource = useMemo(
    () => evaluateColorRange(imageIs.labelValueRange, paramValue, ''),
    [imageIs.labelValueRange, paramValue],
  );

  const layout = useMemo(() => {
    if (!resize) {
      return null;
    }
    const { sw, sh } = getScalers(type);
    const x = Number(resize.x);
    const offsetX = isPanel && x >= 50 ? 15 : 0;
    return clampHorizontal(
      {
        left: sw(x - offsetX),
        top: sh(Number(resize.y)),
        width: sw(Number.parseInt(resize.width, 10)),
        height: sh(Number.parseInt(resize.height, 10)),
      },
      screenWidth,
    );
  }, [resize, type, isPanel, screenWidth]);

  if (!layout) {
    return null;
  }

  return (
    <View style={[styles.container, layout, { zIndex: imageIs.chartZindex }]}>
      <ImageContent
        source={colorSource || imageIs.SquareBg}
        width={layout.width}
        height={layout.height}
        borderRadius={imageIs.borderRadius ? Number(imageIs.borderRadius) : 1}
      />
    </View>
  );
}

Images.propTypes = {
  imageId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  imageDataIs: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  type: PropTypes.string,
};

Images.defaultProps = {
  imageDataIs: undefined,
  type: undefined,
};

export default React.memo(Images);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'hidden',
  },
});