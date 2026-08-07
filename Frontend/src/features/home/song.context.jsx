import { useState, useEffect, createContext } from "react";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://mood-melodies-backend.onrender.com";

export const SongContext = createContext();

export const SongContextProvider = ({ children }) => {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentMood, setCurrentMood] = useState("happy");

  // New states for Settings and History
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [moodHistory, setMoodHistory] = useState([
    { mood: "happy", time: new Date() },
  ]);
  const [listeningHistory, setListeningHistory] = useState([]);
  const [sensitivity, setSensitivity] = useState(60);

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

    // Track Mood History
    setMoodHistory((prev) => {
      if (prev[prev.length - 1]?.mood === currentMood) return prev;

      // Call backend to persist mood
      axios
        .post(
          `${API_BASE}/api/auth/log-mood`,
          { mood: currentMood },
          { withCredentials: true },
        )
        .catch((err) => console.error("Error logging mood:", err));

      const newHistory = [...prev, { mood: currentMood, time: new Date() }];
      return newHistory.slice(-7); // Keep last 7 moods
    });
  }, [currentMood]);

  // Track Listening History
  useEffect(() => {
    if (currentSong) {
      setListeningHistory((prev) => {
        const isSameAsLast = prev[0]?.song?._id === currentSong._id;
        if (isSameAsLast) return prev;

        // Call backend to increment song count
        axios
          .post(
            `${API_BASE}/api/auth/log-song`,
            { songId: currentSong._id },
            { withCredentials: true },
          )
          .catch((err) => console.error("Error logging song:", err));

        return [{ song: currentSong, time: new Date() }, ...prev].slice(0, 5); // Keep last 5 songs
      });
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
