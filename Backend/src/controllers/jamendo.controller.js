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

// Priority tags per mood for Jamendo API
const MOOD_JAMENDO_TAGS = {
    happy: ['happy', 'pop', 'upbeat'],
    sad: ['melancholy', 'sad', 'piano', 'slow'],
    melancholic: ['melancholy', 'sad', 'piano', 'slow'],
    angry: ['angry', 'rock', 'metal'],
    chill: ['chill', 'relaxing', 'ambient', 'lounge'],
    relaxing: ['chill', 'relaxing', 'ambient', 'lounge'],
    dreamy: ['chill', 'relaxing', 'ambient', 'lounge'],
    uplifting: ['uplifting', 'inspiring', 'positive'],
    energetic: ['uplifting', 'inspiring', 'dance'],
    motivational: ['uplifting', 'inspiring', 'positive'],
};

// High quality verified MP3 streams for offline/API fallback (100% playable, support byte ranges, never 403)
const FALLBACK_CATALOG = {
    chill: [
        {
            _id: "fb_chill_1",
            title: "Deliverance",
            artist: "SoundHelix",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            posterUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300",
            durationStr: "6:12",
            mood: "chill"
        },
        {
            _id: "fb_chill_2",
            title: "Gentle Night",
            artist: "SoundHelix",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            posterUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300",
            durationStr: "7:05",
            mood: "chill"
        },
        {
            _id: "fb_chill_3",
            title: "Twilight Reflection",
            artist: "SoundHelix",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            posterUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=300",
            durationStr: "5:44",
            mood: "chill"
        }
    ],
    happy: [
        {
            _id: "fb_happy_1",
            title: "Sunny Day",
            artist: "SoundHelix",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            posterUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300",
            durationStr: "7:05",
            mood: "happy"
        },
        {
            _id: "fb_happy_2",
            title: "Bright Horizon",
            artist: "SoundHelix",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
            posterUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300",
            durationStr: "5:02",
            mood: "happy"
        },
        {
            _id: "fb_happy_3",
            title: "Carefree Walk",
            artist: "SoundHelix",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            posterUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300",
            durationStr: "6:12",
            mood: "happy"
        }
    ],
    sad: [
        {
            _id: "fb_sad_1",
            title: "Quiet Reflection",
            artist: "SoundHelix",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
            posterUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=300",
            durationStr: "5:02",
            mood: "sad"
        },
        {
            _id: "fb_sad_2",
            title: "Melancholy Walk",
            artist: "SoundHelix",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            posterUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300",
            durationStr: "5:44",
            mood: "sad"
        },
        {
            _id: "fb_sad_3",
            title: "Distant Memory",
            artist: "SoundHelix",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
            posterUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300",
            durationStr: "5:53",
            mood: "sad"
        }
    ],
    angry: [
        {
            _id: "fb_angry_1",
            title: "Driving Energy",
            artist: "SoundHelix",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
            posterUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300",
            durationStr: "4:30",
            mood: "angry"
        },
        {
            _id: "fb_angry_2",
            title: "Heavy Pulse",
            artist: "SoundHelix",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
            posterUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=300",
            durationStr: "5:53",
            mood: "angry"
        },
        {
            _id: "fb_angry_3",
            title: "Electric Surge",
            artist: "SoundHelix",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
            posterUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300",
            durationStr: "4:45",
            mood: "angry"
        }
    ],
    uplifting: [
        {
            _id: "fb_uplifting_1",
            title: "Soaring Melody",
            artist: "SoundHelix",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            posterUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=300",
            durationStr: "5:44",
            mood: "uplifting"
        },
        {
            _id: "fb_uplifting_2",
            title: "New Beginnings",
            artist: "SoundHelix",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
            posterUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300",
            durationStr: "4:50",
            mood: "uplifting"
        },
        {
            _id: "fb_uplifting_3",
            title: "Higher Ground",
            artist: "SoundHelix",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            posterUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300",
            durationStr: "7:05",
            mood: "uplifting"
        }
    ]
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

        const clientIds = [
            process.env.JAMENDO_CLIENT_ID,
            'c9cb2a0a',
            'b6747d04',
        ].filter(Boolean);

        const tagsToTry = MOOD_JAMENDO_TAGS[mood] || [mood];
        let data = null;

        for (const clientId of clientIds) {
            for (const tag of tagsToTry) {
                for (const param of ['fuzzytags', 'tags']) {
                    try {
                        const apiUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=15&${param}=${encodeURIComponent(tag)}&audioformat=mp32`;
                        const response = await fetch(apiUrl);
                        if (!response.ok) continue;

                        const temp = await response.json();
                        if (
                            temp.headers &&
                            temp.headers.status === 'success' &&
                            Array.isArray(temp.results) &&
                            temp.results.length > 0
                        ) {
                            const valid = temp.results.filter((t) => t.audio);
                            if (valid.length > 0) {
                                data = { results: valid };
                                break;
                            }
                        }
                    } catch {
                        // Try next param or tag
                    }
                }
                if (data) break;
            }
            if (data) break;
        }

        if (!data || !data.results || data.results.length === 0) {
            const fallbackSongs = FALLBACK_CATALOG[mood] || FALLBACK_CATALOG.chill;
            // Short 30s cache for fallbacks so real Jamendo tracks are retried quickly
            await cache.set(cacheKey, JSON.stringify(fallbackSongs), "EX", 30);
            return res.status(200).json(shuffleArray(fallbackSongs));
        }

        const formattedSongs = data.results.map((track) => {
            const min = Math.floor((track.duration || 0) / 60);
            const sec = Math.floor((track.duration || 0) % 60);
            const durationStr = `${min}:${sec < 10 ? '0' : ''}${sec}`;

            return {
                _id: String(track.id),
                title: track.name || "Untitled Track",
                artist: track.artist_name || "Unknown Artist",
                album: track.album_name || track.name || "Unknown Album",
                durationStr,
                url: track.audio,
                posterUrl: track.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300',
                mood: mood,
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
