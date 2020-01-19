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
            gl.enableVertexAttribArray(positionLocation)
            let size = objs["excalibur"]
                .meshes[0]
                .primitives[0]
                .attributes
                .POSITION
                .size
            let type = objs["excalibur"]
                .meshes[0]
                .primitives[0]
                .attributes
                .POSITION
                .componentType
            let normalize = false
            let stride = 0
            let offset = 0
            gl.vertexAttribPointer(
                positionLocation,
                size,
                type,
                normalize,
                stride,
                offset
            )

            let indexBuffer = gl.createBuffer()
            gl.bindBuffer(
                gl.ELEMENT_ARRAY_BUFFER,
                indexBuffer
            )

            gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                objs["excalibur"]
                    .meshes[0]
                    .primitives[0]
                    .indices
                    .buffer,
                gl.STATIC_DRAW
            )

        }
        gl.bindVertexArray(null)

        const fieldOfView = 45 * Math.PI / 180 // in radians
        const aspect = gl.canvas.width / gl.canvas.height
        const zNear = 0
        const zFar = 1000.0
        const projectionMatrix = glm.mat4.create()

        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
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

        gl.uniformMatrix4fv(
            gl.getUniformLocation(
                mainProgram,
                "u_Camera"
            ),
            false,
            cameraMatrix
        )

        gl.bindVertexArray(vao)

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
    })(gl)
}
console.log(
    objs["excalibur"]
        .animations[0]
        .channels[0]
        .sampler
        .input
        .buffer
        .reverse()
        .find(value => value < 1)
)
console.log(
    objs["excalibur"]
        .animations[0]
        .channels[0]
        .sampler
        .input
        .buffer
        .reverse()
        .find(value => value > 1)
)
let time = 0
let loop = () => {
    requestAnimationFrame(loop)

}