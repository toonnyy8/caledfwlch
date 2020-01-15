import "core-js/stable"
import "regenerator-runtime/runtime"
import { glbDecoder, createShaderProgram } from "./gltool"
import * as files from "../js/files"

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