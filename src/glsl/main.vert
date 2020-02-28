#version 300 es

// 物件預設頂點位置
layout (location = 0) in vec3 v_Position;
// 物件預設法向量
layout (location = 1) in vec3 v_Normal;

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
    gl_Position = u_Projection * u_Camera * u_Posture * vec4(v_Position, 1);
    // f_Position = vec3(u_Posture* vec4(v_Position, 1.0));
    // f_Normal = mat3(transpose(inverse(u_Posture))) * v_Normal;
    f_Color = v_Normal;
    f_Normal = mat3(transpose(inverse(u_Camera))) * mat3(transpose(inverse(u_Posture))) * v_Normal;    
}