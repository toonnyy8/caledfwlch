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

export let animationMatrix = (model: gltf_.GLTF, animName: string, time: number) => {
    let animation = model
        .animations
        .find(animation => animation.name == animName)


    return animation
        .channels
        .map(channel => {
            let hotkey = 0

            let animIO = (accessor: gltf_.Accessor) => {
                let bufferView = model.bufferViews[accessor.bufferView]
                let buffer = model.buffers[bufferView.buffer]
                let bin = new Float32Array(
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
                            type2sizes[accessor.type].reduce((prev, curr) => prev + curr, 0) * accessor.count * 4
                        )
                        .buffer
                )
                return {
                    accessor: accessor,
                    bufferView: bufferView,
                    buffer: buffer,
                    bin: bin
                }
            }
            let input = animIO(model.accessors[animation.samplers[channel.sampler].input])
            let output = animIO(model.accessors[animation.samplers[channel.sampler].output])

            let _time = time %
                input
                    .accessor
                    .max[0]

            if (Number.isNaN(_time)) {
                _time = 0
            }


            input
                .bin
                .slice()
                .find((value, index) => {
                    if (value >= _time) {
                        hotkey = index
                        return true
                    }
                    return false
                })

            let targetMatrix = (vec: number[], rad?: number) => {
                switch (channel
                    .target
                    .path) {
                    case "translation": {
                        return glm.mat4.translate(
                            glm.mat4.create(),
                            glm.mat4.create(),
                            vec
                        )
                    }
                    case "rotation": {

                        return glm.mat4.fromQuat(
                            glm.mat4.create(),
                            glm.quat.fromValues(vec[0], vec[1], vec[2], vec[3])
                        )
                    }
                    case "scale": {
                        return glm.mat4.scale(
                            glm.mat4.create(),
                            glm.mat4.create(),
                            vec
                        )
                    }
                }
            }

            let vecSize = type2sizes[output.accessor.type]
                .reduce((prev, curr) => prev + curr, 0)

            if (_time == input.bin[hotkey]) {
                let vec = output
                    .bin
                    .slice(
                        vecSize * hotkey,
                        vecSize * (hotkey + 1)
                    )
                // console.log([...vec])
                return targetMatrix([...vec], [...vec][3] || undefined)
            } else {
                let vecPrev = output
                    .bin
                    .slice(
                        vecSize * (hotkey - 1),
                        vecSize * hotkey
                    )
                let vecNext = output
                    .bin
                    .slice(
                        vecSize * hotkey,
                        vecSize * (hotkey + 1)
                    );
                // console.log([...vec])
                let diff = input.bin[hotkey] - input.bin[hotkey - 1]
                let wPrev = 1 - (_time - input.bin[hotkey - 1]) / diff;

                let wNext = 1 - (input.bin[hotkey] - _time) / diff
                let vec = vecPrev.map((v, i) => {
                    return v * wPrev + vecNext[i] * wNext
                })
                // console.log(wPrev, wNext)
                // console.log(_time)
                return targetMatrix([...vec], [...vec][3] || undefined)
            }
        }).reduce((prev, curr) => glm.mat4.mul(glm.mat4.create(), prev, curr || glm.mat4.create()), glm.mat4.create())
}