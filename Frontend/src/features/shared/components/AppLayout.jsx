import React, { useContext } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/auth.context";
import { logout } from "../../auth/services/auth.api";
import "../styles/layout.scss";

const AppLayout = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <div className="app-container">
      <aside className="app-sidebar">
        <div>
          <div className="sidebar-brand">Mood Melodies</div>
          <nav className="sidebar-nav">
            <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              Listen
            </NavLink>
            <NavLink to="/insights" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              Insights
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              History
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              Settings
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-footer">
          <span className="sidebar-user">{user?.username || "Account"}</span>
          <button type="button" className="sidebar-logout" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="app-main">
        <div className="app-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
