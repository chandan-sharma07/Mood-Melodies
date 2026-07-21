const normalizeMood = (rawMood) => {
    const mood = (rawMood || 'happy').toLowerCase().trim();
    const knownTags = [
        'happy', 'sad', 'angry', 'energetic', 'chill', 'romantic', 'relaxing',
        'uplifting', 'melancholic', 'playful', 'motivational', 'dreamy', 'joyful',
    ];
    const match = knownTags.find((tag) => mood.includes(tag));
    return match || 'happy';
};

exports.streamSongs = async (req, res) => {
    try {
        const mood = normalizeMood(req.query.mood);
        const clientIds = [process.env.JAMENDO_CLIENT_ID, 'c9cb2a0a', '56d30c95', '042079de', 'b6747d04'].filter(Boolean);

        let data = null;
        for (const clientId of clientIds) {
            // Added search=english and vocal filter to fetch English song vibes
            const apiUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=15&tags=${mood}&search=english&vocalinstrumental=vocal&include=musicinfo&boost=popularity_month`;
            const response = await fetch(apiUrl);

            if (response.ok) {
                const temp = await response.json();
                // Check if API returned success and has results
                if (temp.headers && temp.headers.status === 'success' && temp.results && temp.results.length > 0) {
                    data = temp;
                    break;
                }
            }
        }

        // If strict English search failed, fall back to just the mood without language constraints
        if (!data || !data.results || data.results.length === 0) {
            for (const clientId of clientIds) {
                const apiUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=15&tags=${mood}&include=musicinfo&boost=popularity_month`;
                const response = await fetch(apiUrl);

                if (response.ok) {
                    const temp = await response.json();
                    if (temp.headers && temp.headers.status === 'success' && temp.results && temp.results.length > 0) {
                        data = temp;
                        break;
                    }
                }
            }
        }

        // If data is still null or data.results is empty after checking all keys, use fallbacks
        if (!data || !data.results || data.results.length === 0) {
            console.log("Jamendo failed or empty, using fallbacks for mood:", mood);
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
            return res.status(200).json(fallbackSongs);
        }

        const formattedSongs = data.results.map(track => {
            // Convert seconds to readable MM:SS
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

        res.status(200).json(formattedSongs);
    } catch (error) {
        console.error("Jamendo Fetch Error:", error);
        res.status(500).json({ message: "Error streaming songs", error: error.message });
    }
};
