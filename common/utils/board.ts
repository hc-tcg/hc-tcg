import {GameModel} from '../models/game-model'
import {GenericActionResult} from '../types/game-state'
import {card, slot} from '../components/query'
import {CardComponent, SlotComponent} from '../components'

export function applySingleUse(
	game: GameModel,
	slotInfo: SlotComponent | null = null
): GenericActionResult {
	const {currentPlayer} = game

	const suCard = game.components.find(CardComponent, card.slot(slot.singleUse))

	if (!suCard) return 'FAILURE_NOT_APPLICABLE'

	currentPlayer.hooks.beforeApply.call()

	currentPlayer.singleUseCardUsed = true

	currentPlayer.hooks.onApply.call()

	// This can only be done once per turn
	game.addCompletedActions('PLAY_SINGLE_USE_CARD')

	// Create the logs
	game.battleLog.addPlayCardEntry(suCard, currentPlayer.coinFlips, slotInfo)

	currentPlayer.hooks.afterApply.call()

	return 'SUCCESS'
}
