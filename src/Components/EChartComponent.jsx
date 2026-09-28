import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { View, Text, Platform, ActivityIndicator, Animated } from 'react-native';
import RNEChartsPro from 'react-native-echarts-pro';
import { styles } from '../Screens/MainContent/styles';
import { scaleHeight, scaleWidth, normalizeFont } from '../Constants/dynamicSize';
import { panelscaleHeight, panelscaleWidth, panelnormalizeFont } from '../Constants/panelSize';
import { COLORS } from '../Constants/Colors';
import { type_panel, parseHeight } from './chartUtils';

const SPRING_CONFIG = { friction: 4, tension: 50, useNativeDriver: true };
const PANEL_LEFT_OFFSET = 300;

export default function EChartComponent({ ChartColors, option, showtitle, loading, type }) {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, { toValue: 1, ...SPRING_CONFIG }).start();
        return () => {
            Animated.spring(scaleAnim, { toValue: 0, ...SPRING_CONFIG }).start();
        };
    }, [scaleAnim]);

    const isPanel = type === type_panel;
    const scaleH = isPanel ? panelscaleHeight : scaleHeight;
    const scaleW = isPanel ? panelscaleWidth : scaleWidth;
    const scaleFont = isPanel ? panelnormalizeFont : normalizeFont;
    const resize = ChartColors?.reSizeProperties;
    const resizeHeight = parseHeight(resize?.height);
    const cornerRadius = ChartColors?.isBorderRadius ? 10 : 1;
    const shadowColor = Platform.OS === 'ios' ? COLORS.ASH : '#000';
    const positionStyle = resize?.y ? { top: scaleH(Number(resize.y)) } : { marginTop: scaleH(10) };
    const panelOffset = isPanel ? { left: scaleW(Number(resize?.x) + PANEL_LEFT_OFFSET) } : {};

    return (
        <View
            style={{
                height: scaleH(225),
                position: 'absolute',
                alignSelf: 'center',
                width: scaleW(360),
            }}
        >
            {resize && (
                <Animated.View
                    style={{
                        transform: [{ scale: scaleAnim }],
                        height: scaleH(resizeHeight),
                        ...positionStyle,
                        ...panelOffset,
                    }}
                >
                    {showtitle && (
                        <View
                            style={[
                                styles.headerbox,
                                {
                                    shadowColor,
                                    backgroundColor: ChartColors?.fontBgColor || '#ffffff',
                                    borderTopLeftRadius: cornerRadius,
                                    borderTopRightRadius: cornerRadius,
                                },
                            ]}
                        >
                            <Text style={[styles.charttitle, { fontSize: scaleFont(isPanel ? 16 : 14), color: ChartColors?.fontColor }]}>
                                {ChartColors?.chartTitle}
                            </Text>
                        </View>
                    )}
                    <View
                        style={{
                            alignSelf: 'flex-start',
                            justifyContent: 'center',
                            width: scaleW(350),
                            height: scaleH(resizeHeight - 40),
                            shadowColor,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.8,
                            shadowRadius: 2,
                            elevation: 2,
                            borderColor: '#D3D3D3',
                            borderBottomLeftRadius: cornerRadius,
                            borderBottomRightRadius: cornerRadius,
                            backgroundColor: ChartColors?.areaBackground || COLORS.WHITE,
                        }}
                    >
                        {loading ? (
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: COLORS.WHITE,
                                    borderBottomLeftRadius: cornerRadius,
                                    borderBottomRightRadius: cornerRadius,
                                }}
                            >
                                <ActivityIndicator size="small" color={COLORS.HEADER} />
                            </View>
                        ) : (
                            <View style={{ height: scaleH(resizeHeight - 60) }}>
                                <RNEChartsPro option={option} height={scaleH(resizeHeight - 60)} />
                            </View>
                        )}
                    </View>
                </Animated.View>
            )}
        </View>
    );
}

EChartComponent.propTypes = {
    ChartColors: PropTypes.shape({
        reSizeProperties: PropTypes.object,
        isBorderRadius: PropTypes.bool,
        fontBgColor: PropTypes.string,
        fontColor: PropTypes.string,
        chartTitle: PropTypes.string,
        areaBackground: PropTypes.string,
    }),
    option: PropTypes.object,
    showtitle: PropTypes.bool,
    loading: PropTypes.bool,
    type: PropTypes.string,
};