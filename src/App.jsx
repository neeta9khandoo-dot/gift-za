// src/App.jsx  (replace the whole file with this)
import { BrowserRouter } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import Home from "./pages/Home";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// The one and only BrowserRouter lives here.
// Home.jsx now contains <Routes> plus the Nav, Footer and BottomNav,
// so every URL (including /privacy, /partner/... and /redeem) gets the
// same header and footer.
export default function App() {
  return (
    <BrowserRouter>
      <Home db={db} />
    </BrowserRouter>
  );
}