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
    <div className="listen-layout">
      {/* Left / Main column: Player and Queue */}
      <div className="listen-main-col">
        <div style={{ flexShrink: 0 }}>
          <PlayerView />
        </div>
        <div className="listen-queue-wrapper">
          <QueueTable />
        </div>
      </div>

      {/* Right column: Camera and mood controls */}
      <div className="listen-camera-col">
        <CameraColumn />
      </div>
    </div>
  );
};

export default ListenPage;
