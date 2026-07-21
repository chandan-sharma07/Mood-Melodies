import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/home.scss';

const ProfileModal = ({ isOpen, onClose, user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [artists, setArtists] = useState([]);

    useEffect(() => {
        if (activeTab === 'artists') {
            axios.get('http://localhost:3000/api/auth/recommended-artists', { withCredentials: true })
                .then(res => setArtists(res.data.artists))
                .catch(err => console.error(err));
        }
    }, [activeTab]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>

                {/* Close Button */}
                <button className="modal-close-btn" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Sidebar Navigation */}
                <div className="modal-sidebar">
                    <h3 className="sidebar-title">👤 Profile</h3>
                    <div className="sidebar-menu">
                        <button className={`menu-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                            My Profile
                        </button>
                        <button className={`menu-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                            Mood History
                        </button>
                        <button className={`menu-btn ${activeTab === 'artists' ? 'active' : ''}`} onClick={() => setActiveTab('artists')}>
                            Recommended Artists
                        </button>
                    </div>
                    <button className="logout-btn" onClick={onLogout}>
                        Logout
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="modal-body">
                    {activeTab === 'profile' && (
                        <div className="tab-pane active fade-in">
                            <h2>👤 {user?.name || user?.username || 'Chandan Sharma'}</h2>
                            <div className="profile-stats">
                                <div className="stat-group">
                                    <span className="stat-label">Email</span>
                                    <span className="stat-value">{user?.email || 'N/A'}</span>
                                </div>
                                <div className="stat-group">
                                    <span className="stat-label">Joined</span>
                                    <span className="stat-value">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('default', { month: 'long', year: 'numeric' }) : 'July 2026'}</span>
                                </div>
                                <div className="stat-group">
                                    <span className="stat-label">Total Songs Played</span>
                                    <span className="stat-value">{user?.totalSongsPlayed || 0}</span>
                                </div>
                                <div className="stat-group">
                                    <span className="stat-label">Favorite Mood</span>
                                    <span className="stat-value" style={{ textTransform: 'capitalize' }}>{user?.favoriteMood || 'Neutral'}</span>
                                </div>
                                <div className="stat-group">
                                    <span className="stat-label">Most Played</span>
                                    <span className="stat-value">🎵 Mood Melodies</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="tab-pane active fade-in">
                            <h2>Mood History</h2>
                            <div className="history-list">
                                {user?.moodHistory && user.moodHistory.length > 0 ? (
                                    user.moodHistory.slice().reverse().slice(0, 10).map((item, idx) => (
                                        <div className="history-item" key={idx}>
                                            <span style={{ textTransform: 'capitalize' }}>
                                                {item.mood === 'happy' ? '🟢 Happy' :
                                                    item.mood === 'neutral' ? '🔵 Neutral' :
                                                        item.mood === 'sad' ? '💧 Sad' :
                                                            item.mood === 'angry' ? '🔴 Angry' :
                                                                item.mood === 'surprised' ? '🟡 Surprised' :
                                                                    item.mood === 'fearful' ? '👁️ Fearful' :
                                                                        item.mood === 'disgusted' ? '🤢 Disgusted' :
                                                                            `🟣 ${item.mood}`}
                                            </span>
                                            <span className="time">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="history-item"><span>No mood history yet.</span></div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'artists' && (
                        <div className="tab-pane active fade-in artists-pane">
                            <h2>🎤 Recommended Artists</h2>

                            <div className="history-list">
                                {artists.length > 0 ? (
                                    artists.map((artist, idx) => (
                                        <div className="history-item" key={idx}>
                                            <span style={{ fontSize: '1.1rem' }}>🎵 {artist}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="history-item"><span>Loading artists...</span></div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
