Absolutely! Here's a **detailed point-by-point outline** for implementing the **Supabase-based Emergency Alert System using Expo Push Notifications** in your **React Native (Expo)** app:

---

## ✅ Emergency Alert System (Expo + Supabase) — Full Implementation Outline

---

### **🔧 1. Supabase Setup**

1.1 **Create a Supabase Project**

* Go to [https://supabase.com](https://supabase.com) → New Project
* Save:

  * `SUPABASE_URL`
  * `ANON_KEY` (for app)
  * `SERVICE_ROLE_KEY` (for Edge Functions only)

1.2 **Enable Realtime**

* Enabled by default on Supabase tables
* Used for real-time listening to new alerts

---

### **🗃️ 2. Database Schema**

2.1 **Devices Table**
Stores Expo push tokens for all devices.

```sql
create table devices (
  id uuid primary key default uuid_generate_v4(),
  user_id text,
  expo_token text not null,
  created_at timestamp default now()
);
```

2.2 **Alerts Table**
Stores emergency events — inserting a row here triggers notifications.

```sql
create table alerts (
  id uuid primary key default uuid_generate_v4(),
  sender_id text,
  message text default 'Emergency alert triggered!',
  created_at timestamp default now()
);
```

---

### **📱 3. React Native (Expo) App Integration**

3.1 **Install Required Packages**

```bash
npm install @supabase/supabase-js
expo install expo-notifications expo-device expo-constants
```

3.2 **Initialize Supabase Client**

```ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient("SUPABASE_URL", "ANON_KEY");
```

3.3 **Register Device with Expo Push Token**

```ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

async function registerDevice(userId: string) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted" || !Device.isDevice) return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await supabase.from("devices").insert([{ user_id: userId, expo_token: token }]);
}
```

3.4 **Trigger Emergency Alert**

```ts
async function triggerEmergency(senderId: string) {
  await supabase.from("alerts").insert([{ sender_id: senderId }]);
}
```

3.5 **Listen for Realtime Alerts**

```ts
useEffect(() => {
  const channel = supabase
    .channel("alerts")
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "alerts"
    }, (payload) => {
      console.log("Emergency Alert!", payload);
      // Play sound or update UI
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

---

### **🧠 4. Supabase Edge Function to Send Expo Push**

4.1 **Install & Setup Supabase CLI**

```bash
npm install -g supabase
supabase login
supabase init
```

4.2 **Create New Function**

```bash
supabase functions new send-push-alert
```

4.3 **Function Code (`index.ts`)**

```ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const { sender_id } = await req.json();

  const { data: devices } = await supabase
    .from("devices")
    .select("expo_token")
    .neq("user_id", sender_id);

  const tokens = (devices ?? []).map((d) => d.expo_token);

  const messages = tokens.map((to) => ({
    to,
    sound: "default",
    title: "🚨 Emergency Alert",
    body: "An emergency has been triggered!",
    data: { type: "EMERGENCY_ALERT" }
  }));

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messages)
  });

  return new Response("Push sent");
});
```

4.4 **Deploy the Function**

```bash
supabase functions deploy send-push-alert
```

---

### **⚙️ 5. Optional: Connect Alert to Push Automatically**

5.1 **Option 1: Manual Call (App)**
After triggering an alert, call the edge function via `fetch()` from the app:

```ts
await fetch("https://<project>.functions.supabase.co/send-push-alert", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sender_id }),
});
```

5.2 **Option 2: Automatic DB Trigger**
Set up a **Postgres trigger** that invokes the edge function when a new alert is inserted (requires a webhook setup — let me know if you want this!).

---

### **🔒 6. Final Notes and Best Practices**

* **Token Refresh**: Call `registerDevice()` regularly (e.g., on every app start)
* **Foreground Notifications**: Use `Notifications.addNotificationReceivedListener()`
* **Expo Credentials** (One-time):

  * Android: Upload FCM key in Expo dashboard or `eas.json`
  * iOS: Upload APNs key (.p8 file)
* **Test on real devices**, not simulators/emulators

---

Would you like a GitHub-ready project scaffold or visual diagram for this setup?
