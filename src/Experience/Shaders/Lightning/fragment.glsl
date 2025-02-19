varying vec2 vUv;

uniform sampler2D uDiffuseTexture;
uniform float uTime;

// Optimized getSubUv: Precompute cell size and use direct math.
vec2 getSubUv(in vec2 uv, in float frame) {
    const float cols = 2.0;
    const float rows = 5.0;
    const vec2 cellSize = vec2(1.0 / cols, 1.0 / rows); // (0.5, 0.2)
    
    // Compute the column (x) and row (y) indices.
    float col = mod(frame, cols);
    float row = floor(frame / cols);
    
    // For top-to-bottom ordering, invert the row index.
    float invRow = (rows - 1.0) - row;
    
    // Compute the offset for this cell and add the local uv scaled by cell size.
    return vec2(col * cellSize.x, invRow * cellSize.y) + uv * cellSize;
}

void main() {
    // Animation timings.
    const float animDuration = 0.35; // Duration to play frames 0–9.
    const float pauseDuration = 2.0; // Pause after animation.
    const float totalCycle = animDuration + pauseDuration;
    
    // Get the time within the current cycle.
    float tCycle = mod(uTime, totalCycle);
    
    // Compute progress through the animation portion (clamped to [0,1]).
    float frameProgress = clamp(tCycle / animDuration, 0.0, 1.0);
    
    // Calculate a floating-point frame value across 10 frames.
    float frameFloat = frameProgress * 10.0;
    float frameIndex = floor(frameFloat);
    float blend = fract(frameFloat);
    
    // Clamp the frame index so that frame 9 is never blended with a non-existent frame.
    frameIndex = min(frameIndex, 9.0);
    // If we're at the last frame (9), force blend to 0.
    blend *= step(frameIndex, 8.999);
    
    // Sample the current frame...
    vec2 uv0 = getSubUv(vUv, frameIndex);
    vec4 color0 = texture2D(uDiffuseTexture, uv0);
    
    // ...and the next frame.
    vec2 uv1 = getSubUv(vUv, frameIndex + 1.0);
    vec4 color1 = texture2D(uDiffuseTexture, uv1);
    
    // Blend the two frames (if blend==0, color0 is used).
    vec4 color = mix(color0, color1, blend);
    
    // Use the red channel as alpha and tint the color.
    color.a = color.r;
    color.rgb *= vec3(0.22, 0.95, 1.0);
    
    gl_FragColor = color;
}
