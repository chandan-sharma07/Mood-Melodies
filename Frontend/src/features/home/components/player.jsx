import React, { useContext, useRef, useState, useEffect } from 'react';

import { SongContext } from '../song.context';



const PlayerCard = () => {

  const { currentSong, loading, refreshing, error, playNext, playPrev, autoplayEnabled } = useContext(SongContext);

  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);

  const [duration, setDuration] = useState(0);

  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Map to store per-song liked status
  const [likedSongs, setLikedSongs] = useState({});
  const isLiked = currentSong && likedSongs[currentSong._id];
  const toggleLike = () => {
    if (currentSong) {
      setLikedSongs(prev => ({ ...prev, [currentSong._id]: !isLiked }));
    }
  };



  const title = currentSong?.title || "No song selected";

  const artist = currentSong?.artist || currentSong?.album || "-";

  const coverArt = currentSong?.posterUrl || null;

  const streamUrl = currentSong?.url || null;


  useEffect(() => {

    if (!currentSong || !audioRef.current) return;


    const audio = audioRef.current;

    setCurrentTime(0);

    setDuration(0);

    audio.load();

    if (autoplayEnabled) {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setAutoplayBlocked(true);
        });
    } else {
      setIsPlaying(false);
    }

  }, [currentSong, autoplayEnabled]);



  const togglePlay = () => {

    if (!audioRef.current) return;



    if (isPlaying) {

      audioRef.current.pause();

    } else {

      audioRef.current.play()

        .then(() => {

          setIsPlaying(true);

          setAutoplayBlocked(false);

        })

        .catch(e => console.error("Play error:", e));

    }

  };



  const handleTimeUpdate = () => {

    if (audioRef.current) {

      setCurrentTime(audioRef.current.currentTime);

    }

  };



  const handleLoadedMetadata = () => {

    if (audioRef.current) {

      setDuration(audioRef.current.duration);

    }

  };

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time) => {

    if (!time || isNaN(time)) return "0:00";

    const min = Math.floor(time / 60);

    const sec = Math.floor(time % 60);

    return `${min}:${sec < 10 ? '0' : ''}${sec}`;

  };



  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;



  if (loading && !currentSong) {

    return (

      <div className="card player-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: '#909090' }}>

        Loading songs...

      </div>

    );

  }



  if (error && !currentSong) {

    return (

      <div className="card player-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: '#ff65a3' }}>

        Could not load songs. Is the backend running on port 3000?

      </div>

    );

  }



  return (
    <div className="card player-card" style={{ display: 'flex', flexDirection: 'column' }}>
      {streamUrl && (
        <audio
          ref={audioRef}
          src={streamUrl}
          onEnded={playNext}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ width: '100%', height: '140px', borderRadius: '16px', backgroundColor: '#3a273b', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '1rem', flexShrink: 0, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
          {coverArt ? (
            <img src={coverArt} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <svg viewBox="0 0 24 24" style={{ width: '50px', height: '50px', stroke: '#ff3b30', fill: 'none', strokeWidth: 1.5 }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ flexGrow: 1, paddingRight: '1rem' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.8rem', color: '#fff', fontWeight: 'bold' }}>{title}</h2>
            <p style={{ margin: 0, color: '#909090', fontSize: '1.1rem' }}>{artist}</p>
            {refreshing && <p style={{ margin: '8px 0 0', color: '#909090', fontSize: '0.85rem' }}>Updating playlist...</p>}
            {autoplayBlocked && <p style={{ margin: '8px 0 0', color: '#ff3b30', fontSize: '0.85rem' }}>Tap play to start</p>}
          </div>
          <div onClick={toggleLike} style={{ cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill={isLiked ? '#ff3b30' : 'none'} stroke={isLiked ? '#ff3b30' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.2s ease', transform: isLiked ? 'scale(1.1)' : 'scale(1)' }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
        </div>

        <div style={{ width: '100%', marginBottom: '6px' }}>
          <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} style={{ width: '100%', accentColor: '#ff3b30', cursor: 'pointer' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#909090', marginBottom: '1rem', fontWeight: '500' }}>
          <span>{formatTime(currentTime)}</span>
          <span>{duration > 0 ? formatTime(duration) : (currentSong?.durationStr || '0:00')}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
          <svg onClick={playPrev} viewBox="0 0 24 24" style={{ width: '28px', height: '28px', stroke: '#fff', fill: '#fff', cursor: 'pointer' }}><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>

          <div onClick={togglePlay} style={{ width: '60px', height: '60px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24" style={{ width: '26px', height: '26px', stroke: '#1a1a1d', fill: '#1a1a1d' }}><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            ) : (
              <svg viewBox="0 0 24 24" style={{ width: '28px', height: '28px', stroke: '#1a1a1d', fill: '#1a1a1d', strokeLinejoin: 'round', marginLeft: '4px' }}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            )}
          </div>

          <svg onClick={playNext} viewBox="0 0 24 24" style={{ width: '32px', height: '32px', stroke: '#fff', fill: '#fff', cursor: 'pointer' }}><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;