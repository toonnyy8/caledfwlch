export interface Asset {
    generator: string
    version: string
}

export interface Scene {
    name: string
    nodes: Array<number>
}

export interface Node {
    children?: Array<number>
    mesh: number
    name: string
    scale?: [number, number, number]
    translation?: [number, number, number]
    rotation?: [number, number, number, number]
}


export interface Channel {
    sampler: number
    target: {
        node: number
        path: string
    }
}

export interface Sampler {
    input: number
    interpolation: string
    output: number
}

export interface Animation {
    channels: Array<Channel>
    name: string
    samplers: Array<Sampler>
}

export interface Material {
    doubleSided: boolean
    name: string
    pbrMetallicRoughness: {
        baseColorFactor: [number, number, number, number]
        metallicFactor: number
        roughnessFactor: number
    }
}

export interface Primitive {
    attributes: {
        POSITION: number
        NORMAL: number
        TEXCOORD_0: number
        JOINTS_0: number
        WEIGHTS_0: number
    }
    indices: number
    material: number
}

export interface Mesh {
    name: string,
    primitives: Array<Primitive>
}

export interface Accessor {
    bufferView: number
    byteOffset?: number
    componentType: number
    normalized?: boolean
    count: number
    max?: Array<number>
    min?: Array<number>
    type: string
}

export interface BufferView {
    buffer: number,
    byteLength: number,
    byteOffset: number
}

export interface Buffer {
    byteLength: number,
    bin: Uint8Array
}

export interface GLTF {
    asset: Asset,
    scene: number,
    scenes: Array<Scene>,
    nodes: Array<Node>,
    animations: Array<Animation>,
    materials: Array<Material>,
    meshes: Array<Mesh>,
    accessors: Array<Accessor>,
    bufferViews: Array<BufferView>,
    buffers: Array<Buffer>,
}



export let glbDecoder = (glbBuffer: ArrayBuffer) => {
    let glbBytes = new Uint8Array(glbBuffer)
    let glbU32A = new Uint32Array(glbBuffer)
    let jsonLength = glbU32A[3]
    let binLength = glbU32A[4 + jsonLength / 4]
    // let binData = glbBytes.slice(20 + jsonLength + 8, 20 + jsonLength + 8 + binLength)

    let gltf: GLTF = JSON.parse(
        String.fromCharCode(
            ...glbBytes.slice(20, 20 + jsonLength)
        )
    )

    gltf.buffers[0].bin = glbBytes.slice(20 + jsonLength + 8, 20 + jsonLength + 8 + binLength)

    return gltf
}

export let drawGltf__ = (gl: WebGL2RenderingContext, gltf: GLTF) => {
    let accessor = gltf.accessors[
        gltf.meshes[0].primitives[0].indices
    ]
    const vertexCount = accessor
        .count
    const type = accessor
        .componentType
    const offset = 0;

    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
}
