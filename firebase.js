import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAcMbrhIothHSslJL7Z-6s6qn-ufEqNXLs",
  authDomain: "v2-ee77b.firebaseapp.com",
  projectId: "v2-ee77b",
  storageBucket: "v2-ee77b.appspot.com",
  messagingSenderId: "867716133792",
  appId: "1:867716133792:web:65ff3b32f17ac5a0afeac5"
};

const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

const db = app.firestore();

export default db;