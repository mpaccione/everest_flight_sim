// Vertex shader
varying vec3 col;

void main() {
    col = position;
    vec4 offset = vec4(col.x, col.y, col.z, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * offset;
}
// Fragment shader
varying vec3 col;
lowp float g;

void main(void) {
    g = float(col.z > 5.0);
    gl_FragColor = vec4(0.6*g, 0.5*(1.0-g) + 0.6*g, 0.6*g, 1.0);
}