import React, { useContext } from 'react';
import { SongContext } from '../song.context';

const ListeningHistory = () => {
    const { listeningHistory } = useContext(SongContext);

    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="dash-panel listening-history">
            <div className="panel-header">
                <h3>Recently Played</h3>
                {listeningHistory.length > 0 && <span className="panel-badge">{listeningHistory.length}</span>}
            </div>

            {listeningHistory.length === 0 ? (
                <div className="dash-empty">
                    <span className="empty-icon">🎧</span>
                    <span>Nothing played yet</span>
                </div>
            ) : (
                listeningHistory.map((item, i) => (
                    <div key={i} className="history-item">
                        <div className="history-art">
                            <img
                                src={item.song?.posterUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=80'}
                                alt={item.song?.title}
                            />
                        </div>
                        <div className="history-info">
                            <div className="history-title">{item.song?.title || 'Unknown'}</div>
                            <div className="history-time">{item.song?.artist} · {formatTime(item.time)}</div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default ListeningHistory;
