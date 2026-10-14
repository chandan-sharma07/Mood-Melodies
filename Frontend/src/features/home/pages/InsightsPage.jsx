import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LabelList,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { SongContext } from "../song.context";
import { useSlowServerNotice } from "../../shared/hooks/useSlowServerNotice";
import {
  MOOD_COLORS,
  getMoodColor,
  formatListeningTime,
  buildInsightSentence,
  prepareMoodByHourGrid,
} from "../utils/insights.utils";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://mood-melodies-backend.onrender.com";

const InsightsPage = () => {
  const { timezone } = useContext(SongContext);
  const [range, setRange] = useState("7d"); // '7d' | '30d' | '90d'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

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
    { label: "7d", value: "7d" },
    { label: "30d", value: "30d" },
    { label: "90d", value: "90d" },
  ];

  const hasData = useMemo(() => {
    if (!data || !data.totals) return false;
    return (
      (data.totals.tracksPlayed || 0) > 0 ||
      (Array.isArray(data.moodDistribution) && data.moodDistribution.length > 0)
    );
  }, [data]);

  // Sorted mood distribution for horizontal bar chart
  const sortedMoodDistribution = useMemo(() => {
    if (!data?.moodDistribution) return [];
    return [...data.moodDistribution]
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .map((item) => ({
        ...item,
        label: `${item.count} (${Math.round(item.share || 0)}%)`,
      }));
  }, [data?.moodDistribution]);

  // Formatted daily listening
  const formattedDailyListening = useMemo(() => {
    if (!data?.dailyListening) return [];
    return data.dailyListening.map((item) => {
      let shortDate = item.date;
      const parts = item.date.split("-");
      if (parts.length === 3) {
        shortDate = `${Number(parts[1])}/${Number(parts[2])}`;
      }
      return {
        ...item,
        shortDate,
      };
    });
  }, [data?.dailyListening]);

  // 7x24 grid matrix
  const { grid: hourGrid } = useMemo(() => {
    return prepareMoodByHourGrid(data?.moodByHour || []);
  }, [data?.moodByHour]);

  // Insight sentence below stat blocks
  const insightSentence = useMemo(() => {
    if (!data?.totals) return "";
    return buildInsightSentence(data.totals.tracksPlayed, data.skipRateByMood);
  }, [data]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* Top Header: Title and Segmented Control */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
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

        {/* Range Segmented Control */}
        <div
          role="group"
          aria-label="Time range"
          style={{
            display: "inline-flex",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "2px",
            gap: "2px",
          }}
        >
          {ranges.map((r) => {
            const isActive = range === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRange(r.value)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "calc(var(--radius) - 2px)",
                  border: "none",
                  backgroundColor: isActive ? "var(--bg)" : "transparent",
                  color: isActive ? "var(--text)" : "var(--text-muted)",
                  fontSize: "var(--font-xs)",
                  fontWeight: isActive ? "var(--weight-medium)" : "var(--weight-regular)",
                  cursor: "pointer",
                  transition: "background-color 0.15s ease, color 0.15s ease",
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
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
        /* Proper Empty State */
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
        <>
          {/* Four Plain Stat Blocks */}
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "var(--space-3)",
              }}
            >
              {/* Tracks played */}
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
                    fontSize: "var(--font-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Tracks played
                </div>
                <div
                  style={{
                    fontSize: "var(--font-xl)",
                    fontWeight: "var(--weight-medium)",
                    color: "var(--text)",
                  }}
                >
                  {data.totals.tracksPlayed}
                </div>
              </div>

              {/* Listening time */}
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
                    fontSize: "var(--font-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Listening time
                </div>
                <div
                  style={{
                    fontSize: "var(--font-xl)",
                    fontWeight: "var(--weight-medium)",
                    color: "var(--text)",
                  }}
                >
                  {formatListeningTime(data.totals.minutesListened)}
                </div>
              </div>

              {/* Most frequent mood */}
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
                    fontSize: "var(--font-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Most frequent mood
                </div>
                <div
                  style={{
                    fontSize: "var(--font-xl)",
                    fontWeight: "var(--weight-medium)",
                    color: "var(--text)",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                  }}
                >
                  {data.totals.mostFrequentMood ? (
                    <>
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "2px",
                          backgroundColor: getMoodColor(data.totals.mostFrequentMood),
                          flexShrink: 0,
                        }}
                      />
                      <span>{data.totals.mostFrequentMood}</span>
                    </>
                  ) : (
                    <span style={{ color: "var(--text-muted)", fontSize: "var(--font-base)" }}>
                      None
                    </span>
                  )}
                </div>
              </div>

              {/* Skip rate */}
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
                    fontSize: "var(--font-xs)",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Skip rate
                </div>
                <div
                  style={{
                    fontSize: "var(--font-xl)",
                    fontWeight: "var(--weight-medium)",
                    color: "var(--text)",
                  }}
                >
                  {Math.round(data.totals.skipRate || 0)}%
                </div>
              </div>
            </div>

            {/* One sentence under the stats built only from real numbers */}
            {insightSentence && (
              <p
                style={{
                  fontSize: "var(--font-xs)",
                  color: "var(--text-muted)",
                  marginTop: "var(--space-2)",
                  paddingLeft: "var(--space-1)",
                }}
              >
                {insightSentence}
              </p>
            )}
          </div>

          {/* Mood distribution: Horizontal bar chart (Recharts) */}
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
              Mood distribution
            </div>

            {sortedMoodDistribution.length === 0 ? (
              <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>
                No mood events recorded.
              </div>
            ) : (
              <div style={{ width: "100%", height: Math.max(160, sortedMoodDistribution.length * 36 + 24) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={sortedMoodDistribution}
                    margin={{ top: 8, right: 64, left: 12, bottom: 8 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="mood"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 13, fill: "var(--text)" }}
                      width={70}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      isAnimationActive={false}
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const entry = payload[0].payload;
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
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "1px",
                                  backgroundColor: getMoodColor(entry.mood),
                                }}
                              />
                              <span style={{ fontWeight: "var(--weight-medium)" }}>{entry.mood}</span>
                            </div>
                            <div style={{ color: "var(--text-muted)", marginTop: "2px" }}>
                              {entry.count} events ({Math.round(entry.share || 0)}%)
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="count"
                      isAnimationActive={true}
                      animationDuration={150}
                      radius={[0, 3, 3, 0]}
                    >
                      <LabelList
                        dataKey="label"
                        position="right"
                        style={{ fontSize: 12, fill: "var(--text-muted)" }}
                      />
                      {sortedMoodDistribution.map((entry) => (
                        <Cell key={entry.mood} fill={getMoodColor(entry.mood)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Mood by hour: 7x24 grid built from divs */}
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "var(--space-2)",
                marginBottom: "var(--space-3)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--font-sm)",
                  fontWeight: "var(--weight-medium)",
                  color: "var(--text)",
                }}
              >
                Mood by hour
              </div>

              {/* Hover detail indicator */}
              <div
                style={{
                  fontSize: "var(--font-xs)",
                  color: hoveredCell ? "var(--text)" : "var(--text-muted)",
                }}
              >
                {hoveredCell ? (
                  <span>
                    {hoveredCell.fullDayName}, {hoveredCell.hour}:00 —{" "}
                    {hoveredCell.count > 0 ? (
                      <span style={{ fontWeight: "var(--weight-medium)" }}>
                        {hoveredCell.dominantMood} ({hoveredCell.count} event
                        {hoveredCell.count > 1 ? "s" : ""})
                      </span>
                    ) : (
                      "No events"
                    )}
                  </span>
                ) : (
                  "Hover cell to inspect hour"
                )}
              </div>
            </div>

            {/* Grid Container */}
            <div style={{ overflowX: "auto", paddingBottom: "var(--space-2)" }}>
              <div style={{ minWidth: "540px" }}>
                {/* Hours Header Row */}
                <div style={{ display: "flex", marginBottom: "4px", alignItems: "center" }}>
                  <div style={{ width: "36px", flexShrink: 0 }} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", flex: 1, gap: "2px" }}>
                    {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
                      <div
                        key={h}
                        style={{
                          gridColumnStart: h + 1,
                          gridColumnEnd: h + 4,
                          fontSize: "10px",
                          color: "var(--text-muted)",
                          textAlign: "left",
                        }}
                      >
                        {h}h
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7 Day Rows */}
                {hourGrid.map((dayRow) => (
                  <div
                    key={dayRow.weekday}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "2px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        flexShrink: 0,
                      }}
                    >
                      {dayRow.dayName}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(24, 1fr)",
                        flex: 1,
                        gap: "2px",
                      }}
                    >
                      {dayRow.hours.map((cell) => {
                        const hasEvents = cell.count > 0;
                        const color = hasEvents ? getMoodColor(cell.dominantMood) : "var(--bg)";
                        const cellOpacity = hasEvents ? cell.opacity : 1;
                        const tooltipText = `${cell.fullDayName}, ${cell.hour}:00: ${
                          hasEvents ? `${cell.dominantMood} (${cell.count} events)` : "No events"
                        }`;

                        return (
                          <div
                            key={cell.hour}
                            title={tooltipText}
                            onMouseEnter={() => setHoveredCell(cell)}
                            onMouseLeave={() => setHoveredCell(null)}
                            style={{
                              height: "16px",
                              backgroundColor: color,
                              opacity: cellOpacity,
                              borderRadius: "2px",
                              border: hasEvents ? "none" : "1px solid var(--border)",
                              cursor: "pointer",
                              transition: "transform 0.1s ease",
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div
              style={{
                marginTop: "var(--space-3)",
                paddingTop: "var(--space-2)",
                borderTop: "1px solid var(--border)",
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-4)",
                alignItems: "center",
                fontSize: "var(--font-xs)",
                color: "var(--text-muted)",
              }}
            >
              <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                {Object.entries(MOOD_COLORS).map(([mood, color]) => (
                  <div key={mood} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "1px",
                        backgroundColor: color,
                      }}
                    />
                    <span style={{ color: "var(--text)" }}>{mood}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginLeft: "auto", fontSize: "11px" }}>
                Cell opacity scales with event count.
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
                <BarChart
                  data={formattedDailyListening}
                  margin={{ top: 8, right: 12, left: -20, bottom: 4 }}
                >
                  <XAxis
                    dataKey="shortDate"
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    isAnimationActive={false}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const entry = payload[0].payload;
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
                          <div>{entry.date}</div>
                          <div style={{ fontWeight: "var(--weight-medium)", marginTop: "2px" }}>
                            {entry.minutes} min
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="minutes"
                    fill="var(--accent)"
                    radius={[2, 2, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={150}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Two Small Tables: Skip Rate by Mood & Top Artists */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            {/* Table 1: Skip rate by mood */}
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

              {!data.skipRateByMood || data.skipRateByMood.length === 0 ? (
                <div
                  style={{
                    padding: "var(--space-4)",
                    color: "var(--text-muted)",
                    fontSize: "var(--font-xs)",
                  }}
                >
                  No skip data recorded.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-sm)" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--border)",
                        color: "var(--text-muted)",
                        fontSize: "var(--font-xs)",
                      }}
                    >
                      <th
                        style={{
                          padding: "var(--space-2) var(--space-4)",
                          fontWeight: "var(--weight-medium)",
                          textAlign: "left",
                        }}
                      >
                        Mood
                      </th>
                      <th
                        style={{
                          padding: "var(--space-2) var(--space-4)",
                          fontWeight: "var(--weight-medium)",
                          textAlign: "right",
                        }}
                      >
                        Plays
                      </th>
                      <th
                        style={{
                          padding: "var(--space-2) var(--space-4)",
                          fontWeight: "var(--weight-medium)",
                          textAlign: "right",
                        }}
                      >
                        Skip rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.skipRateByMood.map((s) => (
                      <tr key={s.mood} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              color: "var(--text)",
                            }}
                          >
                            <span
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "1px",
                                backgroundColor: getMoodColor(s.mood),
                                flexShrink: 0,
                              }}
                            />
                            <span>{s.mood}</span>
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "var(--space-3) var(--space-4)",
                            textAlign: "right",
                            color: "var(--text)",
                          }}
                        >
                          {s.plays}
                        </td>
                        <td
                          style={{
                            padding: "var(--space-3) var(--space-4)",
                            textAlign: "right",
                            color: "var(--text-muted)",
                          }}
                        >
                          {Math.round(s.skipRate || 0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Table 2: Top artists */}
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

              {!data.topArtists || data.topArtists.length === 0 ? (
                <div
                  style={{
                    padding: "var(--space-4)",
                    color: "var(--text-muted)",
                    fontSize: "var(--font-xs)",
                  }}
                >
                  No artist data recorded.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-sm)" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--border)",
                        color: "var(--text-muted)",
                        fontSize: "var(--font-xs)",
                      }}
                    >
                      <th
                        style={{
                          padding: "var(--space-2) var(--space-4)",
                          fontWeight: "var(--weight-medium)",
                          textAlign: "left",
                        }}
                      >
                        Artist
                      </th>
                      <th
                        style={{
                          padding: "var(--space-2) var(--space-4)",
                          fontWeight: "var(--weight-medium)",
                          textAlign: "right",
                        }}
                      >
                        Plays
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topArtists.map((a) => (
                      <tr key={a.artist} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td
                          style={{
                            padding: "var(--space-3) var(--space-4)",
                            color: "var(--text)",
                          }}
                        >
                          {a.artist}
                        </td>
                        <td
                          style={{
                            padding: "var(--space-3) var(--space-4)",
                            textAlign: "right",
                            color: "var(--text-muted)",
                          }}
                        >
                          {a.plays}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InsightsPage;
