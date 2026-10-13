import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { SongContext } from "./song.context.js";
import { MoodEngine } from "../expression/utils/moodEngine.js";
import {
  computeEndedBy,
  addToQueue,
  removeFromQueue,
  loadQueue,
  saveQueue,
} from "./utils/eventQueue.js";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://mood-melodies-backend.onrender.com";

const dispatchRequest = async (url, method, data) => {
  try {
    const res = await axios({
      url: `${API_BASE}${url}`,
      method,
      data,
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    console.warn(`Request to ${url} failed, enqueueing to localStorage:`, err);
    const currentQ = loadQueue();
    const updatedQ = addToQueue(currentQ, { url, method, data });
    saveQueue(undefined, updatedQ);
    return null;
  }
};

const flushQueue = async () => {
  const currentQ = loadQueue();
  if (!currentQ.length) return;

  let remainingQ = [...currentQ];
  for (const item of currentQ) {
    try {
      await axios({
        url: `${API_BASE}${item.url}`,
        method: item.method,
        data: item.data,
        withCredentials: true,
      });
      remainingQ = removeFromQueue(remainingQ, item.id);
      saveQueue(undefined, remainingQ);
    } catch {
      // Network might still be down, stop flushing and try next time
      break;
    }
  }
};

export const SongContextProvider = ({ children }) => {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentMood, setCurrentMoodState] = useState("happy");

  // States for Settings and History
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [moodHistory, setMoodHistory] = useState([]);
  const [listeningHistory, setListeningHistory] = useState([]);
  const [sensitivity, setSensitivity] = useState(60);

  const moodEngineRef = useRef(
    new MoodEngine({ sensitivity: 60, initialMood: "happy" })
  );

  // Play event tracking refs
  const activePlayEventIdRef = useRef(null);
  const activeTrackRef = useRef(null);
  const secondsListenedRef = useRef(0);
  const durationRef = useRef(0);

  // Sync sensitivity into moodEngine
  useEffect(() => {
    moodEngineRef.current.setSensitivity(sensitivity);
  }, [sensitivity]);

  // Flush offline queue on mount and fetch initial histories
  useEffect(() => {
    flushQueue();

    // Fetch recent mood history
    axios
      .get(`${API_BASE}/api/events/history?type=mood&limit=7`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data?.events) {
          setMoodHistory(
            res.data.events.map((e) => ({
              mood: e.mood,
              source: e.source,
              time: new Date(e.createdAt),
            }))
          );
        }
      })
      .catch(() => {});

    // Fetch recent listening history
    axios
      .get(`${API_BASE}/api/events/history?type=play&limit=5`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data?.events) {
          setListeningHistory(
            res.data.events.map((e) => ({
              song: {
                title: e.title,
                artist: e.artist,
              },
              time: new Date(e.startedAt),
            }))
          );
        }
      })
      .catch(() => {});

    const handleOnline = () => flushQueue();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  // Update current playback time from PlayerCard
  const updatePlaybackTime = useCallback((seconds, dur) => {
    secondsListenedRef.current = seconds;
    if (dur) durationRef.current = dur;
  }, []);

  // End active play event
  const endActivePlay = useCallback((reason = "switched") => {
    const playId = activePlayEventIdRef.current;
    if (!playId) return;

    const secondsListened = Math.round(secondsListenedRef.current || 0);
    const endedBy = computeEndedBy(reason, secondsListened);

    activePlayEventIdRef.current = null;
    const endedTrack = activeTrackRef.current;
    activeTrackRef.current = null;
    secondsListenedRef.current = 0;

    dispatchRequest(`/api/events/play/${playId}/end`, "post", {
      secondsListened,
      endedBy,
    });

    if (endedTrack) {
      setListeningHistory((prev) =>
        [{ song: endedTrack, time: new Date() }, ...prev].slice(0, 5)
      );
    }
  }, []);

  // Handle pagehide for beacon unload
  useEffect(() => {
    const handlePageHide = () => {
      const playId = activePlayEventIdRef.current;
      if (!playId) return;

      const secondsListened = Math.round(secondsListenedRef.current || 0);
      const url = `${API_BASE}/api/events/play/${playId}/end`;
      const payload = JSON.stringify({
        secondsListened,
        endedBy: "closed",
      });

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, []);

  // Apply mood change and log it to backend (never on page load)
  const applyMoodChange = useCallback((newMood, source = "camera") => {
    if (!newMood) return;
    setCurrentMoodState((prevMood) => {
      if (prevMood === newMood) return prevMood;

      dispatchRequest("/api/events/mood", "post", { mood: newMood, source });

      setMoodHistory((prev) =>
        [{ mood: newMood, source, time: new Date() }, ...prev].slice(0, 7)
      );

      return newMood;
    });
  }, []);

  // Process sample from camera (~5 fps)
  const processFaceDetection = useCallback(
    (label) => {
      const result = moodEngineRef.current.processSample(label);
      if (result.changed) {
        applyMoodChange(result.mood, "camera");
      }
      return result;
    },
    [applyMoodChange]
  );

  // Manual override (bypasses cooldown)
  const manualSetMood = useCallback(
    (mood) => {
      const result = moodEngineRef.current.manualOverride(mood);
      if (result.changed) {
        applyMoodChange(result.mood, "manual");
      }
    },
    [applyMoodChange]
  );

  const setCurrentMood = manualSetMood;

  // Fetch playlist for current mood
  useEffect(() => {
    const fetchSongs = async () => {
      setError(null);
      if (songs.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const response = await axios.get(
          `${API_BASE}/api/songs/stream?mood=${currentMood}`,
          { withCredentials: true }
        );
        setSongs(response.data);

        if (response.data?.length > 0) {
          setCurrentSong((prev) => {
            const stillInList = response.data.find((s) => s._id === prev?._id);
            return stillInList || response.data[0];
          });
        } else {
          setCurrentSong(null);
        }
      } catch (err) {
        console.error("Error fetching songs from Jamendo:", err);
        setError(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchSongs();
  }, [currentMood]);

  // Track Start of Song
  useEffect(() => {
    if (!currentSong?._id) return;

    // End previous active play if any
    endActivePlay("switched");

    activeTrackRef.current = currentSong;
    secondsListenedRef.current = 0;

    dispatchRequest("/api/events/play", "post", {
      trackId: currentSong._id,
      title: currentSong.title,
      artist: currentSong.artist || "Unknown",
      mood: currentSong.mood || currentMood,
      durationSeconds: Math.round(durationRef.current || 0),
    }).then((res) => {
      if (res?._id) {
        activePlayEventIdRef.current = res._id;
      }
    });
  }, [currentSong?._id]);

  const playSong = useCallback(
    (songId) => {
      const song = songs.find((s) => s._id === songId);
      if (song) {
        endActivePlay("switched");
        setCurrentSong(song);
      }
    },
    [songs, endActivePlay]
  );

  const playNext = useCallback(
    (reason = "next") => {
      if (!songs.length) return;
      endActivePlay(reason);
      const currentIndex = songs.findIndex((s) => s._id === currentSong?._id);
      const nextIndex =
        currentIndex >= 0 ? (currentIndex + 1) % songs.length : 0;
      setCurrentSong(songs[nextIndex]);
    },
    [songs, currentSong, endActivePlay]
  );

  const playPrev = useCallback(
    (reason = "prev") => {
      if (!songs.length) return;
      endActivePlay(reason);
      const currentIndex = songs.findIndex((s) => s._id === currentSong?._id);
      const prevIndex =
        currentIndex >= 0
          ? (currentIndex - 1 + songs.length) % songs.length
          : songs.length - 1;
      setCurrentSong(songs[prevIndex]);
    },
    [songs, currentSong, endActivePlay]
  );

  return (
    <SongContext.Provider
      value={{
        songs,
        currentSong,
        loading,
        refreshing,
        error,
        playSong,
        playNext,
        playPrev,
        updatePlaybackTime,
        setCurrentMood,
        manualSetMood,
        processFaceDetection,
        currentMood,
        autoplayEnabled,
        setAutoplayEnabled,
        moodHistory,
        listeningHistory,
        sensitivity,
        setSensitivity,
      }}
    >
      {children}
    </SongContext.Provider>
  );
};
