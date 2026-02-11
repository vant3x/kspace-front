import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { Play, Pause, SkipForward, SkipBack, Music, List } from 'lucide-react';
import './MusicPlayer.css';

export default function MusicPlayer() {
    const { isPlaying, togglePlay, currentTrackIndex, tracks, nextTrack, prevTrack, isUnlocked } = useStore();
    const audioRef = useRef(new Audio(tracks[currentTrackIndex]?.src));
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [volume, setVolume] = useState(0.5);

    useEffect(() => {
        // Update audio source when track changes
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = tracks[currentTrackIndex]?.src || '';
            audioRef.current.load();
            if (isPlaying) {
                audioRef.current.play().catch(e => console.log("Audio play failed (interaction needed):", e));
            }
        }
    }, [currentTrackIndex, tracks]);

    useEffect(() => {
        // Handle play/pause toggle
        if (isPlaying) {
            audioRef.current.play().catch(e => console.error("Playback error:", e));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        // Autoplay next track
        const audio = audioRef.current;

        const handleEnded = () => {
            nextTrack();
        };

        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('ended', handleEnded);
        };
    }, [nextTrack]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Only show player if unlocked
    if (!isUnlocked) return null;

    return (
        <div className={`music-player ${showPlaylist ? 'expanded' : ''}`}>
            <div className="player-controls">
                <div className="player-art">
                    <img src="/img/player.png" alt="Artwork" className={isPlaying ? 'spinning' : ''} />
                </div>
                <div className="track-info">
                    <span className="track-title">
                        {tracks[currentTrackIndex]?.title.replace(/[-_]/g, ' ') || "Select a song"}
                    </span>
                    <span className="track-artist">
                        {tracks[currentTrackIndex]?.artist.replace(/[-_]/g, ' ') || "Unknown Artist"}
                    </span>
                </div>

                <div className="buttons">
                    <button onClick={prevTrack} className="control-btn"><SkipBack size={20} /></button>
                    <button onClick={togglePlay} className="play-btn">
                        {isPlaying ? <Pause size={24} color="black" fill="black" /> : <Play size={24} color="black" fill="black" />}
                    </button>
                    <button onClick={nextTrack} className="control-btn"><SkipForward size={20} /></button>
                    <button onClick={() => setShowPlaylist(!showPlaylist)} className="list-btn">
                        <List size={20} />
                    </button>
                </div>

                {/* Simple visualizer bars (animation only) */}
                {isPlaying && (
                    <div className="visualizer">
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                    </div>
                )}
            </div>

            {showPlaylist && (
                <div className="playlist">
                    <h3>Your Playlist</h3>
                    <ul>
                        {tracks.map((track, idx) => (
                            <li
                                key={idx}
                                className={idx === currentTrackIndex ? 'active' : ''}
                                onClick={() => useStore.getState().setTrack(idx)}
                            >
                                {idx + 1}. {track.title.replace(/[-_]/g, ' ')}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
