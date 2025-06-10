Excellent choice! Supabase gives you a **Firebase-like experience** with more flexibility on the free tier — and **Edge Functions** can replace Firebase Cloud Functions without upgrading a plan.

Here’s your **step-by-step guide** to building the **clinic emergency alert system using Supabase**, fully compatible with your React Native app:

---

## 🚨 Emergency Alert System — Supabase-Based Setup

---

### ✅ **Overview**

Architecture:

```
[React Native App]
   ↕️ Supabase (Postgres DB + Realtime Subscriptions)
   ↕️ Supabase Edge Function (for Push Notifications via FCM)
   → Other Devices
```

---

### 🔧 Part 1: Supabase Setup

#### 1. Create a Supabase Project

- Go to [https://supabase.com](https://supabase.com)
- Click “New Project”
- Create a database
- Save:

  - **Project URL**
  - **Anon/public API key**
  - **Service Role Key** (used by Edge Functions, not in the app)

#### 2. Enable Realtime

Supabase enables realtime on tables by default. We’ll use this for clients to react instantly to alerts.

---

### 🛠️ Part 2: Database Schema

You’ll need a `devices` and an `alerts` table.

#### Devices Table (to store FCM tokens)

```sql
create table devices (
  id uuid primary key default uuid_generate_v4(),
  user_id text,
  fcm_token text not null,
  created_at timestamp default now()
);
```

#### Alerts Table (to trigger emergency)

```sql
create table alerts (
  id uuid primary key default uuid_generate_v4(),
  sender_id text,
  message text default 'Emergency alert triggered!',
  created_at timestamp default now()
);
```

- Any new row in `alerts` = new emergency alert.

---

### 💥 Part 3: React Native Client (Register + Listen)

Install Supabase and FCM libs:

```bash
npm install @supabase/supabase-js @react-native-firebase/app @react-native-firebase/messaging
```

#### 1. Initialize Supabase

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://YOUR_PROJECT.supabase.co";
const supabaseAnonKey = "YOUR_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

#### 2. Register FCM Token to Supabase

```ts
import messaging from "@react-native-firebase/messaging";

async function registerDevice(userId: string) {
  const token = await messaging().getToken();
  await supabase
    .from("devices")
    .insert([{ user_id: userId, fcm_token: token }]);
}
```

#### 3. Trigger Emergency (Insert to `alerts`)

```ts
async function triggerEmergency(senderId: string) {
  await supabase.from("alerts").insert([{ sender_id: senderId }]);
}
```

#### 4. Listen for Emergency Alerts

```ts
useEffect(() => {
  const channel = supabase
    .channel("alerts")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "alerts" },
      (payload) => {
        console.log("Emergency Alert!", payload);
        // Play sound & show UI
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

---

### ⚙️ Part 4: Edge Function (Send FCM Notification)

Supabase **Edge Functions** use Deno.

#### 1. Install Supabase CLI

```bash
npm install -g supabase
supabase login
```

#### 2. Initialize Functions

```bash
supabase init
supabase functions new send-push-alert
```

#### 3. Edge Function Code (Deno)

In `supabase/functions/send-push-alert/index.ts`:

```ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { sendFCM } from "./sendFCM.ts"; // helper module

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const { sender_id } = await req.json();

  const { data: devices } = await supabase
    .from("devices")
    .select("fcm_token, user_id")
    .neq("user_id", sender_id);

  const tokens = devices?.map((d) => d.fcm_token) || [];
  if (tokens.length === 0) return new Response("No tokens", { status: 200 });

  await sendFCM(
    tokens,
    "🚨 Emergency Alert",
    "An emergency has been triggered!"
  );

  return new Response("Push sent", { status: 200 });
});
```

#### 4. Add `sendFCM.ts` Helper

Create `sendFCM.ts` to send push via FCM:

```ts
export async function sendFCM(tokens: string[], title: string, body: string) {
  const res = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      Authorization: "key=YOUR_SERVER_KEY",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      registration_ids: tokens,
      notification: { title, body, sound: "default" },
      data: { type: "EMERGENCY_ALERT" },
    }),
  });

  const result = await res.json();
  console.log("FCM Response:", result);
}
```

> Replace `YOUR_SERVER_KEY` with your **Firebase Cloud Messaging Server Key** (from Firebase Console > Project Settings > Cloud Messaging)

#### 5. Deploy Edge Function

```bash
supabase functions deploy send-push-alert
```

---

### 🔗 Optional: Automate Push from DB Event

You can create a Supabase **trigger** or webhook to call the Edge Function when a new alert is inserted — or call the Edge Function manually from the app after inserting.

---

### ✅ Summary Checklist

| Step | Task                                                |
| ---- | --------------------------------------------------- |
| ✅   | Create Supabase project and tables                  |
| ✅   | Setup React Native: register device and send alerts |
| ✅   | Use realtime listener for alerts                    |
| ✅   | Deploy Edge Function to send push notifications     |
| ✅   | Connect it to call when alert is triggered          |

---

Would you like a GitHub repo starter with this setup or a `.sql` schema file to quickly create the tables?
