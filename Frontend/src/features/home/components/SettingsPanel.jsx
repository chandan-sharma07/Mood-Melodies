import React, { useContext } from 'react';
import { SongContext } from '../song.context';

const SettingsPanel = () => {
    const {
        autoplayEnabled, setAutoplayEnabled,
        sensitivity, setSensitivity,
        currentMood, setCurrentMood,
    } = useContext(SongContext);

    const moods = ['happy', 'sad', 'energetic', 'chill', 'romantic', 'angry', 'relaxing', 'dreamy'];

    return (
        <div className="dash-panel settings-panel">
            <div className="panel-header"><h3>Settings</h3></div>

            {/* Autoplay toggle */}
            <div className="settings-row">
                <div>
                    <div className="settings-label">Autoplay</div>
                    <div className="settings-sub">Play next track automatically</div>
                </div>
                <label className="toggle">
                    <input
                        type="checkbox"
                        checked={autoplayEnabled}
                        onChange={() => setAutoplayEnabled(p => !p)}
                    />
                    <span className="slider" />
                </label>
            </div>

            {/* Sensitivity */}
            <div className="settings-row">
                <div>
                    <div className="settings-label">Detection Sensitivity</div>
                    <div className="settings-sub">{sensitivity}%</div>
                </div>
                <input
                    type="range"
                    className="sens-slider"
                    min="10"
                    max="100"
                    value={sensitivity}
                    onChange={(e) => setSensitivity(Number(e.target.value))}
                />
            </div>

            {/* Manual mood override */}
            <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                <div className="settings-label">Manual Mood Override</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {moods.map(m => (
                        <button
                            key={m}
                            onClick={() => setCurrentMood(m)}
                            style={{
                                padding: '4px 12px',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                border: '1px solid',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textTransform: 'capitalize',
                                background: currentMood === m ? 'rgba(255,101,163,0.2)' : 'transparent',
                                borderColor: currentMood === m ? 'rgba(255,101,163,0.5)' : 'var(--outline-variant)',
                                color: currentMood === m ? 'var(--primary)' : 'var(--on-surface-muted)',
                            }}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
