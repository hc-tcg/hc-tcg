import {CardComponent, SlotComponent} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {assert} from './assert'

export function applySingleUse(
	game: GameModel,
	slotInfo: SlotComponent | null = null,
): void {
	const {currentPlayer} = game

	const suCard = game.components.find(
		CardComponent,
		query.card.slot(query.slot.singleUse),
	)

	assert(
		suCard,
		'Can not apply single use card if there is not a single use on the board',
	)

	currentPlayer.hooks.beforeApply.call()

	currentPlayer.singleUseCardUsed = true

	currentPlayer.hooks.onApply.call()

	// This can only be done once per turn
	game.addCompletedActions('PLAY_SINGLE_USE_CARD')

	// Create the logs
	game.battleLog.addPlayCardEntry(suCard, currentPlayer.coinFlips, slotInfo)

	currentPlayer.hooks.afterApply.call()

	return
}
