import React, { useEffect } from 'react';
import { View, StyleSheet, PixelRatio } from 'react-native';
import { scaleHeight, scaleWidth, normalizeFont } from '../../../Constants/dynamicSize';
import { useDispatch } from 'react-redux';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { panelscaleHeight, panelscaleWidth } from '../../../Constants/panelSize';
const Line = (props) => {
    const { id, lineStylesIs, type } = props
    const lineStyles = lineStylesIs[id].dataIs;
    const dispatch = useDispatch();
    useEffect(() => {
        const newHeight = Number(lineStyles?.position?.y) + Number(lineStyles.height);
        dispatch(updateHeight(newHeight));
    }, [Number(lineStyles?.position?.y), dispatch]);
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
                    top: type === "panel" ? panelscaleHeight(PixelRatio.roundToNearestPixel(Number(lineStyles?.position?.y))):scaleHeight(PixelRatio.roundToNearestPixel(Number(lineStyles?.position?.y))),
                    left: type === "panel" ? panelscaleWidth(PixelRatio.roundToNearestPixel(Number(lineStyles?.position?.x - 5))):scaleWidth(PixelRatio.roundToNearestPixel(Number(lineStyles?.position?.x - 5))),
                    transform: [
                        { rotate: `${lineStyles?.rotation}deg` },
                    ],
                    width: type === "panel" ? panelscaleWidth(lineStyles.width):scaleWidth(lineStyles.width),
                    height: type === "panel" ? panelscaleHeight(lineStyles.height) :scaleHeight(lineStyles.height),
                    backgroundColor: lineStyles.SquareBg,
                    zIndex: lineStyles.chartZindex
                }
                ]} />
            }
        </>
    )
}
export default Line
const styles = StyleSheet.create({
    image: {
        position: 'absolute'
    }
})

