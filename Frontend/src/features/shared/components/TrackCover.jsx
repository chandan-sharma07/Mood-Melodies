import React, { useState } from "react";

const TrackCover = ({ src, title = "", size = 144 }) => {
  const [imgError, setImgError] = useState(false);
  const firstLetter = (title.trim()[0] || "T").toUpperCase();

  const isInvalidUrl = !src || src.includes("placeholder") || src.includes("via.placeholder");

  if (imgError || isInvalidUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: size > 64 ? "var(--font-xl)" : "var(--font-sm)",
          fontWeight: "var(--weight-medium)",
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        {firstLetter}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      onError={() => setImgError(true)}
      style={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        display: "block",
        flexShrink: 0,
      }}
    />
  );
};

export default TrackCover;
