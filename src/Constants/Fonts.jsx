import { Platform } from "react-native"
export const FONTS = {
    NUNITOSANSBLACK: Platform.OS === 'ios' ? 'Nunito Sans 10pt Black':'NunitoSans-Black',
    NUNITOSANSBLACKITALIC: Platform.OS === 'ios' ? 'Nunito Sans 10pt Black Italic':'NunitoSans-BlackItalic',
    NUNITOSANSBOLD: Platform.OS === 'ios' ? 'Nunito Sans 10pt Bold' : 'NunitoSans-Bold',
    NUNITOSANSBOLDITALIC: Platform.OS === 'ios' ? 'Nunito Sans 10pt Bold Italic':'NunitoSans-BoldItalic',
    NUNITOSANSEXTRABOLD: Platform.OS === 'ios' ? 'Nunito Sans 10pt ExtraBold':'NunitoSans-ExtraBold',
    NUNITOSANSEXTRABOLDITALIC: Platform.OS === 'ios' ? 'Nunito Sans 10pt ExtraBold Italic':'NunitoSans-ExtraBoldItalic',
    NUNITOSANSEXTRALIGHT: Platform.OS === 'ios' ? 'Nunito Sans 10pt ExtraLight':'NunitoSans-ExtraLight',
    NUNITOSANSEXTRALIGHTITALIC: Platform.OS === 'ios' ? 'Nunito Sans 10pt ExtraLight Italic':'NunitoSans-ExtraLightItalic',
    NUNITOSANSITALIC: Platform.OS === 'ios' ? 'Nunito Sans 10pt Italic':'NunitoSans-Italic',
    NUNITOSANSLIGHT: Platform.OS === 'ios' ? 'Nunito Sans 10pt Light':'NunitoSans-Light',
    NUNITOSANSLIGHTITALIC: Platform.OS === 'ios' ? 'Nunito Sans 10pt Light Italic':'NunitoSans-LightItalic',
    NUNITOSANSMEDIUM: Platform.OS === 'ios' ? 'Nunito Sans 10pt Medium' : 'NunitoSans-Medium',
    NUNITOSANSMEDIUMITALIC:  Platform.OS === 'ios' ? 'Nunito Sans 10pt Medium Italic' : 'NunitoSans-MediumItalic',
    NUNITOSANSREGULAR: Platform.OS === 'ios' ? 'Nunito Sans 10pt Regular' :'NunitoSans-Regular',
    SEGOEUIREGULAR: Platform.OS === 'ios' ? 'Segoe UI' : 'Segoe-UI',
    SEGOEUISEMIBOLD: Platform.OS === 'ios' ? 'Segoe UI Semibold' : 'Segoe-UI-Semibold',
    SEGOEUIBOLD: Platform.OS === 'ios' ? 'Segoe-UI-Bold' : "Segoe-UI-Bold"
}