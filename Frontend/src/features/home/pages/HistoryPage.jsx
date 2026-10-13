import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MoodBadge from "../../shared/components/MoodBadge";
import { useSlowServerNotice } from "../../shared/hooks/useSlowServerNotice";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://mood-melodies-backend.onrender.com";

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState("mood"); // 'mood' | 'play'
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [data, setData] = useState({ events: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState("");

  const isSlow = useSlowServerNotice(loading);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("type", activeTab);
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (from) params.set("from", new Date(from).toISOString());
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        params.set("to", toDate.toISOString());
      }

      const res = await axios.get(
        `${API_BASE}/api/events/history?${params.toString()}`,
        { withCredentials: true }
      );
      setData(res.data);
    } catch {
      setError("Could not load history.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, limit, from, to]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPage(1);
  };

  const handleExportCsv = async () => {
    try {
      setActionStatus("Exporting CSV...");
      const res = await axios.get(`${API_BASE}/api/events/export`, {
        withCredentials: true,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "events.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setActionStatus("");
    } catch {
      setActionStatus("Could not export events.");
    }
  };

  const handleDeleteData = async () => {
    try {
      setActionStatus("Deleting data...");
      await axios.delete(`${API_BASE}/api/events/me?confirm=true`, {
        withCredentials: true,
      });
      setConfirmOpen(false);
      setActionStatus("All data deleted.");
      setPage(1);
      fetchHistory();
    } catch {
      setActionStatus("Could not delete data.");
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "--";
    try {
      const d = new Date(isoString);
      return d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const formatSeconds = (sec) => {
    if (!sec && sec !== 0) return "--";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          marginBottom: "var(--space-4)",
        }}
      >
        <h1
          style={{
            fontSize: "var(--font-lg)",
            fontWeight: "var(--weight-medium)",
            color: "var(--text)",
          }}
        >
          History
        </h1>

        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              padding: "var(--space-2) var(--space-3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              backgroundColor: "var(--surface)",
              color: "var(--text)",
              fontSize: "var(--font-sm)",
              cursor: "pointer",
            }}
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            style={{
              padding: "var(--space-2) var(--space-3)",
              border: "1px solid var(--danger)",
              borderRadius: "var(--radius)",
              backgroundColor: "transparent",
              color: "var(--danger)",
              fontSize: "var(--font-sm)",
              cursor: "pointer",
            }}
          >
            Delete my data
          </button>
        </div>
      </div>

      {actionStatus && (
        <div
          style={{
            padding: "var(--space-2) var(--space-3)",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            color: "var(--text-muted)",
            fontSize: "var(--font-xs)",
            marginBottom: "var(--space-3)",
          }}
        >
          {actionStatus}
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmOpen && (
        <div
          style={{
            padding: "var(--space-4)",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--danger)",
            borderRadius: "var(--radius)",
            marginBottom: "var(--space-4)",
          }}
        >
          <div
            style={{
              fontSize: "var(--font-sm)",
              fontWeight: "var(--weight-medium)",
              color: "var(--text)",
              marginBottom: "var(--space-2)",
            }}
          >
            Delete all recorded data?
          </div>
          <p
            style={{
              fontSize: "var(--font-xs)",
              color: "var(--text-muted)",
              marginBottom: "var(--space-3)",
            }}
          >
            This permanently deletes all your mood events and listening history. This action cannot be undone.
          </p>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button
              type="button"
              onClick={handleDeleteData}
              style={{
                padding: "var(--space-2) var(--space-3)",
                backgroundColor: "var(--danger)",
                color: "#ffffff",
                border: "none",
                borderRadius: "var(--radius)",
                fontSize: "var(--font-xs)",
                fontWeight: "var(--weight-medium)",
                cursor: "pointer",
              }}
            >
              Confirm delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
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
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Navigation tabs and date filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          marginBottom: "var(--space-3)",
        }}
      >
        <div style={{ display: "flex", gap: "var(--space-1)" }}>
          <button
            type="button"
            onClick={() => handleTabChange("mood")}
            style={{
              padding: "var(--space-2) var(--space-3)",
              border: "1px solid var(--border)",
              borderBottom: activeTab === "mood" ? "2px solid var(--accent)" : "1px solid var(--border)",
              borderRadius: "var(--radius) var(--radius) 0 0",
              backgroundColor: activeTab === "mood" ? "var(--surface)" : "transparent",
              color: activeTab === "mood" ? "var(--text)" : "var(--text-muted)",
              fontSize: "var(--font-sm)",
              fontWeight: activeTab === "mood" ? "var(--weight-medium)" : "var(--weight-regular)",
              cursor: "pointer",
            }}
          >
            Mood
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("play")}
            style={{
              padding: "var(--space-2) var(--space-3)",
              border: "1px solid var(--border)",
              borderBottom: activeTab === "play" ? "2px solid var(--accent)" : "1px solid var(--border)",
              borderRadius: "var(--radius) var(--radius) 0 0",
              backgroundColor: activeTab === "play" ? "var(--surface)" : "transparent",
              color: activeTab === "play" ? "var(--text)" : "var(--text-muted)",
              fontSize: "var(--font-sm)",
              fontWeight: activeTab === "play" ? "var(--weight-medium)" : "var(--weight-regular)",
              cursor: "pointer",
            }}
          >
            Plays
          </button>
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          <label style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>
            From:
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
              style={{
                marginLeft: "var(--space-1)",
                padding: "var(--space-1) var(--space-2)",
                fontSize: "var(--font-xs)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                backgroundColor: "var(--surface)",
                color: "var(--text)",
              }}
            />
          </label>
          <label style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>
            To:
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
              style={{
                marginLeft: "var(--space-1)",
                padding: "var(--space-1) var(--space-2)",
                fontSize: "var(--font-xs)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                backgroundColor: "var(--surface)",
                color: "var(--text)",
              }}
            />
          </label>
        </div>
      </div>

      {/* Main Table Content */}
      <div
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{
              padding: "var(--space-5)",
              color: "var(--text-muted)",
              fontSize: "var(--font-sm)",
            }}
          >
            {isSlow
              ? "Server is starting, this can take up to a minute."
              : "Loading history."}
          </div>
        ) : error ? (
          <div
            style={{
              padding: "var(--space-5)",
              color: "var(--danger)",
              fontSize: "var(--font-sm)",
            }}
          >
            {error}
          </div>
        ) : !data.events || data.events.length === 0 ? (
          <div
            style={{
              padding: "var(--space-5)",
              color: "var(--text-muted)",
              fontSize: "var(--font-sm)",
            }}
          >
            {activeTab === "mood" ? "No mood events recorded." : "No play events recorded."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "var(--font-sm)",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border)",
                    color: "var(--text-muted)",
                    fontSize: "var(--font-xs)",
                  }}
                >
                  {activeTab === "mood" ? (
                    <>
                      <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)" }}>Mood</th>
                      <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)" }}>Source</th>
                      <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)", textAlign: "right" }}>Recorded at</th>
                    </>
                  ) : (
                    <>
                      <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)" }}>Title</th>
                      <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)" }}>Artist</th>
                      <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)" }}>Mood</th>
                      <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)" }}>Listened</th>
                      <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)" }}>Ended by</th>
                      <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)", textAlign: "right" }}>Started at</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.events.map((evt) => (
                  <tr
                    key={evt._id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    {activeTab === "mood" ? (
                      <>
                        <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                          <MoodBadge mood={evt.mood} />
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text-muted)" }}>
                          {evt.source}
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", color: "var(--text-muted)" }}>
                          {formatDate(evt.createdAt)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text)" }}>
                          {evt.title}
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text-muted)" }}>
                          {evt.artist || "Unknown"}
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                          <MoodBadge mood={evt.mood} />
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text-muted)" }}>
                          {formatSeconds(evt.secondsListened)}
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text-muted)" }}>
                          {evt.endedBy || "--"}
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", color: "var(--text-muted)" }}>
                          {formatDate(evt.startedAt)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {data.totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "var(--space-3) var(--space-4)",
              borderTop: "1px solid var(--border)",
              fontSize: "var(--font-xs)",
              color: "var(--text-muted)",
            }}
          >
            <span>
              Page {data.page} of {data.totalPages} ({data.total} total)
            </span>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: "var(--space-1) var(--space-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--surface)",
                  color: "var(--text)",
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  opacity: page <= 1 ? 0.5 : 1,
                }}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                style={{
                  padding: "var(--space-1) var(--space-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--surface)",
                  color: "var(--text)",
                  cursor: page >= data.totalPages ? "not-allowed" : "pointer",
                  opacity: page >= data.totalPages ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
