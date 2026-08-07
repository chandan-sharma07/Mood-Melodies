import React, { useContext, useEffect } from 'react';
import useFaceExpression from '../../expression/hooks/useFaceExpression';
import { expressionToMoodTag } from '../../expression/utils/faceUtils';
import { SongContext } from '../song.context';

const CameraModule = () => {
    const { videoRef, expression } = useFaceExpression();
    const { setCurrentMood, currentMood } = useContext(SongContext);

    useEffect(() => {
        if (!expression || expression === "Loading..." || expression.startsWith("❌")) return;
        const moodTag = expressionToMoodTag(expression);
        if (moodTag === currentMood) return;
        const timer = setTimeout(() => setCurrentMood(moodTag), 1500);
        return () => clearTimeout(timer);
    }, [expression, setCurrentMood, currentMood]);

    const isDetecting = expression && expression !== "Loading..." && !expression.startsWith("❌");

    return (
        <div className="dash-panel camera-module">
            <div className="panel-header">
                <h3>Face Camera</h3>
                <span className="panel-badge" style={{ background: 'rgba(0,200,100,0.12)', color: '#4cde9a', borderColor: 'rgba(0,200,100,0.25)' }}>
                    ● LIVE
                </span>
            </div>

            <div className="camera-feed">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)',
                    }}
                />
                <div className="camera-overlay" />
            </div>

            <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(255,101,163,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,101,163,0.25)',
                    flexShrink: 0,
                }}>
                    😊
                </div>
                <div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'capitalize', color: 'var(--on-surface)' }}>
                        {isDetecting ? expression : 'Detecting…'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>
                        Current expression
                    </div>
                </div>
                {isDetecting && (
                    <div className="mood-badge" style={{ marginLeft: 'auto', textTransform: 'capitalize' }}>
                        🎵 {currentMood}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CameraModule;
