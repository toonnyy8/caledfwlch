import * as gltf_ from "./gltf_"
import * as glm from "../../lib/gl-matrix/index"

const type2sizes = {
    "SCALAR": [1],
    "VEC2": [2],
    "VEC3": [3],
    "VEC4": [4],
    "MAT2": [2, 2],
    "MAT3": [3, 3, 3],
    "MAT4": [4, 4, 4, 4]
}

export let createMesh = (
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    gltf: gltf_.GLTF,
    meshName: string
) => {
    let bindVBO = (
        gl: WebGL2RenderingContext,
        program: WebGLProgram,
        attribLocationName: string,
        accessor: gltf_.Accessor
    ) => {
        let vbo = gl.createBuffer()
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            vbo
        )

        let bufferView = gltf.bufferViews[accessor.bufferView]

        let buffer = gltf.buffers[bufferView.buffer]

        let bytes = (() => {
            switch (accessor.componentType) {
                case 5123: {
                    return 2
                }
                case 5126: {
                    return 4
                }
            }
        })()

        gl.bufferData(
            gl.ARRAY_BUFFER,
            buffer
                .bin
                .slice(
                    bufferView.byteOffset,
                    bufferView.byteOffset +
                    bufferView.byteLength
                )
                .slice(
                    accessor.byteOffset || 0,
                    accessor.byteOffset || 0 +
                    type2sizes[accessor.type].reduce((prev, curr) => prev + curr, 0) * accessor.count * bytes
                )
                .buffer,
            gl.STATIC_DRAW
        )
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            null
        )
        return vbo
    }

    let bindVertexAttrib = (
        gl: WebGL2RenderingContext,
        program: WebGLProgram,
        attribLocationName: string,
        accessor: gltf_.Accessor,
        vbo: WebGLBuffer
    ) => {
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            vbo
        )

        let attribLocation = gl.getAttribLocation(program, attribLocationName)

        let type = accessor
            .componentType

        let normalize = accessor
            .normalized

        let stride = 0
        let offset = 0

        type2sizes[accessor.type]
            .forEach((size, idx) => {
                gl.enableVertexAttribArray(attribLocation + idx)
                gl.vertexAttribPointer(
                    attribLocation + idx,
                    size,
                    type,
                    normalize,
                    stride,
                    offset
                )
            })

        return vbo
    }

    let bindIndex = (
        gl: WebGL2RenderingContext,
        accessor: gltf_.Accessor
    ) => {
        let vbo = gl.createBuffer()
        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            vbo
        )

        let bufferView = gltf.bufferViews[accessor.bufferView]

        let buffer = gltf.buffers[bufferView.buffer]

        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(
                buffer
                    .bin
                    .slice(
                        bufferView.byteOffset,
                        bufferView.byteOffset +
                        bufferView.byteLength
                    )
                    .slice(
                        accessor.byteOffset || 0,
                        accessor.byteOffset || 0 +
                        type2sizes[accessor.type].reduce((prev, curr) => prev + curr, 0) * accessor.count * 2
                    )
                    .buffer
            ),
            gl.STATIC_DRAW
        )

        // gl.bindBuffer(
        //     gl.ELEMENT_ARRAY_BUFFER,
        //     null
        // )
        return vbo
    }

    return gltf
        .meshes
        .find(mesh => mesh.name == meshName)
        .primitives
        .map(primitive => {
            return {
                vao: (() => {
                    let vbos = Object.keys(primitive.attributes)
                        .map(attributeName => {
                            return bindVBO(
                                gl,
                                program,
                                attributeName,
                                gltf.accessors[primitive.attributes[attributeName]]
                            )
                        })

                    let vao = gl.createVertexArray()
                    gl.bindVertexArray(vao)

                    Object.keys(primitive.attributes)
                        .forEach((attributeName, idx) => {
                            bindVertexAttrib(
                                gl,
                                program,
                                attributeName,
                                gltf.accessors[primitive.attributes[attributeName]],
                                vbos[idx]
                            )
                        })
                    bindIndex(
                        gl,
                        gltf.accessors[primitive.indices]
                    )

                    gl.bindVertexArray(null)
                    return vao
                })(),
                posture: glm.mat4.create()
            }

        })
}