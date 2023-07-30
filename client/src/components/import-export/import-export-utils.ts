import {CardT} from 'common/types/game-state'
import {CARDS} from 'common/cards'
import {universe} from './import-export-const'
import {encode, decode} from 'js-base64'

export const getDeckFromHash = (hash: string): Array<CardT> => {
	const b64 = decode(hash)
		.split('')
		.map((char) => char.charCodeAt(0))
	const deck = []
	for (let i = 0; i < b64.length; i++) {
		deck.push({
			cardId: universe[b64[i]],
			cardInstance: Math.random().toString(),
		})
	}
	const deckCards = deck.filter((card: CardT) => CARDS[card.cardId])
	return deckCards
}

export const getHashFromDeck = (pickedCards: Array<CardT>): string => {
	const indicies = []
	for (let i = 0; i < pickedCards.length; i++) {
		const cardId = String(pickedCards[i].cardId)
		const index = universe.indexOf(cardId)
		if (index >= 0) indicies.push(index)
	}
	const b64cards = encode(String.fromCharCode.apply(null, indicies))
	return b64cards
}
