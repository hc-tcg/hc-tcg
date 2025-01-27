import {decode} from 'js-base64'
import {CARDS} from '../cards'
import {CardEntity} from '../entities'
import {LocalCardInstance, WithoutFunctions} from '../types/server-requests'

export const getDeckFromHash = (hash: string): Array<LocalCardInstance> => {
	try {
		var b64 = decode(hash)
			.split('')
			.map((char) => char.charCodeAt(0))
	} catch (_err) {
		return []
	}
	const deck = []
	for (let i = 0; i < b64.length; i++) {
		const props = Object.values(CARDS).find(
			(value) => value.numericId === b64[i],
		)
		if (!props) continue
		deck.push({
			props: WithoutFunctions(props),
			entity: Math.random().toString() as CardEntity,
			slot: null,
			turnedOver: false,
			attackHint: null,
			prizeCard: false,
		})
	}
	return deck
}
