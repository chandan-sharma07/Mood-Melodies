import React, { useContext, useState } from "react";
import { SongContext } from "../song.context";
import { getWindowSize, getCooldownSeconds } from "../../expression/utils/moodEngine";

const SettingsPage = () => {
  const {
    autoplayEnabled,
    setAutoplayEnabled,
    cameraEnabled,
    setCameraEnabled,
    sensitivity,
    setSensitivity,
    timezone,
    setTimezone,
  } = useContext(SongContext);

  const [tzInput, setTzInput] = useState(timezone);
  const [tzFeedback, setTzFeedback] = useState("");

  const windowSize = getWindowSize(sensitivity);
  const cooldownSeconds = getCooldownSeconds(sensitivity);

  const handleTzChange = (e) => {
    const val = e.target.value;
    setTzInput(val);
    try {
      Intl.DateTimeFormat(undefined, { timeZone: val });
      setTimezone(val);
      setTzFeedback("Timezone saved.");
    } catch {
      setTzFeedback("Invalid IANA timezone.");
    }
  };

  const handleResetTz = () => {
    const detected =
      typeof Intl !== "undefined" && Intl.DateTimeFormat
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
        : "UTC";
    setTzInput(detected);
    setTimezone(detected);
    setTzFeedback("Reset to detected timezone.");
  };

  return (
    <div style={{ maxWidth: "640px" }}>
      <h1
        style={{
          fontSize: "var(--font-lg)",
          fontWeight: "var(--weight-medium)",
          marginBottom: "var(--space-4)",
          color: "var(--text)",
        }}
      >
        Settings
      </h1>

      <div
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "var(--space-5)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-5)",
        }}
      >
        {/* Playback Settings */}
        <div>
          <div
            style={{
              fontSize: "var(--font-base)",
              fontWeight: "var(--weight-medium)",
              color: "var(--text)",
              marginBottom: "var(--space-2)",
            }}
          >
            Playback
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontSize: "var(--font-sm)",
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={autoplayEnabled}
              onChange={(e) => setAutoplayEnabled(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <span>Autoplay next track when finished</span>
          </label>
        </div>

        <div style={{ height: "1px", backgroundColor: "var(--border)" }} />

        {/* Camera and Detection Settings */}
        <div>
          <div
            style={{
              fontSize: "var(--font-base)",
              fontWeight: "var(--weight-medium)",
              color: "var(--text)",
              marginBottom: "var(--space-3)",
            }}
          >
            Detection
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontSize: "var(--font-sm)",
              color: "var(--text)",
              cursor: "pointer",
              marginBottom: "var(--space-4)",
            }}
          >
            <input
              type="checkbox"
              checked={cameraEnabled}
              onChange={(e) => setCameraEnabled(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <span>Enable camera detection</span>
          </label>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "var(--font-sm)",
                marginBottom: "var(--space-1)",
              }}
            >
              <label htmlFor="sensitivity-slider" style={{ color: "var(--text)" }}>
                Sensitivity
              </label>
              <span style={{ color: "var(--text-muted)" }}>{sensitivity}</span>
            </div>

            <input
              id="sensitivity-slider"
              type="range"
              min="10"
              max="100"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              style={{
                width: "100%",
                accentColor: "var(--accent)",
                cursor: "pointer",
              }}
            />

            <p
              style={{
                fontSize: "var(--font-xs)",
                color: "var(--text-muted)",
                marginTop: "var(--space-2)",
                lineHeight: 1.4,
              }}
            >
              Higher sensitivity means a shorter sample window ({windowSize} samples) and shorter cooldown ({cooldownSeconds}s).
            </p>
          </div>
        </div>

        <div style={{ height: "1px", backgroundColor: "var(--border)" }} />

        {/* Timezone Settings */}
        <div>
          <div
            style={{
              fontSize: "var(--font-base)",
              fontWeight: "var(--weight-medium)",
              color: "var(--text)",
              marginBottom: "var(--space-2)",
            }}
          >
            Timezone
          </div>

          <p
            style={{
              fontSize: "var(--font-xs)",
              color: "var(--text-muted)",
              marginBottom: "var(--space-3)",
            }}
          >
            Analytics and daily listening summaries use this timezone to group activity.
          </p>

          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <input
              type="text"
              value={tzInput}
              onChange={handleTzChange}
              placeholder="e.g. Asia/Kolkata, America/New_York, UTC"
              style={{
                flex: 1,
                padding: "var(--space-2) var(--space-3)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                backgroundColor: "var(--surface)",
                color: "var(--text)",
                fontSize: "var(--font-sm)",
              }}
            />
            <button
              type="button"
              onClick={handleResetTz}
              style={{
                padding: "var(--space-2) var(--space-3)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                backgroundColor: "var(--surface)",
                color: "var(--text)",
                fontSize: "var(--font-xs)",
                cursor: "pointer",
              }}
            >
              Detect
            </button>
          </div>

          {tzFeedback && (
            <p
              style={{
                fontSize: "var(--font-xs)",
                color: tzFeedback.includes("Invalid") ? "var(--danger)" : "var(--accent)",
                marginTop: "var(--space-1)",
              }}
            >
              {tzFeedback}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
