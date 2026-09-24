import { StyleSheet, Platform } from 'react-native'
import { normalizeFont, scaleHeight, scaleWidth, } from '../../Constants/dynamicSize';
import { FONTS } from '../../Constants/Fonts';
import { COLORS } from '../../Constants/Colors';

export const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flex: 1,
    },
    matchText: {
        position: 'absolute',
        flexDirection: 'row',
        bottom: scaleHeight(100),
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: scaleHeight(60),
        backgroundColor: COLORS.DIVIDER,
        borderWidth: 1,
        borderColor: COLORS.DIVIDER
    },
    matchCountContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 0.95
    },
    chevronContainer: {
        width: scaleWidth(100),
        flex: 0.05,
        right: scaleWidth(60),
        top: scaleHeight(5),
        flexDirection: 'row'
    },
    touchArrow: {
        width: scaleWidth(30),
        height: scaleHeight(40),
    },
    sendIcon: {
        height: scaleHeight(25),
        width: scaleWidth(25),
    },
    animationIcon: {
        height: scaleHeight(150),
        width: scaleWidth(143),
        left: scaleWidth(10),
        alignSelf: 'center'
    },
    iconView: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-end',
        height: scaleHeight(82),
        marginRight: scaleWidth(16),
        left: scaleWidth(-30),
        bottom: scaleHeight(10),
    },
    galleryButton: {
        flex: 0.08,
        paddingHorizontal: scaleWidth(15),
        marginLeft: scaleHeight(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    textInputView: {
        width: '60%',
        backgroundColor: COLORS.WHITE,
        borderWidth: scaleWidth(2),
        borderColor: COLORS.BORDER_CHATCOLOR,
        borderRadius: scaleWidth(15),
        opacity: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-end',
        marginHorizontal: scaleWidth(10),
        height: scaleHeight(90),
        left: scaleWidth(-30),
        bottom: scaleHeight(10)
    },
    centerMicView: {
        width: '60%',
        alignItems: 'center',
        justifyContent: 'center',
        left: scaleWidth(-30),
    },
    queryPlaceHolder: {
        color: '#000',
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(12),
        fontWeight: '200',
        height: scaleHeight(50),
        width: '75%',
        marginHorizontal: scaleWidth(5),
    },
    bottomContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        position: 'absolute',
        zIndex: 1000,
        bottom: Platform.OS === 'ios' ? '3%' : '1%',
        flex: 1,
    },
    timeStyle: {
        color: COLORS.ASH,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(12),
        fontWeight: '500',
        marginHorizontal: scaleWidth(10),
        marginVertical: scaleHeight(2),
        lineHeight: scaleHeight(20),
    },
    box: {
        marginVertical: scaleHeight(15),
        backgroundColor: COLORS.WHITE,
        borderRadius: scaleHeight(8),
        marginHorizontal: 1
    },
    yellowMic: {
        width: scaleWidth(90),
        height: scaleHeight(90),
        top: scaleHeight(5),
    },
    snowText: {
        color: COLORS.WHITE,
        fontFamily: FONTS.SEGOEUIBOLD,
        fontSize: normalizeFont(16),
        fontWeight: '700',
        marginLeft: scaleWidth(5)
    },
    dayText: {
        color: COLORS.WHITE,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(16),
        fontWeight: '600',
        textAlign: 'right'
    },
    weatherText: {
        color: COLORS.WHITE,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(16),
        fontWeight: '600',
        marginLeft: scaleWidth(4)
    },
    degreeText: {
        color: COLORS.WHITE,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(50),
        fontWeight: '600',
        marginLeft: scaleWidth(5)
    },
    camera: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        position: 'absolute'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: scaleHeight(20),
    },
    timeText: {
        color: COLORS.WHITE,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(24),
        fontWeight: '700',
        marginLeft: scaleWidth(5),
        textAlign: 'right'
    },
    bubblewrapperRightStyle: {
        backgroundColor: COLORS.CHAT_BLUE,
        borderRadius: scaleWidth(5),
        alignContent: 'center',
        alignItems: 'center'
    },
    imagePick: {
        height: scaleHeight(200),
        width: scaleWidth(200)
    },
    bubblewrapperLeftStyle: {
        backgroundColor: COLORS.CHAT_GREEN,
        borderRadius: scaleWidth(10),
    },
    bubbleRightTextStyle: {
        color: COLORS.WHITE,
        lineHeight: scaleHeight(20),
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(14),
        fontWeight: '700',
        marginHorizontal: scaleWidth(10),
        marginVertical: scaleHeight(10),
        letterSpacing: 0.2
    },
    matchTextStyle: {
        color: COLORS.BLACK,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(18),
        fontWeight: '700',
        marginVertical: scaleHeight(10),
    },
    bubbleLeftTextStyle: {
        color: COLORS.WHITE,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(14),
        fontWeight: '700',
        marginHorizontal: scaleWidth(10),
        marginVertical: scaleHeight(10),
        lineHeight: scaleHeight(20),
        letterSpacing: 0.2
    },
    genie: {
        height: scaleHeight(30),
        width: scaleWidth(30),
        alignSelf: 'center'
    },
    botView: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: scaleHeight(2),
        height: 40,
        width: 40,
        borderColor: COLORS.BORDER_CHATCOLOR,
        borderRadius: 40,
        marginRight: scaleWidth(5)
    },
    micView: {
        height: scaleHeight(40),
        width: scaleWidth(35),
        marginBottom: scaleHeight(10),
        marginRight: scaleWidth(16),
        backgroundColor: COLORS.WHITE,
        shadowColor: Platform.OS === 'ios' ? '#fff' : '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.8,
        shadowRadius: 40,
        elevation: 10,
        borderRadius: scaleHeight(40),
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: COLORS.BORDER_CHATCOLOR,
        borderWidth: scaleWidth(2)
    },
    imgBackground: {
        width: '99%',
        marginLeft: '15%',
        alignSelf: 'center',
        height: scaleHeight(170),
        marginVertical: scaleHeight(10),
    },
    degree: {
        flexDirection: 'row',
        marginLeft: scaleWidth(10)
    },
    degreeView: {
        flexDirection: 'row',
        marginHorizontal: scaleWidth(20),
        marginVertical: scaleHeight(10),
        justifyContent: 'space-between'
    },
    location: {
        flexDirection: 'row',
        alignSelf: 'flex-end',
        marginRight: scaleWidth(30),
        bottom: scaleWidth(10)
    },
    conditionView: {
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    },
    snow: {
        height: scaleHeight(20),
        width: scaleWidth(20),
    },
    weatherWidget: {
        height: scaleHeight(35),
        backgroundColor: '#A45465',
        width: '91%',
        alignItems: 'center',
        marginLeft: '4%',
    },
    divider: {
        backgroundColor: '#D07185',
        height: scaleHeight(20),
        width: 1,
        marginLeft: scaleWidth(4)
    },
    plotBox: {
        width: '88%',
        borderRadius: scaleHeight(10),
        height: scaleHeight(250),
        marginLeft: scaleWidth(45),
        backgroundColor: COLORS.WHITE,
        marginTop: scaleHeight(15),
        alignContent: 'center'
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: scaleWidth(20),
        borderRadius: scaleWidth(10),
        width: scaleWidth(300),
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: normalizeFont(18),
        fontWeight: 'bold',
        marginBottom: scaleHeight(20),
        color: COLORS.NEW_BLUE
    },
    button: {
        backgroundColor: COLORS.NEW_HEADER,
        paddingVertical: 12,
        paddingHorizontal: 30,
        marginVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
    },
    cancelButton: {
        backgroundColor: '#FF6347',
        paddingVertical: 12,
        paddingHorizontal: 30,
        marginVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    videoPlayerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearButton: {
        padding: scaleHeight(10),
        backgroundColor: 'gray',
        marginBottom: scaleHeight(10),
        borderRadius: scaleHeight(5),
    },
    playButton: {
        padding: scaleHeight(10),
        backgroundColor: 'green',
        borderRadius: scaleHeight(5),
    },
    videoPlayer: {
        width: scaleWidth(250),
        height: scaleHeight(150),
        overflow: 'hidden',
        borderRadius: scaleHeight(5)
    },
    icon: {
        alignItems: 'center',
        justifyContent: 'center',
        left: 10
    },
    iconview: {
        height: scaleHeight(40),
        alignItems: 'center',
        justifyContent: 'center',
        right: scaleWidth(20)
    },
    searchbox: {
        height: scaleHeight(50),
        borderWidth: scaleHeight(1),
        borderColor: COLORS.WHITE,
        borderRadius: scaleHeight(2),
        flex: 0.85,
        backgroundColor: COLORS.WHITE,
        marginLeft: scaleWidth(25),
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: scaleHeight(10)
    },
    searchboxinput: {
        height: scaleHeight(70),
        borderRadius: scaleHeight(2),
        width: '100%',
        marginLeft: scaleWidth(15),
        fontFamily: FONTS.SEGOEUIREGULAR,
        textAlign: 'left',
        color: COLORS.BLACK
    },
    bgsearch: {
        flexDirection: 'row',
        height: scaleHeight(70),
        backgroundColor: COLORS.HEADER,
        alignItems: 'center',
        alignContent: 'center'
    },
    searchView: {
        flexDirection: 'row',
        height: scaleHeight(50),
        backgroundColor: COLORS.WHITE,
        alignItems: 'center',
        alignContent: 'center'
    },
    searchboxcontainer: {
        flex: 1,
        flexDirection: 'row',
        height: scaleHeight(70),
    },
    searchinpbox: {
        height: scaleHeight(50),
        borderWidth: scaleHeight(1),
        borderColor: COLORS.GREYBG,
        borderRadius: scaleWidth(10),
        backgroundColor: COLORS.DIVIDER,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        width: '60%',
        marginTop: scaleHeight(10),
        position: 'absolute',
        zIndex: 10000000,
        flexDirection: 'row'
    },
    searchinput: {
        borderRadius: scaleHeight(2),
        width: '85%',
        marginLeft: scaleWidth(45),
        fontFamily: FONTS.SEGOEUIREGULAR,
        textAlign: 'left',
        color: COLORS.BLACK,

    },
    highlight: {
        backgroundColor: COLORS.YELLOW,
        color: COLORS.BLACK,
    },
    searchInput: {
        alignSelf: 'center',
        borderColor: COLORS.GREY,
        borderWidth: 1,
        width: '90%',
        borderStyle: 'dashed',
        backgroundColor: COLORS.BLUE_BG,
        borderRadius: scaleWidth(5)
    },
    input: {
        marginLeft: scaleWidth(15),
        fontFamily: FONTS.SEGOEUIREGULAR,
        textAlign: 'left',
        color: COLORS.BLACK,
    },
    searchModal: {
        backgroundColor: COLORS.WHITE,
        position: 'absolute',
        right: 10,
        width: scaleWidth(50),
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        top: '18%',
        borderRadius: scaleWidth(10)
    },
    chartView: {
        height: scaleHeight(230),
        width: scaleWidth(300),
        backgroundColor: COLORS.WHITE,
        borderRadius: scaleWidth(10)
    },
    eventCard: {
        backgroundColor: COLORS.PURPLE,
        borderRadius: scaleWidth(10),
        paddingHorizontal: scaleWidth(10),
        shadowColor: Platform.OS === 'ios' ? '#fff' : '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        width: '98%',
        marginVertical: scaleHeight(10)
    },
    titleView: {
        backgroundColor: COLORS.NEW_GREEN,
        width: scaleWidth(325),
        right: scaleWidth(10),
        borderTopLeftRadius: scaleHeight(10),
        borderTopRightRadius: scaleHeight(10)
    },
    eventTitle: {
        fontFamily: FONTS.SEGOEUIBOLD,
        color: COLORS.WHITE,
        fontSize: normalizeFont(16),
        width: '80%',
        fontWeight: 'bold',
        marginVertical: scaleHeight(10),
        marginLeft: scaleWidth(15)
    },
    clock: {
        height: scaleHeight(14),
        width: scaleWidth(14),
        tintColor: COLORS.BLACK
    },
    cell: {
        textAlign: 'center',
        fontFamily: FONTS.SEGOEUIREGULAR,
        color: COLORS.NEW_BLUE,
        fontSize: normalizeFont(15),
        alignSelf: 'center',
        marginLeft: scaleWidth(5)
    },
})