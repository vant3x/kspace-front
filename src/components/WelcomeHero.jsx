import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text3D, Center, Float, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Stars as StarsIcon } from 'lucide-react';
import * as THREE from 'three';
import './WelcomeHero.css';

// Animated Particle Field - White Stars (Background)
function WhiteStarField() {
    const points = useRef();
    const particleCount = 2000;

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < particleCount; i++) {
            const x = (Math.random() - 0.5) * 100;
            const y = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 100;
            temp.push(x, y, z);
        }
        return new Float32Array(temp);
    }, []);

    useFrame((state) => {
        if (points.current) {
            points.current.rotation.y = state.clock.elapsedTime * 0.02;
        }
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.length / 3}
                    array={particles}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color="#ffffff"
                sizeAttenuation
                transparent
                opacity={0.8}
            />
        </points>
    );
}

// Animated Particle Field - Golden Chemistry Particles
function GoldenParticleField() {
    const points = useRef();
    const particleCount = 500;

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < particleCount; i++) {
            const x = (Math.random() - 0.5) * 60;
            const y = (Math.random() - 0.5) * 60;
            const z = (Math.random() - 0.5) * 60;
            temp.push(x, y, z);
        }
        return new Float32Array(temp);
    }, []);

    useFrame((state) => {
        if (points.current) {
            points.current.rotation.y = state.clock.elapsedTime * 0.05;
            points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
        }
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.length / 3}
                    array={particles}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color="#fbbf24"
                sizeAttenuation
                transparent
                opacity={0.4}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

// DNA Helix Structure
function DNAHelix() {
    const groupRef = useRef();
    const helixPoints = useMemo(() => {
        const points = [];
        const turns = 3;
        const pointsPerTurn = 20;
        const radius = 2;
        const height = 8;

        for (let i = 0; i < turns * pointsPerTurn; i++) {
            const angle = (i / pointsPerTurn) * Math.PI * 2;
            const y = (i / (turns * pointsPerTurn)) * height - height / 2;

            points.push({
                pos1: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
                pos2: [Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius]
            });
        }
        return points;
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
        }
    });

    return (
        <group ref={groupRef} position={[5, 0, -5]}>
            {helixPoints.map((point, i) => (
                <group key={i}>
                    <mesh position={point.pos1}>
                        <sphereGeometry args={[0.15, 8, 8]} />
                        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
                    </mesh>
                    <mesh position={point.pos2}>
                        <sphereGeometry args={[0.15, 8, 8]} />
                        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
                    </mesh>
                    <mesh position={[(point.pos1[0] + point.pos2[0]) / 2, point.pos1[1], (point.pos1[2] + point.pos2[2]) / 2]}>
                        <cylinderGeometry args={[0.03, 0.03, 4, 8]} />
                        <meshStandardMaterial color="#666" />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// Floating Atoms
function FloatingAtom({ position, color = "#fbbf24", scale = 1 }) {
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <mesh position={position} scale={scale}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <MeshDistortMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5}
                    distort={0.3}
                    speed={2}
                />
            </mesh>
        </Float>
    );
}

// 3D Scene Component
function Scene3D() {
    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#fbbf24" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#fff" />

            {/* Layered particle systems for depth */}
            <WhiteStarField />
            <GoldenParticleField />
            <DNAHelix />

            <FloatingAtom position={[-6, 2, -3]} color="#fbbf24" scale={0.8} />
            <FloatingAtom position={[-7, -2, -2]} color="#fff" scale={0.6} />
            <FloatingAtom position={[6, -1, -4]} color="#fbbf24" scale={0.7} />
        </>
    );
}

export default function WelcomeHero({ onExplore }) {
    return (
        <div className="welcome-hero-container">
            {/* 3D Background */}
            <div className="hero-canvas">
                <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                    <Scene3D />
                </Canvas>
            </div>

            {/* Content Overlay */}
            <div className="hero-content">
                <motion.div
                    className="hero-title-container"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                >
                    <motion.h1 className="hero-title">
                        {['B', 'I', 'E', 'N', 'V', 'E', 'N', 'I', 'D', 'A'].map((letter, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, scale: 0, rotateY: 180 }}
                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                whileHover={{
                                    scale: 1.2,
                                    color: "#fff",
                                    textShadow: "0 0 50px rgba(251, 191, 36, 1)",
                                    transition: { duration: 0.2 }
                                }}
                                transition={{
                                    duration: 1.5,
                                    delay: i * 0.15,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </motion.h1>

                    <motion.div
                        className="hero-subtitle-wrapper"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                    >
                        <motion.p
                            className="hero-subtitle"
                            animate={{
                                textShadow: [
                                    "0 0 10px rgba(251, 191, 36, 0.5)",
                                    "0 0 20px rgba(251, 191, 36, 0.8)",
                                    "0 0 10px rgba(251, 191, 36, 0.5)"
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            Al pequeño universo que preparé para ti
                        </motion.p>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="hero-quote"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1.5 }}
                >
                    <p>"El amor es lo único que somos capaces de percibir que trasciende las dimensiones</p>
                    <p>del tiempo y del espacio."</p>
                    <span className="quote-author">— Interstellar</span>
                </motion.div>

                {/* Cosmic Connection / Visual Element */}
                <motion.div
                    className="cosmic-signal-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 2 }}
                >
                    <div className="cosmic-signal">
                        <div className="signal-ring"></div>
                        <div className="signal-ring"></div>
                        <div className="signal-ring"></div>
                        <div className="signal-core">
                            <StarsIcon size={14} color="#fbbf24" />
                        </div>
                        <div className="orbital-dot"></div>
                        <div className="orbital-dot"></div>
                    </div>
                </motion.div>

                <motion.div
                    className="hero-cta"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 1 }}
                >
                    <motion.div
                        className="cta-glow"
                        onClick={onExplore}
                        animate={{
                            boxShadow: [
                                "0 0 20px rgba(251, 191, 36, 0.3)",
                                "0 0 40px rgba(251, 191, 36, 0.6)",
                                "0 0 20px rgba(251, 191, 36, 0.3)"
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <span className="cta-text">EXPLORAR EL COSMOS</span>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
