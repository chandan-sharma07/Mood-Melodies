const cache = require("../config/cache");

const normalizeMood = (rawMood) => {
    const mood = (rawMood || 'happy').toLowerCase().trim();
    const knownTags = [
        'happy', 'sad', 'angry', 'energetic', 'chill', 'romantic', 'relaxing',
        'uplifting', 'melancholic', 'playful', 'motivational', 'dreamy', 'joyful',
    ];
    const match = knownTags.find((tag) => mood.includes(tag));
    return match || 'happy';
};

const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

exports.streamSongs = async (req, res) => {
    try {
        const mood = normalizeMood(req.query.mood);
        const cacheKey = `mood_songs:${mood}`;

        const cached = await cache.get(cacheKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return res.status(200).json(shuffleArray(parsed));
                }
            } catch {
                // fall through to fetch
            }
        }

        const clientId = process.env.JAMENDO_CLIENT_ID;
        let data = null;

        if (clientId) {
            const apiUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=15&tags=${mood}&search=english&vocalinstrumental=vocal&include=musicinfo&boost=popularity_month`;
            const response = await fetch(apiUrl);

            if (response.ok) {
                const temp = await response.json();
                if (temp.headers && temp.headers.status === 'success' && temp.results && temp.results.length > 0) {
                    data = temp;
                }
            }

            if (!data || !data.results || data.results.length === 0) {
                const fallbackUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=15&tags=${mood}&include=musicinfo&boost=popularity_month`;
                const fallbackResponse = await fetch(fallbackUrl);

                if (fallbackResponse.ok) {
                    const temp = await fallbackResponse.json();
                    if (temp.headers && temp.headers.status === 'success' && temp.results && temp.results.length > 0) {
                        data = temp;
                    }
                }
            }
        }

        if (!data || !data.results || data.results.length === 0) {
            const fallbackSongs = [
                {
                    _id: "fb_" + mood + "_1",
                    title: mood === 'sad' ? "Melancholy Walk" : "Summer Walk",
                    artist: "Olexy",
                    url: "https://cdn.pixabay.com/audio/2022/07/25/audio_5b6ebcd038.mp3",
                    posterUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300",
                    durationStr: "2:04",
                    mood: mood
                },
                {
                    _id: "fb_" + mood + "_2",
                    title: "Lofi Focus",
                    artist: "FASSounds",
                    url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf589.mp3",
                    posterUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300",
                    durationStr: "2:15",
                    mood: mood
                },
                {
                    _id: "fb_" + mood + "_3",
                    title: "Chill Vibes",
                    artist: "Purrple Cat",
                    url: "https://cdn.pixabay.com/audio/2022/09/27/audio_1c13bc58b4.mp3",
                    posterUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=300",
                    durationStr: "3:02",
                    mood: mood
                }
            ];

            await cache.set(cacheKey, JSON.stringify(fallbackSongs), "EX", 15 * 60);
            return res.status(200).json(shuffleArray(fallbackSongs));
        }

        const formattedSongs = data.results.map(track => {
            const min = Math.floor(track.duration / 60);
            const sec = track.duration % 60;
            const durationStr = `${min}:${sec < 10 ? '0' : ''}${sec}`;

            return {
                _id: track.id,
                title: track.name,
                artist: track.artist_name,
                album: track.album_name || track.name,
                durationStr,
                url: track.audio,
                posterUrl: track.image || 'https://via.placeholder.com/150',
                mood: mood
            };
        });

        await cache.set(cacheKey, JSON.stringify(formattedSongs), "EX", 15 * 60);
        return res.status(200).json(shuffleArray(formattedSongs));
    } catch (error) {
        console.error("Jamendo Fetch Error:", error);
        return res.status(500).json({ error: "Error streaming songs" });
    }
};

exports.normalizeMood = normalizeMood;
exports.shuffleArray = shuffleArray;
