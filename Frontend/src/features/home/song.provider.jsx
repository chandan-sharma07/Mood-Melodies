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

// Priority tags and client IDs for direct Jamendo fetch
const CLIENT_IDS = ["c9cb2a0a", "b6747d04"];
const MOOD_TAGS = {
  happy: ["happy", "upbeat", "pop"],
  sad: ["sad", "acoustic", "slow", "piano"],
  angry: ["angry", "rock", "metal"],
  chill: ["relaxing", "chillout", "ambient", "lounge"],
  uplifting: ["uplifting", "inspiring", "positive"],
};

// Safe fallback tracks (using verified SoundHelix streams, never 403)
const SAFE_FALLBACKS = {
  happy: [
    {
      _id: "fb_happy_1",
      title: "Sunny Groove",
      artist: "SoundHelix",
      album: "Acoustic Joy",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      posterUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300",
      durationStr: "6:12",
      mood: "happy",
    },
    {
      _id: "fb_happy_2",
      title: "Brisk Motion",
      artist: "SoundHelix",
      album: "Bright Horizons",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      posterUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300",
      durationStr: "7:05",
      mood: "happy",
    },
    {
      _id: "fb_happy_3",
      title: "Joyful Flight",
      artist: "SoundHelix",
      album: "Elevation",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      posterUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=300",
      durationStr: "5:44",
      mood: "happy",
    },
  ],
  sad: [
    {
      _id: "fb_sad_1",
      title: "Quiet Rain",
      artist: "SoundHelix",
      album: "Solitude",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      posterUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=300",
      durationStr: "5:02",
      mood: "sad",
    },
    {
      _id: "fb_sad_2",
      title: "Distant Echo",
      artist: "SoundHelix",
      album: "Memories",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
      posterUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=300",
      durationStr: "4:15",
      mood: "sad",
    },
    {
      _id: "fb_sad_3",
      title: "Solitary Path",
      artist: "SoundHelix",
      album: "Still Water",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      posterUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300",
      durationStr: "6:12",
      mood: "sad",
    },
  ],
  angry: [
    {
      _id: "fb_angry_1",
      title: "Intense Drive",
      artist: "SoundHelix",
      album: "Fierce Velocity",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      posterUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300",
      durationStr: "5:53",
      mood: "angry",
    },
    {
      _id: "fb_angry_2",
      title: "Electric Surge",
      artist: "SoundHelix",
      album: "Overdrive",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
      posterUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300",
      durationStr: "4:45",
      mood: "angry",
    },
    {
      _id: "fb_angry_3",
      title: "Relentless Beat",
      artist: "SoundHelix",
      album: "Impact",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      posterUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=300",
      durationStr: "7:05",
      mood: "angry",
    },
  ],
  chill: [
    {
      _id: "fb_chill_1",
      title: "Deliverance",
      artist: "SoundHelix",
      album: "Ambient Moments",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      posterUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300",
      durationStr: "6:12",
      mood: "chill",
    },
    {
      _id: "fb_chill_2",
      title: "Gentle Night",
      artist: "SoundHelix",
      album: "Nocturne",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      posterUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300",
      durationStr: "7:05",
      mood: "chill",
    },
    {
      _id: "fb_chill_3",
      title: "Twilight Reflection",
      artist: "SoundHelix",
      album: "Calm Horizon",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      posterUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=300",
      durationStr: "5:44",
      mood: "chill",
    },
  ],
  uplifting: [
    {
      _id: "fb_uplifting_1",
      title: "Soaring Melody",
      artist: "SoundHelix",
      album: "Ascent",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      posterUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=300",
      durationStr: "5:44",
      mood: "uplifting",
    },
    {
      _id: "fb_uplifting_2",
      title: "New Beginnings",
      artist: "SoundHelix",
      album: "Fresh Start",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
      posterUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300",
      durationStr: "4:50",
      mood: "uplifting",
    },
    {
      _id: "fb_uplifting_3",
      title: "Higher Ground",
      artist: "SoundHelix",
      album: "Clear Skies",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      posterUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300",
      durationStr: "7:05",
      mood: "uplifting",
    },
  ],
};

const fetchJamendoDirect = async (mood) => {
  const tags = MOOD_TAGS[mood] || [mood];
  for (const clientId of CLIENT_IDS) {
    for (const tag of tags) {
      for (const param of ["fuzzytags", "tags"]) {
        try {
          const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=15&${param}=${encodeURIComponent(tag)}&audioformat=mp32`;
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          if (data?.results?.length > 0) {
            const valid = data.results.filter((t) => t.audio);
            if (valid.length > 0) {
              return valid.map((track) => {
                const min = Math.floor((track.duration || 0) / 60);
                const sec = Math.floor((track.duration || 0) % 60);
                return {
                  _id: String(track.id),
                  title: track.name || "Untitled Track",
                  artist: track.artist_name || "Unknown Artist",
                  album: track.album_name || track.name || "Unknown Album",
                  durationStr: `${min}:${sec < 10 ? "0" : ""}${sec}`,
                  url: track.audio,
                  posterUrl:
                    track.image ||
                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300",
                  mood,
                };
              });
            }
          }
        } catch {
          // Continue to next param/tag
        }
      }
    }
  }
  return null;
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

  const defaultTz =
    typeof Intl !== "undefined" && Intl.DateTimeFormat
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
      : "UTC";

  const [cameraEnabled, setCameraEnabledState] = useState(() => {
    try {
      const saved = localStorage.getItem("mm_camera_enabled");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const [timezone, setTimezoneState] = useState(() => {
    try {
      return localStorage.getItem("mm_timezone") || defaultTz;
    } catch {
      return defaultTz;
    }
  });

  const setCameraEnabled = useCallback((val) => {
    setCameraEnabledState(val);
    try {
      localStorage.setItem("mm_camera_enabled", String(val));
    } catch {}
  }, []);

  const setTimezone = useCallback((tz) => {
    setTimezoneState(tz);
    try {
      localStorage.setItem("mm_timezone", tz);
    } catch {}
  }, []);

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
    let isCancelled = false;

    const fetchSongs = async () => {
      setError(null);
      if (songs.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      let trackList = null;

      try {
        const response = await axios.get(
          `${API_BASE}/api/songs/stream?mood=${currentMood}`,
          { withCredentials: true }
        );

        if (Array.isArray(response.data) && response.data.length > 0) {
          const hasBrokenPixabay = response.data.some(
            (s) => s.url && s.url.includes("cdn.pixabay.com")
          );
          const isLegacySmallFallback =
            response.data.length <= 3 &&
            response.data.some((s) => s._id && String(s._id).startsWith("fb_"));

          if (hasBrokenPixabay || isLegacySmallFallback) {
            // Live Render backend is serving old cached data with 403 Pixabay URLs.
            // Rescue with direct Jamendo API fetch so real audio plays immediately.
            const direct = await fetchJamendoDirect(currentMood);
            if (direct && direct.length > 0) {
              trackList = direct;
            } else {
              // Direct Jamendo failed, replace broken Pixabay tracks with safe SoundHelix fallbacks
              trackList = SAFE_FALLBACKS[currentMood] || SAFE_FALLBACKS.chill;
            }
          } else {
            trackList = response.data;
          }
        }
      } catch (err) {
        console.warn("Backend song fetch failed, falling back to direct Jamendo:", err);
      }

      // If backend failed or returned empty, fetch directly from Jamendo
      if (!trackList || trackList.length === 0) {
        try {
          const direct = await fetchJamendoDirect(currentMood);
          if (direct && direct.length > 0) {
            trackList = direct;
          }
        } catch (err) {
          console.warn("Direct Jamendo fetch error:", err);
        }
      }

      // Final bulletproof fallback: verified playable SoundHelix MP3s
      if (!trackList || trackList.length === 0) {
        trackList = SAFE_FALLBACKS[currentMood] || SAFE_FALLBACKS.chill;
      }

      if (isCancelled) return;

      setSongs(trackList);

      if (trackList.length > 0) {
        setCurrentSong((prev) => {
          const stillInList = trackList.find((s) => s._id === prev?._id);
          return stillInList || trackList[0];
        });
      } else {
        setCurrentSong(null);
      }

      setLoading(false);
      setRefreshing(false);
    };

    fetchSongs();

    return () => {
      isCancelled = true;
    };
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

  // Persistent audio playback controller (survives route navigation)
  const audioRef = useRef(typeof Audio !== "undefined" ? new Audio() : null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMutedState] = useState(false);
  const [playbackError, setPlaybackError] = useState(null);

  // Sync volume & muted states with audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  // Audio track playback & events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.url) return;

    setPlaybackError(null);
    audio.pause();
    audio.src = currentSong.url;
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);

    const onLoaded = () => {
      const dur = audio.duration || 0;
      if (!isNaN(dur) && dur > 0) {
        setDuration(dur);
        durationRef.current = dur;
      }

      if (autoplayEnabled) {
        audio.play().catch((err) => {
          console.warn("Autoplay blocked by browser policy:", err);
          setPlaying(false);
        });
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      secondsListenedRef.current = audio.currentTime;
      if (audio.duration) durationRef.current = audio.duration;
    };

    const onPlay = () => {
      setPlaying(true);
      setPlaybackError(null);
    };

    const onPause = () => {
      setPlaying(false);
    };

    const onEnded = () => {
      setPlaying(false);
      playNext("completed");
    };

    const onError = () => {
      console.warn("Audio loading error for URL:", currentSong.url);
      setPlaying(false);
      setPlaybackError("Audio track could not be loaded. Click next or choose another track.");
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("canplay", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    audio.load();

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("canplay", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [currentSong?._id, currentSong?.url, autoplayEnabled, playNext]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.url) return;
    setPlaybackError(null);

    if (audio.paused) {
      if (!audio.src || audio.src === window.location.href || audio.error) {
        audio.src = currentSong.url;
        audio.load();
      }
      audio.play()
        .then(() => {
          setPlaying(true);
          setPlaybackError(null);
        })
        .catch((err) => {
          console.warn("Play failed:", err);
          setPlaying(false);
          setPlaybackError("Click to interact with page to allow audio playback.");
        });
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, [currentSong?.url]);

  const seekTo = useCallback((seconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
    secondsListenedRef.current = seconds;
  }, []);

  const handleVolume = useCallback((val) => {
    setVolumeState(val);
    if (val === 0) setMutedState(true);
    else if (muted) setMutedState(false);
  }, [muted]);

  const toggleMute = useCallback(() => {
    setMutedState((prev) => !prev);
  }, []);

  return (
    <SongContext.Provider
      value={{
        songs,
        currentSong,
        loading,
        refreshing,
        error,
        playing,
        currentTime,
        duration,
        volume,
        muted,
        playbackError,
        togglePlay,
        seekTo,
        setVolume: handleVolume,
        toggleMute,
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
        cameraEnabled,
        setCameraEnabled,
        timezone,
        setTimezone,
      }}
    >
      {children}
    </SongContext.Provider>
  );
};
