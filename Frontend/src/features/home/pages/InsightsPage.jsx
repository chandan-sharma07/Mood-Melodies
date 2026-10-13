import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { SongContext } from "../song.context";
import MoodBadge from "../../shared/components/MoodBadge";
import { useSlowServerNotice } from "../../shared/hooks/useSlowServerNotice";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://mood-melodies-backend.onrender.com";

const InsightsPage = () => {
  const { timezone } = useContext(SongContext);
  const [range, setRange] = useState("7d"); // '7d' | '30d' | '90d'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isSlow = useSlowServerNotice(loading);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${API_BASE}/api/analytics/summary?range=${range}&tz=${encodeURIComponent(
          timezone || "UTC"
        )}`,
        { withCredentials: true }
      );
      setData(res.data);
    } catch {
      setError("Could not load insights.");
    } finally {
      setLoading(false);
    }
  }, [range, timezone]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const ranges = [
    { label: "7 days", value: "7d" },
    { label: "30 days", value: "30d" },
    { label: "90 days", value: "90d" },
  ];

  const formatChartDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}`;
    }
    return dateStr;
  };

  const chartData = (data?.dailyListening || []).map((d) => ({
    date: formatChartDate(d.date),
    fullDate: d.date,
    minutes: d.minutes,
  }));

  const hasData = data && data.totals && (data.totals.tracksPlayed > 0 || (data.moodDistribution && data.moodDistribution.length > 0));

  return (
    <div>
      {/* Top Header */}
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
          Insights
        </h1>

        {/* Range Selector */}
        <div style={{ display: "flex", gap: "var(--space-1)" }}>
          {ranges.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRange(r.value)}
              style={{
                padding: "var(--space-1) var(--space-3)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                backgroundColor: range === r.value ? "var(--surface)" : "transparent",
                color: range === r.value ? "var(--text)" : "var(--text-muted)",
                fontSize: "var(--font-xs)",
                fontWeight: range === r.value ? "var(--weight-medium)" : "var(--weight-regular)",
                cursor: "pointer",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
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
            : "Loading insights."}
        </div>
      ) : error ? (
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
          {error}
        </div>
      ) : !hasData ? (
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
          No listening data for this period.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          {/* Totals Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--space-3)",
            }}
          >
            <div
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "var(--space-4)",
              }}
            >
              <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>
                Tracks played
              </div>
              <div style={{ fontSize: "var(--font-xl)", fontWeight: "var(--weight-medium)", color: "var(--text)" }}>
                {data.totals.tracksPlayed}
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "var(--space-4)",
              }}
            >
              <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>
                Minutes listened
              </div>
              <div style={{ fontSize: "var(--font-xl)", fontWeight: "var(--weight-medium)", color: "var(--text)" }}>
                {data.totals.minutesListened}
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "var(--space-4)",
              }}
            >
              <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>
                Dominant mood
              </div>
              <div style={{ marginTop: "var(--space-1)" }}>
                {data.totals.mostFrequentMood ? (
                  <MoodBadge mood={data.totals.mostFrequentMood} />
                ) : (
                  <span style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)" }}>None</span>
                )}
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "var(--space-4)",
              }}
            >
              <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>
                Skip rate
              </div>
              <div style={{ fontSize: "var(--font-xl)", fontWeight: "var(--weight-medium)", color: "var(--text)" }}>
                {Math.round((data.totals.skipRate || 0) * 100)}%
              </div>
            </div>
          </div>

          {/* Daily Listening Bar Chart */}
          <div
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "var(--space-4)",
            }}
          >
            <div
              style={{
                fontSize: "var(--font-sm)",
                fontWeight: "var(--weight-medium)",
                color: "var(--text)",
                marginBottom: "var(--space-3)",
              }}
            >
              Daily listening (minutes)
            </div>

            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={{ stroke: "var(--border)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={{ stroke: "var(--border)" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div
                            style={{
                              backgroundColor: "var(--surface)",
                              border: "1px solid var(--border)",
                              borderRadius: "var(--radius)",
                              padding: "var(--space-2) var(--space-3)",
                              fontSize: "var(--font-xs)",
                              color: "var(--text)",
                            }}
                          >
                            <div>{payload[0].payload.fullDate}</div>
                            <div style={{ fontWeight: "var(--weight-medium)", marginTop: "2px" }}>
                              {payload[0].value} min
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="minutes" fill="var(--accent)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tables Section: Mood Distribution & Skip Rate by Mood */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            {/* Mood Distribution */}
            <div
              style={{
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
                }}
              >
                Mood distribution
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-sm)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "var(--font-xs)" }}>
                    <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)", textAlign: "left" }}>Mood</th>
                    <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)", textAlign: "right" }}>Count</th>
                    <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)", textAlign: "right" }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.moodDistribution || []).map((m) => (
                    <tr key={m.mood} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                        <MoodBadge mood={m.mood} />
                      </td>
                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", color: "var(--text)" }}>
                        {m.count}
                      </td>
                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", color: "var(--text-muted)" }}>
                        {Math.round(m.share * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Skip Rate by Mood */}
            <div
              style={{
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
                }}
              >
                Skip rate by mood
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-sm)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "var(--font-xs)" }}>
                    <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)", textAlign: "left" }}>Mood</th>
                    <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)", textAlign: "right" }}>Plays</th>
                    <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)", textAlign: "right" }}>Skip rate</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.skipRateByMood || []).map((s) => (
                    <tr key={s.mood} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                        <MoodBadge mood={s.mood} />
                      </td>
                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", color: "var(--text)" }}>
                        {s.plays}
                      </td>
                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", color: "var(--text-muted)" }}>
                        {Math.round(s.skipRate * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Artists */}
          <div
            style={{
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
              }}
            >
              Top artists
            </div>
            {data.topArtists && data.topArtists.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-sm)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "var(--font-xs)" }}>
                    <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)", textAlign: "left" }}>Artist</th>
                    <th style={{ padding: "var(--space-2) var(--space-4)", fontWeight: "var(--weight-medium)", textAlign: "right" }}>Plays</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topArtists.map((a) => (
                    <tr key={a.artist} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text)" }}>
                        {a.artist}
                      </td>
                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", color: "var(--text-muted)" }}>
                        {a.plays}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "var(--space-4)", color: "var(--text-muted)", fontSize: "var(--font-xs)" }}>
                No artist data available.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsPage;
