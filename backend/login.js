  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCiWR2ZBY3uZ7YVCjIfSdIsKAq0rhKQkX0",
    authDomain: "utax-login.firebaseapp.com",
    projectId: "utax-login",
    storageBucket: "utax-login.firebasestorage.app",
    messagingSenderId: "700335224969",
    appId: "1:700335224969:web:ffcb77cddf47f8b0c66e58",
    measurementId: "G-5WLQVVW2ZT"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);