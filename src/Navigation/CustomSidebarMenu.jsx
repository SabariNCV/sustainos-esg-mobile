import React, { useEffect, useState, memo } from 'react';
import { Text, View, TouchableOpacity, FlatList, StatusBar, Alert } from 'react-native';
import { styles } from './styles';
import { Icon } from 'react-native-elements';
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { fas } from '@fortawesome/pro-solid-svg-icons';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userDetails, pageName } from '../Redux/ReduxSlice/authSlice';
import { getMenuProjectDetails, getGroupMenuDetails } from '../Redux/ReduxSlice/actions/authActions';
import { COLORS } from '../Constants/Colors';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut } from 'lucide-react-native';

const generateMenuKey = (prefix, item, index) => {
  return `${prefix}-${item?.id || item?.menu_name || 'item'}-${index}`;
};

const MenuItem = memo(({ element, currentMenu, expandedSubMenu, menuTheme, onItemPress, onNavigate }) => {
  if (!element) return null;

  const renderSubSubMenu = (subSubMenuList) => (
    <FlatList
      data={subSubMenuList}
      keyExtractor={(item, index) => generateMenuKey('subSubMenu', item, index)}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onNavigate(item)}>
          <View style={styles.row}>
            <View style={[styles.icon, styles.subSubIcon]}>
              <FontAwesomeIcon icon={fas[item?.icon || "faAngleRight"]} size={20} color={COLORS.BLACK} style={styles.iconSpacing} />
              <Text style={styles.subsubtitle}>{item.menu_name}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );

  const renderSubMenu = (subMenuList) => (
    <FlatList
      data={subMenuList}
      keyExtractor={(item, index) => generateMenuKey('subMenu', item, index)}
      renderItem={({ item }) => (
        <View style={styles.subMenuWrapper}>
          <TouchableOpacity onPress={() => onItemPress(item)}>
            <View style={[ styles.row, styles.subMenuRow, { backgroundColor: currentMenu === item?.menu_name ? menuTheme?.advancedBgColor : 'transparent' } ]}>
              <View style={[styles.icon, styles.subMenuIcon]}>
                <FontAwesomeIcon icon={fas[item?.icon || "faAngleRight"]} size={16} color={currentMenu === item?.menu_name ? menuTheme?.advancedColor : menuTheme?.childColor} style={styles.iconSpacing} />
                <Text style={[
                  styles.subtitle,
                  { color: currentMenu === item?.menu_name ? menuTheme?.advancedColor : menuTheme?.childColor }
                ]}>
                  {item.menu_name}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {item.sub_sub_menu?.length > 0 && renderSubSubMenu(item.sub_sub_menu)}
        </View>
      )}
    />
  );

  const renderMainMenuItem = (item, index) => {
    const isActive = currentMenu === item?.menu_name;
    const isExpanded = expandedSubMenu === item?.menu_name;

    return (
      <View style={[ styles.mainMenuContainer, { backgroundColor: isActive ? menuTheme?.advancedBgColor : 'transparent' } ]} >
        <TouchableOpacity onPress={() => onItemPress(item)} accessibilityLabel='Menu Button' style={styles.rowelements}>
          <View style={styles.row}>
            <View style={styles.icon}>
              <FontAwesomeIcon
                icon={fas[item?.icon || "faAngleRight"]}
                size={16}
                color={isActive ? menuTheme?.advancedColor : menuTheme?.childColor}
                style={styles.iconSpacing}
              />
              <Text style={[styles.title, { color: isActive ? menuTheme?.advancedColor : menuTheme?.childColor }]}>
                {item.menu_name}
              </Text>
            </View>
          </View>
          {item.sub_menu?.length > 0 && (
            <Icon
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={isActive ? menuTheme?.advancedColor : menuTheme?.childColor}
              type='entypo'
              style={styles.chevronIcon}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.menuGroupWrapper}>
      {element?.group_name && <Text style={styles.group}>{element.group_name}</Text>}
      {element?.menu_data?.map((item, index) => (
        <View key={generateMenuKey('menuData', item, index)}>
          {renderMainMenuItem(item, index)}
          {expandedSubMenu === item.menu_name && item.sub_menu?.length > 0 && renderSubMenu(item.sub_menu)}
        </View>
      ))}
    </View>
  );
});

export default function CustomSidebarMenu({ navigation }) {
  const dispatch = useDispatch();
  const usermenu = useSelector(state => state.authSlice.menu);
  const menuTheme = useSelector(state => state.authSlice.menuTheme);
  const [currentmenu, setCurrentmenu] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [expandedSubMenu, setExpandedSubMenu] = useState(null);
  const menucolor = useSelector(state => state.mainSlice.menuBackground);
  useEffect(() => {
    initializeMenu();
  }, []);

  const initializeMenu = async () => {
    try {
      const projectDetails = await dispatch(getMenuProjectDetails()).unwrap();
      const menuId = projectDetails?.[0]?.id;
      const groupMenuData = await dispatch(getGroupMenuDetails(menuId)).unwrap();
      setDefaultNavigation(groupMenuData);
    } catch (error) {
      console.error('Menu initialization error:', error);
    }
  };

  const setDefaultNavigation = (groupMenuData) => {
    const rootMenu = groupMenuData?.[0];
    const mainMenuItem = rootMenu?.menu_data?.[0];
    if (!mainMenuItem) return;

    if (mainMenuItem.sub_menu?.length < 1) {
      handleNavigation(mainMenuItem);
      return;
    }

    const subMenuItem = mainMenuItem.sub_menu[0];
    if (subMenuItem.sub_sub_menu?.length < 1) {
      handleNavigation(subMenuItem);
      setExpandedSubMenu(rootMenu?.menu_name);
      return;
    }

    handleNavigation(subMenuItem.sub_sub_menu[0]);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await AsyncStorage.removeItem('jwttoken');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (error) {
      console.error("Logout error: ", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const onBackPress = () => {
    Alert.alert('Hold on!', 'Are you sure you want to Logout?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      { text: 'YES', onPress: () => handleLogout() },
    ]);
    return true;
  };

  const handleNavigation = (subSubItem) => {
    setCurrentmenu(subSubItem?.menu_name);
    const pageLink = subSubItem.pagelink;
    dispatch(userDetails({ key: "pageId", value: pageLink?.id }));
    dispatch(userDetails({ key: "PageName", value: pageLink?.title }));
    dispatch(pageName(pageLink?.title));
    navigation.navigate('DrawerWrapper', {
      title: subSubItem?.menu_name,
      pageId: pageLink?.id,
      pagetitle: pageLink?.title,
    });
    navigation.closeDrawer();
  };

  const handleClick = (item) => {
    if (item.sub_menu?.length > 0) {
      toggleSubMenu(item.menu_name);
      return;
    }
    if (item?.menu_name === currentmenu) {
      return;
    }
    handleNavigation(item);
  };

  const toggleSubMenu = (menuName) => {
    setExpandedSubMenu(prev => (prev === menuName ? null : menuName));
  };

  return (
    <View style={[styles.container, { backgroundColor: menucolor, borderColor: menucolor }]}>
        <SafeAreaView style={[styles.container, { backgroundColor: menucolor, borderColor: menucolor }]}>
        <StatusBar backgroundColor="transparent" translucent={true} />
        <View style={styles.menuWrapper}>
          <TouchableOpacity onPress={() => navigation?.closeDrawer()}>
            <View style={styles.closeview}>
              <FontAwesomeIcon icon={faXmark} size={20} color={menuTheme?.childColor ? menuTheme?.childColor : COLORS.BLACK} />
            </View>
          </TouchableOpacity>
          <View style={styles.menuListWrapper}>
            <FlatList
              data={usermenu}
              extraData={expandedSubMenu}
              keyExtractor={(item, index) => generateMenuKey('main', item, index)}
              style={styles.menuList}
              contentContainerStyle={styles.menuListContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <MenuItem
                  element={item}
                  currentMenu={currentmenu}
                  expandedSubMenu={expandedSubMenu}
                  menuTheme={menuTheme}
                  onItemPress={handleClick}
                  onNavigate={handleNavigation}
                />
              )}
            />
          </View>
        </View>
        <View style={styles.settingsview}>
          <TouchableOpacity onPress={() => onBackPress()} style={styles.logoutview}>
            <LogOut name="logout" size={20} color={COLORS.BLACK} />
            <Text style={[styles.logout, { color: '#000' }]}>
              {"Logout"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}