import "core-js/stable"
import "regenerator-runtime/runtime"
import * as glm from "gl-matrix"
import { createShaderProgram } from "./gltool"
import { GLTF, glbDecoder } from "./gltf"
import * as files from "../js/files"


glm.glMatrix.setMatrixArrayType(Array)

let objs: { [key: string]: GLTF } = Object.keys(files.glb).reduce((acc: object, curr: string) => {
    acc[curr] = new GLTF(glbDecoder(files.glb[curr]))
    return acc
}, {})
console.log(objs)

console.log(files.glsl)

let canvas = document.createElement("canvas")
canvas.width = 800
canvas.height = 600

document.body.appendChild(canvas)

let gl = canvas.getContext("webgl2")
gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
gl.clearDepth(1.0);                 // Clear everything
gl.enable(gl.DEPTH_TEST);           // Enable depth testing
gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

gl.clear(gl.COLOR_BUFFER_BIT)

{
    ((gl: WebGL2RenderingContext) => {
        let mainProgram = createShaderProgram(gl, files.glsl.main.vert, files.glsl.main.frag)
        gl.useProgram(mainProgram);

        let vao = gl.createVertexArray()
        gl.bindVertexArray(vao)
        {
            let buffer = gl.createBuffer()
            gl.bindBuffer(
                gl.ARRAY_BUFFER,
                buffer
            )
            gl.bufferData(
                gl.ARRAY_BUFFER,
                objs["excalibur"]
                    .meshes[0]
                    .primitives[0]
                    .attributes
                    .POSITION
                    .buffer,
                gl.STATIC_DRAW
            )

            let positionLocation = gl.getAttribLocation(mainProgram, "v_Position")
            {
                let type = objs["excalibur"]
                    .meshes[0]
                    .primitives[0]
                    .attributes
                    .POSITION
                    .componentType

                let normalize = objs["excalibur"]
                    .meshes[0]
                    .primitives[0]
                    .attributes
                    .POSITION
                    .normalized

                let stride = 0
                let offset = 0

                objs["excalibur"]
                    .meshes[0]
                    .primitives[0]
                    .attributes
                    .POSITION
                    .sizes
                    .forEach((size, idx) => {
                        gl.enableVertexAttribArray(positionLocation + idx)
                        gl.vertexAttribPointer(
                            positionLocation + idx,
                            size,
                            type,
                            normalize,
                            stride,
                            offset
                        )
                    })
            }

        }
        gl.bindVertexArray(null)

        let indexBuffer = gl.createBuffer()
        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            indexBuffer
        )
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            objs["excalibur"]
                .accessors[
                objs["excalibur"]
                    .gltfile
                    .json
                    .meshes
                    .find(mesh => mesh.name == "Excalibur")
                    .primitives[0]
                    .indices
            ].buffer,
            gl.STATIC_DRAW
        )

        let time = 0
        let loop = () => {
            requestAnimationFrame(loop)

            gl.bindVertexArray(vao)
            gl.bindBuffer(
                gl.ELEMENT_ARRAY_BUFFER,
                indexBuffer
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
                    mainProgram,
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
            glm.mat4.rotate(
                cameraMatrix,
                cameraMatrix,
                Math.PI / 4,
                [0, 0, 1]
            )
            glm.mat4.rotate(
                cameraMatrix,
                cameraMatrix,
                time,
                [1, -1, 0]
            )

            gl.uniformMatrix4fv(
                gl.getUniformLocation(
                    mainProgram,
                    "u_Camera"
                ),
                false,
                cameraMatrix
            )

            gl.clear(gl.COLOR_BUFFER_BIT)

            {
                const vertexCount = objs["excalibur"]
                    .meshes[0]
                    .primitives[0]
                    .indices
                    .count
                const type = objs["excalibur"]
                    .meshes[0]
                    .primitives[0]
                    .indices
                    .componentType
                const offset = 0;

                gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            }

            if (time < objs["excalibur"]
                .animations[0]
                .channels[0]
                .sampler
                .input
                .max[0]) {
                console.log(
                    objs["excalibur"]
                        .accessors[
                        objs["excalibur"]
                            .gltfile
                            .json
                            .animations
                            .find(animation => animation.name == "spike")
                            .samplers[
                            objs["excalibur"]
                                .gltfile
                                .json
                                .animations
                                .find(animation => animation.name == "spike")
                                .channels[0]
                                .sampler
                        ].input
                    ].buffer
                        .slice()
                        .reverse()
                        .find(value => value < time)
                )

                console.log(
                    objs["excalibur"]
                        .animations[0]
                        .channels[0]
                        .sampler
                        .input
                        .buffer
                        .slice()
                        .find(value => value > time)
                )
            }

            time += 0.16
        }

        loop()

    })(gl)
}