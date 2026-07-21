import React, { useContext } from 'react';

import { SongContext } from '../song.context';

import { EXPRESSION_MOOD_MAP } from '../../expression/utils/faceUtils';



const MOOD_OPTIONS = [...new Set(Object.values(EXPRESSION_MOOD_MAP))];



const PlaylistQueue = () => {

    const { songs, currentSong, currentMood, loading, playSong, setCurrentMood } = useContext(SongContext);



    if (loading) {

        return (

            <div className="card playlist-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '180px', color: '#909090' }}>

                Loading playlist...

            </div>

        );

    }



    if (!songs.length) {

        return (

            <div className="card playlist-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '180px', color: '#909090' }}>

                No songs available for this mood.

            </div>

        );

    }



    return (

        <div className="card playlist-card" style={{ display: 'flex', flexDirection: 'column' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>

                <div style={{ color: '#e0e0e0', fontSize: '0.95rem' }}>

                    Playing because you <br /> seem {currentMood}

                </div>

                <div style={{ position: 'relative' }}>

                    <select

                        value={currentMood}

                        onChange={(e) => setCurrentMood(e.target.value)}

                        style={{ backgroundColor: '#101010', color: '#fff', border: '1px solid #333', padding: '8px 30px 8px 12px', borderRadius: '4px', outline: 'none', appearance: 'none', fontSize: '0.9rem', cursor: 'pointer' }}

                    >

                        {MOOD_OPTIONS.map((mood) => (

                            <option key={mood} value={mood}>{mood}</option>

                        ))}

                    </select>

                    <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', stroke: '#fff', fill: 'none', position: 'absolute', right: '10px', top: '10px', pointerEvents: 'none' }}><polyline points="6 9 12 15 18 9"></polyline></svg>

                </div>

            </div>



            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

                {songs.slice(0, 3).map((s) => {

                    const isActive = currentSong?._id === s._id;

                    return (

                        <div

                            key={s._id}

                            onClick={() => playSong(s._id)}

                            style={{

                                display: 'flex',

                                justifyContent: 'space-between',

                                alignItems: 'center',

                                padding: '12px 16px',

                                borderRadius: '8px',

                                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',

                                cursor: 'pointer',

                                transition: 'background 0.2s',

                            }}

                        >

                            <div style={{ display: 'flex', alignItems: 'center', color: isActive ? '#fff' : '#c0c0c0', fontWeight: isActive ? '500' : '400' }}>

                                {isActive && (

                                    <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', stroke: '#ff65a3', fill: 'none', marginRight: '10px' }}>

                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>

                                    </svg>

                                )}

                                {s.title}

                            </div>

                            <div style={{ color: '#707070', fontSize: '0.9rem' }}>

                                {s.durationStr || s.duration || "3:00"}

                            </div>

                        </div>

                    );

                })}

            </div>

        </div>

    );

};



export default PlaylistQueue;


