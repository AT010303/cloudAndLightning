/* eslint-disable no-unused-vars */
import { CameraControls,CameraShake, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, SelectiveBloom, Vignette } from '@react-three/postprocessing';
import { Perf } from 'r3f-perf';
import { useRef, useState } from 'react';
import * as THREE from 'three';

import LightningStrikeComponent, {
    defaultRayParams
} from '../Component/LightningStrike';
import ThunderCloud from '../Component/ThunderCloud.jsx';

const Experience = () => {
    const [showLightning, setShowLightning] = useState(false);
    const [shakeIntensity, setShakeIntensity] = useState(0);

    const shake = useRef();
    const lightningStrikeRef1 = useRef();
    const lightningStrikeRef2 = useRef();

    const handleLightning = () => {
        setShowLightning(true);
        triggerShake();
        setTimeout(() => {
            setShowLightning(false);
        }, 1500 * Math.random());
    };

    const triggerShake = () => {
        shake.current?.setIntensity(1);
        setTimeout(() => {
            shake.current?.setIntensity(0);
        }, 300);
    };

    const customParams1 = {
        ...defaultRayParams,
        sourceOffset: new THREE.Vector3(0, 0, 0),
        destOffset: new THREE.Vector3(
            4 * Math.random(),
            -40 * Math.random(),
            20 * Math.random()
        ),
        roughness: 0.85,
        maxIterations: 8,
        maxSubrayRecursion: 4,
        raymification: 9,
        straightness: 0.5,
        subrayPeriod: 1.5
    };

    const customParams2 = {
        ...defaultRayParams,
        sourceOffset: new THREE.Vector3(0, 0, 0),
        destOffset: new THREE.Vector3(
            4 * Math.random(),
            -40 * Math.random(),
            20 * Math.random()
        ),
        roughness: 0.85,
        maxIterations: 8,
        maxSubrayRecursion: 4,
        raymification: 9,
        straightness: 0.5,
        subrayPeriod: 1.5
    };

    return (
        <Canvas
            camera={{ position: [0, 0, 50] }}
            dpr={[1, 2]}
            gl={{
                antialias: false,
                alpha: true,
                powerPreference: 'high-performance'
            }}
        >
            <Perf position="top-left" />
            <ambientLight intensity={0.2} />

            <PerspectiveCamera
                makeDefault
                position={[0, -4, 30]}
                fov={90}
                onUpdate={(self) => self.lookAt(0, 0, 0)}
            >
            {/* <CameraControls /> */}
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
            </PerspectiveCamera>

            <ThunderCloud onLightning={handleLightning} />

            {/* <pointLight position={[50, 0, 0]} color={'white'} intensity={50} /> */}

            {showLightning && (
                <group>
                    <LightningStrikeComponent
                        rayParams={customParams1}
                        color={'#9be9fe'}
                        ref={lightningStrikeRef1}
                    />
                    <LightningStrikeComponent
                        rayParams={customParams2}
                        color={'#9be9fe'}
                        ref={lightningStrikeRef2}
                    />
                </group>
            )}

            <EffectComposer multisampling={10}>
                <Bloom
                    mipmapBlur={true}
                    luminanceThreshold={0.0}
                    luminanceSmoothing={0.95}
                    intensity={5}
                />
                {/* <SelectiveBloom
                    luminanceThreshold={0.0}
                    luminanceSmoothing={0.9}
                    intensity={2.5}
                    bloom={0.7}
                    radius={0.1}
                    threshold={0.5}
                    selection={null}
                
                /> */}
                {/* <Vignette eskil={false} offset={0.1} darkness={1.1} /> */}
            </EffectComposer>
        </Canvas>
    );
};

export default Experience;
