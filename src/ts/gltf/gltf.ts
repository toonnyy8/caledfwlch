export interface GLTFile {
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
            attributes: {
                POSITION: number,
                NORMAL: number,
                TEXCOORD_0: number,
                JOINTS_0: number,
                WEIGHTS_0: number
            }
            indices: number
            material: number
        }>
    }>,
    accessors: Array<{
        bufferView: number,
        byteOffset?: number,
        componentType: number,
        normalized?: boolean,
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
        byteLength: number,
        bin: Uint8Array
    }>,
}

export class GLTF {
    constructor(gltfile: GLTFile) {
        let _accessors = gltfile.accessors.map((accessor, accessorNum) => {
            return new Accessor(gltfile, accessorNum)
        })

        let _materials = gltfile.materials.map(material => new Material(material))

        let _meshes: Array<Mesh>

        if (gltfile.meshes) {
            _meshes = gltfile.meshes.map(mesh => {
                return new Mesh(mesh, _accessors, _materials)
            })
        }

        let _nodes = gltfile.nodes.map(node => {
            return new Node(node, _meshes)
        })
        _nodes.forEach((node, idx) => {
            if (gltfile.nodes[idx].children) {
                node.children = []
                gltfile.nodes[idx].children.forEach(child => {
                    node.children.push(_nodes[child])
                })
            }
        })

        this.asset = JSON.parse(
            JSON.stringify(
                gltfile.asset
            )
        )
        this.scene = gltfile.scene

        this.scenes = JSON.parse(
            JSON.stringify(
                gltfile.scenes
            )
        )

        this.nodes = _nodes

        if (gltfile.animations) {
            this.animations = gltfile.animations.map(animation => {
                return new Animation(animation, _accessors, _nodes)
            })
        }

        this.materials = _materials

        this.meshes = _meshes

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
    nodes: Array<Node>
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
        let bufferView = gltfile.bufferViews[
            gltfile.accessors[accessorNum].bufferView
        ]

        this.componentType = gltfile.accessors[accessorNum].componentType

        this.normalized = gltfile.accessors[accessorNum].normalized || false

        this.byteOffset = gltfile.accessors[accessorNum].byteOffset || 0

        this.count = gltfile.accessors[accessorNum].count

        this.max = gltfile.accessors[accessorNum].max

        this.min = gltfile.accessors[accessorNum].min

        this.type = gltfile.accessors[accessorNum].type

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

        switch (gltfile.accessors[accessorNum].componentType) {
            case 5123: {
                this.buffer = new Uint16Array(
                    gltfile.buffers[0].bin.slice(
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
                    gltfile.buffers[0].bin.slice(
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
    normalized: boolean = false
    byteOffset: number = 0
    count: number
    max?: Array<number>
    min?: Array<number>
    type: string
    sizes: Array<number>
}

class Node {
    constructor({
        children,
        mesh,
        name,
        translation,
        rotation,
        scale
    }: {
        children?: Array<number>
        mesh?: number
        name: string
        translation?: [number, number, number]
        rotation?: [number, number, number, number]
        scale?: [number, number, number]
    }, meshes: Array<Mesh>) {
        this.mesh = meshes[mesh]
        this.name = name
        this.translation = translation
        this.rotation = rotation
        this.scale = scale
    }
    children?: Array<Node>
    mesh?: Mesh
    name: string
    translation?: [number, number, number]
    rotation?: [number, number, number, number]
    scale?: [number, number, number]
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
    },
        accessors: Array<Accessor>,
        materials: Array<Material>) {
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
                material: materials[primitive.material]
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
        material: Material
    }>
}

class Material {
    constructor({
        doubleSided,
        name,
        pbrMetallicRoughness
    }: {
        doubleSided: boolean
        name: string
        pbrMetallicRoughness: {
            baseColorFactor: [number, number, number, number]
            metallicFactor: number
            roughnessFactor: number
        }
    }) {
        this.doubleSided = doubleSided
        this.name = name
        this.pbrMetallicRoughness = pbrMetallicRoughness
    }
    doubleSided: boolean
    name: string
    pbrMetallicRoughness: {
        baseColorFactor: [number, number, number, number]
        metallicFactor: number
        roughnessFactor: number
    }
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
        },
        samplers: Array<Sampler>,
        nodes: Array<Node>
    ) {
        this.sampler = samplers[sampler]
        this.target = {
            node: nodes[target.node],
            path: target.path
        }
    }
    sampler: Sampler
    target: {
        node: Node
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
    },
        accessors: Array<Accessor>,
        nodes: Array<Node>
    ) {
        let _samplers = samplers.map(sampler => {
            return new Sampler(sampler, accessors)
        })

        this.name = name

        this.channels = channels.map(channel => {
            return new Channel(channel, _samplers, nodes)
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
    // let binData = glbBytes.slice(20 + jsonLength + 8, 20 + jsonLength + 8 + binLength)

    let gltf: GLTFile = JSON.parse(
        String.fromCharCode(
            ...glbBytes.slice(20, 20 + jsonLength)
        )
    )
    gltf.buffers[0].bin = glbBytes.slice(20 + jsonLength + 8, 20 + jsonLength + 8 + binLength)
    console.log(gltf)
    return gltf
}
