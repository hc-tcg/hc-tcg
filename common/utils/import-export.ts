import {CARDS} from '../cards'
import {CardEntity} from '../entities'
import {LocalCardInstance, WithoutFunctions} from '../types/server-requests'
import {decode, encode} from 'js-base64'

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
		})
	}
	return deck
}

export const getHashFromDeck = (
	pickedCards: Array<LocalCardInstance>,
): string => {
	const indicies = []
	for (let i = 0; i < pickedCards.length; i++) {
		if (!pickedCards[i].props) {
			console.error('Error exporting: ' + i)
			continue
		}
		const id = pickedCards[i].props.numericId
		if (id >= 0) indicies.push(id)
	}
	const b64cards = encode(String.fromCharCode.apply(null, indicies))
	return b64cards
}
