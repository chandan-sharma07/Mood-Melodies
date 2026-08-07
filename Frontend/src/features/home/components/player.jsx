import { useContext, useEffect, useRef, useState } from 'react';
import { SongContext } from '../song.context';

const PlayerCard = () => {
    const { currentSong, loading, playNext, playPrev, songs } = useContext(SongContext);

    // ── Audio Ref (persistent across renders) ──
    const audioRef = useRef(new Audio());

    // ── State ──
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);

    // ── Load new song whenever currentSong changes ──
    useEffect(() => {
        const audio = audioRef.current;
        if (!currentSong?.url) return;

        audio.pause();
        audio.src = currentSong.url;
        audio.volume = volume;

        const onLoaded = () => {
            setDuration(audio.duration || 0);
            setCurrentTime(0);
            // Autoplay new song
            audio.play().catch(() => {});
            setPlaying(true);
        };

        const onTimeUpdate = () => setCurrentTime(audio.currentTime);

        const onEnded = () => {
            setPlaying(false);
            playNext(); // auto next song
        };

        const onError = () => setPlaying(false);

        audio.addEventListener('loadedmetadata', onLoaded);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);

        audio.load();

        return () => {
            audio.removeEventListener('loadedmetadata', onLoaded);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSong?._id]);

    // ── Sync volume changes ──
    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    // ── Cleanup on unmount ──
    useEffect(() => {
        const audio = audioRef.current;
        return () => { audio.pause(); audio.src = ''; };
    }, []);

    // ── Controls ──
    const togglePlay = () => {
        const audio = audioRef.current;
        if (!currentSong?.url) return;
        if (audio.paused) {
            if (!audio.src || audio.src === window.location.href) {
                audio.src = currentSong.url;
                audio.volume = volume;
                audio.load();
            }
            audio.play().catch(() => {});
            setPlaying(true);
        } else {
            audio.pause();
            setPlaying(false);
        }
    };

    const handlePrev = () => {
        audioRef.current.pause();
        setPlaying(false);
        setCurrentTime(0);
        playPrev();
    };

    const handleNext = () => {
        audioRef.current.pause();
        setPlaying(false);
        setCurrentTime(0);
        playNext();
    };

    // ── Seek ──
    const handleSeek = (e) => {
        const audio = audioRef.current;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        const seekTime = ratio * (duration || 0);
        audio.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    // ── Helpers ──
    const fmt = (s) => {
        if (!s || isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

    // ── Render ──
    if (loading) return (
        <div className="dash-panel player-card">
            <div className="dash-loading">
                <div className="loading-ring" />
                <span>Loading tracks…</span>
            </div>
        </div>
    );

    if (!currentSong) return (
        <div className="dash-panel player-card">
            <div className="dash-empty">
                <span className="empty-icon">🎵</span>
                <span>No song selected</span>
            </div>
        </div>
    );

    return (
        <div className="dash-panel player-card">
            {/* Album Art */}
            <div className="player-art">
                <img
                    src={currentSong.posterUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400'}
                    alt={currentSong.title}
                />
            </div>

            {/* Song Info */}
            <div className="player-meta">
                <div className="song-title">{currentSong.title}</div>
                <div className="song-artist">{currentSong.artist}</div>
            </div>

            {/* Seekable Progress Bar */}
            <div className="player-progress">
                <div
                    className="progress-track"
                    onClick={handleSeek}
                    style={{ cursor: 'pointer' }}
                    title="Click to seek"
                >
                    <div
                        className="progress-fill"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
                <div className="progress-times">
                    <span>{fmt(currentTime)}</span>
                    <span>{fmt(duration)}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="player-controls">
                <button className="ctrl-btn" onClick={handlePrev} title="Previous">⏮</button>
                <button className="play-btn" onClick={togglePlay} title={playing ? 'Pause' : 'Play'}>
                    {playing ? '⏸' : '▶'}
                </button>
                <button className="ctrl-btn" onClick={handleNext} title="Next">⏭</button>
            </div>

            {/* Volume */}
            <div className="volume-row">
                <span>🔉</span>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
                <span>🔊</span>
            </div>
        </div>
    );
};

export default PlayerCard;