import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import {
    normalizeFont,
    scaleHeight,
    scaleWidth,
} from '../../../Constants/dynamicSize';
import { useDispatch } from 'react-redux';
import { updateHeight } from '../../../Redux/ReduxSlice/mainSlice';
import { FONTS } from "../../../Constants/Fonts";
import { panelscaleHeight, panelscaleWidth, panelnormalizeFont } from '../../../Constants/panelSize';

export default function ButtonElement(props) {

    const { buttonId, buttonDataIs, type, buttonPress } = props;
    const dispatch = useDispatch();
    const buttonIS = (buttonDataIs && buttonDataIs[buttonId]["button-colors"] !== undefined) && buttonDataIs[buttonId]["button-colors"]
    useEffect(() => {
        const newHeight = Number(buttonIS?.reSizeProperties?.y) + 100;
        dispatch(updateHeight(newHeight));
    }, [Number(buttonIS?.reSizeProperties?.y), dispatch]);
    const parseFontSize = (fontSize) => {
        if (typeof fontSize === 'string') {
            return parseInt(fontSize.replace('px', ''), 10);
        }
        console.warn("Unexpected fontSize value:", fontSize);
        return 12;
    };
    const fontSize = buttonIS?.fontSize ? parseFontSize(buttonIS?.fontSize) : 12;
    const handleButton = () => {
        const panelId = buttonIS?.panelId;
        const pageId = buttonIS?.pageId?.id
        if (panelId !== "") {
            buttonPress && buttonPress(panelId ? panelId : 0,"panel")
        }else{
            buttonPress && buttonPress(pageId ? pageId : 0,"page")
        }
    }

    return (
        <>
            {
                buttonIS
                &&
                <TouchableOpacity style={{   zIndex: buttonIS?.chartZindex}} onPress={() => handleButton()}>
                    <View style={[styles.image,
                    {   
                        borderRadius: type === "panel" ? panelscaleWidth(parseInt(buttonIS?.borderRadius)) : scaleWidth(parseInt(buttonIS?.borderRadius)),
                        zIndex: buttonIS?.chartZindex,
                        alignItems:'center',
                        justifyContent:'center',
                        backgroundColor: buttonIS?.fontBgColor,
                        width: type === "panel" ? panelscaleWidth(parseInt(buttonIS?.reSizeProperties?.width)) : scaleWidth(parseInt(buttonIS?.reSizeProperties?.width)),
                        height: type === "panel" ? panelscaleHeight(parseInt(buttonIS?.reSizeProperties?.height)) : scaleHeight(parseInt(buttonIS?.reSizeProperties?.height)),
                        left: type === "panel" ? panelscaleWidth(buttonIS?.reSizeProperties?.x +20) : scaleWidth(buttonIS?.reSizeProperties?.x),
                        top: type === "panel" ? panelscaleHeight(Number(buttonIS?.reSizeProperties?.y)) : scaleHeight(Number(buttonIS?.reSizeProperties?.y)) }
                    ]}>
                        <Text style={{
                            zIndex: buttonIS?.chartZindex,
                            color: buttonIS?.fontColor,
                            fontFamily: FONTS.SEGOEUISEMIBOLD,
                            fontWeight: buttonIS?.isBold === true ? 'bold' : '500',
                            fontSize: type === "panel"
                                ? panelnormalizeFont(fontSize)
                                : normalizeFont(fontSize),
                            marginHorizontal: type === "panel" ? panelscaleWidth(6) : scaleWidth(5),
                        }}>{buttonIS?.buttonTitle}</Text>
                    </View>
                </TouchableOpacity>
            }
        </>
    )
}

const styles = StyleSheet.create({
    image: {
        alignSelf: 'center',
        position: 'absolute',
    }
})