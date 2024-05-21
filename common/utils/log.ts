import {MessageTextT} from '../types/game-state'

export function formatLogEntry(text: string): Array<MessageTextT> {
	const output: Array<MessageTextT> = []

	var playerMode = false
	var highlightMode = false
	var passthroughMode = false

	output.push({
		text: '',
		censoredText: '',
		format: 'plain',
	})

	for (var i = 0; i < text.length; i++) {
		const char = text[i]
		const nextChar = text[i + 1]

		passthroughMode = false

		if (playerMode && char === '|') {
			output.push({
				text: '',
				censoredText: '',
				format: 'plain',
				condition: 'opponent',
			})
			passthroughMode = true
		}

		if (playerMode && char === '}') {
			output.push({
				text: '',
				censoredText: '',
				format: 'plain',
			})
			passthroughMode = true
		}

		if (char === '{') {
			playerMode = true
			output.push({
				text: '',
				censoredText: '',
				format: 'plain',
				condition: 'player',
			})
			passthroughMode = true
		}

		if (highlightMode && char === '$') {
			output.push({
				text: '',
				censoredText: '',
				format: 'plain',
			})
			passthroughMode = true
			highlightMode = false
		} else if (char === '$' && 'poh'.includes(nextChar)) {
			output.push({
				text: '',
				censoredText: '',
				format: 'plain',
			})
			if (nextChar === 'p') output[output.length - 1].format = 'player'
			if (nextChar === 'o') output[output.length - 1].format = 'opponent'
			if (nextChar === 'h') output[output.length - 1].format = 'highlight'
			passthroughMode = true
			highlightMode = true
			i++
		}

		if (!passthroughMode) {
			output[output.length - 1].text += char
		}
	}

	output.forEach((item) => {
		item.text += ' '
		item.censoredText = item.text
	})

	output.forEach((item, index) => {
		if (item.text === ' ') {
			output.splice(index, 1)
		}
	})

	console.log(output)

	return output
}
