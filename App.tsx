import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from "react-redux";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import store from "./src/Redux/store";
import MainStack from './src/Navigation/MainStack';
library.add(fas);

export default function App() {

  LogBox.ignoreLogs(['Warning: ...']);
  LogBox.ignoreAllLogs(); 
    
  return (
      <Provider store={store}>
          <NavigationContainer >
            <MainStack />
          </NavigationContainer>
      </Provider>
  );
};