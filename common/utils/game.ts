import type {Card} from '../cards/types'

let CARDS: Record<any, Card>
import('../cards').then((mod) => (CARDS = mod.CARDS))

export function getFormattedName(cardId: string, opponent: boolean) {
	const cardInfo = CARDS[cardId]

	const getFormatting = (cardInfo: Card, opponent: boolean): string | null => {
		if (cardInfo.category === 'hermit') return opponent ? '$o' : '$p'
		if (cardInfo.category === 'single_use') return '$e'
		if (cardInfo.category === 'attach') return '$e'
		if (cardInfo.category === 'item') return '$m'
		return null
	}

	const formatting = getFormatting(cardInfo, opponent)
	if (!formatting) return ''

	return `${formatting}${cardInfo.name}$`
}

export function newIncrementor() {
	let x = 1
	return function () {
		x += 1
		return x
	}
}
