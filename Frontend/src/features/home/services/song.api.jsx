import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "https://mood-melodies-backend.onrender.com") + "/api/songs";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export const createSong = async (songData) => {

    const formData = new FormData();
    for (const key in songData) {
        formData.append(key, songData[key]);
    }
    const response = await api.post("/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
};

export const getAllSongs = async () => {
    const response = await api.get("/");
    return response.data;
}
