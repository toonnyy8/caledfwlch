#version 300 es

layout (location = 0) in vec3 in_Position;
// layout (location = 1) in vec3 in_Normal;

// uniform mat4 uf_Posture;
// uniform mat4 uf_Projection;
// uniform mat4 uf_Camera;

// out vec3 out_Position;
// out vec3 out_Normal;

void main(){
    // gl_Position = uf_Projection * uf_Camera * uf_Posture * vec4(in_Position, 1);
    // out_Position = vec3(uf_Posture* vec4(in_Position, 1.0));
    // out_Normal = mat3(transpose(inverse(uf_Posture))) * in_Normal;
    gl_Position=vec4(in_Position, 1);
}