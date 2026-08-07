import React, { useContext, useState } from 'react';
import { SongContext } from '../song.context';
import { AuthContext } from '../../auth/auth.context';
import { logout } from '../../auth/services/auth.api';
import '../styles/home.scss';

import CameraModule from '../components/CameraModule';
import PlayerCard from '../components/player';
import PlaylistQueue from '../components/PlaylistQueue';
import MoodHistory from '../components/MoodHistory';
import SettingsPanel from '../components/SettingsPanel';
import ListeningHistory from '../components/ListeningHistory';
import ProfileModal from '../components/ProfileModal';

// Hidden FaceExpression for mood detection side-effect
import FaceExpression from '../../expression/components/FaceExpression';

const Home = () => {
    const { user, setUser } = useContext(AuthContext);
    const { currentMood } = useContext(SongContext);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : '?';

    const handleLogout = async () => {
        try {
            await logout();
        } catch {
            // ignore
        } finally {
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <div className="dashboard-page">
            {/* Invisible FaceExpression for detection side effects */}
            <div style={{ display: 'none' }}>
                <FaceExpression />
            </div>

            {/* ── Top Bar ── */}
            <header className="dash-topbar">
                <a href="#" className="topbar-logo">
                    <span className="logo-icon">🎵</span>
                    <span className="logo-text">Mood Melodies</span>
                </a>
                <div className="topbar-actions">
                    <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)', textTransform: 'capitalize' }}>
                        Mood: <strong style={{ color: 'var(--primary)' }}>{currentMood}</strong>
                    </span>
                    <button
                        className="profile-btn"
                        onClick={() => setIsProfileOpen(true)}
                    >
                        <span className="profile-avatar">{initials}</span>
                        {user?.username || 'Profile'}
                    </button>
                </div>
            </header>

            {/* ── 3-Column Dashboard Grid ── */}
            <main className="dash-content">
                {/* Left column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <CameraModule />
                    <MoodHistory />
                </div>

                {/* Center column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <PlayerCard />
                    <PlaylistQueue />
                </div>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <ListeningHistory />
                    <SettingsPanel />
                </div>
            </main>

            {/* ── Profile Modal ── */}
            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
                onLogout={handleLogout}
            />
        </div>
    );
};

export default Home;