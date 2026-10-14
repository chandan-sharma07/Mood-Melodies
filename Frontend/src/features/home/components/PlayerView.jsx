import React, { useContext } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { SongContext } from "../song.context";
import TrackCover from "../../shared/components/TrackCover";

const PlayerView = () => {
  const {
    currentSong,
    loading,
    error,
    playing,
    currentTime,
    duration,
    volume,
    muted,
    playbackError,
    togglePlay,
    seekTo,
    setVolume,
    toggleMute,
    playNext,
    playPrev,
  } = useContext(SongContext);

  const handlePrev = () => {
    playPrev("prev");
  };

  const handleNext = () => {
    playNext("next");
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const totalDuration = duration > 0 ? duration : 0;
    if (totalDuration > 0) {
      seekTo(ratio * totalDuration);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
  };

  const fmt = (s) => {
    if (!s || isNaN(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const displayDuration = duration > 0 ? duration : 0;
  const progressPct = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0;

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
    <div className="player-view-card">
      <div className="player-view-cover-wrapper">
        <TrackCover src={currentSong.posterUrl} title={currentSong.title} size={144} />
      </div>

      <div className="player-view-details">
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
                transition: "width 0.1s linear",
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
            <span>{duration > 0 ? fmt(duration) : (currentSong.durationStr || "0:00")}</span>
          </div>
        </div>

        {/* Playback Controls & Volume */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-2)",
          }}
        >
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

          {/* Volume Control */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "4px",
              }}
            >
              {muted || volume === 0 ? (
                <VolumeX size={16} strokeWidth={1.5} />
              ) : (
                <Volume2 size={16} strokeWidth={1.5} />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              aria-label="Volume"
              style={{
                width: "60px",
                accentColor: "var(--accent)",
                cursor: "pointer",
              }}
            />
          </div>
        </div>

        {playbackError && (
          <div
            style={{
              fontSize: "var(--font-xs)",
              color: "var(--text-muted)",
              marginTop: "var(--space-2)",
            }}
          >
            {playbackError}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerView;
