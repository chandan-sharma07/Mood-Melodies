import React, { useContext } from 'react';
import { SongContext } from '../song.context';

const MoodHistory = () => {
    const { moodHistory } = useContext(SongContext);

    return (
        <div className="card mood-history-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
                <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                <h3>Mood history</h3>
            </div>

            <div style={{ flexGrow: 1, position: 'relative', marginTop: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
                {moodHistory.length === 0 ? (
                    <div style={{ color: '#707070', fontSize: '0.85rem' }}>No mood data yet</div>
                ) : (
                    moodHistory.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff65a3', marginRight: '10px' }}></div>
                                <span style={{ color: '#e0e0e0', textTransform: 'capitalize', fontSize: '0.9rem' }}>{item.mood}</span>
                            </div>
                            <span style={{ color: '#707070', fontSize: '0.8rem' }}>
                                {item.time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MoodHistory;
