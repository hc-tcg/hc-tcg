import {dataHuffmanTree} from '../../../common/config/huffman-tree'

type HuffmanNode = {
	firstChild: HuffmanNode | string
	secondChild: HuffmanNode | string | null
}

function nodesToArray(
	node: HuffmanNode,
	previousCode: string,
): Array<{character: string; code: string}> {
	const out: Array<{character: string; code: string}> = []
	if (typeof node.firstChild === 'object') {
		out.push(...nodesToArray(node.firstChild, previousCode + '1'))
	} else {
		out.push({character: node.firstChild, code: previousCode + '1'})
	}

	if (node.secondChild === null) return out

	if (typeof node.secondChild === 'object') {
		out.push(...nodesToArray(node.secondChild, previousCode + '0'))
	} else {
		out.push({character: node.secondChild, code: previousCode + '0'})
	}
	return out
}

export function createHuffmanTree(bytes: Array<string>) {
	let cursor = 0
	const rarity: Array<
		| {type: 'char'; character: string; frequency: number}
		| {type: 'node'; node: HuffmanNode; frequency: number}
	> = []
	while (cursor < bytes.length) {
		const byte = bytes[cursor]
		const index = rarity.findIndex(
			(w) => w.type === 'char' && w.character === byte,
		)
		if (index >= 0) rarity[index].frequency += 1
		else rarity.push({type: 'char', character: byte, frequency: 1})
		cursor++
	}

	rarity.sort((w, x) => w.frequency - x.frequency)

	while (rarity.length > 1) {
		const first = rarity.shift()
		const second = rarity.shift()

		if (!first) return

		const node: HuffmanNode = {
			firstChild: first.type === 'char' ? first.character : first.node,
			secondChild:
				second !== undefined
					? second.type === 'char'
						? second.character
						: second.node
					: null,
		}

		const frequency =
			first.frequency + (second !== undefined ? second.frequency : 0)
		const smallestAbove = rarity.findIndex((f) => f.frequency >= frequency)

		rarity.splice(smallestAbove, 0, {
			type: 'node',
			node,
			frequency,
		})
	}

	const firstNode = rarity[0]
	const tree: Record<string, string> = {}

	if (firstNode.type !== 'node') return

	nodesToArray(firstNode.node, '').forEach((w) => (tree[w.character] = w.code))

	// Generate final data buffer
	let dataString = ''
	for (let i = 0; i < bytes.length; i++) {
		const byte = bytes[i]
		dataString += tree[byte]
	}
	const dataNumbers: Array<number> = []
	while (dataString.length) {
		dataNumbers.push(Number(`0b${dataString.substring(0, 8)}`))
		dataString = dataString.substring(8)
	}

	const treeAsArray: Array<{symbol: string; code: string}> = []
	Object.entries(tree).forEach((entry) =>
		treeAsArray.push({symbol: entry[0], code: entry[1]}),
	)
	treeAsArray.sort((a, b) => Number(a.code) - Number(b.code))
	// console.log(treeAsArray.slice(0, 100))
	// console.log(treeAsArray.slice(100, 200))
	// console.log(treeAsArray.slice(200))
}

export function huffmanCompress(buffer: Buffer) {
	const bytes: Array<string> = []
	for (let i = 0; i < buffer.length; i++) {
		const byte = buffer.readUint8(i).toString(16)
		bytes.push(byte)
	}
	let dataString = ''
	for (let i = 0; i < bytes.length; i++) {
		const byte = bytes[i]
		dataString += dataHuffmanTree.find((e) => e.symbol === byte)?.code
	}
	dataString += dataHuffmanTree.find((e) => e.symbol === 'EOF')?.code
	const dataNumbers: Array<number> = []

	while (dataString.length) {
		dataNumbers.push(Number(`0b${dataString.substring(0, 8).padEnd(8, '0')}`))
		dataString = dataString.substring(8)
	}

	const dataBuffer = Buffer.from(dataNumbers)
	return dataBuffer
}

function getNextEntry(
	byteString: string,
	start: number,
): {symbol: string; code: string} | null {
	let currentCode = ''
	for (let i = start; i < byteString.length; i++) {
		currentCode += byteString[i]
		const entry = dataHuffmanTree.find((c) => c.code === currentCode)
		if (entry) return entry
	}
	return null
}

export function huffmanDecompress(bytes: Buffer) {
	let byteString = ''
	for (let i = 0; i < bytes.length; i++) {
		const byte = bytes.readUint8(i)
		byteString += byte.toString(2).padStart(8, '0')
	}

	const output: Array<string> = []
	let byte = 0
	while (byte < byteString.length) {
		const entry = getNextEntry(byteString, byte)
		if (!entry) continue
		if (entry.symbol === 'EOF') {
			break
		}
		byte += entry.code.length
		output.push(entry.symbol)
	}

	const dataBuffer = Buffer.from(output.map((w) => Number(`0x${w}`)))
	return dataBuffer
}
