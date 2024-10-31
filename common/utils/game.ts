import {CARDS} from '../cards'
import {Card} from '../cards/types'

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
