import {
	attachCardClasses,
	hermitCardClasses,
	itemCardClasses,
	singleUseCardClasses,
} from 'common/cards'
import WildItem from 'common/cards/items/wild-common'
import {Card, Hermit, Item} from 'common/cards/types'
import {choose} from './utils'

/** Create a deck for fuzz testing. This may NOT be a valid deck */
export function createDeck(random: () => number): Array<Card> {
	let cards: Array<Card> = []

	let hermitCount = Math.floor(random() * 10) + 5
	let itemCount = Math.floor(random() * 12) + 8

	let firstHermit = choose(hermitCardClasses, random) as Card & Hermit
	let type = firstHermit.type

	let pickHermitsFrom = hermitCardClasses.filter(
		(c) => (c as Hermit).type === type,
	)
	let pickItemsFrom = [
		...itemCardClasses.filter((c) => (c as Item).energy.includes(type)),
		WildItem,
	]

	for (let i = 0; i < hermitCount; i++) {
		cards.push(choose(pickHermitsFrom, random))
	}
	for (let i = 0; i < itemCount; i++) {
		cards.push(choose(pickItemsFrom, random))
	}

	while (cards.length < 42) {
		let pick = Math.floor(random() * 3)

		if (pick === 0) {
			cards.push(choose(attachCardClasses, random))
		} else if (pick === 1) {
			cards.push(choose(singleUseCardClasses, random))
		}
	}

	return cards
}
