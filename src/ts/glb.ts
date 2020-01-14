let toUint32 = (u8a: Uint8Array) => {
    return u8a.reduce((acc: number, curr: number, idx: number) => {
        return acc + curr * (256 ** idx)
    }, 0)
}

export let glb = (glbBuffer: Uint8Array) => {
    let jsonLength = toUint32(glbBuffer.slice(12, 16))
    let binLength = toUint32(glbBuffer.slice(20 + jsonLength, 20 + jsonLength + 4))
    let jsonData = JSON.parse(
        String.fromCharCode(
            ...glbBuffer.slice(20, 20 + jsonLength)
        )
    )
    let binData = glbBuffer.slice(20 + jsonLength + 8, 20 + jsonLength + 8 + binLength)

    return { json: jsonData, bin: binData }
}