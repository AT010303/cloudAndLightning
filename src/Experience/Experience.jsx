/* eslint-disable no-unused-vars */
import {
    CameraControls,
    CameraShake,
    PerspectiveCamera
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import {
    Bloom,
    EffectComposer,
    SelectiveBloom,
    Vignette
} from '@react-three/postprocessing';
import { Perf } from 'r3f-perf';
import { useRef, useState } from 'react';
import * as THREE from 'three';

import ThunderCloud from '../Component/ThunderCloud.jsx';

const Experience = () => {
    const [showLightning, setShowLightning] = useState(false);
    const [shakeIntensity, setShakeIntensity] = useState(0);
    const shake = useRef();

    const handleLightning = () => {
        setShakeIntensity(5);
        setShowLightning(true);
        triggerShake();
        setTimeout(() => {
            setShowLightning(false);
            setShakeIntensity(0);
        }, 1500 * Math.random());
    };

    const triggerShake = () => {
        shake.current?.setIntensity(1);
        setTimeout(() => {
            shake.current?.setIntensity(0);
        }, 300);
    };

    return (
        <Canvas
            camera={{ position: [0, 0, 40] }}
            dpr={[1, 2]}
            gl={{
                antialias: false,
                alpha: true,
                powerPreference: 'high-performance',
                outputColorSpace: THREE.sRGBEncoding,
                toneMapping: THREE.ACESFilmicToneMapping
            }}
        >
            <Perf position="top-left" />
            <ambientLight intensity={0.2} />

            {/* <PerspectiveCamera
                makeDefault
                position={[0, -4, 30]}
                fov={90}
                onUpdate={(self) => self.lookAt(0, 0, 0)}
            > */}
            <CameraControls>
                <CameraShake
                    ref={shake}
                    decay
                    decayRate={0.95}
                    maxYaw={0.05}
                    maxPitch={0.01}
                    yawFrequency={4}
                    pitchFrequency={2}
                    rollFrequency={2}
                    intensity={shakeIntensity}
                />
            </CameraControls>
            {/* </PerspectiveCamera> */}

            <ThunderCloud onLightning={handleLightning} />

            {/* <pointLight position={[50, 0, 0]} color={'white'} intensity={50} /> */}

            <EffectComposer multisampling={0}>
                <Bloom
                    mipmapBlur={true}
                    luminanceThreshold={0.0}
                    luminanceSmoothing={0.95}
                    intensity={5}
                />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
        </Canvas>
    );
};

export default Experience;
