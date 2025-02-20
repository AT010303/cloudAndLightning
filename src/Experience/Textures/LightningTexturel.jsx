import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

import fragmentShader from '../Shaders/Lightning/fragment.glsl';
import vertexShader from '../Shaders/Lightning/vertex.glsl';

const LightningTexture = shaderMaterial(
    {
        uDiffuseTexture: new THREE.Texture(),
        uTime: 0
        // uAlphaTexture: new THREE.Texture(),
        // uDisplacementStrength: 0.00333,
        // uProgress: 0,
        // uMouse: 0
    },
    vertexShader,
    fragmentShader
);

export default LightningTexture;
