import {STATUS_EFFECT_CLASSES} from '../status-effects'
import {CardPosModel, getCardPos} from '../models/card-pos-model'
import {GameModel} from '../models/game-model'
import {RowPos, SlotInfo} from '../types/cards'
import {
	StatusEffectInstance,
	GenericActionResult,
	PlayerState,
	RowStateWithHermit,
	CardInstance,
} from '../types/game-state'

export function getActiveRow(player: PlayerState): RowStateWithHermit | null {
	if (player.board.activeRow === null) return null
	const row = player.board.rows[player.board.activeRow]
	if (!row.hermitCard) return null
	return row
}

export function getActiveRowPos(player: PlayerState): RowPos | null {
	const rowIndex = player.board.activeRow
	if (rowIndex === null) return null
	const row = player.board.rows[rowIndex]
	if (!row.hermitCard) return null
	return {
		player: player,
		rowIndex,
		row,
	}
}

export function applySingleUse(game: GameModel, slotInfo?: SlotInfo): GenericActionResult {
	const {currentPlayer} = game

	const suCard = currentPlayer.board.singleUseCard
	if (!suCard) return 'FAILURE_NOT_APPLICABLE'
	const pos = getCardPos(game, suCard)
	if (!pos) return 'FAILURE_UNKNOWN_ERROR'

	const cardInstance = currentPlayer.board.singleUseCard?.instance
	if (!cardInstance) return 'FAILURE_NOT_APPLICABLE'

	currentPlayer.hooks.beforeApply.call()

	currentPlayer.board.singleUseCardUsed = true

	currentPlayer.hooks.onApply.call()

	// This can only be done once per turn
	game.addCompletedActions('PLAY_SINGLE_USE_CARD')

	// Create the logs
	game.battleLog.addPlayCardEntry(suCard.card, pos, currentPlayer.coinFlips, slotInfo)

	currentPlayer.hooks.afterApply.call()

	return 'SUCCESS'
}

/**
 * Apply an statusEffect to a card instance. statusEffectId must be a status effect id, and targetInstance must be card
 * instance.
 */
export function applyStatusEffect(
	game: GameModel,
	statusEffectId: string,
	targetInstance: CardInstance | undefined | null
): GenericActionResult {
	if (!targetInstance) return 'FAILURE_INVALID_DATA'

	const pos = getCardPos(game, targetInstance)

	if (!pos) return 'FAILURE_INVALID_DATA'

	const statusEffectInstance = new StatusEffectInstance(
		STATUS_EFFECT_CLASSES[statusEffectId],
		Math.random().toString(),
		targetInstance
	)

	statusEffectInstance.statusEffect.onApply(game, statusEffectInstance, pos)

	return 'SUCCESS'
}

/**
 * Remove an statusEffect from the game.
 */
export function removeStatusEffect(
	game: GameModel,
	pos: CardPosModel,
	statusEffectInstance: StatusEffectInstance
): GenericActionResult {
	const statusEffects = game.state.statusEffects.filter(
		(a) => a.instance === statusEffectInstance.instance
	)
	if (statusEffects.length === 0) return 'FAILURE_NOT_APPLICABLE'

	const statusEffectObject = STATUS_EFFECT_CLASSES[statusEffects[0].props.id]
	statusEffectObject.onRemoval(game, statusEffects[0], pos)
	game.battleLog.addRemoveStatusEffectEntry(statusEffectObject)
	game.state.statusEffects = game.state.statusEffects.filter((a) => !statusEffects.includes(a))

	return 'SUCCESS'
}

export function hasStatusEffect(
	game: GameModel,
	instance: CardInstance | null,
	statusEffectId: string
) {
	if (!instance) return false
	return (
		game.state.statusEffects.filter(
			(ail) => ail.props.id === statusEffectId && ail.instance === instance.instance
		).length !== 0
	)
}
