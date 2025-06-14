// utils/supabaseClient.ts
import { Platform } from "react-native";

const supabase = Platform.select({
  native: require("./supabaseClient.native").supabase,
  default: require("./supabaseClient.web").supabase,
});

export { supabase };
