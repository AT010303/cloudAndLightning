/* eslint-disable react/prop-types */
import { Cloud, Clouds } from '@react-three/drei';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import {
    BallCollider,
    CuboidCollider,
    Physics,
    RigidBody
} from '@react-three/rapier';
import { random } from 'maath';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import LightningStrikeComponent, { defaultRayParams } from './LightningStrike';

const ThunderCloud = ({ onLightning }) => {
    const [showLightning, setShowLightning] = useState(false);
    const [activeLightning, setActiveLightning] = useState([true, true]);

    const cloudsRef = useRef();

    const lightningOriginRef = useRef(new THREE.Vector3(0, 0, 0));
    const triggeredCloudRef = useRef(null);

    const { camera } = useThree();

    const listner = useMemo(() => {
        const l = new THREE.AudioListener();
        camera.add(l);
        return l;
    }, [camera]);

    const thunderBuffer = useLoader(
        THREE.AudioLoader,
        '/sound/loudThunder.mp3'
    );
    const thunderAmbianceBuffer = useLoader(
        THREE.AudioLoader,
        '/sound/thunderAmbiance.mp3'
    );

    const thunderInstancesRef = useRef([]);
    const thunderAmbianceInstancesRef = useRef([]);

    // const thunderSound = useMemo(() => {
    //     const sound = new THREE.Audio(listner);
    //     sound.setBuffer(thunderBuffer);
    //     sound.setVolume(1.0);
    //     return sound;
    // }, [listner, thunderBuffer]);

    // const thunderAmbianceSound = useMemo(() => {
    //     const sound = new THREE.Audio(listner);
    //     sound.setBuffer(thunderAmbianceBuffer);
    //     sound.setVolume(0.5);
    //     return sound;
    // }, [listner, thunderAmbianceBuffer]);

    // useEffect(()=> {
    //     if(showLightning){
    //         thunderSound.play();
    //         thunderAmbianceSound.play();
    //     }
    // },[showLightning, thunderSound, thunderAmbianceSound]);

    const playLightningSound = () => {
        // For Thunder sound
        thunderInstancesRef.current = thunderInstancesRef.current.filter(
            (sound) => sound.isPlaying
        );
        if (thunderInstancesRef.current.length < 8) {
            const thunder = new THREE.Audio(listner);
            thunder.setBuffer(thunderBuffer);
            thunder.setVolume(0.5);
            thunder.play();
            thunder.onEnded = () => {
                thunderInstancesRef.current =
                    thunderInstancesRef.current.filter((s) => s !== thunder);
            };
            thunderInstancesRef.current.push(thunder);
        }
        // For Ambiance sound
        thunderAmbianceInstancesRef.current =
            thunderAmbianceInstancesRef.current.filter(
                (sound) => sound.isPlaying
            );
        if (thunderAmbianceInstancesRef.current.length < 8) {
            const ambiance = new THREE.Audio(listner);
            ambiance.setBuffer(thunderAmbianceBuffer);
            ambiance.setVolume(0.25);
            ambiance.play();
            ambiance.onEnded = () => {
                thunderAmbianceInstancesRef.current =
                    thunderAmbianceInstancesRef.current.filter(
                        (s) => s !== ambiance
                    );
            };
            thunderAmbianceInstancesRef.current.push(ambiance);
        }
    };

    const contact = (cloudPosition, cloudApi) => {
        if (onLightning) {
            setActiveLightning([Math.random() > 0.4, Math.random() > 0.6]);

            setShowLightning(true);
            setTimeout(
                () => {
                    setShowLightning(false);
                },
                1000 + 1000 * Math.random()
            );
        }
        if (activeLightning[0] || activeLightning[1]) {
            playLightningSound();
        }

        triggeredCloudRef.current = cloudApi;

        lightningOriginRef.current.copy(cloudPosition);
    };

    useFrame(() => {
        if (showLightning && triggeredCloudRef.current) {
            lightningOriginRef.current.copy(
                triggeredCloudRef.current.translation()
            );
        }
    });

    const customParams1 = {
        ...defaultRayParams(),
        sourceOffset: lightningOriginRef.current,
        destOffset: new THREE.Vector3(
            8 * (Math.random() - 0.5),
            -50 + 20 * Math.random(),
            20 * (Math.random() - 0.5)
        ),
        roughness: 0.85,
        maxIterations: 8,
        maxSubrayRecursion: 4,
        raymification: 9,
        straightness: 0.5,
        subrayPeriod: 1.5
    };

    const customParams2 = {
        ...defaultRayParams(),
        sourceOffset: lightningOriginRef.current,
        destOffset: new THREE.Vector3(
            8 * (Math.random() - 0.5),
            -30 + 20 * Math.random(),
            20 * (Math.random() - 0.5)
        ),
        roughness: 0.75,
        maxIterations: 8,
        maxSubrayRecursion: 4,
        raymification: 9,
        straightness: 0.35,
        subrayPeriod: 1.5
    };

    return (
        <>
            <Clouds
                limit={400}
                material={THREE.MeshLambertMaterial}
                ref={cloudsRef}
            >
                <Physics gravity={[0, 0, 0]}>
                    <Pointer />
                    <Puffycloud
                        seed={10}
                        position={[50, 0, 0]}
                        onLightning={contact}
                    />
                    <Puffycloud
                        seed={20}
                        position={[-50, 0, 0]}
                        onLightning={contact}
                    />
                    <Puffycloud
                        seed={30}
                        position={[50, 0, -50]}
                        onLightning={contact}
                    />
                    <Puffycloud
                        seed={40}
                        position={[-50, 0, -50]}
                        onLightning={contact}
                    />
                    <CuboidCollider
                        position={[0, -15, 0]}
                        args={[50, 10, 50]}
                    />
                </Physics>
                {showLightning && (
                    <group>
                        {activeLightning[0] && (
                            <LightningStrikeComponent
                                rayParams={customParams1}
                                originRef={lightningOriginRef}
                            />
                        )}
                        {activeLightning[1] && (
                            <LightningStrikeComponent
                                rayParams={customParams2}
                                originRef={lightningOriginRef}
                            />
                        )}
                    </group>
                )}
            </Clouds>
        </>
    );
};

function Puffycloud({
    seed,
    onLightning,
    vec = new THREE.Vector3(),
    ...props
}) {
    const api = useRef();
    const light = useRef();

    // Create a flash generator (used to modulate cloud light)
    const [flash] = useState(
        () =>
            new random.FlashGen({
                count: 5,
                minDuration: 40,
                maxDuration: 200
            })
    );

    // Compute a stable random color only once per instance
    const randomColor = useMemo(() => {
        // Array of possible colors
        const cloudColors = [
            '#3090b7',
            '#9322c0',
            '#2a1dc1',
            '#599bc5',
            '#c022b5',
            '#1d56c1',
            '#330973'
        ];
        return cloudColors[Math.floor(Math.random() * cloudColors.length)];
    }, []);

    // Contact function gets triggered on collision
    const contact = (payload) => {
        if (
            payload.other.rigidBodyObject.userData?.cloud &&
            payload.totalForceMagnitude / 1000 > 100
        ) {
            flash.burst();
            const cloudCenter = api.current.translation();
            if (onLightning) {
                onLightning(cloudCenter, api.current);
            }
        }
    };

    useFrame((state, delta) => {
        const impulse = flash.update(state.clock.elapsedTime, delta);
        if (light.current) light.current.intensity = impulse * 2;
        api.current?.applyImpulse(
            vec.copy(api.current.translation()).negate().multiplyScalar(10)
        );
    });

    return (
        <RigidBody
            ref={api}
            userData={{ cloud: true }}
            onContactForce={contact}
            linearDamping={4}
            angularDamping={1}
            friction={0.1}
            // angularVelocity={[0, 0, 0]}
            {...props}
            colliders={false}
        >
            <BallCollider args={[5]} />
            <Cloud
                seed={seed}
                fade={30}
                speed={0.1}
                growth={4}
                segments={40}
                volume={6}
                opacity={0.6}
                bounds={[4, 3, 1]}
            />
            <Cloud
                seed={seed + 1}
                fade={30}
                position={[0, 1, 0]}
                speed={0.5}
                growth={4}
                volume={10}
                opacity={1}
                bounds={[6, 2, 1]}
            />
            <pointLight
                position={[0, 0, 0.5]}
                decay={0.1}
                ref={light}
                color={randomColor}
            />
        </RigidBody>
    );
}

function Pointer({ vec = new THREE.Vector3(), dir = new THREE.Vector3() }) {
    const ref = useRef();
    useFrame(({ pointer, camera }) => {
        vec.set(pointer.x, pointer.y, 0.5).unproject(camera);
        dir.copy(vec).sub(camera.position).normalize();
        vec.add(dir.multiplyScalar(camera.position.length()));
        ref.current?.setNextKinematicTranslation(vec);
    });
    return (
        <RigidBody
            userData={{ cloud: true }}
            type="kinematicPosition"
            colliders={false}
            ref={ref}
        >
            <BallCollider args={[5]} />
        </RigidBody>
    );
}

export default ThunderCloud;
