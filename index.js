/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './App/Modules/General/App';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerRunnable(appName, async (initialProps) => {
  try {
    AppRegistry.registerComponent(appName, () => App)
    AppRegistry.runApplication(appName, initialProps)
  } catch (e) {
    console.log(e)
  }
})
