import { Slot } from "expo-router";
import { GlobalProvider } from "@/components/GlobalSearch"; 

export default function Layout() {
  return (
    <GlobalProvider>
      <Slot /> 
    </GlobalProvider>
  );
}
