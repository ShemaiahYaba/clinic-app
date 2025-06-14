import { registerRootComponent } from "expo";

import App from "./app";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
// If you want to use the app in a web environment, you can also import
