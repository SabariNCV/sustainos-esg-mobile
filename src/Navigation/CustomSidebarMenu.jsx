import React, { useCallback, useState } from 'react';
import { Text, View, TouchableOpacity, FlatList, StatusBar, Alert, Platform } from 'react-native';
import { styles } from './styles';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { fas } from '@fortawesome/pro-solid-svg-icons';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scaleHeight, scaleWidth } from '../Constants/dynamicSize';
import { userDetails, logoutAuth, pageName } from '../Redux/ReduxSlice/authSlice';
import { resetHeight, menuBackground, title, logoutReset, emptyChartData, panelemptyChartData } from '../Redux/ReduxSlice/mainSlice';
import { COLORS } from '../Constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOutIcon } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

const transparent = 'transparent';

const menuItems = [
  { id: '1', menu_name: 'Dashboard', icon: 'faGaugeHigh', pagelink: { id: 'dashboard', title: 'Dashboard' } },
  { id: '2', menu_name: 'Summary', icon: 'faFileLines', pagelink: { id: 'summary', title: 'Summary' } },
  { id: '3', menu_name: 'Logout', icon: 'faRightFromBracket', isLogout: true }
];

export default function CustomSidebarMenu({ navigation }) {
  const dispatch = useDispatch();
  const menucolor = useSelector((state) => state.mainSlice.menuBackground);
  const [currentMenu, setCurrentMenu] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleNavigation = (menuItem) => {
    const pageLink = menuItem.pagelink;
    setCurrentMenu(menuItem?.menu_name);
    dispatch(resetHeight());
    dispatch(userDetails({ key: 'pageId', value: pageLink?.id }));
    dispatch(userDetails({ key: 'PageName', value: pageLink?.title }));
    dispatch(pageName(pageLink?.title));
    dispatch(title(menuItem?.menu_name));
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: 'HomePage', params: { title: menuItem?.menu_name, pageId: pageLink?.id, pagetitle: pageLink?.title } }
        ]
      })
    );
    navigation.closeDrawer();
  };

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      
      const rootNavigation = navigation.getParent('RootStack') || navigation.getParent() || navigation;
      rootNavigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }));
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, navigation]);

  const confirmLogout = useCallback(() => {
    Alert.alert('Hold on!', 'Are you sure you want to Logout?', [
      { text: 'Cancel', onPress: () => null, style: 'cancel' },
      { text: 'YES', onPress: handleLogout }
    ]);
  }, [handleLogout]);

  const handleClick = useCallback(
    (item) => {
      if (item.isLogout) {
        confirmLogout();
        return;
      }
      if (item?.menu_name === currentMenu) return;
      dispatch(panelemptyChartData());
      dispatch(emptyChartData());
      handleNavigation(item);
    },
    [currentMenu, dispatch, confirmLogout]
  );

  return (
    <View style={[styles.container, { backgroundColor: menucolor, borderColor: menucolor }]}>
      <SafeAreaView style={[styles.container, { backgroundColor: menucolor, borderColor: menucolor }]}>
        <StatusBar backgroundColor={transparent} translucent />
        <View style={{ flex: 1, marginTop: Platform.OS === 'ios' ? '0%' : '15%' }}>
          <TouchableOpacity onPress={() => navigation?.closeDrawer()}>
            <View style={styles.closeview}>
              <FontAwesomeIcon icon={faXmark} size={20} color={COLORS.BLACK} />
            </View>
          </TouchableOpacity>
          <View style={{ marginTop: scaleHeight(30) }}>
            <FlatList
              data={menuItems}
              keyExtractor={(item) => item.id}
              style={{ marginTop: scaleHeight(20), height: '72%' }}
              contentContainerStyle={{ paddingBottom: scaleHeight(100), height: scaleHeight(400) }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleClick(item)}>
                  <View style={[ styles.row, { borderRadius: 10, marginLeft: scaleWidth(10), backgroundColor: currentMenu === item.menu_name ? COLORS.LIGHT_GRAY : transparent } ]} >
                    <View style={styles.icon}>
                      {item.isLogout ? (
                        <LogOutIcon size={16} color={COLORS.BLACK} style={{ marginRight: scaleWidth(10) }} />
                      ) : (
                        <FontAwesomeIcon
                          icon={fas[item.icon]}
                          size={16}
                          color={COLORS.BLACK}
                          style={{ marginRight: scaleWidth(10) }}
                        />
                      )}
                      <Text style={styles.title}>{item.menu_name}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}