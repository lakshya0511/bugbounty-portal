import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    // 🪪 If no token in URL, go to login
    if (!token) {
      console.error("❌ No token found in URL");
      navigate("/login", { replace: true });
      return;
    }

    console.log("🔑 Token received from backend:", token);

    // Fetch user profile using token
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("❌ Failed to fetch profile:", res.status);
          navigate("/unauthorized", { replace: true });
          return;
        }

        const userData = await res.json();
        console.log("✅ User profile fetched:", userData);

        // ✅ Save to AuthContext and localStorage using correct keys
        login(userData, token);
        localStorage.setItem("bb_user", JSON.stringify(userData));
        localStorage.setItem("bb_token", token);

        // Redirect based on user role
        if (userData.role === "reviewer") {
          navigate("/unreviewed", { replace: true });
        } else {
          navigate("/my", { replace: true });
        }
      } catch (err) {
        console.error("❌ Error verifying user profile:", err);
        navigate("/unauthorized", { replace: true });
      }
    };

    fetchProfile();
  }, [login, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl font-semibold text-gray-700 mb-3">
        Logging you in...
      </h2>
      <p className="text-gray-500">Please wait while we verify your account.</p>
    </div>
  );
}

export default AuthSuccess;
