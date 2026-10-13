import React, { useContext } from "react";
import { SongContext } from "../song.context";
import { useSlowServerNotice } from "../../shared/hooks/useSlowServerNotice";
import PlayerView from "../components/PlayerView";
import QueueTable from "../components/QueueTable";
import CameraColumn from "../components/CameraColumn";

const ListenPage = () => {
  const { loading, error } = useContext(SongContext);
  const isSlow = useSlowServerNotice(loading);

  if (loading) {
    return (
      <div
        style={{
          padding: "var(--space-5)",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          color: "var(--text-muted)",
          fontSize: "var(--font-sm)",
        }}
      >
        {isSlow
          ? "Server is starting, this can take up to a minute."
          : "Loading tracks."}
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "var(--space-5)",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          color: "var(--danger)",
          fontSize: "var(--font-sm)",
        }}
      >
        Could not load tracks.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-5)",
        flexWrap: "wrap",
        alignItems: "flex-start",
      }}
    >
      {/* Left / Main column: Player and Queue */}
      <div style={{ flex: 1, minWidth: "280px" }}>
        <PlayerView />
        <QueueTable />
      </div>

      {/* Right column: 260px Camera and mood controls */}
      <div>
        <CameraColumn />
      </div>
    </div>
  );
};

export default ListenPage;
