import {
	hermitCardClasses,
	attachCardClasses,
	itemCardClasses,
	singleUseCardClasses,
} from 'common/cards'
import WildItem from 'common/cards/items/wild-common'
import {Card, Hermit, Item} from 'common/cards/types'

function choose<T>(a: Array<T>) {
	return a[Math.floor(Math.random() * a.length)]
}

/** Create a deck for fuzz testing. This may NOT be a valid deck */
export function createDeck(): Array<Card['id']> {
	let cards: Array<Card['id']> = []

	let hermitCount = Math.floor(Math.random() * 10) + 5

	let firstHermit = choose(hermitCardClasses) as Card & Hermit
	let type = firstHermit.type

	let pickHermitsFrom = hermitCardClasses.filter(
		(c) => (c as Hermit).type === type,
	)
	let pickItemsFrom = [
		...itemCardClasses.filter((c) => (c as Item).energy.includes(type)),
		WildItem,
	]

	for (let i = 0; i < hermitCount; i++) {
		cards.push(choose(pickHermitsFrom).id)
	}

	while (cards.length < 42) {
		let pick = Math.floor(Math.random() * 3)

		if (pick === 0) {
			cards.push(choose(attachCardClasses).id)
		} else if (pick === 1) {
			cards.push(choose(singleUseCardClasses).id)
		} else if (pick === 2) {
			cards.push(choose(pickItemsFrom).id)
		}
	}

	return cards
}
