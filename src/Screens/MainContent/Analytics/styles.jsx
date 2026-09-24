import { StyleSheet, Platform, Dimensions } from 'react-native'
import {
    normalizeFont,
    scaleHeight,
    scaleWidth,
} from '../../../Constants/dynamicSize';
import { FONTS } from '../../../Constants/Fonts';
import { COLORS } from '../../../Constants/Colors';
const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    divider: {
        height: scaleHeight(1),
        backgroundColor: COLORS.GREYBG,
    },
    box: {
        width: '100%',
        backgroundColor: COLORS.WHITE,
        marginTop: scaleHeight(20),
        borderRadius: scaleHeight(2),
    },
    share: {
        width: scaleWidth(25),
        height: scaleHeight(25),
        resizeMode: 'center',
        overflow: 'hidden',
    },
    boxView: {
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.NEW_HEADER,
        flexDirection: 'row',
        width: '100%'
    },
    sharebox: {
        width: scaleWidth(40),
        height: scaleHeight(40),
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: COLORS.GREYBG,
        borderWidth: 0.5,
        marginRight: scaleWidth(5)
    },
    innerbox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: scaleWidth(10)
    },
    dropview: {
        backgroundColor: COLORS.WHITE,
        width: '75%',
        marginRight: scaleWidth(10)

    },
    dropdowntextstyle: {
        color: COLORS.BLACK,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(16),
        fontWeight: '200',
        marginVertical: scaleHeight(10),
        marginLeft: scaleWidth(10)
    },
    headerLine: {
        backgroundColor: COLORS.NEW_HEADER,
        width: '100%',
        flexDirection: 'row',
    },
    shareTextstyle: {
        color: COLORS.BLACK,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(16),
        fontWeight: '200',
        marginVertical: scaleHeight(10),
        textAlign: 'center',
    },
    firstView: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    textInput: {
        borderWidth: 1,
        height: scaleHeight(30),
        justifyContent: 'center',
        borderColor: COLORS.GREY,
        marginHorizontal: scaleWidth(10)
    },
    modalView: {
        backgroundColor: COLORS.WHITE,
        width: scaleWidth(150),
        top: '25%',
        position: 'absolute',
        right: 20,
        shadowColor: Platform.OS === 'ios' ? '#fff' : COLORS.ASH,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 30,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.GREYBG,
    },
    chartmodal: {
        backgroundColor: COLORS.WHITE,
        alignSelf: 'center',
        shadowColor: Platform.OS === 'ios' ? '#fff' : COLORS.BLACKK,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        borderColor: COLORS.WHITE,
        borderWidth: 0.1,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5,
        overflow: 'hidden',
        height: scaleHeight(1150),
        width: '100%',
    },
    bookmodalView: {
        backgroundColor: COLORS.WHITE,
        alignSelf: 'center',
        shadowColor: Platform.OS === 'ios' ? '#fff' : COLORS.BLACKK,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        borderColor: COLORS.GREY,
        borderWidth: 0.1,
        position: 'absolute',
        bottom: 0,
        elevation: 5,
        overflow: 'hidden',
        height: scaleHeight(800),
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    clearView: {
        height: scaleHeight(40),
        width: scaleWidth(60),
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        backgroundColor: COLORS.WHITE,
        borderWidth: 0.6,
        borderRadius: scaleHeight(5),
        marginRight: scaleWidth(10)
    },
    selectedUsersContainer: {
        marginTop: scaleWidth(10),
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: scaleWidth(20),
    },
    clearText: {
        color: COLORS.NEW_HEADER,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(16),
        fontWeight: '800',
    },
    saveText: {
        color: COLORS.WHITE,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(16),
        fontWeight: '800',
    },
    saveView: {
        height: scaleHeight(40),
        width: scaleWidth(60),
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        backgroundColor: COLORS.NEW_HEADER,
        borderRadius: scaleHeight(5)
    },
    buttonView: {
        flexDirection: 'row',
        alignSelf: 'flex-end',
        marginTop: scaleHeight(10),
        marginRight: scaleWidth(10)
    },
    input: {
        height: scaleHeight(50),
        textAlign: 'left',
        fontSize: normalizeFont(14)
    },
    row: {
        flexDirection: 'row',
        backgroundColor: COLORS.WHITE
    },
    searchboxcontainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        height: scaleHeight(70),
        width: scaleWidth(330),
        marginLeft: scaleWidth(10),

    },
    searchbox: {
        height: scaleHeight(50),
        borderWidth: 0.5,
        borderColor: COLORS.NEW_HEADER,
        borderRadius: scaleHeight(2),
        width: scaleWidth(270),
        backgroundColor: COLORS.WHITE,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: scaleHeight(10)
    },
    searchboxinput: {
        height: scaleHeight(70),
        borderRadius: scaleHeight(2),
        width: '100%',
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
    flexicon: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: scaleWidth(10)
    },
    icon: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.NEW_HEADER,
        height: scaleHeight(50),
        width: scaleHeight(50),
        borderRadius: 2
    },
    iconview: {
        height: scaleHeight(70),
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareView: {
        backgroundColor: COLORS.WHITE,
        alignSelf: 'center',
        shadowColor: Platform.OS === 'ios' ? '#fff' : COLORS.BLACKK,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        borderColor: COLORS.GREY,
        borderWidth: 0.1,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        elevation: 5,
        overflow: 'hidden',
    },
    closeView: {
        height: scaleHeight(40),
        width: scaleWidth(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
    close: {
        height: scaleHeight(15),
        width: scaleWidth(15),
        tintColor: COLORS.WHITE,
    },
    userTextView: {
        height: scaleHeight(30),
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        backgroundColor: COLORS.WHITE,
        borderColor: COLORS.GREY,
        borderWidth: 1,
        borderRadius: scaleHeight(2),
        marginTop: scaleHeight(8),
    },
    removeText: {
        marginLeft: scaleWidth(5),
        color: COLORS.NEW_HEADER,
    },
    selectedUser: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        borderRadius: scaleWidth(5),
        padding: scaleWidth(5),
        marginBottom: scaleWidth(10),
        marginRight: scaleWidth(5),
    },
    timeView: {
        width: '100%',
        height: scaleHeight(35),
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        backgroundColor: COLORS.WHITE,
        borderColor: COLORS.GREY,
        borderWidth: 1,
        borderRadius: scaleHeight(2),
        marginTop: scaleHeight(8),
    },
    timeText: {
        color: COLORS.DATETEXT,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(14),
        fontWeight: '700',
    },
    FromText: {
        color: COLORS.DATETEXT,
        fontFamily: FONTS.SEGOEUIREGULAR,
        fontSize: normalizeFont(16),
        marginHorizontal: 8,
        marginVertical: 2
    },
    dataRow: {
        height: Platform.OS === 'ios' ? normalizeFont(50) : scaleHeight(55),
    },
    rowText: {
        color: COLORS.BLACK,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(15),
        marginVertical: Platform.OS === 'ios' ? normalizeFont(8) : scaleHeight(15),
    },
    tableText: {
        color: COLORS.BLACK,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(15),
        marginVertical: Platform.OS === 'ios' ? normalizeFont(8) : scaleHeight(15),
        width: scaleWidth(185),
        textAlign:'center'
    },
    table3Text: {
        color: COLORS.BLACK,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(15),
        marginVertical: Platform.OS === 'ios' ? normalizeFont(8) : scaleHeight(15),
        width: scaleWidth(120),
        textAlign:'center'
    },
    cellView: {
        height: '100%',
        flexDirection:'row'
    },
    headerCell: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
        borderRightWidth: 1,
        borderColor: '#E0E0E0',
        flexDirection: 'row',
        backgroundColor: COLORS.NEW_HEADER,
        height: scaleHeight(45),
    },
    headingText: {
        color: COLORS.WHITE,
        fontFamily: FONTS.SEGOEUISEMIBOLD,
        fontSize: normalizeFont(16),
        textAlign: 'center',
        marginVertical: Platform.OS === 'ios' ? scaleHeight(5) : scaleHeight(10),
        fontWeight: '600',
        marginHorizontal: scaleWidth(4),
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.NEW_HEADER,
    },
    next: {
        position: 'absolute',
        right: 0,
        bottom: -40,
        marginRight: scaleWidth(10),

    }

})