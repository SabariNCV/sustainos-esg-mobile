import { StyleSheet,Platform} from 'react-native';
import { FONTS } from '../Constants/Fonts';
import { COLORS } from '../Constants/Colors';
import { scaleHeight, normalizeFont, scaleWidth } from '../Constants/dynamicSize';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logout: {
    textAlign: 'left',
    fontSize: normalizeFont(15),
    fontWeight: '700',
    color: COLORS.BLACK,
    fontFamily: FONTS.SEGOEUISEMIBOLD,
    marginLeft: scaleWidth(10)
  },
  language: {
    textAlign: 'left',
    fontSize: normalizeFont(14),
    color: COLORS.BLACK,
    fontFamily: FONTS.SEGOEUISEMIBOLD,
  },
  logoutimage: {
    height: scaleHeight(40),
    width: scaleWidth(40),
    tintColor: COLORS.WHITE
  },
  containerfull: {
    backgroundColor: COLORS.HEADER,
    borderBottomColor: COLORS.WHITE,
    height: scaleHeight(80),
  },
  profileimage: {
    height: scaleHeight(50),
    width: scaleWidth(50),
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: scaleWidth(100),
    borderColor: COLORS.WHITE,
    borderWidth: scaleHeight(2),
    alignItems: 'center'
  },
  generalcardtitle: {
    color: COLORS.WHITE,
    fontSize: normalizeFont(14),
    fontWeight: '700',
    fontFamily: FONTS.SEGOEUIBOLD
  },
  generalcardsubtitle: {
    color: COLORS.WHITE,
    fontSize: normalizeFont(14),
    fontWeight: '500',
    marginLeft: scaleWidth(2),
    marginTop: scaleHeight(5),
    fontFamily: FONTS.SEGOEUIREGULAR
  },
  positiontitle: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginLeft: scaleWidth(10)
  },
  divider: {
    height: scaleWidth(2),
  },
  chartdivider: {
    height: scaleWidth(2),
  },
  tabs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: Platform.OS === 'ios' ? normalizeFont(18) : normalizeFont(16),
    paddingVertical: scaleHeight(10),
    fontFamily: FONTS.SEGOEUISEMIBOLD,
    width: scaleWidth(250),
  },
  group: {
    fontSize: normalizeFont(17),
    color: COLORS.HEADER,
    marginLeft: scaleWidth(20),
    textTransform: 'uppercase',
    textDecorationLine: 'underline',
    fontFamily: FONTS.SEGOEUIBOLD,
    fontWeight: 'bold',
    marginVertical: scaleHeight(10)
  },
  subtitle: {
    fontSize: normalizeFont(14),
    fontWeight: '600',
    paddingVertical: scaleHeight(10),
    fontFamily: FONTS.SEGOEUISEMIBOLD,
    width: scaleWidth(140),
    textAlign: 'left'

  },
  rowelements: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  subsubtitle: {
    fontSize: normalizeFont(14),
    paddingVertical: scaleHeight(10),
    fontFamily: FONTS.SEGOEUISEMIBOLD
  },
  icon: {
    flexDirection: 'row',
    marginLeft: scaleWidth(15),
    alignItems: 'center',
    width: scaleWidth(140),
  },
  arrow: {
    height: scaleHeight(30),
    width: scaleWidth(30),
    tintColor: COLORS.HEADER
  },
  logoutview: {
    flexDirection: 'row',
    marginLeft: scaleWidth(20),
    marginTop: scaleHeight(20),
    alignItems:'center',
    justifyContent:'center'
  },
  setting: {
    right: scaleWidth(40),
    flexDirection: 'row',
  },
  settingsview: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'absolute',
    bottom: scaleHeight(50),
    left: 0,
    right: 0,
    alignSelf: 'flex-start',
    height: scaleHeight(50),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    alignItems: 'center',
  },
  netCarbo: {
    color: COLORS.GREEN,
    fontSize: normalizeFont(14),
    textAlign: 'center',
    marginLeft: scaleWidth(8),
    fontFamily: FONTS.SEGOEUIBOLD
  },
  closeview: {
    marginLeft: scaleWidth(15),
    marginTop: scaleHeight(20),
    height: scaleHeight(40),
    width: scaleWidth(40),
    alignItems: 'center',
    justifyContent: 'center'
  },
  mapview: {
    marginLeft: scaleWidth(25),
    marginTop: scaleHeight(20),
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmodalView: {
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
    bottom: 90,
    borderRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  headerLine: {
    backgroundColor: COLORS.NEW_HEADER,
    width: '100%',
    flexDirection: 'row',
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
    tintColor: COLORS.WHITE
  },
  saveText: {
    color: COLORS.WHITE,
    fontFamily: FONTS.SEGOEUISEMIBOLD,
    fontSize: normalizeFont(14),
    fontWeight: '600',
  },
  menuWrapper: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? '0%' : '15%',
  },
  menuListWrapper: {
    marginTop: scaleHeight(30),
  },
  menuList: {
    marginTop: scaleHeight(20),
    height: '72%',
  },
  menuListContent: {
    paddingBottom: scaleHeight(100),
  },
  menuGroupWrapper: {
    marginBottom: scaleHeight(5),
  },
  mainMenuContainer: {
    flexDirection: 'row',
    marginLeft: scaleWidth(10),
    alignItems: 'center',
    width: '80%',
    borderRadius: 10,
  },
  chevronIcon: {
    marginLeft: scaleWidth(45),
  },
  subMenuWrapper: {
    marginTop: scaleHeight(3),
    marginLeft: scaleWidth(10),
    width: '80%',
  },
  subMenuRow: {
    borderRadius: 10,
  },
  subMenuIcon: {
    marginLeft: scaleWidth(30),
  },
  subSubIcon: {
    marginLeft: scaleWidth(60),
  },
  iconSpacing: {
    marginRight: scaleWidth(10),
  },
});