import { useEffect, useRef } from 'react';
import { useStore } from '../store';

const IntroAudio = () => {
    // Only run this effect when mount, or specifically check isUnlocked
    // Since this component is conditionally rendered in App.jsx ONLY when isUnlocked is true,
    // we can just run the effect on mount.
    const audioRef = useRef(null);
    const fadeIntervalRef = useRef(null);

    useEffect(() => {
        // Pick one intro audio - hardcoded for now or random? User said "use any one".
        const audioPath = '/music/intros/sounbg1.mp3';

        const audio = new Audio();

        // Add error listener
        audio.onerror = (e) => {
            console.error("Intro Audio Error:", e);
        };

        audio.src = audioPath;
        audio.volume = 0.6;
        audioRef.current = audio;

        // Play
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                console.log("Intro audio started");
            }).catch(error => {
                console.warn("Autoplay prevented or audio source issue:", error);
            });
        }

        // FADE OUT LOGIC
        // Start fading out after 6 seconds
        const fadeOutStartTime = 6000;
        const fadeOutDuration = 2000; // takes 2 seconds to fade out completely
        const intervalTime = 50; // Update every 50ms
        const steps = fadeOutDuration / intervalTime;
        const volumeStep = 0.6 / steps;

        const fadeOutTimeout = setTimeout(() => {
            if (!audioRef.current) return;

            fadeIntervalRef.current = setInterval(() => {
                if (audioRef.current && audioRef.current.volume > 0.05) {
                    // Reduce volume safely
                    const newVol = Math.max(0, audioRef.current.volume - volumeStep);
                    audioRef.current.volume = newVol;
                } else {
                    // Done fading
                    if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                        // Start the music player automatically
                        useStore.getState().setIsPlaying(true);
                    }
                    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                }
            }, intervalTime);

        }, fadeOutStartTime);

        // Cleanup function
        return () => {
            clearTimeout(fadeOutTimeout);
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []); // Empty dependency array = run once on mount

    return null;
};

export default IntroAudio;
