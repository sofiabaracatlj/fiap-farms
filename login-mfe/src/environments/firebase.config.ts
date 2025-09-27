// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDWZ-dusKkdRvpPv0BTl9Pc5gcMi-kLXcM",
    authDomain: "fiap-farms-e0f26.firebaseapp.com",
    projectId: "fiap-farms-e0f26",
    storageBucket: "fiap-farms-e0f26.firebasestorage.app",
    messagingSenderId: "711781164631",
    appId: "1:711781164631:web:5e25a7120234f452eda512"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { firebaseConfig, app };
