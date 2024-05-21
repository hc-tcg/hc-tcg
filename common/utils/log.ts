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
	output: Array<MessageTextT>,
	format: string,
	condition?: 'player' | 'opponent'
): void {
	const previousEntry = output[output.length - 1]
	if (previousEntry && previousEntry.text === '') {
		previousEntry.format = format
		previousEntry.condition = condition ? condition : undefined
		return
	}

	output.push({
		text: '',
		censoredText: '',
		format: format,
		condition: condition ? condition : undefined,
	})
}

function updateLastEntry(
	output: Array<MessageTextT>,
	text: string,
	format?: string,
	condition?: 'player' | 'opponent' | 'both'
): void {
	output[output.length - 1] = {
		text: output[output.length - 1].text + text,
		censoredText: output[output.length - 1].text + text,
		format: format ? format : output[output.length - 1].format,
		condition: condition !== 'both' && condition ? condition : output[output.length - 1].condition,
	}
}

const formatDict: Record<string, string> = {
	p: 'player',
	o: 'opponent',
	h: 'highlight',
	i: 'image',
}

export function formatLogEntry(text: string): Array<MessageTextT> {
	const output: Array<MessageTextT> = []

	var visibility: 'both' | 'player' | 'opponent' = 'both'
	var passthroughMode = false
	var highlightMode = false

	if (text.length === 0) return []
	if (!'{$'.includes(text[0])) createEntry(output, 'plain')

	for (var i = 0; i < text.length; i++) {
		const char = text[i]
		const nextChar = text[i + 1]

		if (nextChar === undefined) return output

		passthroughMode = false

		if (visibility !== 'both' && char === '|') {
			createEntry(output, 'plain', 'opponent')
			visibility = 'opponent'
			passthroughMode = true
		}

		if (visibility !== 'both' && char === '}') {
			createEntry(output, 'plain')
			visibility = 'both'
			passthroughMode = true
		}

		if (char === '{') {
			createEntry(output, 'plain', 'player')
			visibility = 'player'
			passthroughMode = true
		}

		if (char === '$') {
			createEntry(output, 'plain')
			passthroughMode = true
			highlightMode = !highlightMode

			if (highlightMode && Object.keys(formatDict).includes(nextChar)) {
				updateLastEntry(output, '', formatDict[nextChar], visibility)
				i++
			}
		}

		if (!passthroughMode) updateLastEntry(output, char)
	}

	return output
}
