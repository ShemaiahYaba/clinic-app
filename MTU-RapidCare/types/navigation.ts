export type AppRoutes = {
  index: undefined;
  splash: undefined;
  auth: undefined;
  '/(tabs)': undefined;
  '/(tabs)/home': undefined;
  '/(tabs)/emergencies': undefined;
  '/(tabs)/profile': undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends AppRoutes {}
  }
}

export type RootStackParamList = AppRoutes; 