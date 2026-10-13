import React, { useContext, useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { SongContext } from "../song.context";
import TrackCover from "../../shared/components/TrackCover";

const PlayerView = () => {
  const {
    currentSong,
    loading,
    error,
    playNext,
    playPrev,
    updatePlaybackTime,
  } = useContext(SongContext);

  const audioRef = useRef(new Audio());
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!currentSong?.url) return;

    audio.pause();
    audio.src = currentSong.url;

    const onLoaded = () => {
      const dur = audio.duration || 0;
      setDuration(dur);
      setCurrentTime(0);
      if (updatePlaybackTime) {
        updatePlaybackTime(0, dur);
      }
      audio.play().catch(() => {});
      setPlaying(true);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (updatePlaybackTime) {
        updatePlaybackTime(audio.currentTime, audio.duration || duration);
      }
    };

    const onEnded = () => {
      setPlaying(false);
      playNext("completed");
    };

    const onError = () => setPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    audio.load();

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?._id]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!currentSong?.url) return;
    if (audio.paused) {
      if (!audio.src || audio.src === window.location.href) {
        audio.src = currentSong.url;
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
    playPrev("prev");
  };

  const handleNext = () => {
    audioRef.current.pause();
    setPlaying(false);
    setCurrentTime(0);
    playNext("next");
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const seekTime = ratio * (duration || 0);
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (loading) {
    return null; // Handled by page container loading state
  }

  if (error || !currentSong) {
    return (
      <div
        style={{
          padding: "var(--space-4)",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          color: "var(--text-muted)",
          fontSize: "var(--font-sm)",
        }}
      >
        No track selected.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "var(--space-4)",
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "var(--space-4)",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <TrackCover src={currentSong.posterUrl} title={currentSong.title} size={144} />

      <div style={{ flex: 1, minWidth: "200px" }}>
        <div
          style={{
            fontSize: "var(--font-base)",
            fontWeight: "var(--weight-medium)",
            color: "var(--text)",
            marginBottom: "var(--space-1)",
          }}
        >
          {currentSong.title}
        </div>
        <div
          style={{
            fontSize: "var(--font-sm)",
            color: "var(--text-muted)",
            marginBottom: "var(--space-3)",
          }}
        >
          {currentSong.artist || "Unknown artist"}
        </div>

        {/* Seek Bar */}
        <div style={{ marginBottom: "var(--space-3)" }}>
          <div
            onClick={handleSeek}
            style={{
              width: "100%",
              height: "4px",
              backgroundColor: "var(--border)",
              borderRadius: "2px",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: "100%",
                backgroundColor: "var(--accent)",
                borderRadius: "2px",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "var(--font-xs)",
              color: "var(--text-muted)",
              marginTop: "var(--space-1)",
            }}
          >
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous track"
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "var(--space-2)",
              cursor: "pointer",
              color: "var(--text)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SkipBack size={16} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            style={{
              background: "var(--accent)",
              border: "1px solid var(--accent)",
              borderRadius: "var(--radius)",
              padding: "var(--space-2) var(--space-3)",
              cursor: "pointer",
              color: "var(--accent-contrast)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {playing ? <Pause size={16} strokeWidth={1.5} /> : <Play size={16} strokeWidth={1.5} />}
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next track"
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "var(--space-2)",
              cursor: "pointer",
              color: "var(--text)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SkipForward size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerView;
