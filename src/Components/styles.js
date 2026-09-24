import { StyleSheet, Platform } from 'react-native';
import { scaleHeight, scaleWidth, normalizeFont } from '../Constants/dynamicSize';
import { FONTS } from '../Constants/Fonts';
import { COLORS } from '../Constants/Colors';

export const chartStyles = StyleSheet.create({
  headerbox: {
    backgroundColor: COLORS.WHITE,
    shadowColor: Platform.OS === 'ios' ? '#fff' : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 10,
    borderColor: '#D3D3D3',
    width: '100%',
    alignSelf: 'center',
  },
  charttitle: {
    textAlign: 'left',
    fontSize: normalizeFont(14),
    fontWeight: '800',
    color: COLORS.BLACK,
    fontFamily: FONTS.SEGOEUISEMIBOLD,
    marginVertical: scaleHeight(10),
  },
  Modalbox: {
    position: 'absolute',
    backgroundColor: COLORS.WHITE,
    right: 0,
    bottom: Platform.OS === 'ios' ? 0 : 5,
    borderColor: COLORS.BLUE_BG,
    borderWidth: 1,
  },
  backgroundImage: {
    width: scaleWidth(280),
    overflow: 'hidden',
  },
  insightView: {
    backgroundColor: COLORS.BLUE_NEW,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: scaleHeight(10),
    paddingHorizontal: 20,
  },
  insights: {
    fontWeight: 'bold',
    color: COLORS.WHITE,
    fontSize: normalizeFont(14),
  },
});