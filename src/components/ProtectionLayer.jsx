import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { Sparkles, ArrowRight } from 'lucide-react';
import './ProtectionLayer.css';

// Password is stored in sessionStorage - only required once per browser session
// When the browser is closed, the password will be required again
const PASSCODE = "eureka";

export default function ProtectionLayer() {
    const { isUnlocked, setIsUnlocked, setIsWarping } = useStore();
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);
    const [launching, setLaunching] = useState(false);

    // Preload audio
    const warpAudio = new Audio('/music/warp.mp3');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.toLowerCase() === PASSCODE) {
            setLaunching(true);
            setIsWarping(true);

            warpAudio.volume = 0.5;
            warpAudio.play().catch(e => console.log("Audio play failed", e));

            setTimeout(() => {
                setIsWarping(false);
                setIsUnlocked(true);
            }, 800);

        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
        }
    };

    return (
        <AnimatePresence>
            {!isUnlocked && (
                <motion.div
                    className="protection-layer"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(40px)" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    <div className={`login-container ${launching ? 'launching' : ''}`}>
                        <motion.div
                            animate={launching ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="icon-wrapper minimalist">
                                <Sparkles size={24} color="#fbbf24" strokeWidth={1} />
                            </div>

                            <h1 className="minimal-title">Universo Privado</h1>

                            {!launching && (
                                <form onSubmit={handleSubmit} className="minimal-form">
                                    <input
                                        type="password"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ingresar Clave de Acceso"
                                        className={error ? 'error' : ''}
                                        autoFocus
                                    />
                                    <button type="submit" className="minimal-btn" disabled={!input}>
                                        <ArrowRight size={20} />
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
