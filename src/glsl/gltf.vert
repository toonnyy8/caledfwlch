#version 300 es

// 物件預設頂點位置
layout (location = 0) in vec3 POSITION;
// 物件預設法向量
layout (location = 1) in vec3 NORMAL;

layout (location = 2) in vec2 TEXCOORD_0;
layout (location = 3) in vec4 JOINTS_0;
layout (location = 4) in vec4 WEIGHTS_0;

// layout (location = 2) in vec4 v_Color;

// 物件姿態矩陣
uniform mat4 u_Posture;
// 鏡頭焦距
uniform mat4 u_Projection;
// 鏡頭姿態矩陣
uniform mat4 u_Camera;

// 物件轉換後的頂點位置
out vec3 f_Position;
// 物件轉換後的法向量
out vec3 f_Normal;

out vec3 f_Color;

void main(){
    gl_Position = u_Projection * u_Camera * u_Posture * vec4(POSITION, 1);
    // f_Position = vec3(u_Posture* vec4(POSITION, 1.0));
    // f_Normal = mat3(transpose(inverse(u_Posture))) * NORMAL;
    f_Color = NORMAL;
    f_Normal = mat3(transpose(inverse(u_Camera))) * mat3(transpose(inverse(u_Posture))) * NORMAL;
    TEXCOORD_0;
    JOINTS_0;
    WEIGHTS_0;
}