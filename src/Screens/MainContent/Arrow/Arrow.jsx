import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, PixelRatio, TouchableOpacity } from 'react-native';
import { scaleHeight, scaleWidth } from '../../../Constants/dynamicSize';
import { panelscaleHeight, panelscaleWidth } from '../../../Constants/panelSize';
import { useDispatch } from 'react-redux';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { WebView } from 'react-native-webview';

const Arrow = (props) => {
  const { id, arrowStylesIs, type } = props
  const arrowStyles = arrowStylesIs[id]?.dataIs;
  const dispatch = useDispatch();
  useEffect(() => {
    const newHeight = Number(arrowStyles?.position?.y) + Number(arrowStyles.height);
    dispatch(updateHeight(newHeight));
  }, [Number(arrowStyles?.position?.y), dispatch]);


  const position = useMemo(() => ({
    top: type === "panel" ? panelscaleHeight(PixelRatio.roundToNearestPixel(Number(arrowStyles?.position?.y))) : scaleHeight(PixelRatio.roundToNearestPixel(Number(arrowStyles?.position?.y))),
    left: type === "panel" ? panelscaleWidth(PixelRatio.roundToNearestPixel(Number(arrowStyles?.position?.x))) : scaleWidth(PixelRatio.roundToNearestPixel(Number(arrowStyles?.position?.x)) - 5),
    width: type === "panel" ? panelscaleWidth(arrowStyles?.width - 20) : scaleWidth(arrowStyles?.width),
    height: type === "panel" ? panelscaleHeight(arrowStyles?.height) : scaleHeight(arrowStyles?.height),
  }), [arrowStyles, type]);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .arrow {
          width: ${type === "panel" ? panelscaleWidth(arrowStyles.width) : scaleWidth(arrowStyles.width)}px; 
          height: ${type === "panel" ? panelscaleHeight(arrowStyles.height) : scaleHeight(arrowStyles.height)}px; 
          clip-path: polygon(0 39%, 74% 38%, 74% 0, 100% 50%, 73% 97%, 74% 58%, 0 59%);
          background-color: ${arrowStyles.SquareBg}; 
          display: flex;
          justify-content: right;
          align-items: center;
          
        }
      </style>
    </head>
    <body>
      <div class="arrow"></div>
    </body>
    </html>
  `;

  return (
    <>
      {
        arrowStyles?.position &&
        arrowStyles?.width &&
        arrowStyles?.height &&
        arrowStyles?.SquareBg &&
        arrowStyles?.rotation != null
        &&
        <TouchableOpacity disabled={true}>
          <View style={{
            ...position,
            transform: [
              { rotate: `${arrowStyles?.rotation}deg` },
            ],
            position: 'absolute'
          }}>
            <WebView
              originWhitelist={['*']}
              source={{ html: html }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              style={{ backgroundColor: 'transparent', flex: 1, }}
              scrollEnabled={false}
              scalesPageToFit={false}
            />
          </View>
        </TouchableOpacity>
      }
    </>
  )
}
export default Arrow
const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
    position: 'absolute'
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  line: {
    height: 1,
    backgroundColor: 'black',
    width: 20,
  },
})

