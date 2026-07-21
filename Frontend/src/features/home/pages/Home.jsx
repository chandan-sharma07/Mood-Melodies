import React, { useContext, useState } from 'react';
import FaceExpression from "../../expression/components/FaceExpression";
import '../styles/home.scss';
import CameraModule from '../components/CameraModule';
import MoodHistory from '../components/MoodHistory';
import SettingsPanel from '../components/SettingsPanel';
import PlayerCard from '../components/player';
import PlaylistQueue from '../components/PlaylistQueue';
import ListeningHistory from '../components/ListeningHistory';
import { AuthContext } from '../../auth/auth.context';
import { logout } from '../../auth/services/auth.api';
import ProfileModal from '../components/ProfileModal';

const Home = () => {
    const { user, setUser } = useContext(AuthContext);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <div className="dashboard-container">
            {/* The existing FaceExpression logic, kept for preserving the camera functionality */}
            <div style={{ display: 'none' }}>
                <FaceExpression />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1rem', width: '100%', maxWidth: '1600px', margin: '0 auto 1.5rem auto' }}>
                <a href="#" style={{ textDecoration: 'none', color: '#ff65a3', fontSize: '1.6rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🎵 Mood Melodies
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); setIsProfileOpen(true); }} style={{ textDecoration: 'none', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 101, 163, 0.1)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid rgba(255, 101, 163, 0.3)', transition: 'all 0.2s', cursor: 'pointer' }}>
                    👤 {user && user.name ? user.name : (user && user.username ? user.username : 'Profile')}
                </a>
            </div>

            <div className="dashboard-grid">
                <CameraModule />
                <PlayerCard />
                <MoodHistory />
                <PlaylistQueue />
                <SettingsPanel />
                <ListeningHistory />
            </div>

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
                onLogout={async () => {
                    try {
                        await logout();
                        setUser(null);
                        window.location.href = '/login'; // Assuming there is a login route
                    } catch (e) {
                        console.error('Logout failed', e);
                    }
                }}
            />
        </div>
    );
};

export default Home;