import {CardInstance} from 'common/types/game-state'
import {CARDS} from 'common/cards'
import {encode, decode} from 'js-base64'

export const getDeckFromHash = (hash: string): Array<CardInstance> => {
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
			props: props,
			cardInstance: Math.random().toString(),
		})
	}
	return deck
}

export const getHashFromDeck = (pickedCards: Array<CardInstance>): string => {
	const indicies = []
	for (let i = 0; i < pickedCards.length; i++) {
		const id = CARDS[pickedCards[i].props.id].props.numericId
		if (id >= 0) indicies.push(id)
	}
	const b64cards = encode(String.fromCharCode.apply(null, indicies))
	return b64cards
}
