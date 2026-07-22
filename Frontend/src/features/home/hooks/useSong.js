import { useContext } from "react";
import { SongContext } from "../song.context";

export const useSong = () => {
    const { songs, currentSong, loading, playSong, playNext, playPrev, setCurrentMood, currentMood } = useContext(SongContext);

    return {
        songs,
        currentSong,
        loading,
        playSong,
        playNext,
        playPrev,
        setCurrentMood,
        currentMood,
    };
};
