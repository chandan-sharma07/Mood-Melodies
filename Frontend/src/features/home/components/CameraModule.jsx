import React, { useContext, useEffect, useState } from 'react';
import useFaceExpression from '../../expression/hooks/useFaceExpression';
import { EXPRESSION_DISPLAY } from '../../expression/utils/faceUtils';
import { SongContext } from '../song.context';

const CameraModule = () => {
    const { videoRef, expression } = useFaceExpression();
    const { processFaceDetection, currentMood } = useContext(SongContext);
    const [engineStatus, setEngineStatus] = useState("Initializing");

    useEffect(() => {
        if (!expression || expression === "Loading..." || expression.startsWith("❌")) return;
        if (processFaceDetection) {
            const result = processFaceDetection(expression);
            if (result?.status) {
                setEngineStatus(result.status);
            }
        }
    }, [expression, processFaceDetection]);

    const isNoFace = expression === "no_face" || engineStatus === "No face in frame";
    const isError = expression && expression.startsWith("❌");
    const isLoading = !expression || expression === "Loading...";

    let displayLabel = "Detecting…";
    let emoji = "😊";

    if (isLoading) {
        displayLabel = "Loading camera…";
        emoji = "⏳";
    } else if (isError) {
        displayLabel = expression;
        emoji = "⚠️";
    } else if (isNoFace) {
        displayLabel = "No face in frame";
        emoji = "👤";
    } else if (EXPRESSION_DISPLAY[expression]) {
        displayLabel = EXPRESSION_DISPLAY[expression];
        emoji = displayLabel.split(' ')[0] || "😊";
    }

    return (
        <div className="dash-panel camera-module">
            <div className="panel-header">
                <h3>Face Camera</h3>
                <span
                    className="panel-badge"
                    style={{
                        background: isNoFace ? 'rgba(255,180,0,0.12)' : 'rgba(0,200,100,0.12)',
                        color: isNoFace ? '#ffb400' : '#4cde9a',
                        borderColor: isNoFace ? 'rgba(255,180,0,0.25)' : 'rgba(0,200,100,0.25)',
                    }}
                >
                    {isNoFace ? '● NO FACE' : '● LIVE'}
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
                    fontSize: '1.1rem',
                }}>
                    {emoji}
                </div>
                <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                        {displayLabel}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>
                        {isNoFace ? 'Camera active' : 'Estimated expression'}
                    </div>
                </div>
                <div className="mood-badge" style={{ marginLeft: 'auto', textTransform: 'capitalize' }}>
                    🎵 {currentMood}
                </div>
            </div>

            <div style={{ marginTop: '14px', borderTop: '1px solid var(--outline-variant)', paddingTop: '10px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', margin: '0 0 4px 0', lineHeight: 1.4 }}>
                    Expression is estimated from facial movement. It is a guess, not a measure of how you feel.
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', margin: 0, lineHeight: 1.4 }}>
                    Video stays in your browser. Nothing is uploaded.
                </p>
            </div>
        </div>
    );
};

export default CameraModule;
