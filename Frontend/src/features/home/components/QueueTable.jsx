import React, { useContext } from "react";
import { SongContext } from "../song.context";

const QueueTable = () => {
  const { songs, currentSong, playSong } = useContext(SongContext);

  if (!songs || songs.length === 0) {
    return (
      <div
        style={{
          padding: "var(--space-4)",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          color: "var(--text-muted)",
          fontSize: "var(--font-sm)",
          marginTop: "var(--space-4)",
        }}
      >
        No tracks in queue.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxHeight: "100%",
        minHeight: 0,
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "var(--space-3) var(--space-4)",
          borderBottom: "1px solid var(--border)",
          fontSize: "var(--font-sm)",
          fontWeight: "var(--weight-medium)",
          color: "var(--text)",
          flexShrink: 0,
        }}
      >
        Queue ({songs.length} tracks)
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "var(--font-sm)",
          }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              backgroundColor: "var(--surface)",
              zIndex: 1,
            }}
          >
            <tr
              style={{
                borderBottom: "1px solid var(--border)",
                color: "var(--text-muted)",
                fontSize: "var(--font-xs)",
              }}
            >
              <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)" }}>Title</th>
              <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)" }}>Artist</th>
              <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)", textAlign: "right" }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => {
              const isCurrent = currentSong?._id === song._id;
              return (
                <tr
                  key={song._id}
                  onClick={() => playSong(song._id)}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    cursor: "pointer",
                    backgroundColor: isCurrent ? "var(--bg)" : "transparent",
                    color: isCurrent ? "var(--accent)" : "var(--text)",
                    fontWeight: isCurrent ? "var(--weight-medium)" : "var(--weight-regular)",
                  }}
                >
                  <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      {isCurrent && (
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "1px",
                            backgroundColor: "var(--accent)",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <span>{song.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: "var(--space-3) var(--space-4)", color: isCurrent ? "var(--accent)" : "var(--text-muted)" }}>
                    {song.artist || "Unknown"}
                  </td>
                  <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", color: "var(--text-muted)" }}>
                    {song.durationStr || "--"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QueueTable;
