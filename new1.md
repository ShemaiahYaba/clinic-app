I've identified several inconsistencies and potential issues in the data flow:
User Authentication Flow Inconsistencies ⚠️
CreateAccount.tsx calls registerUser but doesn't store the user ID/token in global state
LoginAccount.tsx properly stores auth data using setUserAuth
EmergencyPage.tsx reads from AsyncStorage directly instead of using global state
Device Token Management Issues ⚠️
Multiple places handle device token registration:
registerUser in authService.ts
registerDevice in notifications.ts
registerForPushNotificationsAsync in EmergencyPage.tsx
No clear single source of truth for device token management
Global State Management ⚠️
GlobalSearch.tsx has good state management but isn't consistently used
Some components use direct AsyncStorage access instead of global state
Emergency alert state is managed in multiple places
Authentication Token Handling ⚠️
Inconsistent token storage:
Some places use AsyncStorage directly
Others use global state
Supabase client has its own storage
Project ID Inconsistency ⚠️
Hardcoded project ID in multiple places:
authService.ts: 'c90572c1-39a6-414b-9547-eac1231e32e6'
EmergencyPage.tsx: Uses Constants.expoConfig?.extra?.eas?.projectId