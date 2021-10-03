import DebugConfig from '../Config/DebugConfig';
import Reactotron from 'reactotron-react-native';
import AppConfig from '../Config/AppConfig';

if (DebugConfig.useReactotron) {
  // https://github.com/infinitered/reactotron for more options!
  Reactotron
    .configure({
      name: AppConfig.app_name
    })
    .useReactNative()
    .connect()

  // Let's clear Reactotron on every time we load the app
  Reactotron.clear()

  // Totally hacky, but this allows you to not both importing reactotron-react-native
  // on every file.  This is just DEV mode, so no big deal.
  console.tron = Reactotron
  Reactotron.log(Reactotron)
}
