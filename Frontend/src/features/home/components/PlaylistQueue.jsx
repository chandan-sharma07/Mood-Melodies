import React, { useContext } from 'react';
import { SongContext } from '../song.context';

const PlaylistQueue = () => {
    const { songs, currentSong, playSong, loading } = useContext(SongContext);

    if (loading) return (
        <div className="dash-panel playlist-queue">
            <div className="panel-header"><h3>Queue</h3></div>
            <div className="dash-loading">
                <div className="loading-ring" />
                <span>Loading…</span>
            </div>
        </div>
    );

    return (
        <div className="dash-panel playlist-queue">
            <div className="panel-header">
                <h3>Queue</h3>
                {songs.length > 0 && <span className="panel-badge">{songs.length} tracks</span>}
            </div>

            {songs.length === 0 ? (
                <div className="dash-empty">
                    <span className="empty-icon">🎶</span>
                    <span>No tracks in queue</span>
                </div>
            ) : (
                <div style={{ overflowY: 'auto', maxHeight: '340px' }}>
                    {songs.map((song, i) => (
                        <div
                            key={song._id}
                            className={`queue-item${currentSong?._id === song._id ? ' active' : ''}`}
                            onClick={() => playSong(song._id)}
                        >
                            <span className="queue-num">{i + 1}</span>
                            <div className="queue-art">
                                <img
                                    src={song.posterUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=80'}
                                    alt={song.title}
                                />
                            </div>
                            <div className="queue-info">
                                <div className="queue-title">{song.title}</div>
                                <div className="queue-artist">{song.artist}</div>
                            </div>
                            <span className="queue-dur">{song.durationStr || '--'}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlaylistQueue;
