import firebase from "/node_modules/.vite/deps/firebase_app.js?v=40a958a8"

import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyARaspdC-wNqVESmfVuJqPCg9wAbomoQrc",
    authDomain: "pet-connect-c53f1.firebaseapp.com",
    databaseURL: "https://pet-connect-c53f1-default-rtdb.firebaseio.com",
    projectId: "pet-connect-c53f1",
    storageBucket: "pet-connect-c53f1.appspot.com",
    messagingSenderId: "304771768372",
    appId: "1:304771768372:web:36bb2fb7014ebd3ec8aa61",
    measurementId: "G-XR8CW0ZJEB"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();

export { db }