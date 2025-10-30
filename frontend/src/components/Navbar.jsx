import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();      // ✅ Hooks at the top
  const auth = useAuth();              // ✅ Hooks at the top
  const user = auth?.user;
  const logout = auth?.logout;

  const handleLogout = () => {
    if (logout) {
      logout();
      navigate("/login");
    }
  };

  // ✅ Render nothing if auth not ready
  if (!auth) return null;

  return (
    <nav className="navbar">
      {user?.role === "reviewer" ? (
        <>
          <NavLink
            to="/unreviewed"
            className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}
          >
            Unreviewed
          </NavLink>
          <NavLink
            to="/valid"
            className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}
          >
            Valid
          </NavLink>
          <NavLink
            to="/invalid"
            className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}
          >
            Invalid
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}
          >
            Leaderboard
          </NavLink>
        </>
      ) : (
        <>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}
          >
            Leaderboard
          </NavLink>
          <NavLink
            to="/my"
            className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}
          >
            My Issues
          </NavLink>
        </>
      )}

      <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
        {user ? (
          <>
            <div style={{ color: "#f1f5f9", alignSelf: "center" }}>
              {user.githubUsername}
            </div>
            <button
              onClick={handleLogout}
              className="nav-link"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}
          >
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
