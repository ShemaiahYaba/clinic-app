importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAI7R0Fw-Eb99fioe5XJjJAW8vLa3NppHE",
  authDomain: "clinic-app-ca8da.firebaseapp.com",
  projectId: "clinic-app-ca8da",
  storageBucket: "clinic-app-ca8da.firebasestorage.app",
  messagingSenderId: "34561263747",
  appId: "1:34561263747:android:45ba8acf9dbdd17396b3b6"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/images/notification_icon.png',
    badge: '/assets/images/notification_icon.png',
    vibrate: [200, 100, 200],
    sound: '/assets/sound/emergency_alert.wav'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
  