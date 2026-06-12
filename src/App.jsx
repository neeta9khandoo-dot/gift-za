import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import OrdersPage from "./pages/OrdersPage";
import AuthPage from "./pages/AuthPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import RedeemPage from "./pages/RedeemPage";
import HelpCentrePage from "./pages/HelpCentrePage";
import ContactPage from "./pages/ContactPage";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBx01_b7Dkm6QCnZiGnSrRK0dZGf9p5IaY",
  authDomain: "gift-za.firebaseapp.com",
  projectId: "gift-za",
  storageBucket: "gift-za.firebasestorage.app",
  messagingSenderId: "732762883935",
  appId: "1:732762883935:web:1fc9b21f71c9ffaa43d8ea",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ── Auth guard: redirects to /auth if not logged in ──────
function Protected({ user, loading, children }) {
  if (loading) return null; // wait for auth state
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

// ── All routes ────────────────────────────────────────────
function AppRoutes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const handleAuthSuccess = () => navigate("/");

  return (
    <Routes>
      {/* ── Public ── */}
      <Route
        path="/"
        element={<Home db={db} onAuthSuccess={handleAuthSuccess} />}
      />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route
        path="/help"
        element={<HelpCentrePage setPage={(p) => navigate(`/${p}`)} />}
      />
      <Route
        path="/contact"
        element={
          <ContactPage firebaseApp={app} setPage={(p) => navigate(`/${p}`)} />
        }
      />

      {/* ── Auth ── */}
      <Route
        path="/auth"
        element={
          user ? (
            <Navigate to="/" replace /> // already logged in → home
          ) : (
            <AuthPage firebaseApp={app} onSuccess={handleAuthSuccess} />
          )
        }
      />

      {/* ── Protected ── */}
      <Route
        path="/admin"
        element={
          <Protected user={user} loading={authLoading}>
            <AdminPage
              user={user}
              onLogout={() => {
                auth.signOut();
                navigate("/");
              }}
            />
          </Protected>
        }
      />
      <Route
        path="/redeem"
        element={
          <Protected user={user} loading={authLoading}>
            <RedeemPage user={user} />
          </Protected>
        }
      />
      <Route
        path="/orders"
        element={
          <Protected user={user} loading={authLoading}>
            <OrdersPage user={user} />
          </Protected>
        }
      />

      {/* ── Category browsing ── */}
      <Route
        path="/category/:cat"
        element={
          <CategoryPage onBack={() => navigate("/")} onOpenVoucher={() => {}} />
        }
      />

      {/* ── 404 fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
