/* eslint-disable no-unused-vars */
import { useTexture } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import LightningTexture from './Textures/LightningTexturel';
extend({ LightningTexture });
LightningTexture.key = THREE.MathUtils.generateUUID();

const Lightning = () => {
    const LightningTexture = useTexture('/lightning/strike.jpg');

    const textureRef = useRef();
    const meshRef = useRef();
    const controls = useControls({
        progress: { value: 0, min: 0, max: 1, step: 0.01 }
    });

    const TextureMaterialProp = useMemo(
        () => ({
            uDiffuseTexture: LightningTexture,
            uTime : 0
        }),[
            LightningTexture
        ]
    );

    useFrame((clock) => {
        textureRef.current.uTime = clock.clock.elapsedTime;
    });

    return (
        <>
            <mesh>
                <planeGeometry args={[1, 1]} />
                <lightningTexture ref={textureRef} side={THREE.DoubleSide} {...TextureMaterialProp} key={LightningTexture.key} />
            </mesh>
        </>
    );
};

export default Lightning;