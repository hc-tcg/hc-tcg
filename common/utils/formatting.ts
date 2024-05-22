/**
 * Guide to symbols
 * Player A - Player that generated the log | Player B - other player
 * {A|B} A shows to player A, B shows to player B
 * $e Effect card
 * $m Item card
 * $v Hermit attack
 * $g Good (healing, heads)
 * $b Bad (damage, tails)
 * $i Image
 */

export type Format =
	| 'effect'
	| 'item'
	| 'image'
	| 'attack'
	| 'good'
	| 'bad'
	| 'italic'
	| 'bold'

export type Node =
	| ListNode
	| TextNode
	| FormatNode
	| DifferentTextNode
	| ProfanityNode
	| LineBreakNode
	| TabNode

export class ListNode {
	public TYPE = 'ListNode'

	public nodes: Node[]

	constructor(nodes: Node[]) {
		this.nodes = nodes
	}
}

export class TextNode {
	public TYPE = 'TextNode'

	public text: string

	constructor(text: string) {
		this.text = text
	}
}

export class FormatNode {
	public TYPE = 'FormatNode'

	public format: Format
	public text: Node

	static formatDict: Record<string, Format> = {
		e: 'effect',
		m: 'item',
		i: 'image',
		v: 'attack',
		g: 'good',
		b: 'bad',
	}

	constructor(format: Array<string>, text: Node) {
		//@TODO Fix type checking
		//@ts-ignore
		this.format = format
		this.text = text
	}

	static fromShorthand(format: string, text: Node) {
		format = this.formatDict[format]
		if (format == undefined) {
			throw new Error(`Format ${format} not found.`)
		}
		return new FormatNode([format], text)
	}
}

export class DifferentTextNode {
	public TYPE = 'DifferentTextNode'

	public playerText: Node
	public opponentText: Node

	constructor(playerText: Node, opponentText: Node) {
		this.playerText = playerText
		this.opponentText = opponentText
	}
}

export class ProfanityNode {
	public TYPE = 'ProfanityNode'

	public text: string

	constructor(text: string) {
		this.text = text
	}
}

export class LineBreakNode {
	public TYPE = 'LineBreakNode'
}

export class TabNode {
	public TYPE = 'TabNode'
}


// The special characters that can end the expression.
const SPECIAL_CHARACTERS = [...'${}|*:\n\t']

const messageParseOptions: Array<[(text: string) => boolean, (text: string) => [Node, string]]> = [
	[
		(text: string) => text.startsWith('$'),
		(text: string) => {
			// Expecting the format $fFormat Node$ where f is a format character
			let format = text[1]
			text = text.slice(2)

			let [nodes, remaining] = parseNodesUntil(text, (remaining) => remaining.startsWith('$'))

			if (nodes.length == 0) {
				throw new Error('Expected an expression, not $')
			}

			let node = new ListNode(nodes)

			return [FormatNode.fromShorthand(format, node), remaining.slice(1)]
		},
	],
	[
		(text: string) => text.startsWith('{'),
		(text: string) => {
			// expecting the format {MesageTreeNode,|Node,}
			let remaining = text.slice(1)

			let firstNode
				;[firstNode, remaining] = parseSingleNode(remaining)

			if (remaining[0] !== '|') {
				throw new Error('Expected |')
			}

			remaining = remaining.slice(1)

			let secondNode
				;[secondNode, remaining] = parseSingleNode(remaining)

			if (remaining[0] !== '}') {
				throw new Error('Expected } to close expression.')
			}

			remaining = remaining.slice(1)

			return [new DifferentTextNode(firstNode, secondNode), remaining]
		},
	],
	[
		(text: string) => text.startsWith('**'),
		(text: string) => {
			// There is no bold because the string isn't long enough.
			if (text.length == 2) {
				return parseTextNode(text)
			}

			text = text.slice(2)

			// If there is no set of ** in the rest of the message, continue like this is regular text
			if (!text.includes('**')) {
				return parseTextNode(text)
			}

			// Otherwise lets parse a bold node list
			let [nodes, remaining] = parseNodesUntil(text, (remaining) => remaining.startsWith('**'))
			remaining = remaining.slice(2)
			return [new FormatNode(['bold'], new ListNode(nodes)), remaining]
		},
	],
	[
		(text: string) => text.startsWith('*'),
		(text: string) => {
			// There is no italic because the string isn't long enough.
			if (text.length == 1) {
				return parseTextNode(text)
			}

			text = text.slice(1)

			// If there is no * in the rest of the message, continue like this is regular text
			if (!text.includes('*')) {
				return parseTextNode(text)
			}

			// Otherwise we parse a italic node list.
			let [nodes, remaining] = parseNodesUntil(text, (remaining) => remaining.startsWith('*'))
			remaining = remaining.slice(1)
			return [new FormatNode(['italic'], new ListNode(nodes)), remaining]
		},
	],
	[
		(text: string) => text.startsWith(':'),
		(text: string) => {
			let remaining = text.slice(1)

			let emojiText: string
				;[emojiText, remaining] = parseUntil(remaining, [':'])

			if (remaining[0] !== ':') {
				throw new Error('Expected : to close expression.')
			}

			// HERMIT_CARDS required a circular import
			// const cardInfo = Object.values(HERMIT_CARDS).find((card) => card.name === emojiText)

			// if (!cardInfo) {
			// 	return [new TextNode(emojiText), remaining.slice(1)]
			// }

			// emojiText = `images/hermits-emoji/${cardInfo.id.split('_')[0]}.png`

			return [
				FormatNode.fromShorthand('i', new TextNode(emojiText)),
				remaining.slice(1),
			]
		}],
	// [(text: string) => text.startsWith('\n'), (text: string) => {

	// }],
	// [(text: string) => text.startsWith('\t'), (text: string) => {

	// }],
	[(_) => true, parseTextNode],
]
// Parse the raw text that is part of a text mode or emoji node. Handles escape
// sequences.
function parseUntil(text: string, until: Array<string>): [string, string] {
	// We take characters until we get to something that is probably a parser
	let out = ''
	let i = 0

	let isEscaped = text[0] == '\\'
	let nextChar: string | undefined = text[0]

	while (true) {
		if (!isEscaped) {
			out += nextChar
		}
		i++

		if (i >= text.length) {
			break
		}
		nextChar = text.at(i)
		if (nextChar == undefined) {
			break
		}

		if (!isEscaped && until.includes(nextChar)) {
			break
		}

		isEscaped = nextChar === '\\'
	}

	return [out, text.slice(i)]
}

// Parse nodes until a predicate matches, or there is an error
function parseNodesWhile(
	text: string,
	matches: (remaining: string) => boolean
): [Array<Node>, string] {
	let remaining = text
	let nodes = []

	try {
		while (true) {
			if (!matches(remaining)) {
				break
			}

			if (remaining.length === 0) {
				throw new Error('Ran out of text when parsing (Unexpected EOF).')
			}

			let node
				;[node, remaining] = parseSingleNode(remaining)
			nodes.push(node)
		}
	} catch (e) {
		return [[...nodes, new TextNode(remaining)], '']
	}

	return [nodes, remaining]
}

function parseNodesUntil(
	text: string,
	matches: (remaining: string) => boolean
): [Array<Node>, string] {
	return parseNodesWhile(text, (remaining) => !matches(remaining))
}

// Parse all Nodes until the end of the string.
function parseNodesUntilEmpty(text: string): Node {
	let [nodes, _] = parseNodesWhile(text, (remaining) => remaining.length >= 1)
	return new ListNode(nodes)
}

// Parse a TextNode
function parseTextNode(text: string): [TextNode, string] {
	let remaining
		;[text, remaining] = parseUntil(text, SPECIAL_CHARACTERS)
	return [new TextNode(text), remaining]
}

// Parse a single Node
function parseSingleNode(text: string): [Node, string] {
	for (let [condition, parser] of messageParseOptions) {
		if (condition(text)) {
			return parser(text)
		}
	}
	throw new Error(`No matching parser found for \`${text}\``)
}

export function formatText(text: string, mode?: 'log' | 'chat'): Node {
	try {
		return parseNodesUntilEmpty(text)
	} catch (e) {
		return new TextNode('There was a unrecoverable formatting error')
	}
}
