import {CardT} from 'common/types/game-state'
import {CARDS} from 'common/cards'
import {encode, decode} from 'js-base64'

export const getDeckFromHash = (hash: string): Array<CardT> => {
	const b64 = decode(hash)
		.split('')
		.map((char) => char.charCodeAt(0))
	const deck = []
	for (let i = 0; i < b64.length; i++) {
		const card_id = Object.values(CARDS).find((value) => value.numeric_id === b64[i])?.id
		if (!card_id) continue
		deck.push({
			cardId: card_id,
			cardInstance: Math.random().toString(),
		})
	}
	const deckCards = deck.filter((card: CardT) => CARDS[card.cardId])
	return deckCards
}

export const getHashFromDeck = (pickedCards: Array<CardT>): string => {
	const indicies = []
	for (let i = 0; i < pickedCards.length; i++) {
		const id = CARDS[pickedCards[i].cardId].numeric_id
		if (id >= 0) indicies.push(id)
	}
	const b64cards = encode(String.fromCharCode.apply(null, indicies))
	return b64cards
}
