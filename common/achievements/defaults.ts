export const achievement = {
    getProgress: (data: Buffer<ArrayBuffer>) => {
        return data.readInt16BE(0)
    }
}