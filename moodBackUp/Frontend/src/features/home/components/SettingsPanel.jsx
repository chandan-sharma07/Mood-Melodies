import React, { useContext } from 'react';
import { SongContext } from '../song.context';

const SettingsPanel = () => {
    const { autoplayEnabled, setAutoplayEnabled, sensitivity, setSensitivity } = useContext(SongContext);

    return (
        <div className="card settings-card">
            <div className="card-header">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                <h3>Settings</h3>
            </div>


            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#e0e0e0' }}>Sensitivity</span>
                <span style={{ fontWeight: '500' }}>{sensitivity}%</span>
            </div>
            <div style={{ marginBottom: '1.5rem', width: '100%', position: 'relative' }}>
                <input
                    type="range"
                    min="10"
                    max="100"
                    value={sensitivity}
                    onChange={(e) => setSensitivity(Number(e.target.value))}
                    style={{
                        width: '100%',
                        accentColor: '#90caf9',
                        cursor: 'pointer'
                    }}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#e0e0e0' }}>
                <span>Auto-play on change</span>
                <div
                    onClick={() => setAutoplayEnabled(!autoplayEnabled)}
                    style={{
                        width: '40px', height: '20px',
                        backgroundColor: autoplayEnabled ? '#ff65a3' : '#333',
                        borderRadius: '10px', position: 'relative', cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}>
                    <div style={{
                        width: '16px', height: '16px',
                        backgroundColor: autoplayEnabled ? '#1a1a1d' : '#888',
                        borderRadius: '50%', position: 'absolute',
                        right: autoplayEnabled ? '2px' : 'auto',
                        left: autoplayEnabled ? 'auto' : '2px',
                        top: '2px',
                        transition: 'all 0.2s'
                    }}></div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
