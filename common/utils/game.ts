import {CARDS} from '../cards'
import Card from '../cards/base/card'
import {PlayerState} from '../types/game-state'

export function hasActive(playerState: PlayerState): boolean {
	return playerState.board.activeRow !== null
}

export function getFormattedName(cardId: string, opponent: boolean) {
	const cardInfo = CARDS[cardId]

	const getFormatting = (cardInfo: Card, opponent: boolean): string | null => {
		if (cardInfo.type === 'hermit') return opponent ? '$o' : '$p'
		if (cardInfo.type === 'single_use') return '$e'
		if (cardInfo.type === 'effect') return '$e'
		if (cardInfo.type === 'item') return '$m'
		return null
	}

	const formatting = getFormatting(cardInfo, opponent)
	if (!formatting) return ''

	return `${formatting}${cardInfo.name}$`
}
