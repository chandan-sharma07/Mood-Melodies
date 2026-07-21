import axios from "axios";

const API_URL = "http://localhost:8080/api/songs";

const api = axios.create({
    baseURL: API_URL,
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


