export interface GLTF {
    json: {
        asset: { generator: string, version: string },
        scene: number,
        scenes: Array<{
            name: string
            nodes: Array<number>
        }>,
        nodes: Array<{
            children?: Array<number>
            mesh: number
            name: string,
            scale?: [number, number, number]
            translation?: [number, number, number]
            rotation?: [number, number, number, number]
        }>,
        animations: Array<{
            channels: Array<{
                sampler: number,
                target: {
                    node: number,
                    path: string
                }
            }>,
            name: string,
            samplers: Array<{
                input: number,
                interpolation: string,
                output: number
            }>
        }>,
        materials: Array<{
            doubleSided: boolean,
            name: string,
            pbrMetallicRoughness: {
                baseColorFactor: [number, number, number, number],
                metallicFactor: number,
                roughnessFactor: number,
            }
        }>,
        meshes: Array<{
            name: string,
            primitives: Array<{
                attributes: { POSITION: number, NORMAL: number, TEXCOORD_0: number, JOINTS_0: number, WEIGHTS_0: number }
                indices: number
                material: number
            }>
        }>,
        accessors: Array<{
            bufferView: number,
            componentType: number,
            count: number,
            max?: Array<number>,
            min?: Array<number>,
            type: string
        }>,
        bufferViews: Array<{
            buffer: number,
            byteLength: number,
            byteOffset: number
        }>,
        buffers: Array<{
            byteLength: number
        }>,
    },
    bin: Uint8Array
}

export let glbDecoder = (glbBuffer: ArrayBuffer) => {
    let glbBytes = new Uint8Array(glbBuffer)
    let glbU32A = new Uint32Array(glbBuffer)
    let jsonLength = glbU32A[3]
    let binLength = glbU32A[4 + jsonLength / 4]
    let jsonData = JSON.parse(
        String.fromCharCode(
            ...glbBytes.slice(20, 20 + jsonLength)
        )
    )
    let binData = glbBytes.slice(20 + jsonLength + 8, 20 + jsonLength + 8 + binLength)

    let gltf: GLTF = { json: jsonData, bin: binData }
    return gltf
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
export let compileShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
    const shader: WebGLShader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}


export let createShaderProgram = (gl: WebGL2RenderingContext, vsSource: string, fsSource: string) => {

    const vertexShader: WebGLShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader: WebGLShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram: WebGLProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}