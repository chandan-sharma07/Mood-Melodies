import React, { useContext } from 'react';
import { SongContext } from '../song.context';

const ListeningHistory = () => {
    const { listeningHistory } = useContext(SongContext);

    return (
        <div className="card history-card">
            <h3 style={{ fontSize: '1rem', fontWeight: '400', color: '#c0c0c0', margin: '0 0 1.5rem 0' }}>Listening history</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {listeningHistory.length === 0 ? (
                    <span style={{ color: '#707070', fontSize: '0.85rem' }}>No history yet</span>
                ) : (
                    listeningHistory.map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#e0e0e0', fontSize: '0.95rem' }}>{item.song?.title || "Unknown"}</span>
                            <span style={{ color: '#707070', fontSize: '0.85rem' }}>
                                {item.time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ListeningHistory;
