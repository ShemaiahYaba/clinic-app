import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAI7R0Fw-Eb99fioe5XJjJAW8vLa3NppHE",
  authDomain: "clinic-app-ca8da.firebaseapp.com",
  projectId: "clinic-app-ca8da",
  storageBucket: "clinic-app-ca8da.firebasestorage.app",
  messagingSenderId: "34561263747",
  appId: "1:34561263747:android:45ba8acf9dbdd17396b3b6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

export { app, messaging }; 