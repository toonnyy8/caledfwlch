import "core-js/stable"
import "regenerator-runtime/runtime"
import * as glm from "gl-matrix"
import { glbDecoder, createShaderProgram, GLTF } from "./gltool"
import * as files from "../js/files"


glm.glMatrix.setMatrixArrayType(Array)
console.log(glm)
let objs: { [key: string]: GLTF } = Object.keys(files.glb).reduce((acc: object, curr: string) => {
    acc[curr] = glbDecoder(files.glb[curr])
    return acc
}, {})
console.log(objs)

console.log(files.glsl)

let canvas = document.createElement("canvas")
canvas.width = 800
canvas.height = 600

document.body.appendChild(canvas)

let gl = canvas.getContext("webgl2")
gl.clearColor(0, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)
{
    (gl: WebGL2RenderingContext) => {
        let mainProgram = createShaderProgram(gl, files.glsl.main.vert, files.glsl.main.frag)
        let buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        let positions = [
            0, 0,
            0, 0.5,
            0.7, 0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    }
}