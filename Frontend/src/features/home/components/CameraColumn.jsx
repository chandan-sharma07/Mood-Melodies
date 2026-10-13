import React, { useContext, useEffect, useState } from "react";
import useFaceExpression from "../../expression/hooks/useFaceExpression";
import { SongContext } from "../song.context";
import MoodBadge from "../../shared/components/MoodBadge";

const CameraColumn = () => {
  const {
    processFaceDetection,
    currentMood,
    setCurrentMood,
    cameraEnabled,
  } = useContext(SongContext);

  const { videoRef, expression } = useFaceExpression(cameraEnabled);
  const [engineStatus, setEngineStatus] = useState("Initializing");

  useEffect(() => {
    if (!cameraEnabled) return;
    if (!expression || expression === "Loading..." || expression.startsWith("Camera")) return;
    if (processFaceDetection) {
      const result = processFaceDetection(expression);
      if (result?.status) {
        setEngineStatus(result.status);
      }
    }
  }, [expression, processFaceDetection, cameraEnabled]);

  const isNoFace = !cameraEnabled || expression === "no_face" || engineStatus === "No face in frame";
  const statusText = !cameraEnabled
    ? "Camera off"
    : isNoFace
    ? "No face in frame"
    : "Face detected";

  const supportedMoods = ["happy", "sad", "angry", "chill", "uplifting"];

  return (
    <div
      style={{
        width: "260px",
        minWidth: "260px",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      {/* Camera Preview Card */}
      <div
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "var(--space-3)",
        }}
      >
        <div
          style={{
            fontSize: "var(--font-xs)",
            fontWeight: "var(--weight-medium)",
            color: "var(--text-muted)",
            marginBottom: "var(--space-2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Camera</span>
          <span style={{ color: isNoFace ? "var(--text-muted)" : "var(--accent)" }}>
            {statusText}
          </span>
        </div>

        <div
          style={{
            width: "100%",
            height: "160px",
            backgroundColor: "var(--bg)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
            position: "relative",
            border: "1px solid var(--border)",
          }}
        >
          {cameraEnabled ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                fontSize: "var(--font-xs)",
                padding: "var(--space-2)",
                textAlign: "center",
              }}
            >
              Camera is turned off.
            </div>
          )}
        </div>

        {/* Current Mood */}
        <div
          style={{
            marginTop: "var(--space-3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>
            Current mood
          </span>
          <MoodBadge mood={currentMood} />
        </div>

        {/* Manual Override Select */}
        <div style={{ marginTop: "var(--space-3)" }}>
          <label
            htmlFor="mood-select"
            style={{
              display: "block",
              fontSize: "var(--font-xs)",
              color: "var(--text-muted)",
              marginBottom: "var(--space-1)",
            }}
          >
            Manual override
          </label>
          <select
            id="mood-select"
            value={currentMood}
            onChange={(e) => setCurrentMood(e.target.value)}
            style={{
              width: "100%",
              padding: "var(--space-2)",
              backgroundColor: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              fontSize: "var(--font-sm)",
              cursor: "pointer",
            }}
          >
            {supportedMoods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Disclaimers */}
      <div
        style={{
          padding: "var(--space-3)",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          fontSize: "var(--font-xs)",
          color: "var(--text-muted)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
          lineHeight: 1.4,
        }}
      >
        <p style={{ margin: 0 }}>
          Expression is estimated from facial movement. It is a guess, not a measure of how you feel.
        </p>
        <p style={{ margin: 0 }}>
          Video stays in your browser. Nothing is uploaded.
        </p>
      </div>
    </div>
  );
};

export default CameraColumn;
