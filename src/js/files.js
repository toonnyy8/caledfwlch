import fs from "fs"

import mainVertexShader from "../glsl/main.vert"
import mainFragmentShader from "../glsl/main.frag"

export let glb = { excalibur: fs.readFileSync(__dirname + '/../../file/actor/excalibur.glb').buffer }
export let glsl = {
    main: {
        vert: mainVertexShader,
        frag: mainFragmentShader
    }
}

