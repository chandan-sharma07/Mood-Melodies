import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { SongContext } from "./song.context.js";
import { MoodEngine } from "../expression/utils/moodEngine.js";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://mood-melodies-backend.onrender.com";

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
  const lastSongIdRef = useRef(null);

  // Sync sensitivity into moodEngine
  useEffect(() => {
    moodEngineRef.current.setSensitivity(sensitivity);
  }, [sensitivity]);

  // Apply mood change and log it to backend (never on page load)
  const applyMoodChange = useCallback((newMood, source = "camera") => {
    if (!newMood) return;
    setCurrentMoodState((prevMood) => {
      if (prevMood === newMood) return prevMood;

      // Persist mood to backend with source
      axios
        .post(
          `${API_BASE}/api/auth/log-mood`,
          { mood: newMood, source },
          { withCredentials: true },
        )
        .catch((err) => console.error("Error logging mood:", err));

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

  // Expose setCurrentMood as manual override for compatibility
  const setCurrentMood = manualSetMood;

  // Fetch playlist for current mood (runs on mount and on mood changes; DOES NOT log mood)
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
          { withCredentials: true },
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

  // Track Listening History
  useEffect(() => {
    if (currentSong && lastSongIdRef.current !== currentSong._id) {
      lastSongIdRef.current = currentSong._id;

      axios
        .post(
          `${API_BASE}/api/auth/log-song`,
          { songId: currentSong._id },
          { withCredentials: true },
        )
        .catch((err) => console.error("Error logging song:", err));

      setListeningHistory((prev) =>
        [{ song: currentSong, time: new Date() }, ...prev].slice(0, 5),
      );
    }
  }, [currentSong]);

  const playSong = (songId) => {
    const song = songs.find((s) => s._id === songId);
    if (song) {
      setCurrentSong(song);
    }
  };

  const playNext = () => {
    if (!songs.length) return;
    const currentIndex = songs.findIndex((s) => s._id === currentSong?._id);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % songs.length : 0;
    setCurrentSong(songs[nextIndex]);
  };

  const playPrev = () => {
    if (!songs.length) return;
    const currentIndex = songs.findIndex((s) => s._id === currentSong?._id);
    const prevIndex =
      currentIndex >= 0
        ? (currentIndex - 1 + songs.length) % songs.length
        : songs.length - 1;
    setCurrentSong(songs[prevIndex]);
  };

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
