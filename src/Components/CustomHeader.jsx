import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import { FONTS } from '../Constants/Fonts';
import { scaleWidth, scaleHeight, normalizeFont } from '../Constants/dynamicSize';
import { IMAGES } from '../Constants/Images';
import { COLORS } from '../Constants/Colors';
import { useDispatch, useSelector } from 'react-redux';
// import { fetchNotificationCount } from '../Redux/ReduxSlice/actions/';
import * as Animatable from 'react-native-animatable';



const CustomHeader = (props) => {
    const navigation = props?.navigation
    const icon = props?.icon
    const dispatch = useDispatch();
   
    const userDetails = useSelector((state) => state.authSlice.userDetails);
    const notificationCount = useSelector((state) => state.mainSlice.notificationcount);
    const baseUrl = useSelector(state => state.mainSlice.baseUrlIs);
    const projectId = useSelector((state) => state.authSlice.userDetails?.projectName?.id);

    // useEffect(() => {
    //     dispatch(fetchNotificationCount({ baseUrl, projectId }));
    // }, [baseUrl, projectId]);

    return (
        <View style={{ backgroundColor: COLORS.NEW_HEADER }}>
            <View style={styles.rowheader}>
                <View style={styles.headerimage}>
                    <View>
                        <Image source={IMAGES.SustainOS} style={[styles.logoIcon]} resizeMode="contain" />
                        {/* <Image source={IMAGES.pockets} style={[styles.pocketImage]} resizeMode="contain" /> */}

                    </View>
                    <View style={{ width: scaleWidth(180), }}>
                        <Text style={styles.headertitle}>{"ESG-SustainOS"}</Text>
                    </View>
                    <TouchableOpacity activeOpacity={1} accessibilityLabel='Notification Button'>
                        <Image style={styles.ncvIcon} resizeMode="contain" source={IMAGES.ncv} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={[styles.headerimage, { backgroundColor: COLORS.NEW_HEADER }]}>
                {icon === 'leftarrow' &&
                    <TouchableOpacity style={styles.menuview} onPress={props?.goback}>
                        <View style={styles.menuviewTouch}>
                            <Image style={styles.leftIcon} resizeMode="contain" source={IMAGES.leftarrow} />
                        </View>
                    </TouchableOpacity>}
                {icon === 'menu' &&
                    <TouchableOpacity style={styles.menuview} onPress={() => navigation.openDrawer()}>
                        <View style={styles.menuviewTouch}>
                            <Image
                                style={styles.menuIcon}
                                resizeMode="contain"
                                source={IMAGES.menu}
                            />
                        </View>
                    </TouchableOpacity>}
                <View style={{ alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
                    {props?.title && <Animatable.Text numberOfLines={1} animation="pulse" easing="ease-out" iterationCount={2} style={[styles.title, { right: props?.filter ? Platform.OS === 'ios' ? -10 : scaleWidth(0) : Platform.OS === 'ios' ? 0 : scaleWidth(5) }]}>{(props?.title)}</Animatable.Text>}
                </View>

                <View style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

                    <View style={styles.notificationicon} onPress={() => navigation.navigate('Notification')} accessibilityLabel='Notification Button'>
                        {props?.filter}
                        {/* <Image style={styles.notificationIcon} resizeMode="contain" source={IMAGES.notification} />
                        <View style={styles.roundIcon}>
                            <Animatable.Text animation="pulse" easing="ease-out" iterationCount={'infinite'} style={styles.notificationCount}>{notificationCount ? notificationCount : '0'}</Animatable.Text>
                        </View> */}
                    </View>
                </View>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    rowheader: {
        alignItems: 'flex-start',
    },
    headerimage: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        overflow: 'hidden',
        alignSelf: 'center',
        backgroundColor: COLORS.WHITE
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    logoIcon: {
        width: 90,
        height: 30,
        marginLeft: scaleWidth(18)
    },
    pocketImage: {
        width: 60,
        height: 10,
        alignSelf: 'flex-end',
        marginBottom: scaleHeight(6)
    },
    ncvIcon: {
        width: 60,
        height: 40,
        marginRight: scaleWidth(15),
    },
    menuview: {
        width: Platform.OS === 'ios' ? scaleWidth(60) : scaleWidth(70),
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        right: scaleWidth(2)
    },
    menuviewTouch: {
        width: scaleWidth(70),
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: normalizeFont(16),
        color: COLORS.WHITE,
        fontFamily: FONTS.SEGOEUIBOLD,
    },
    notificationCount: {
        fontSize: normalizeFont(10),
        color: COLORS.WHITE,
        fontFamily: FONTS.SEGOEUIBOLD,
        alignSelf: 'center',
        fontWeight: 'bold',
    },
    notificationIcon: {
        height: scaleHeight(20),
        width: scaleWidth(20),
        top: scaleHeight(4),
        right: scaleWidth(4),
        tintColor: COLORS.WHITE
    },
    header: {
        flexDirection: 'row',
        height: scaleHeight(40),
        backgroundColor: COLORS.NEW_HEADER,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Platform.OS === 'ios' ? '#fff' : '#000',
        shadowOffset: { width: 0, height: scaleWidth(2) },
        shadowOpacity: 0.8,
        shadowRadius: scaleWidth(2),
        elevation: scaleWidth(2),
        borderColor: '#D3D3D3',
    },
    menuIcon: {
        height: 20,
        width: 20,
        tintColor: COLORS.WHITE,
    },
    leftIcon: {
        height: 20,
        width: 20,
        tintColor: COLORS.WHITE,
        right: scaleWidth(2)
    },
    headertitle: {
        textAlign: 'center',
        fontSize: normalizeFont(14),
        fontWeight: '700',
        color: COLORS.BLACK,
        fontFamily: FONTS.SEGOEUIBOLD,
        right: scaleWidth(10)
    },
    roundIcon: {
        borderRadius: scaleWidth(16),
        backgroundColor: COLORS.RED,
        alignItems: 'center',
        position: 'absolute',
        left: scaleWidth(20),
        bottom: scaleHeight(6),
        height: scaleHeight(16),
        width: scaleHeight(16),
        justifyContent: 'center'
    },
    notificationicon: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        width: scaleWidth(50),
        height: scaleHeight(20),
        marginVertical: scaleHeight(8)
    },
    right: {
        alignSelf: 'flex-end',
    }
})
export default CustomHeader;