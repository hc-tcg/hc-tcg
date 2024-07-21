import {CARDS} from 'common/cards'
import {encode, decode} from 'js-base64'
import {LocalCardInstance, WithoutFunctions} from 'common/types/server-requests'
import {CardEntity} from 'common/entities'

export const getDeckFromHash = (hash: string): Array<LocalCardInstance> => {
	try {
		var b64 = decode(hash)
			.split('')
			.map((char) => char.charCodeAt(0))
	} catch (err) {
		return []
	}
	const deck = []
	for (let i = 0; i < b64.length; i++) {
		const props = Object.values(CARDS).find((value) => value.props.numericId === b64[i])?.props
		if (!props) continue
		deck.push({
			props: WithoutFunctions(props),
			entity: Math.random().toString() as CardEntity,
			slot: null,
		})
	}
	return deck
}

export const getHashFromDeck = (pickedCards: Array<LocalCardInstance>): string => {
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
