import React, { useContext } from 'react';
import { SongContext } from '../song.context';
import { getWindowSize, getCooldownSeconds } from '../../expression/utils/moodEngine';

const SettingsPanel = () => {
    const {
        autoplayEnabled, setAutoplayEnabled,
        sensitivity, setSensitivity,
        currentMood, manualSetMood, setCurrentMood,
    } = useContext(SongContext);

    // Only these 5 valid mood tags map to expressions
    const moods = ['happy', 'sad', 'angry', 'chill', 'uplifting'];

    const setMoodHandler = manualSetMood || setCurrentMood;
    const windowSize = getWindowSize(sensitivity);
    const cooldownSec = getCooldownSeconds(sensitivity);

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
            <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
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
                        style={{ width: '130px' }}
                    />
                </div>
                <div className="settings-sub" style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', lineHeight: 1.4 }}>
                    Higher sensitivity means a shorter sample window ({windowSize} samples) and shorter cooldown ({cooldownSec}s).
                </div>
            </div>

            {/* Manual mood override */}
            <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                <div className="settings-label">Manual Mood Override</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {moods.map(m => (
                        <button
                            key={m}
                            onClick={() => setMoodHandler(m)}
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
