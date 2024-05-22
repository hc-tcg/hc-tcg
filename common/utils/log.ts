import {MessageTextT} from '../types/game-state'

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
	format: string,
	condition?: 'player' | 'opponent'
): MessageTextT {
	return {
		text: text,
		censoredText: text,
		format: format,
		condition: condition ? condition : undefined,
	}
}

const formatDict: Record<string, string> = {
	p: 'player',
	o: 'opponent',
	h: 'highlight',
	i: 'image',
}

export function formatLogEntry(text: string): Array<MessageTextT> {
	if (text.length === 0) {
		return []
	}

	const [token, reaminingText] = parseSingleMessageText(text)

	return [token, ...formatLogEntry(reaminingText)]
}

const messageParseOptions = {
	$: (text: string) => {
		var format = text[1]
		text = text.slice(2)

		const [a, b] = text.split('$', 1)
		return createEntry(text, formatDict[format])
	},
	'{': (text: string) => {},
}

function parseSingleMessageText(): [MessageTextT, string] {}
