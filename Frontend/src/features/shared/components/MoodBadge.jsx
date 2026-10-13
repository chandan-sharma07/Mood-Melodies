import React from "react";

const MOOD_COLOR_VARS = {
  happy: "var(--mood-happy)",
  sad: "var(--mood-sad)",
  angry: "var(--mood-angry)",
  chill: "var(--mood-chill)",
  neutral: "var(--mood-chill)",
  uplifting: "var(--mood-uplifting)",
  surprised: "var(--mood-uplifting)",
};

const MoodBadge = ({ mood = "neutral" }) => {
  const normalized = (mood || "neutral").toLowerCase();
  const color = MOOD_COLOR_VARS[normalized] || "var(--text-muted)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "var(--font-sm)",
        color: "var(--text)",
        fontWeight: "var(--weight-regular)",
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "1px",
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <span>{normalized}</span>
    </span>
  );
};

export default MoodBadge;
