import React, { useContext } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { AuthContext } from "../../auth/auth.context";
import { SongContext } from "../../home/song.context";
import { logout } from "../../auth/services/auth.api";
import "../styles/layout.scss";

const AppLayout = () => {
  const { user, setUser } = useContext(AuthContext);
  const { currentSong, playing, togglePlay, playNext, playPrev } = useContext(SongContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isListenPage = location.pathname === "/";

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
    <div className={`app-container ${isListenPage ? "app-container--listen" : ""}`}>
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

        <div className="sidebar-bottom">
          {/* Mini player for non-listen pages (keeps track controls visible while browsing Insights, History, Settings) */}
          {!isListenPage && currentSong && (
            <div className="sidebar-mini-player">
              <div className="sidebar-mini-player-info">
                <span className="sidebar-mini-player-title">{currentSong.title}</span>
                <span className="sidebar-mini-player-artist">{currentSong.artist || "Unknown"}</span>
              </div>
              <div className="sidebar-mini-player-controls">
                <button
                  type="button"
                  onClick={() => playPrev("prev")}
                  aria-label="Previous track"
                  className="sidebar-mini-btn"
                >
                  <SkipBack size={14} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={playing ? "Pause" : "Play"}
                  className="sidebar-mini-btn sidebar-mini-btn--accent"
                >
                  {playing ? <Pause size={14} strokeWidth={1.5} /> : <Play size={14} strokeWidth={1.5} />}
                </button>
                <button
                  type="button"
                  onClick={() => playNext("next")}
                  aria-label="Next track"
                  className="sidebar-mini-btn"
                >
                  <SkipForward size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}

          <div className="sidebar-footer">
            <span className="sidebar-user">{user?.username || "Account"}</span>
            <button type="button" className="sidebar-logout" onClick={handleLogout}>
              Sign out
            </button>
          </div>
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
