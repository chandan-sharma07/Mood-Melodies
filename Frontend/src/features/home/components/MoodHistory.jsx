import { useContext } from 'react';
import { SongContext } from '../song.context';

const MoodHistory = () => {
    const { moodHistory, currentMood } = useContext(SongContext);

    const moodEmoji = {
        happy: '😄', sad: '😢', angry: '😡', energetic: '⚡',
        chill: '😌', romantic: '❤️', relaxing: '🌊', joyful: '🎉',
        melancholic: '🌧️', playful: '🎈', motivational: '💪', dreamy: '✨',
        neutral: '😐', surprised: '😮', disgusted: '🤢', fearful: '😨',
    };

    return (
        <div className="dash-panel mood-history">
            <div className="panel-header">
                <h3>Mood History</h3>
                <span className="panel-badge" style={{ textTransform: 'capitalize' }}>
                    {moodEmoji[currentMood] || '🎵'} {currentMood}
                </span>
            </div>

            <div className="mood-chips">
                {moodHistory.length === 0 ? (
                    <div className="dash-empty">
                        <span className="empty-icon">🌀</span>
                        <span>No mood history yet</span>
                    </div>
                ) : (
                    [...moodHistory].reverse().map((h, i) => (
                        <span
                            key={i}
                            className={`mood-chip${h.mood === currentMood && i === 0 ? ' current' : ''}`}
                        >
                            {moodEmoji[h.mood] || '🎵'} {h.mood}
                        </span>
                    ))
                )}
            </div>
        </div>
    );
};

export default MoodHistory;
