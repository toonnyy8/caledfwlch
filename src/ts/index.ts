import "core-js/stable"
import "regenerator-runtime/runtime"
import { glb } from "./glb"
import * as files from "../js/files"

let objs = Object.keys(files).reduce((acc: object, curr: string) => {
    acc[curr] = glb(files[curr])
    return acc
}, {})

console.log(objs)

{
    (gl: WebGL2RenderingContext) => {

    }
}