import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { Heart, Stars as StarsIcon, Calendar, Mail, Atom, Play, Rocket, MessageSquare, Compass, Home, ArrowRight, X } from 'lucide-react';
import WelcomeHero from './WelcomeHero';
import Countdown from './Countdown';
import './ContentOverlay.css';

export default function ContentOverlay() {
    const { isUnlocked, activeSection, setActiveSection } = useStore();
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Remote Data States
    const [letterData, setLetterData] = useState(null);
    const [loadingLetter, setLoadingLetter] = useState(true);
    const [missionData, setMissionData] = useState(null);
    const [loadingMission, setLoadingMission] = useState(true);
    const [notes, setNotes] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [activeStageIdx, setActiveStageIdx] = useState(0);
    const [isLetterOpen, setIsLetterOpen] = useState(false);
    const [showApodModal, setShowApodModal] = useState(false);

    useEffect(() => {
        if (activeSection === 'letter') fetchLetter();
        if (activeSection === 'memories') fetchMission();
        if (activeSection === 'message') fetchNotes();
    }, [activeSection]);

    const fetchLetter = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/letter`);
            const data = await response.json();
            setLetterData(data);
            setLoadingLetter(false);
        } catch (error) {
            console.error('Error fetching letter:', error);
            setLoadingLetter(false);
        }
    };

    const fetchMission = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/mission`);
            const data = await response.json();
            setMissionData(data);
            setLoadingMission(false);
        } catch (error) {
            console.error('Error fetching mission:', error);
            setLoadingMission(false);
        }
    };

    const fetchNotes = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/notes`);
            const data = await response.json();
            setNotes(data);
            setLoadingNotes(false);
        } catch (error) {
            console.error('Error fetching notes:', error);
            setLoadingNotes(false);
        }
    };

    const handleAccept = async () => {
        try {
            await fetch(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'accepted',
                    missionType: missionData?.title || 'Reaction Date',
                    userName: 'K',
                    message: `Mission accepted. Target Date: ${missionData?.targetDate}`
                })
            });
            alert("¡Misión Aprobada! Sincronización molecular completa. 🧪💥");
        } catch (error) {
            console.error('Error accepting mission:', error);
        }
    };

    const handleDecline = async () => {
        try {
            await fetch(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'declined',
                    missionType: missionData?.title || 'Reaction Date',
                    userName: 'K',
                    message: 'Mission path recalibrated by user.'
                })
            });
            alert("Ruta de la misión recalibrada. Mantente al tanto de nuevas alertas cósmicas.");
        } catch (error) {
            console.error('Error declining mission:', error);
        }
    };

    const contentVariants = {
        hidden: { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
        visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.5, ease: "easeOut" } },
        exit: { opacity: 0, scale: 1.2, filter: 'blur(10px)', transition: { duration: 0.5 } }
    };

    const activeStage = missionData?.stages?.[activeStageIdx];

    const sampleNotes = [
        {
            type: 'special',
            title: "M104: La Galaxia del Sombrero en Infrarrojo",
            date: "11 de enero de 2026",
            content: "Este anillo flotante es del tamaño de una galaxia. M104 es famosa por su anillo de polvo oscuro, hecho de Hidrógeno molecular (H₂), los ingredientes básicos para formar nuevas estrellas... justo como nuestro camino juntos.",
            chemicalInfo: {
                formula: "H₂ + Dust",
                label: "Química en la Caminata",
                detail: "Base de incubación estelar"
            },
            src: "/img/space_data/sombrero_spitzer_1080.jpg",
            size: 'tall',
            isStatic: true
        }
    ];

    const displayNotes = [...sampleNotes, ...notes];

    return (
        <div className="content-overlay">
            <nav className="overlay-nav">
                <button className={activeSection === 'home' ? 'active' : ''} onClick={() => setActiveSection('home')}>
                    <Home size={16} /> <span>Inicio</span>
                </button>
                <button className={activeSection === 'message' ? 'active' : ''} onClick={() => setActiveSection('message')}>
                    <MessageSquare size={16} /> <span>Colección</span>
                </button>
                <button className={activeSection === 'letter' ? 'active' : ''} onClick={() => setActiveSection('letter')}>
                    <Mail size={16} /> <span>Un mensaje</span>
                </button>
                <button className={activeSection === 'memories' ? 'active' : ''} onClick={() => setActiveSection('memories')}>
                    <Compass size={16} /> <span>La Misión</span>
                </button>
            </nav>

            <div className="content-container">
                <AnimatePresence mode="wait">
                    {activeSection === 'home' && (
                        <motion.div key="home" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="card home-card welcome-hero-card">
                            <WelcomeHero onExplore={() => setActiveSection('message')} />
                        </motion.div>
                    )}

                    {activeSection === 'message' && (
                        <motion.div key="message" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="card message-card masonry-container">
                            <h2>La Colección de K</h2>
                            <div className="masonry-grid">
                                {loadingNotes && notes.length === 0 ? (
                                    <p className="loading-spinner">Consultando registros cósmicos...</p>
                                ) : (
                                    displayNotes.map((item, index) => (
                                        <motion.div
                                            key={item._id || index}
                                            className={`masonry-item ${item.size || 'medium'} ${item.highlight ? 'highlight' : ''}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            {!item.isStatic && (
                                                <div className="delete-note-btn" onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Future: delete note logic here
                                                }}>×</div>
                                            )}
                                            {item.date && <span className="note-date">{item.date}</span>}
                                            {item.title && <h3 className="note-title">{item.title}</h3>}
                                            {item.src && (
                                                <div className="media-wrapper">
                                                    {item.mediaType === 'video' ? (
                                                        <div className="video-container">
                                                            <video src={item.src} controls={false} muted loop onMouseOver={e => e.target.play()} onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }} />
                                                            <div className="play-icon"><Play size={20} fill="white" /></div>
                                                        </div>
                                                    ) : (
                                                        <img src={item.src} alt={item.title || "Memory"} />
                                                    )}
                                                </div>
                                            )}
                                            {item.chemicalInfo && (
                                                <div className="chemical-badge">
                                                    <div className="chemical-formula-mini">{item.chemicalInfo.formula}</div>
                                                    <div className="chemical-tag">
                                                        <span className="tag-label">{item.chemicalInfo.label}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {item.isQuote ? (
                                                <div className="quote-container">
                                                    <p className="note-content">
                                                        "{item.content}"
                                                        <span className="quote-attribution-inline">
                                                            — {item.author} {item.quoteSource && <span className="quote-source-inline">({item.quoteSource})</span>}
                                                        </span>
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    {item.content && <p className="note-content">{item.content}</p>}
                                                    {item.author && <div className="note-author">- {item.author}</div>}
                                                </>
                                            )}
                                        </motion.div>
                                    ))
                                )}
                            </div>
                            <Heart size={24} color="#ef4444" className="heart-floater" />
                        </motion.div>
                    )}

                    {activeSection === 'letter' && (
                        <motion.div key="letter" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className={`card letter-card ${isLetterOpen ? 'open' : 'sealed'}`}>
                            {loadingLetter ? (
                                <div className="letter-loading"><div className="loading-atom"></div><p>Descifrando...</p></div>
                            ) : !isLetterOpen ? (
                                <motion.div
                                    className="letter-envelope"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setIsLetterOpen(true)}
                                >
                                    <div className="envelope-front">
                                        <div className="envelope-seal">
                                            <Mail size={48} color="#fbbf24" strokeWidth={1} />
                                            <div className="seal-glow"></div>
                                        </div>
                                        <div className="envelope-info">
                                            <span className="info-label">COSMIC TRANSMISSION</span>
                                            <span className="info-recipient">PARA: {letterData?.recipient}</span>
                                        </div>
                                        <button className="open-letter-btn">
                                            ABRIR MENSAJE <ArrowRight size={16} />
                                        </button>
                                    </div>
                                    <div className="envelope-decoration">
                                        <div className="line"></div>
                                        <div className="line"></div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="letter-paper"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <div className="letter-top-decoration">
                                        <div className="decor-atom">Au <span>79</span></div>
                                        <div className="decor-atom">He <span>2</span></div>
                                        <div className="decor-atom">H <span>1</span></div>
                                    </div>
                                    <div className="letter-heading">
                                        <div className="letter-meta">
                                            <div>TRANS.ID: 40.7128-74.0060</div>
                                            <div>DATE: {new Date(letterData?.date).toLocaleDateString()}</div>
                                            <div className="recipient-mark">PARA: {letterData?.recipient}</div>
                                        </div>
                                        <Mail size={40} color="#fbbf24" strokeWidth={1} />
                                    </div>
                                    <div className="letter-body"><div className="body-glow"></div>{letterData?.content}</div>
                                    <div className="letter-footer">
                                        <div className="signature-block"><div className="sig-label">VÍNCULO COVALENTE POR</div><div className="sig-name">{letterData?.sender}</div></div>
                                        <div className="elemental-seal"><div className="seal-rings"></div><div className="seal-symbol">∞</div></div>
                                    </div>

                                    {/* Memoria Estática Especial al final de la carta */}
                                    <div className="letter-static-memory" onClick={() => setShowApodModal(true)}>
                                        <div className="memory-divider">
                                            <div className="divider-line"></div>
                                            <Atom size={16} color="#fbbf24" />
                                            <div className="divider-line"></div>
                                        </div>
                                        <div className="static-memory-content">
                                            <div className="static-memory-image">
                                                <img src="/img/space_data/primerenero" alt="Alineación Planetaria" />
                                                <div className="image-overlay-text">APOD: 11 JAN 2025 (Click para ver más)</div>
                                            </div>
                                            <div className="static-memory-text">
                                                <h3>11 de enero de 2025: Nuestros universos colisionan</h3>
                                                <p>
                                                    En la misma fecha que nos conocimos en persona, el cielo nos regaló una
                                                    <strong> "Alineación planetaria perfecta"</strong>. Mientras nosotros dábamos
                                                    nuestros primeros pasos, arriba, los planetas se alineaban enmarcados por el Etna.
                                                </p>
                                                <p className="memory-detail">
                                                    Tal como sucede con las órbitas celestes, nuestro encuentro fue una alineación
                                                    de elementos que rara vez coinciden por azar. (Haz clic para ver el reporte de la NASA)
                                                </p>
                                                <div className="memory-formula-badge">
                                                    C21H23NO5 + Luz Estelar = Conexión Real
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {activeSection === 'memories' && (
                        <motion.div key="memories" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="card memories-card mission-card">
                            {loadingMission ? (
                                <p>Calculando trayectorias...</p>
                            ) : (
                                <>
                                    <h2>{missionData?.title}</h2>
                                    <div className="grid-overlay"></div>
                                    <Countdown targetDate={missionData?.targetDate} variant="mission" />
                                    <div className="mission-meta">
                                        <div className="meta-item"><Calendar size={18} /><span>{new Date(missionData?.targetDate).toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' })}</span></div>
                                        <div className="meta-item"><StarsIcon size={18} /><span>{new Date(missionData?.targetDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} HRS</span></div>
                                    </div>

                                    <div className="molecular-timeline">
                                        {missionData?.stages.map((stage, idx) => (
                                            <React.Fragment key={idx}>
                                                {idx > 0 && (
                                                    <motion.div
                                                        className="chemical-bond"
                                                        style={{ left: `${(idx - 1) * 33 + 15}%`, width: '18%', rotate: idx % 2 === 0 ? '-10deg' : '10deg' }}
                                                        initial={{ width: 0 }} animate={{ width: '18%' }}
                                                    />
                                                )}
                                                <motion.div
                                                    className={`molecule-step ${idx === activeStageIdx ? 'active' : ''} ${stage.isLocked ? 'locked' : ''}`}
                                                    onClick={() => !stage.isLocked && setActiveStageIdx(idx)}
                                                >
                                                    <div className="atom-core">
                                                        <span className="atom-symbol">{stage.symbol}</span>
                                                        <span className="atom-number">0{idx + 1}</span>
                                                        {idx === activeStageIdx && <div className="orbital-ring"></div>}
                                                    </div>
                                                    <span className="step-label">{stage.label}</span>
                                                </motion.div>
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeStageIdx}
                                            className="mission-detail-panel"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <h3>{activeStage?.title}</h3>
                                            <span className="chemical-formula">{activeStage?.formula}</span>
                                            <p>{activeStage?.description}</p>
                                            {activeStageIdx === 0 && (
                                                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                                    <button className="accept-btn" onClick={handleAccept}>ACEPTAR MISIÓN</button>
                                                    <button className="decline-btn" onClick={handleDecline}>ABORTAR</button>
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* APOD Modal Details */}
            <AnimatePresence>
                {showApodModal && (
                    <motion.div
                        className="apod-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowApodModal(false)}
                    >
                        <motion.div
                            className="apod-modal-content"
                            initial={{ scale: 0.9, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 50, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button className="modal-close" onClick={() => setShowApodModal(false)}><X size={24} /></button>
                            <div className="modal-scroll-area">
                                <div className="modal-image-full">
                                    <img src="/img/space_data/primerenero" alt="An Evening Sky Full of Planets" />
                                </div>
                                <div className="modal-text-content">
                                    <div className="apod-header">
                                        <span className="apod-date">NASA Astronomy Picture of the Day - 11 January 2025</span>
                                        <h2>An Evening Sky Full of Planets</h2>
                                        <span className="apod-credit">Credit & Copyright: Dario Giannobile</span>
                                    </div>
                                    <div className="apod-explanation">
                                        <p>
                                            Sólo falta Mercurio en este desfile de planetas del Sistema Solar en este paisaje celeste del atardecer.
                                            Saliendo casi en dirección opuesta al Sol, el brillante Marte se encuentra en el extremo izquierdo.
                                            Los otros planetas visibles a simple vista, Júpiter, Saturno y Venus, también pueden verse,
                                            con las posiciones de Urano y Neptuno, demasiado débiles, marcadas cerca del trazado arqueado del plano de la eclíptica.
                                        </p>
                                        <p>
                                            En el extremo derecho y cerca del horizonte occidental tras la puesta de sol, se encuentra una joven Luna creciente
                                            cuya superficie está parcialmente iluminada por el brillo de la Tierra. En el primer plano del panorama compuesto
                                            capturado el 2 de enero, el planeta Tierra está representado por el cráter Silvestri inferior del monte Etna.
                                        </p>
                                        <p>
                                            Por supuesto, los cielos del anochecer de la Tierra están llenos de planetas durante todo el mes de enero.
                                            El 13 de enero, una Luna casi llena parecerá pasar por delante de Marte para los observadores del cielo en el
                                            territorio continental de EE.UU. y el este de Canadá.
                                        </p>
                                    </div>
                                    <div className="personal-connection">
                                        <div className="connection-badge">Vínculo Registrado</div>
                                        <p>
                                            Esta imagen fue publicada oficialmente por la NASA el mismo día que decidimos unir nuestros rumbos en persona.
                                            Al igual que los planetas se alinearon sobre el volcán, nosotros encontramos nuestro propio equilibrio
                                            entre todas las variables del universo. No fue casualidad, fue física de atracción pura.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
