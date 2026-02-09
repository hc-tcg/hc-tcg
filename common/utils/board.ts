import assert from 'assert'
import {CardComponent, RowComponent, SlotComponent} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'

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
	game.state.turn.cardsPlayed++

	currentPlayer.hooks.onApply.call()

	// This can only be done once per turn
	game.addCompletedActions('PLAY_SINGLE_USE_CARD')

	// Create the logs
	game.battleLog.addPlayCardEntry(suCard, currentPlayer.coinFlips, slotInfo)

	currentPlayer.hooks.afterApply.call()

	return
}

/** Used by Hermit attacks to get items that contribute to the given row */
export function getSupportingItems(
	game: GameModel,
	row: RowComponent,
): Array<CardComponent> {
	return game.components.filter(
		CardComponent,
		query.card.slot(query.slot.item),
		query.some(
			query.card.rowEntity(row.entity),
			query.every(
				query.card.row(
					query.row.adjacent(query.row.entity(row.entity)),
					(_game, value) =>
						'cyberpunkimpulse_rare' === value.getHermit()?.props.id,
				),
				(_game, value) => {
					if (!value.isItem()) return false
					return value.props.energy.includes('farm')
				},
			),
		),
	)
}
