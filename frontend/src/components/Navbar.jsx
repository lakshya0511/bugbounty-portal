import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
        Unreviewed
      </NavLink>
      <NavLink to="/valid" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
        Valid
      </NavLink>
      <NavLink to="/invalid" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
        Invalid
      </NavLink>
    </nav>
  );
};

export default Navbar;
