import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../Screens/Auth/Login';
import Splash from '../Screens/Auth/Splash';
import OnboardingScreen from '../Screens/Auth/OnboardingScreen'
import SideTab from '../Navigation/SideTab';
import ChatScreen from  '../Screens/Chats/ChatScreen';
const Stack = createNativeStackNavigator();
function MainStack() {
  return (
    <Stack.Navigator id="RootStack">
      <Stack.Screen
        name="Splash"
        component={Splash}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animationTypeForReplace: 'push',
          animation: 'slide_from_bottom'
        }}
      />
      <Stack.Screen
        name="OnboardingScreen"
        component={OnboardingScreen}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animationTypeForReplace: 'push',
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animationTypeForReplace: 'push',
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen
        name="MainScreen"
        component={SideTab}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animationTypeForReplace: 'push',
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animationTypeForReplace: 'push',
          animation: 'slide_from_right'
        }}
      />

    </Stack.Navigator>
  );
}

export default MainStack;