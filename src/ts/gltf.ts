export interface GLTFile {
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

export class GLTF {
    constructor(gl: WebGL2RenderingContext, gltfile: GLTFile) {
        this.gltfile = gltfile

        this.meshes
    }

    gltfile: GLTFile

    meshes: Array<Mesh>
}

class Node {
    constructor(gltfile: GLTFile, nodeNum: number) {

    }
    children?: Array<number>
    mesh: number
    name: string
    scale?: [number, number, number]
    translation?: [number, number, number]
    rotation?: [number, number, number, number]
}

class Accessor {
    constructor(gltfile: GLTFile, accessorNum: number) {
        let bufferView = gltfile.json.bufferViews[
            gltfile.json.accessors[accessorNum].bufferView
        ]

        this.componentType = gltfile.json.accessors[accessorNum].componentType

        switch (gltfile.json.accessors[accessorNum].componentType) {
            case 5123: {
                this.buffer = new Uint16Array(
                    gltfile.bin.slice(
                        bufferView.byteOffset,
                        bufferView.byteOffset +
                        bufferView.byteLength
                    ).buffer
                )
                break
            }
            case 5126: {
                this.buffer = new Float32Array(
                    gltfile.bin.slice(
                        bufferView.byteOffset,
                        bufferView.byteOffset +
                        bufferView.byteLength
                    ).buffer
                )
                break
            }
        }

        this.count = gltfile.json.accessors[accessorNum].count

        this.max = gltfile.json.accessors[accessorNum].max

        this.min = gltfile.json.accessors[accessorNum].min

        this.type = gltfile.json.accessors[accessorNum].type
    }
    buffer: Float32Array | Uint16Array
    componentType: number
    count: number
    max?: Array<number>
    min?: Array<number>
    type: string
}

class Mesh {
    constructor(gltfile: GLTFile, meshNum: number) {
        this.name = gltfile.json.meshes[meshNum].name
        this.primitives = gltfile.json.meshes[meshNum].primitives.map((primitive) => {
            return {
                attributes: {
                    POSITION: new Accessor(gltfile, primitive.attributes.POSITION),
                    NORMAL: new Accessor(gltfile, primitive.attributes.NORMAL),
                    TEXCOORD_0: new Accessor(gltfile, primitive.attributes.TEXCOORD_0),
                    JOINTS_0: new Accessor(gltfile, primitive.attributes.JOINTS_0),
                    WEIGHTS_0: new Accessor(gltfile, primitive.attributes.WEIGHTS_0),
                },
                indices: new Accessor(gltfile, primitive.indices),
                material: primitive.material
            }
        })
    }
    name: string
    primitives: Array<{
        attributes: {
            POSITION: Accessor,
            NORMAL: Accessor,
            TEXCOORD_0: Accessor,
            JOINTS_0: Accessor,
            WEIGHTS_0: Accessor
        }
        indices: Accessor
        material: number
    }>
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

    let gltf: GLTFile = { json: jsonData, bin: binData }
    return gltf
}
