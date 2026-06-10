importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCsegOJYxJ6xGfYzyfAYpgV071ecqxLwZE",
    authDomain: "namaz-dagestan-app.firebaseapp.com",
    projectId: "namaz-dagestan-app",
    storageBucket: "namaz-dagestan-app.firebasestorage.app",
    messagingSenderId: "25438159159",
    appId: "1:25438159159:web:211bb662319c356ff8dab2"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Фоновое уведомление:', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3069/3069175.png',
        vibrate: [200, 100, 200]
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
