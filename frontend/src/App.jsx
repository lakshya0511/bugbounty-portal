// 🧭 App.jsx — Clean, ESLint-compliant, with conditional Navbar & detailed logs

import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Unreviewed from "./pages/Unreviewed";
import Valid from "./pages/Valid";
import Invalid from "./pages/Invalid";
import Login from "./pages/Login";
import AuthSuccess from "./pages/AuthSuccess";
import Leaderboard from "./pages/Leaderboard";
import MyIssues from "./pages/MyIssues";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";

console.log("✅ All imports in App.jsx loaded successfully");

// 🔁 RouteChangeTracker — logs navigation changes
const RouteChangeTracker = () => {
  const location = useLocation();
  useEffect(() => {
    console.log("🔄 Route changed to:", location.pathname);
  }, [location]);
  return null;
};

// 🌐 Main App
function App() {
  const location = useLocation();
  console.log("🚀 App.jsx rendered at:", location.pathname);

  // Hide Navbar on login and auth success pages
  const hideNavbarPaths = ["/login", "/auth/success"];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <RouteChangeTracker />

      <Routes>
        {/* Default route → Login */}
        <Route
          path="/"
          element={
            <>
              {console.log("➡ Redirecting to /login")}
              <Navigate to="/login" />
            </>
          }
        />

        {/* Public routes */}
        <Route
          path="/login"
          element={
            <>
              {console.log("🟢 Rendering Login Page")}
              <Login />
            </>
          }
        />
        <Route
          path="/auth/success"
          element={
            <>
              {console.log("🟢 Rendering AuthSuccess Page")}
              <AuthSuccess />
            </>
          }
        />

        {/* Reviewer-only routes */}
        <Route
          path="/unreviewed"
          element={
            <>
              {console.log("🟣 Rendering Unreviewed Page (Protected)")}
              <ProtectedRoute requireReviewer>
                <Unreviewed />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/valid"
          element={
            <>
              {console.log("🟣 Rendering Valid Page (Protected)")}
              <ProtectedRoute requireReviewer>
                <Valid />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/invalid"
          element={
            <>
              {console.log("🟣 Rendering Invalid Page (Protected)")}
              <ProtectedRoute requireReviewer>
                <Invalid />
              </ProtectedRoute>
            </>
          }
        />

        {/* Logged-in user routes */}
        <Route
          path="/leaderboard"
          element={
            <>
              {console.log("🔵 Rendering Leaderboard Page (Protected)")}
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/my"
          element={
            <>
              {console.log("🔵 Rendering MyIssues Page (Protected)")}
              <ProtectedRoute>
                <MyIssues />
              </ProtectedRoute>
            </>
          }
        />

        {/* Unauthorized page */}
        <Route
          path="/unauthorized"
          element={
            <>
              {console.log("🔴 Rendering Unauthorized Page")}
              <Unauthorized />
            </>
          }
        />

        {/* Catch-all fallback */}
        <Route
          path="*"
          element={
            <>
              {console.log("⚠️ Unknown path, redirecting to /login")}
              <Navigate to="/login" />
            </>
          }
        />
      </Routes>
    </>
  );
}

// 🧩 Wrapper — provides Auth + Router context
export default function AppWrapper() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  );
}
