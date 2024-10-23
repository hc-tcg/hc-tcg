import {CARDS} from '../cards'
import {
	Card,
	isAttach,
	isHermit,
	isItem,
	isSingleUse,
} from '../cards/base/types'
import {CONFIG} from '../config'
import {EXPANSIONS} from '../const/expansions'
import {STRENGTHS} from '../const/strengths'
import {CardEntity, newEntity} from '../entities'
import {LocalCardInstance, WithoutFunctions} from '../types/server-requests'

function randomBetween(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function getStarterPack(): Array<LocalCardInstance> {
	const limits = CONFIG.limits

	// only allow some starting types
	const startingTypes = ['balanced', 'builder', 'farm', 'miner', 'redstone']
	const typesCount = randomBetween(2, 3)
	const types = Object.keys(STRENGTHS)
		.filter((type) => startingTypes.includes(type))
		.sort(() => 0.5 - Math.random())
		.slice(0, typesCount)

	const cards = Object.values(CARDS).filter(
		(cardInfo) =>
			!isHermit(cardInfo) ||
			!isItem(cardInfo) ||
			(types.includes(cardInfo.type) &&
				EXPANSIONS[cardInfo.expansion].disabled === false),
	)

	const effectCards = cards.filter(
		(card) => isSingleUse(card) || isAttach(card),
	)
	const hermitCount = typesCount === 2 ? 8 : 10

	const deck: Array<Card> = []

	let itemCounts = {
		[types[0]]: {
			items: 0,
			tokens: 0,
		},
		[types[1]]: {
			items: 0,
			tokens: 0,
		},
	}
	if (types[2]) {
		itemCounts[types[2]] = {
			items: 0,
			tokens: 0,
		}
	}
	let tokens = 0

	// hermits, but not diamond ones
	let hermitCards = cards
		.filter((card) => isHermit(card))
		.filter((card) => !isHermit(card) || types.includes(card.type))
		.filter((card) => card.name !== 'diamond')

	while (deck.length < hermitCount && hermitCards.length > 0) {
		const randomIndex = Math.floor(Math.random() * hermitCards.length)
		const hermitCard = hermitCards[randomIndex]

		// remove this option
		hermitCards = hermitCards.filter((_card, index) => index !== randomIndex)

		// add 1 - 3 of this hermit
		const hermitAmount = Math.min(
			randomBetween(1, 3),
			hermitCount - deck.length,
		)

		tokens +=
			(hermitCard.tokens !== 'wild' ? hermitCard.tokens : 1) * hermitAmount
		for (let i = 0; i < hermitAmount; i++) {
			deck.push(hermitCard)
			itemCounts[hermitCard.type].items += 2
		}
	}

	// items
	for (let type in itemCounts) {
		let counts = itemCounts[type]

		for (let i = 0; i < counts.items; i++) {
			deck.push(CARDS[`item_${type}_common`])
		}
	}

	let loopBreaker = 0
	// effects
	while (deck.length < limits.maxCards && deck.length < effectCards.length) {
		const effectCard =
			effectCards[Math.floor(Math.random() * effectCards.length)]

		const duplicates = deck.filter(
			(card) => card.numericId === effectCard.numericId,
		)
		if (duplicates.length >= limits.maxDuplicates) continue

		const tokenCost = effectCard.tokens !== 'wild' ? effectCard.tokens : 1
		if (tokens + tokenCost >= limits.maxDeckCost) {
			loopBreaker++
			continue
		} else {
			loopBreaker = 0
		}
		if (loopBreaker >= 100) {
			const err = new Error()
			console.log('Broke out of loop while generating starter deck!', err.stack)
			break
		}

		tokens += tokenCost
		deck.push(effectCard)
	}

	return deck.map((card) => {
		return {
			props: WithoutFunctions(CARDS[card.numericId]),
			entity: newEntity('card-entity', Math.random()) as CardEntity,
			slot: null,
			turnedOver: false,
			attackHint: null,
		}
	})
}
