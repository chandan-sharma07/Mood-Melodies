import React from "react";

const moodColors = {
  happy: "var(--mood-happy)",
  sad: "var(--mood-sad)",
  angry: "var(--mood-angry)",
  chill: "var(--mood-chill)",
  neutral: "var(--mood-chill)",
  uplifting: "var(--mood-uplifting)",
  surprised: "var(--mood-uplifting)",
};

const ExpressionBadge = ({ expression = "neutral" }) => {
  const norm = String(expression).toLowerCase();
  const color = moodColors[norm] || "var(--accent)";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        fontSize: "var(--font-sm)",
        color: "var(--text)",
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "2px",
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <span>{expression}</span>
    </div>
  );
};

export default ExpressionBadge;