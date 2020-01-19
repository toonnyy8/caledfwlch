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
            byteOffset?: number,
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
    constructor(gltfile: GLTFile) {
        let _accessors = gltfile.json.accessors.map((accessor, accessorNum) => {
            return new Accessor(gltfile, accessorNum)
        })
        this.asset = JSON.parse(
            JSON.stringify(
                gltfile.json.asset
            )
        )
        this.scene = gltfile.json.scene
        this.scenes = JSON.parse(
            JSON.stringify(
                gltfile.json.scenes
            )
        )
        this.nodes = JSON.parse(
            JSON.stringify(
                gltfile.json.nodes
            )
        )

        if (gltfile.json.animations) {
            this.animations = gltfile.json.animations.map(animation => {
                return new Animation(animation, _accessors)
            })
        }

        this.materials = JSON.parse(
            JSON.stringify(
                gltfile.json.materials
            )
        )
        if (gltfile.json.meshes) {
            this.meshes = gltfile.json.meshes.map(mesh => {
                return new Mesh(mesh, _accessors)
            })
        }
        this.accessors = _accessors
        this.gltfile = gltfile
    }

    gltfile: GLTFile

    asset: { generator: string, version: string }
    scene: number
    scenes: Array<{
        name: string
        nodes: Array<number>
    }>
    nodes: Array<{
        children?: Array<number>
        mesh: number
        name: string,
        scale?: [number, number, number]
        translation?: [number, number, number]
        rotation?: [number, number, number, number]
    }>
    animations: Array<Animation>
    materials: Array<{
        doubleSided: boolean,
        name: string,
        pbrMetallicRoughness: {
            baseColorFactor: [number, number, number, number],
            metallicFactor: number,
            roughnessFactor: number,
        }
    }>
    meshes: Array<Mesh>
    accessors: Array<Accessor>
}

class Accessor {
    constructor(gltfile: GLTFile, accessorNum: number) {
        let bufferView = gltfile.json.bufferViews[
            gltfile.json.accessors[accessorNum].bufferView
        ]

        this.componentType = gltfile.json.accessors[accessorNum].componentType

        this.byteOffset = gltfile.json.accessors[accessorNum].byteOffset || 0

        this.count = gltfile.json.accessors[accessorNum].count

        this.max = gltfile.json.accessors[accessorNum].max

        this.min = gltfile.json.accessors[accessorNum].min

        this.type = gltfile.json.accessors[accessorNum].type

        switch (this.type) {
            case "SCALAR": {
                this.sizes = [1]
                break
            }
            case "VEC2": {
                this.sizes = [2]
                break
            }
            case "VEC3": {
                this.sizes = [3]
                break
            }
            case "VEC4": {
                this.sizes = [4]
                break
            }
            case "MAT2": {
                this.sizes = [2, 2]
                break
            }
            case "MAT3": {
                this.sizes = [3, 3, 3]
                break
            }
            case "MAT4": {
                this.sizes = [4, 4, 4, 4]
                break
            }
        }

        switch (gltfile.json.accessors[accessorNum].componentType) {
            case 5123: {
                this.buffer = new Uint16Array(
                    gltfile.bin.slice(
                        bufferView.byteOffset,
                        bufferView.byteOffset +
                        bufferView.byteLength
                    ).slice(
                        this.byteOffset,
                        this.byteOffset +
                        this.sizes.reduce((prev, curr) => prev + curr, 0) * this.count * 2
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
                    ).slice(
                        this.byteOffset,
                        this.byteOffset +
                        this.sizes.reduce((prev, curr) => prev + curr, 0) * this.count * 4
                    ).buffer
                )
                break
            }
        }

    }
    buffer: Float32Array | Uint16Array
    componentType: number
    byteOffset?: number
    count: number
    max?: Array<number>
    min?: Array<number>
    type: string
    sizes: Array<number>
}

class Mesh {
    constructor({ name, primitives }: {
        name: string
        primitives: Array<{
            attributes: {
                POSITION: number
                NORMAL: number
                TEXCOORD_0: number
                JOINTS_0: number
                WEIGHTS_0: number
            }
            indices: number
            material: number
        }>
    }, accessors: Array<Accessor>) {
        this.name = name
        this.primitives = primitives.map((primitive) => {
            return {
                attributes: {
                    POSITION: accessors[primitive.attributes.POSITION],
                    NORMAL: accessors[primitive.attributes.NORMAL],
                    TEXCOORD_0: accessors[primitive.attributes.TEXCOORD_0],
                    JOINTS_0: accessors[primitive.attributes.JOINTS_0],
                    WEIGHTS_0: accessors[primitive.attributes.WEIGHTS_0]
                },
                indices: accessors[primitive.indices],
                material: primitive.material
            }
        })
    }
    name: string
    primitives: Array<{
        attributes: {
            POSITION: Accessor
            NORMAL: Accessor
            TEXCOORD_0: Accessor
            JOINTS_0: Accessor
            WEIGHTS_0: Accessor
        }
        indices: Accessor
        material: number
    }>
}

class Channel {
    constructor(
        {
            sampler,
            target
        }: {
            sampler: number
            target: {
                node: number
                path: string
            }
        }, samplers: Array<Sampler>
    ) {
        this.sampler = samplers[sampler]
        this.target = {
            node: target.node,
            path: target.path
        }
    }
    sampler: Sampler
    target: {
        node: number
        path: string
    }
}

class Sampler {
    constructor({
        input,
        interpolation,
        output
    }: {
        input: number
        interpolation: string
        output: number
    }, accessors: Array<Accessor>) {
        this.input = accessors[input]
        this.interpolation = interpolation
        this.output = accessors[output]
    }
    input: Accessor
    interpolation: string
    output: Accessor
}

class Animation {
    constructor({ channels, name, samplers }: {
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
    }, accessors: Array<Accessor>) {
        let _samplers = samplers.map(sampler => {
            return new Sampler(sampler, accessors)
        })

        this.channels = channels.map(channel => {
            return new Channel(channel, _samplers)
        })

        this.samplers = _samplers
    }

    channels: Array<Channel>
    name: string
    samplers: Array<Sampler>
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
