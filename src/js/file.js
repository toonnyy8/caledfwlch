import fs from "fs"

export let actor = fs.readFileSync(__dirname + '/../../file/actor/actor.glb')
export let excalibur = fs.readFileSync(__dirname + '/../../file/actor/excalibur.glb')