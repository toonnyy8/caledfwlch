import "core-js/stable"
import "regenerator-runtime/runtime"
import * as glm from "gl-matrix"
import { glbDecoder, createShaderProgram } from "./gltool"
import * as files from "../js/files"


glm.glMatrix.setMatrixArrayType(Array)
console.log(glm)
let objs = Object.keys(files.glb).reduce((acc: object, curr: string) => {
    acc[curr] = glbDecoder(files.glb[curr])
    return acc
}, {})

console.log(objs)

console.log(files.glsl)

{
    (gl: WebGL2RenderingContext) => {
        let mainProgram = createShaderProgram(gl, files.glsl.main.vert, files.glsl.main.frag)
    }
}