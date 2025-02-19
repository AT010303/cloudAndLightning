/* eslint-disable react/prop-types */
// ThunderCloud.jsx
import { Cloud, Clouds } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { BallCollider, CuboidCollider,Physics, RigidBody } from "@react-three/rapier";
import { random } from "maath";
import { useRef, useState } from "react";
import * as THREE from "three";

const ThunderCloud = ({ onLightning }) => {
    return (
        <>
            <Clouds limit={400} material={THREE.MeshLambertMaterial}>
                <Physics gravity={[0, 0, 0]}>
                    <Pointer />
                    <Puffycloud seed={10} position={[50, 0, 0]} onLightning={onLightning} />
                    <Puffycloud seed={20} position={[0, 50, 0]} onLightning={onLightning} />
                    <Puffycloud seed={30} position={[50, 0, 50]} onLightning={onLightning} />
                    <Puffycloud seed={40} position={[50, 50, 50]} onLightning={onLightning} />
                    {/* <Puffycloud seed={50} position={[0, 0, 50]} onLightning={onLightning} /> */}
                    {/* <Puffycloud seed={60} position={[0, 50, 50]} onLightning={onLightning} /> */}
                    <CuboidCollider position={[0, -15, 0]} args={[400, 10, 400]} />
                </Physics>
            </Clouds>
        </>
    );
};

function Puffycloud({ seed, onLightning, vec = new THREE.Vector3(), ...props }) {
    const api = useRef();
    const light = useRef();
    // Create a flash generator (used to modulate cloud light)
    const [flash] = useState(() => new random.FlashGen({ count: 10, minDuration: 40, maxDuration: 200 }));

    // Contact function gets triggered on collision
    const contact = (payload) => {
        // Check for cloud-to-cloud collision and a threshold force
        if (payload.other.rigidBodyObject.userData?.cloud && payload.totalForceMagnitude / 1000 > 100) {
            flash.burst();
            // Call the callback to trigger the lightning strike
            if (onLightning) {
                onLightning(payload);
            }
        }
    };

    // Update the cloud each frame
    useFrame((state, delta) => {
        const impulse = flash.update(state.clock.elapsedTime, delta);
        if (light.current) light.current.intensity = impulse * 15000;
        api.current?.applyImpulse(vec.copy(api.current.translation()).negate().multiplyScalar(10));
    });

    return (
        <RigidBody
            ref={api}
            userData={{ cloud: true }}
            onContactForce={contact}
            linearDamping={4}
            angularDamping={1}
            friction={0.1}
            {...props}
            colliders={false}
        >
            <BallCollider args={[4]} />
            <Cloud seed={seed} fade={30} speed={0.1} growth={4} segments={40} volume={6} opacity={0.6} bounds={[4, 3, 1]} />
            <Cloud seed={seed + 1} fade={30} position={[0, 1, 0]} speed={0.5} growth={4} volume={10} opacity={1} bounds={[6, 2, 1]} />
            <pointLight position={[0, 0, 0.5]} ref={light} color="blue" />
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
        <RigidBody userData={{ cloud: true }} type="kinematicPosition" colliders={false} ref={ref}>
            <BallCollider args={[4]} />
        </RigidBody>
    );
}

export default ThunderCloud;
