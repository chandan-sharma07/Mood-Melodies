import React, { useContext, useEffect } from 'react';
import useFaceExpression from '../../expression/hooks/useFaceExpression';
import { expressionToMoodTag } from '../../expression/utils/faceUtils';
import { SongContext } from '../song.context';

const CameraModule = () => {
    const { videoRef, expression } = useFaceExpression();
    const { setCurrentMood, currentMood } = useContext(SongContext);

    // Debounce or directly set mood to prevent too many unnecessary API hits 
    // if expression flickers, although useFaceExpression usually handles this.
    useEffect(() => {
        if (!expression || expression === "Loading..." || expression.startsWith("❌")) return;

        const moodTag = expressionToMoodTag(expression);
        if (moodTag === currentMood) return;

        const timer = setTimeout(() => {
            setCurrentMood(moodTag);
        }, 1500);

        return () => clearTimeout(timer);
    }, [expression, setCurrentMood, currentMood]);

    return (
        <div className="card camera-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
                <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"></rect><circle cx="12" cy="12" r="3"></circle></svg>
                <h3>Camera</h3>
                <div className="status-badge">
                    <span className="dot"></span> live
                </div>
            </div>

            <div style={{ flexGrow: 1, backgroundColor: 'transparent', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.1rem', position: 'relative', overflow: 'hidden' }}>
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                        width: '240px',
                        height: '240px',
                        aspectRatio: '1/1',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '3px solid rgba(255, 101, 163, 0.4)',
                        marginBottom: '1rem'
                    }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255, 101, 163, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff65a3" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', textTransform: 'capitalize' }}>{expression || "Detecting..."}</h4>
                    <span style={{ fontSize: '0.85rem', color: '#909090' }}>detected just now</span>
                </div>
            </div>
        </div>
    );
};

export default CameraModule;
