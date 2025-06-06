import { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import LoadScreen from "../components/LoadScreen";
import CreateAccount from '@/app/(Authentication)/CreateAccount'


export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'load_screen': require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setTimeout(() => setIsLoading(false), 2000); // Simulate a delay
    }
  }, [fontsLoaded, fontError]);

  if (isLoading) {
    return <LoadScreen />;  // Show custom loading screen
  }
  else
  {
  return (
    <CreateAccount/>
  );
}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
