import "core-js/stable"
import "regenerator-runtime/runtime"
import eruda from "eruda"
import erudaDom from "eruda-dom"
eruda.init();
eruda.add(erudaDom)

import * as glm from "../lib/gl-matrix/index"
import { createShaderProgram } from "./gltool"
import { GLTFile } from "./gltf/gltf"
import { GLTF, glbDecoder, drawGltf__ } from "./gltf/gltf_"
import { createMesh } from "./gltf/mesh"
import { animationMatrix } from "./gltf/animation"
import * as files from "../js/files"


glm.glMatrix.setMatrixArrayType(Array)

let objs: { [key: string]: GLTF } = Object.keys(files.glb).reduce((acc: object, curr: string) => {
    acc[curr] = glbDecoder(files.glb[curr])
    return acc
}, {})
console.log(objs)

let canvas = document.createElement("canvas")
canvas.width = 800
canvas.height = 600

document.body.appendChild(canvas)

let gl = canvas.getContext("webgl2")
gl.clearColor(0.5, 0.2, 0.5, 1.0);  // Clear to black, fully opaque
gl.clearDepth(1.0);                 // Clear everything
gl.enable(gl.DEPTH_TEST);           // Enable depth testing
gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

gl.clear(gl.COLOR_BUFFER_BIT)

{
    ((gl: WebGL2RenderingContext) => {
        let mainProgram = createShaderProgram(gl, files.glsl.main.vert, files.glsl.main.frag)
        // gl.useProgram(gltfProgram);

        let gltfProgram = createShaderProgram(gl, files.glsl.gltf.vert, files.glsl.gltf.frag)
        gl.useProgram(gltfProgram);

        let mesh = createMesh(gl, gltfProgram, objs["excalibur"], "Excalibur")
        console.log(mesh)

        let time = 0
        let loop = () => {
            requestAnimationFrame(loop)

            gl.bindVertexArray(mesh[0].vao)
            gl.bindBuffer(
                gl.ELEMENT_ARRAY_BUFFER,
                mesh[0].index
            )

            let fieldOfView = 45 * Math.PI / 180 // in radians
            let aspect = gl.canvas.width / gl.canvas.height
            let zNear = 0
            let zFar = 1000.0
            let projectionMatrix = glm.mat4.create()

            glm.mat4.perspective(
                projectionMatrix,
                fieldOfView,
                aspect,
                zNear,
                zFar
            )
            gl.uniformMatrix4fv(
                gl.getUniformLocation(
                    gltfProgram,
                    "u_Projection"
                ),
                false,
                projectionMatrix
            )

            let cameraMatrix = glm.mat4.create()
            glm.mat4.translate(
                cameraMatrix,
                glm.mat4.create(),
                [-0, 0.0, -6.0]
            )
            // glm.mat4.rotate(
            //     cameraMatrix,
            //     cameraMatrix,
            //     Math.PI / 4,
            //     [0, 0, 1]
            // )
            // glm.mat4.rotate(
            //     cameraMatrix,
            //     cameraMatrix,
            //     time,
            //     [1, -1, 0]
            // )

            gl.uniformMatrix4fv(
                gl.getUniformLocation(
                    gltfProgram,
                    "u_Camera"
                ),
                false,
                cameraMatrix
            )

            gl.uniformMatrix4fv(
                gl.getUniformLocation(
                    gltfProgram,
                    "u_Posture"
                ),
                false,
                animationMatrix(objs["excalibur"], "cyclone", time)
            )

            gl.uniform3fv(
                gl.getUniformLocation(
                    gltfProgram,
                    "u_DirLight.direction"
                ),
                [0, 0, -6]
            )
            gl.uniform3fv(
                gl.getUniformLocation(
                    gltfProgram,
                    "u_DirLight.lightColor"
                ),
                [1, 1, 1]
            )
            gl.uniform3fv(
                gl.getUniformLocation(
                    gltfProgram,
                    "u_DirLight.ambient"
                ),
                [0.2, 0.2, 0.2]
            )
            gl.uniform3fv(
                gl.getUniformLocation(
                    gltfProgram,
                    "u_DirLight.diffuse"
                ),
                [0.4, 0.4, 0.4]
            )
            gl.uniform3fv(
                gl.getUniformLocation(
                    gltfProgram,
                    "u_DirLight.specular"
                ),
                [0.5, 0.5, 0.5]
            )

            gl.clear(gl.COLOR_BUFFER_BIT)

            drawGltf__(gl, objs["excalibur"])

            time += 0.001
        }

        loop()

    })(gl)
}

