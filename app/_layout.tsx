import { Slot } from "expo-router";
import { GlobalProvider } from "@/components/GlobalSearch";
import Toast from "react-native-toast-message";

export default function Layout() {
  return (
    <GlobalProvider>
      <Slot />
      <Toast />
    </GlobalProvider>
  );
}
