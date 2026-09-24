import { StyleSheet, Dimensions, StatusBar } from 'react-native';
import { scaleHeight, scaleWidth } from '../../Constants/dynamicSize';
import { COLORS } from "../../Constants/Colors";
import { FONTS } from '../../Constants/Fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 1000;
const HEIGHT = Dimensions.get("window").height + StatusBar.currentHeight;

export const KNOB_SIZE = 52;
export const SWIPE_TRACK_HEIGHT = 60;

export const splashStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
    },
    splashinsideContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: "center",
        backgroundColor: COLORS.SPLASH_BG,
        padding: scaleWidth(20),
    },
    AlignCenter: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    firstAnimation: {
        width: scaleWidth(400),
        height: scaleHeight(1000),
    },
});

export const loginStyles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        width: '100%',
        height: HEIGHT,
    },
    bgImageAbsolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    insideContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        bottom: '3%',
    },
    centerAlign: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingVertical: scaleHeight(20),
        alignSelf: 'center',
    },
    logoImage: {
        width: 230,
        height: 70,
    },
    pocketImage: {
        width: 100,
        height: 28,
    },
    containView: {
        paddingHorizontal: scaleWidth(8),
    },
    title: {
        fontSize: 16,
        paddingBottom: scaleHeight(10),
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        textAlign: 'center',
        width: '80%',
        alignSelf: 'center',
        color: COLORS.WHITE,
    },
    inputContainer: {
        marginVertical: scaleHeight(8),
    },
    subTitle: {
        fontSize: 15,
        fontWeight: '500',
        fontFamily: FONTS.SEGOEUIREGULAR,
        color: COLORS.WHITE,
    },
    textInput: {
        height: 50,
        borderWidth: 0,
        borderRadius: 12,
        marginTop: scaleHeight(8),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.WHITE,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 1,
    },
    input: {
        height: '100%',
        paddingHorizontal: 16,
        flex: 0.95,
        fontFamily: FONTS.SEGOEUIREGULAR,
        fontSize: 15,
        fontWeight: '400',
    },
    eyeHeight: {
        width: 45,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifyContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: scaleHeight(30),
    },
    loginText: {
        color: COLORS.WHITE,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        fontFamily: FONTS.SEGOEUIBOLD,
    },
    scrollView: {
        width: '100%',
        backgroundColor: 'transparent',
    },
    bgContainer: {
        width: isTablet ? 450 : 350,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: 16,
        alignSelf: 'center',
        borderRadius: scaleHeight(24),
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1,
        overflow: 'hidden',
    },
    loaderWrapper: {
        marginVertical: '10%',
    },
    swipeTrack: {
        height: SWIPE_TRACK_HEIGHT,
        borderRadius: SWIPE_TRACK_HEIGHT / 2,
        justifyContent: 'center',
        overflow: 'hidden',
        width: '100%',
    },
    swipeTrackEnabled: {
        backgroundColor: COLORS.BUTTONGREEN,
        opacity: 1,
    },
    swipeTrackDisabled: {
        backgroundColor: COLORS.GREY,
        opacity: 0.6,
    },
    swipeButtonLabel: {
        position: 'absolute',
        alignSelf: 'center',
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: FONTS.SEGOEUISEMIBOLD,
    },
    swipeKnob: {
        width: KNOB_SIZE,
        height: KNOB_SIZE,
        borderRadius: KNOB_SIZE / 2,
        backgroundColor: COLORS.WHITE,
        marginLeft: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
});


export const DOT_SIZE = 8;
 
export const onboardingStyles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: HEIGHT,
    },
    bgImageAbsolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    insideContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bgContainer: {
        width: isTablet ? 450 : 350,
        height: isTablet ? 620 : 520,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: 16,
        paddingVertical: scaleHeight(20),
        alignSelf: 'center',
        borderRadius: scaleHeight(24),
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1,
        overflow: 'hidden',
    },
    skipRow: {
        width: '100%',
        alignItems: 'flex-end',
        paddingHorizontal: scaleWidth(4),
    },
    skipText: {
        color: COLORS.WHITE,
        fontSize: 14,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
    },
    slide: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scaleWidth(16),
    },
    slideImage: {
        width: 220,
        height: 220,
        marginBottom: scaleHeight(24),
    },
    title: {
        fontSize: 18,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        color: COLORS.WHITE,
        textAlign: 'center',
        marginBottom: scaleHeight(10),
    },
    description: {
        fontSize: 14,
        fontFamily: FONTS.SEGOEUIREGULAR,
        color: COLORS.WHITE,
        textAlign: 'center',
        lineHeight: 20,
        opacity: 0.85,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: scaleHeight(20),
    },
    dot: {
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        backgroundColor: COLORS.WHITE,
        marginHorizontal: 4,
    },
    footer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButton: {
        width: '100%',
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.BUTTONGREEN,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonText: {
        color: COLORS.WHITE,
        fontSize: 16,
        fontFamily: FONTS.SEGOEUIBOLD,
    },
});
 
