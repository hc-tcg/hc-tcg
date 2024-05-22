import { FormattedSegment, Format } from '../types/game-state'

/**
 * Guide to symbols
 * Player A - Player that generated the log | Player B - other player
 * {A|B} A shows to player A, B shows to player B
 * $p Player
 * $o Opponent
 * $e Effect card
 * $m Item card
 * $v Hermit attack
 * $g Good (healing, heads)
 * $b Bad (damage, tails)
 * $i Image
 */

function createEntry(
	text: string,
	format: Array<Format>,
	condition?: 'player' | 'opponent'
): FormattedSegment {
	return {
		text: text,
		censoredText: text,
		format: format,
		condition: condition ? condition : undefined,
	}
}

type MessageTreeNode = {
	getText: (
		format: FormattedSegment['format'],
		condition: FormattedSegment['condition']
	) => Array<FormattedSegment>
}

function format(node: MessageTreeNode, formatting: Array<Format>) {
	return new FormattedMessageTreeNode(formatting, node)
}

class MessageTreeNodeList {
	private nodes: MessageTreeNode[]

	constructor(nodes: MessageTreeNode[]) {
		this.nodes = nodes
	}

	public getText(
		format: FormattedSegment['format'],
		condition: FormattedSegment['condition']
	): Array<FormattedSegment> {
		return this.nodes.flatMap((node) => node.getText(format, condition))
	}
}

class TextMessageTreeNode {
	private text: string

	constructor(text: string) {
		this.text = text
	}

	public getText(
		format: FormattedSegment['format'],
		condition: FormattedSegment['condition']
	): Array<FormattedSegment> {
		return [createEntry(this.text, format, condition)]
	}
}

class FormattedMessageTreeNode {
	private format: FormattedSegment['format']
	private text: MessageTreeNode

	static formatDict: Record<string, Format> = {
		p: 'player',
		o: 'opponent',
		e: 'effect',
		m: 'item',
		i: 'image',
		v: 'attack',
		g: 'good',
		b: 'bad',
	}

	constructor(format: Array<string>, text: MessageTreeNode) {
		//@TODO Fix type checking
		//@ts-ignore
		this.format = format
		this.text = text
	}

	static fromShorthand(format: string, text: MessageTreeNode) {
		format = this.formatDict[format]
		if (format == undefined) {
			throw new Error(`Format ${format} not found.`)
		}
		return new FormattedMessageTreeNode([format], text)
	}

	public getText(
		format: FormattedSegment['format'],
		condition: FormattedSegment['condition']
	): Array<FormattedSegment> {
		format = [...format, ...this.format]
		return this.text.getText(format, condition)
	}
}

class CurlyBracketMessageTreeNode {
	private playerText: MessageTreeNode
	private opponentText: MessageTreeNode

	constructor(playerText: MessageTreeNode, opponentText: MessageTreeNode) {
		this.playerText = playerText
		this.opponentText = opponentText
	}

	public getText(
		format: FormattedSegment['format'],
		_: FormattedSegment['condition']
	): Array<FormattedSegment> {
		return [
			...this.playerText.getText(format, 'player'),
			...this.opponentText.getText(format, 'opponent'),
		]
	}
}

const messageParseOptions: Record<string, (text: string) => [MessageTreeNode, string]> = {
	$: (text: string) => {
		// Expecting the format $fFormat Node$ where f is a format character
		let format = text[1]
		text = text.slice(2)

		const [innerNode, remaining] = parseSingleMessageTreeNode(text)

		if (remaining[0] !== '$') {
			throw new Error('Expected $ to close expression.')
		}

		return [FormattedMessageTreeNode.fromShorthand(format, innerNode), remaining.slice(1)]
	},
	'{': (text: string) => {
		// expecting the format {MesageTreeNode,|MessageTreeNode,}
		let remaining = text.slice(1)

		let firstNode
			;[firstNode, remaining] = parseSingleMessageTreeNode(remaining)

		if (remaining[0] !== '|') {
			throw new Error('Expected |')
		}

		remaining = remaining.slice(1)

		let secondNode
			;[secondNode, remaining] = parseSingleMessageTreeNode(remaining)

		if (remaining[0] !== '}') {
			throw new Error('Expected } to close expression.')
		}

		remaining = remaining.slice(1)

		return [new CurlyBracketMessageTreeNode(firstNode, secondNode), remaining]
	},
	'*': (text: string) => {
		// There is no bold or italic because the string isn't long enough.
		if (text.length == 1) {
			return parseTextNode(text)
		}

		// Bold is two stars
		if (text[1] === '*') {
			// handle bold
			text = text.slice(2)

			// If there is no set of ** in the rest of the message, continue like this is regular text
			if (!text.includes('**')) {
				return parseTextNode(text)
			}

			// Otherwise lets parse a bold node list
			let [nodes, remaining] = parseNodesUntil(text, (remaining) => remaining.startsWith('**'))
			remaining = remaining.slice(2)
			let boldNodes = nodes.map((node) => format(node, ['bold']))
			return [new MessageTreeNodeList(boldNodes), remaining]
		} else {
			// handle italic
			text = text.slice(1)

			// If there is no * in the rest of the message, continue like this is regular text
			if (!text.includes('*')) {
				return parseTextNode(text)
			}

			// Otherwise we parse a italic node list.
			let [nodes, remaining] = parseNodesUntil(text, (remaining) => remaining.startsWith('*'))
			remaining = remaining.slice(1)
			let italicNodes = nodes.map((node) => format(node, ['italic']))
			return [new MessageTreeNodeList(italicNodes), remaining]
		}
	},
	':': (text: string) => {
		let remaining = text.slice(1)

		let emojiText: string
			;[emojiText, remaining] = parseUntil(remaining, [':'])

		if (remaining[0] !== ':') {
			throw new Error('Expected : to close expression.')
		}

		// HERMIT_CARDS required a circular import
		const cardInfo = Object.values(HERMIT_CARDS).find((card) => card.name === emojiText)

		if (!cardInfo) {
			return [new TextMessageTreeNode(emojiText), remaining.slice(1)]
		}

		emojiText = `images/hermits-emoji/${cardInfo.id.split('_')[0]}.png`

		return [
			FormattedMessageTreeNode.fromShorthand('i', new TextMessageTreeNode(emojiText)),
			remaining.slice(1),
		]
	},
}
// Parse the raw text that is part of a text mode or emoji node. Handles escape
// sequences.
function parseUntil(text: string, until: Array<string>): [string, string] {
	// We take characters until we get to something that is probably a parser
	let out = ''
	let i = 0

	let isEscaped = false
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

function parseNodesWhile(
	text: string,
	matches: (remaining: string) => boolean
): [Array<MessageTreeNode>, string] {
	let remaining = text
	let nodes = []

	while (true) {
		if (!matches(remaining)) {
			break
		}

		if (remaining.length === 0) {
			throw new Error('Ran out of text when parsing (Unexpected EOF).')
		}

		let node
			;[node, remaining] = parseSingleMessageTreeNode(remaining)
		nodes.push(node)
	}

	return [nodes, remaining]
}

function parseNodesUntil(
	text: string,
	matches: (remaining: string) => boolean
): [Array<MessageTreeNode>, string] {
	return parseNodesWhile(text, (remaining) => !matches(remaining))
}

// Parse all MessageTreeNodes until the end of the string.
function parseNodesUntilEmpty(text: string): MessageTreeNode {
	let [nodes, _] = parseNodesWhile(text, (remaining) => remaining.length >= 1)
	return new MessageTreeNodeList(nodes)
}

// Parse a TextMessageTreeNode
function parseTextNode(text: string): [TextMessageTreeNode, string] {
	let until = Object.keys(messageParseOptions)
	until.push(...['|', '}'])
	let remaining
		;[text, remaining] = parseUntil(text, until)
	return [new TextMessageTreeNode(text), remaining]
}

// Parse a single MessageTreeNode
function parseSingleMessageTreeNode(text: string): [MessageTreeNode, string] {
	let parser = messageParseOptions[text[0]] || parseTextNode
	return parser(text)
}

export function formatText(text: string, mode?: 'log' | 'chat'): Array<FormattedSegment> {
	let rootNode = parseNodesUntilEmpty(text)

	let messageTextParts
	try {
		messageTextParts = rootNode.getText([], undefined)
	} catch (e) {
		// TODO: Improve error format
		return [createEntry('There was a formatting error', [], undefined)]
	}

	return messageTextParts
}
