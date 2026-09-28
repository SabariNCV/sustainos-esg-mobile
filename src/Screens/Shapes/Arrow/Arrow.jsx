import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';
function Arrow(props) {
  const { id, arrowStylesIs, tabShape } = props
  let arrowStyles
  if (tabShape) {
    arrowStyles = arrowStylesIs.filter(ele => ele.id === id)[0].dataIs
  } else {
    arrowStyles = arrowStylesIs[id].dataIs;
  }

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
          width: ${scaleWidth(arrowStyles.width)}px; 
          height: ${scaleHeight(arrowStyles.height)}px; 
          clip-path: polygon(0 39%, 74% 38%, 74% 0, 100% 50%, 73% 97%, 74% 58%, 0 59%);
          background-color: ${arrowStyles.SquareBg}; 
          display: flex;
          justify-content: center;
          align-items: center;
          
        }
      </style>
    </head>
    <body>
      <div class="arrow"></div>
    </body>
    </html>
  `;

  const selectShape = () => {
    const panelId = arrowStyles.panelId
    if (panelId !== "") {
      dispatch(openPanel(!isPanelOpen))
      dispatch(panelIdIs(panelId))
    }
  }
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
          <View style={[styles.arrowContainer, {
            top: scaleHeight(PixelRatio.roundToNearestPixel(Number(arrowStyles?.position?.y))),
            left: scaleWidth(PixelRatio.roundToNearestPixel(Number(arrowStyles?.position?.x - 5))),
            width: scaleWidth(arrowStyles.width),
            height: scaleHeight(arrowStyles.height),
            transform: [
              { rotate: `${arrowStyles?.rotation}deg` },
            ],
          }]}>
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

export default Arrow;



