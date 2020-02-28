#version 300 es
precision mediump float;

struct DirLight {
    vec3 direction;
    vec3 lightColor;
	
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

in vec3 f_Color;

in vec3 f_Normal;

uniform DirLight u_DirLight[1];

out vec4 color;

void main() {
    // color = f_Color;
    vec3 normal = normalize(f_Normal);
    float light = min(max(dot(normal, vec3(0, 0, -6)), 0.0), 0.5);
    color += light;
    color.rgb *= f_Color;
}