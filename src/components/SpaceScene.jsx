import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { Stars, Sparkles, Float, shaderMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useStore } from '../store';
// import { motion } from 'framer-motion-3d'; // Removed to avoid dependency hell, we use useFrame lerp instead

// --- Custom Shaders ---

const BlackHoleDiskMaterial = shaderMaterial(
    { time: 0, color: new THREE.Color(1.0, 0.6, 0.0) },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      // Create a swirling pattern
      vec2 center = vec2(0.5, 0.5);
      vec2 pos = vUv - center;
      float r = length(pos);
      float angle = atan(pos.y, pos.x);
      
      // Animation
      float noise = snoise(vec2(angle * 4.0 - time * 0.5, r * 3.0 - time * 0.2));
      
      // Ring mask (fade edges)
      float opacity = smoothstep(0.0, 0.2, r) * (1.0 - smoothstep(0.4, 0.5, r));
      
      // Color intensity
      float intensity = 1.0 + noise * 0.5;
      
      gl_FragColor = vec4(color * intensity, opacity * (0.8 + noise * 0.2));
    }
  `
);

extend({ BlackHoleDiskMaterial });

function BlackHole() {
    const materialRef = useRef();

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.time += delta;
        }
    });

    return (
        <group position={[0, 0, -10]}>
            {/* The Void */}
            <mesh>
                <sphereGeometry args={[2, 64, 64]} />
                <meshBasicMaterial color="#000000" />
            </mesh>

            {/* Accretion Disk (Shader Based) */}
            <mesh rotation={[1.3, 0, 0]}>
                <planeGeometry args={[12, 12, 64, 64]} />
                {/* @ts-ignore */}
                <blackHoleDiskMaterial ref={materialRef} transparent side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>

            {/* Accretion Disk (Particles for texture) */}
            <Sparkles
                count={200}
                scale={[8, 2, 8]}
                size={4}
                speed={0.4}
                opacity={0.6}
                color="#ff8800"
                position={[0, 0, 0]}
                rotation={[0.3, 0, 0]} // Slight tilt relative to the shader plane
            />
        </group>
    );
}

function CameraController() {
    const { camera } = useThree();
    const { activeSection, isWarping } = useStore();

    // Target positions for each section
    const targets = useMemo(() => ({
        home: new THREE.Vector3(0, 0, 8),
        message: new THREE.Vector3(-4, 2, 12),
        memories: new THREE.Vector3(4, -2, 6),
    }), []);

    useFrame((state, delta) => {
        const target = targets[activeSection] || targets.home;

        if (isWarping) {
            // Warp speed effect: shake and pull back
            camera.position.lerp(new THREE.Vector3(0, 0, 50), delta * 2);
        } else {
            // Smooth float to target
            camera.position.lerp(target, delta * 1.5);
            camera.lookAt(0, 0, -10);
        }

        const { x, y } = state.pointer;
        camera.position.x += (x * 0.5 - camera.position.x) * delta * 0.5;
        camera.position.y += (y * 0.5 - camera.position.y) * delta * 0.5;
    });

    return null;
}

function WarpStars() {
    const { isWarping } = useStore();
    const starsRef = useRef();

    useFrame((state, delta) => {
        if (!starsRef.current) return;

        if (isWarping) {
            starsRef.current.scale.z = THREE.MathUtils.lerp(starsRef.current.scale.z, 20, delta * 10);
            starsRef.current.rotation.z += delta * 2;
        } else {
            starsRef.current.scale.z = THREE.MathUtils.lerp(starsRef.current.scale.z, 1, delta * 2);
            starsRef.current.rotation.y += delta * 0.05;
        }
    });

    return (
        <group ref={starsRef}>
            <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1} />
        </group>
    );
}

function StarField() {
    const { isWarping } = useStore();
    const meshRef = useRef();

    // Create initial positions for stars
    const count = 3000;
    const initialPositions = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 150; // x: wide spread
            positions[i * 3 + 1] = (Math.random() - 0.5) * 150; // y: wide spread
            positions[i * 3 + 2] = (Math.random() - 0.5) * 300; // z: deep depth
        }
        return positions;
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const speed = isWarping ? 200 : 20;
        const positions = meshRef.current.geometry.attributes.position.array;

        for (let i = 0; i < count; i++) {
            // Move z position towards camera (positive z)
            positions[i * 3 + 2] += delta * speed;

            // Reset if passed camera (assuming camera around z=8)
            if (positions[i * 3 + 2] > 20) {
                positions[i * 3 + 2] = -200;
                // Randomize x/y again for variety upon re-entry? 
                // Optional, but keeps the field dynamic.
                // positions[i * 3] = (Math.random() - 0.5) * 150;
                // positions[i * 3 + 1] = (Math.random() - 0.5) * 150;
            }
        }

        meshRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={initialPositions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#ffffff"
                size={0.6}
                sizeAttenuation={true}
                transparent={true}
                opacity={0.8}
                depthWrite={false}
            />
        </points>
    );
}

// Assuming this is the main component that renders the scene
export default function SpaceScene() {
    const { isUnlocked } = useStore();

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, background: '#000' }}>
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping }}>
                <color attach="background" args={['#000000']} />

                <CameraController />
                <StarField />

                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />

                <WarpStars />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <BlackHole />
                </Float>

                {/* Floating Particles/Dust */}
                <Sparkles count={500} scale={20} size={1} speed={0.2} opacity={0.4} color="#ffffff" />

                <EffectComposer disableNormalPass>
                    <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} radius={0.6} />
                    <Noise opacity={0.05} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
            </Canvas>
        </div>
    );
}
