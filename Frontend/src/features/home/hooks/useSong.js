import {getSongById} from "../services/song.service";
import {useContext} from "react";
import {SongContext} from "../song.context";


export const useSong = () => {
    const context = useContext(SongContext);
    const {song, setSong, loading, setLoading} = context

    const getSong = async (songId) => {
        try {
            const response = await getSongById(songId);
            return response.data;
        } catch (error) {
            console.error("Error fetching song:", error);
            throw error;
        }
    };


    const fetchSong = async (songId) => {
        try {
            const response = await getSongById(songId);
            return response.data;
        } catch (error) {
            console.error("Error fetching song:", error);
            throw error;
        }

    };
};


module.exports = {}



