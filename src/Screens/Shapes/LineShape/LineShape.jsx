import React from 'react';
import { View, PixelRatio } from 'react-native';
import { scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import { panelscaleHeight, panelscaleWidth } from '../../../Constants/panelSize';
function Line(props) {
  const { id, lineStylesIs,tabShape,type } = props
  let lineStyles
  if (tabShape) {
    lineStyles = lineStylesIs.filter(ele => ele.id === id)[0].dataIs
  } else {
    lineStyles = lineStylesIs[id].dataIs;
  }
  return (
    <>
      {
        lineStyles?.position &&
        lineStyles?.width &&
        lineStyles?.height &&
        lineStyles?.SquareBg &&
        lineStyles?.rotation != null
        &&
        <View style={[styles.image,
        {
          flex: 0,
          top: type === "panel" ? panelscaleHeight(PixelRatio.roundToNearestPixel(Number(lineStyles?.position?.y))) : scaleHeight(PixelRatio.roundToNearestPixel(Number(lineStyles?.position?.y))),
          left: type === "panel" ? panelscaleWidth(PixelRatio.roundToNearestPixel(Number(lineStyles?.position?.x - 5))) : scaleWidth(PixelRatio.roundToNearestPixel(Number(lineStyles?.position?.x - 5))),
          transform: [
            { rotate: `${lineStyles?.rotation}deg` },
          ],
          width: type === "panel" ? panelscaleWidth(lineStyles.width) : scaleWidth(lineStyles.width),
          height: type === "panel" ? panelscaleHeight(lineStyles.height) : scaleHeight(lineStyles.height),
          backgroundColor: lineStyles.SquareBg,
          zIndex: lineStyles.chartZindex
        }
        ]} />
      }
    </>
  );
}

export default Line;



