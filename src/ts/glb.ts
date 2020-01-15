export let glb = (glbBuffer: ArrayBuffer) => {
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

    return { json: jsonData, bin: binData }
}