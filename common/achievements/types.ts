export type Achievement = {
    id: string
    numericId: number
    name: string
    description: string
    steps: number
    getProgress: (data: Buffer<ArrayBuffer>) => number,
    sidebarDescriptions?: Array<{type: string; name: string}>
}