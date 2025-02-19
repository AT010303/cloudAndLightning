/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { useFrame } from '@react-three/fiber';
// import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import { LightningStrike } from '../utils/lightning/LightningStrike.js';

// Default parameters (you can override these via props)
export const defaultRayParams = {
    sourceOffset: new THREE.Vector3(-45, 20, -10), // The point where the ray starts.
    destOffset: new THREE.Vector3(45, -10, 10), // The point where the ray ends.
    radius0: 0.2, // Radius of the main ray trunk at the start point. Default: 1
    radius1: 0.01, // Radius of the main ray trunk at the end point. Default: 1
    radius0Factor: 0.5, // The radius0 of a subray is this factor times the radius0 of its parent subray. Default: 0.5
    radius1Factor: 0.2, // The radius1 of a subray is this factor times the radius1 of its parent subray. Default: 0.2
    minRadius: 2.5, // Minimum value a subray radius0 or radius1 can get. Default: 0.1
    maxIterations: 7, // Greater than 0. The number of ray's leaf segments is 2**maxIterations. Default: 9
    isEternal: true, // If true the ray never extinguishes. Otherwise its life is controlled by the 'birthTime' and 'deathTime' parameters. Default: true if any of those two parameters is undefined.
    // birthTime: 1, // The time at which the ray starts its life and begins propagating. Only if isEternal is false. Default: None.
    // deathTime: 2, // The time at which the ray ends its life. Only if isEternal is false. Default: None.
    timeScale: 0.7, //The rate at wich the ray form changes in time. Default: 1
    propagationTimeFactor: 0.05, // From 0 to 1. Lifetime factor at which the ray ends propagating and enters the steady phase. For example, 0.1 means it is propagating 1/10 of its lifetime. Default: 0.1
    vanishingTimeFactor: 0.95, // From 0 to 1. Lifetime factor at which the ray ends the steady phase and begins vanishing. For example, 0.9 means it is vanishing 1/10 of its lifetime. Default: 0.9
    subrayPeriod: 3.5, // Subrays cycle periodically. This is their time period. Default: 4
    subrayDutyCycle: 0.6, // From 0 to 1. This is the fraction of time a subray is active. Default: 0.6
    maxSubrayRecursion: 3, // Greater than 0. Maximum level of recursion (subray descendant generations). Default: 3
    raymification: 7, // Greater than 0. Maximum number of child subrays a subray can have. Default: 5
    recursionProbability: 0.6, // From 0 to 1. The lower the value, the less chance each new generation of subrays has to generate new subrays. Default: 0.6
    roughness: 0.85, //From 0 to 1. The higher the value, the more wrinkled is the ray. Default: 0.9
    straightness: 0.6 // From 0 to 1. The higher the value, the more straight will be a subray path. Default: 0.7
};

const LightningStrikeComponent = ({
    // Allow the user to supply custom parameters or use defaults
    rayParams = defaultRayParams,
    color = '#9be9fe',
    ...props
}) => {
    // Store the lightning strike geometry instance in state
    const [geometry, setGeometry] = useState(null);
    const lightningRef = useRef();

    useEffect(() => {
        // Create a new lightning strike using the provided parameters
        const lightning = new LightningStrike(rayParams);
        setGeometry(lightning);

        // Cleanup: dispose the geometry if needed when the component unmounts
        return () => {
            if (lightning.dispose) {
                lightning.dispose();
            }
        };
    }, [rayParams]);

    // Update the lightning strike each frame (assuming update(time) modifies the geometry)
    useFrame(({ clock }) => {
        if (geometry) {
            geometry.update(clock.getElapsedTime());
        }
    });

    // Until the geometry is ready, do not render anything
    if (!geometry) return null;
    

    return (
        <>
        <mesh ref={lightningRef} geometry={geometry} {...props}>
            <meshBasicMaterial color={color} />
        </mesh>
        
        </>
    );
};

export default LightningStrikeComponent;
