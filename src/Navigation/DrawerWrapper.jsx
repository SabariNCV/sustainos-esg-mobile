import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerSceneWrapper from '../Components/DrawerSceneWrapper';
import { View } from 'react-native';
import MainScreen from '../Screens/MainContent/MainScreen';
import { COLORS } from '../Constants/Colors';
const Stack = createNativeStackNavigator();
function DrawerWrapper() {
    return (
    <DrawerSceneWrapper>
    <View style={{ flex: 1,backgroundColor: COLORS.NEW_HEADER }}>
        <Stack.Navigator>
          <Stack.Screen
            name="HomePage"
            component={MainScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
    </View>
    </DrawerSceneWrapper>
    )
};
export default DrawerWrapper;