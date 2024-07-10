import {STATUS_EFFECT_CLASSES} from '../status-effects'
import {CardPosModel, getCardPos} from '../models/card-pos-model'
import {GameModel} from '../models/game-model'
import {SlotComponent} from '../types/cards'
import {
	StatusEffectComponent,
	GenericActionResult,
	PlayerState,
	CardComponent,
} from '../types/game-state'
import {card} from '../filters'

export function applySingleUse(game: GameModel, slotInfo?: SlotComponent): GenericActionResult {
	const {currentPlayer} = game

	const suCard = game.state.cards.find(card.singleUse)

	if (!suCard) return 'FAILURE_NOT_APPLICABLE'
	const pos = getCardPos(game, suCard)
	if (!pos) return 'FAILURE_UNKNOWN_ERROR'

	const cardInstance = suCard?.entity
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
	targetInstance: CardComponent | undefined | null
): GenericActionResult {
	if (!targetInstance) return 'FAILURE_INVALID_DATA'

	const pos = getCardPos(game, targetInstance)

	if (!pos) return 'FAILURE_INVALID_DATA'

	const statusEffectInstance = new StatusEffectComponent(
		STATUS_EFFECT_CLASSES[statusEffectId],
		Math.random().toString(),
		targetInstance
	)

	if (!statusEffectInstance.props.applyCondition(game, pos)) return 'FAILURE_CANNOT_COMPLETE'

	statusEffectInstance.statusEffect.onApply(game, statusEffectInstance, pos)
	game.state.statusEffects.push(statusEffectInstance)

	return 'SUCCESS'
}

/**
 * Remove an statusEffect from the game.
 */
export function removeStatusEffect(
	game: GameModel,
	pos: CardPosModel | null,
	statusEffectInstance: StatusEffectComponent
): GenericActionResult {
	if (!pos) return 'FAILURE_NOT_APPLICABLE'
	const statusEffects = game.state.statusEffects.filter(
		(a) => a.instance === statusEffectInstance.entity
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
	instance: CardComponent | null,
	statusEffectId: string
) {
	if (!instance) return false
	return (
		game.state.statusEffects.filter(
			(ail) => ail.props.id === statusEffectId && ail.instance === instance.entity
		).length !== 0
	)
}
