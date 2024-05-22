import { getHeapCodeStatistics } from 'v8';
import { MessageTextT } from '../types/game-state'

/**
 * Guide to symbols
 * Player A - Player that generated the log | Player B - other player
 * {A|B} A shows to player A, B shows to player B
 * $h Highlight
 * $p Player A highlight
 * $o Player B highlight
 * $i Inline image
 */

function createEntry(
	text: string,
	format: MessageTextT["format"],
	condition?: 'player' | 'opponent'
): MessageTextT {
	return {
		text: text,
		censoredText: text,
		format: format,
		condition: condition ? condition : undefined,
	}
}


type MessageTreeNode = {
	getText: (format: MessageTextT["format"], condition: MessageTextT["condition"]) => Array<MessageTextT>
}

class TextMessageTreeNode {
	private text: string;

	constructor(text: string) {
		this.text = text;
	}

	public getText(format: MessageTextT["format"], condition: MessageTextT["condition"]): Array<MessageTextT> {
		return [createEntry(
			this.text,
			format,
			condition,
		)]
	}
}

class FormattedMessageTreeNode {
	private format: MessageTextT["format"];
	private text: MessageTreeNode;

	private formatDict: Record<string, MessageTextT["format"]> = {
		p: 'player',
		o: 'opponent',
		h: 'highlight',
		i: 'image',
	}

	constructor(format: string, text: MessageTreeNode) {
		this.format = this.formatDict[format];
		if (this.format == undefined) {
			console.log(`Format ${format} not found.`)
		}

		this.text = text;
	}

	public getText(_: MessageTextT["format"], condition: MessageTextT["condition"]): Array<MessageTextT> {
		return this.text.getText(this.format, condition);
	}
}

class CurlyBracketMessageTreeNode {
	private playerText: MessageTreeNode
	private opponentText: MessageTreeNode

	constructor(playerText: MessageTreeNode, opponentText: MessageTreeNode) {
		this.playerText = playerText
		this.opponentText = opponentText
	}

	public getText(format: MessageTextT["format"], _: MessageTextT["condition"]): Array<MessageTextT> {
		return [
			...this.playerText.getText(format, 'player'),
			...this.opponentText.getText(format, 'opponent'),
		]

	}
}

const messageParseOptions: Record<string, (text: string) => [MessageTreeNode, string]> = {
	'$': (text: string) => {
		// Expecting the format $fFormat Node$ where f is a format character
		var format = text[1]
		text = text.slice(2)

		const [innerNode, remaining] = parseSingleMessageTreeNode(text)

		if (remaining[0] !== "$") {
			throw new Error("Expected $ to close expression.")
		}

		return [new FormattedMessageTreeNode(format, innerNode), remaining.slice(1)];
	},
	'{': (text: string) => {
		// expecting the format {MesageTreeNode,|MessageTreeNode,}
		var remaining = text.slice(1)
		console.log(remaining)

		var [firstNode, remaining] = parseSingleMessageTreeNode(remaining);
		console.log(remaining)

		if (remaining[0] !== "|") {
			throw new Error("Expected |")
		}

		remaining = remaining.slice(1)

		var [secondNode, remaining] = parseSingleMessageTreeNode(remaining);
		console.log(remaining)

		if (remaining[0] !== "}") {
			throw new Error("Expected } to close expression.")
		}

		remaining = remaining.slice(1)

		return [new CurlyBracketMessageTreeNode(firstNode, secondNode), remaining]
	},
	':': (text: string) => {
		var remaining = text.slice(1)

		var [emojiText, remaining] = textParser(remaining);

		if (remaining[0] !== ":") {
			throw new Error("Expected : to close expression.")
		}

		return [new FormattedMessageTreeNode("i", emojiText), remaining.slice(1)];
	}
}

// The text parser
function textParser(text: string): [MessageTreeNode, string] {
	// We take text until we get to something that is probably a parser
	// TODO: Handle escape sequences

	var out = ""
	var i = 0

	var nextChar = text.at(i);


	// Get the special characters. These would requrie escape sequences in the future to be parsed.
	var endAt = Object.keys(messageParseOptions);
	endAt.push(...['|', '}'])

	while (nextChar !== undefined && !endAt.includes(nextChar)) {
		out += nextChar;
		i++;
		nextChar = text.at(i)
	}

	return [new TextMessageTreeNode(out), text.slice(i)];
}


function parseSingleMessageTreeNode(text: string): [MessageTreeNode, string] {
	let parser = messageParseOptions[text[0]] || textParser;
	console.log(parser)
	return parser(text)
}

function parseNodesUntilEmpty(text: string): Array<MessageTreeNode> {
	var remaining = text
	var nodes = [];

	while (remaining.length >= 1) {
		var node;
		[node, remaining] = parseSingleMessageTreeNode(remaining)
		console.log(remaining)
		nodes.push(node)
	}

	return nodes;
}


export function formatLogEntry(text: string, mode?: 'log' | 'chat'): Array<MessageTextT> {
	var nodes = parseNodesUntilEmpty(text)

	var messageTextParts;
	try {
		messageTextParts = nodes.flatMap((node) =>
			node.getText("plain", undefined)
		)

	} catch (e) {
		// TODO: Improve error format
		return [createEntry("There was a formatting error", "plain", undefined)]
	}

	return messageTextParts
}
