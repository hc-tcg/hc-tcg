import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {TurnActions} from '../../../types/game-state'
import EffectCard from '../../base/effect-card'
import {CARDS} from '../..'
import {applySingleUse, removeStatusEffect} from '../../../utils/board'
import {CanAttachResult} from '../../base/card'

class MilkBucketEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'milk_bucket',
			numericId: 79,
			name: 'Milk Bucket',
			rarity: 'common',
			description:
				'Remove poison and bad omen from one of your Hermits.\nIf attached, prevents the Hermit this card is attached to from being poisoned.',
			log: (values) => {
				if (values.pos.slotType === 'single_use')
					return `${values.defaultLog} on $p${values.pick.name}$`
				return `$p{You|${values.player}}$ attached $e${this.name}$ to $p${values.pos.hermitCard}$`
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer, slot, row} = pos
		if (slot.type === 'single_use') {
			game.addPickRequest({
				playerId: player.id,
				id: instance,
				message: 'Pick one of your Hermits',
				onResult(pickResult) {
					if (pickResult.playerId !== player.id) return 'FAILURE_INVALID_PLAYER'
					if (pickResult.rowIndex === undefined) return 'FAILURE_INVALID_SLOT'

					if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					const statusEffectsToRemove = game.state.statusEffects.filter((ail) => {
						return (
							ail.targetInstance === pickResult.card?.cardInstance &&
							(ail.statusEffectId == 'poison' || ail.statusEffectId == 'badomen')
						)
					})
					statusEffectsToRemove.forEach((ail) => {
						removeStatusEffect(game, pos, ail.statusEffectInstance)
					})

					applySingleUse(game, pickResult)

					return 'SUCCESS'
				},
			})
		} else if (slot.type === 'effect') {
			// Straight away remove poison
			const poisonStatusEffect = game.state.statusEffects.find((ail) => {
				return (
					ail.targetInstance === row?.hermitCard?.cardInstance && ail.statusEffectId == 'poison'
				)
			})
			if (poisonStatusEffect) {
				removeStatusEffect(game, pos, poisonStatusEffect.statusEffectInstance)
			}

			player.hooks.onDefence.add(instance, (attack) => {
				if (!row) return
				const statusEffectsToRemove = game.state.statusEffects.filter((ail) => {
					return (
						ail.targetInstance === row.hermitCard?.cardInstance &&
						(ail.statusEffectId == 'poison' || ail.statusEffectId == 'badomen')
					)
				})
				statusEffectsToRemove.forEach((ail) => {
					removeStatusEffect(game, pos, ail.statusEffectInstance)
				})
			})

			opponentPlayer.hooks.afterApply.add(instance, () => {
				if (!row) return
				const statusEffectsToRemove = game.state.statusEffects.filter((ail) => {
					return (
						ail.targetInstance === row.hermitCard?.cardInstance &&
						(ail.statusEffectId == 'poison' || ail.statusEffectId == 'badomen')
					)
				})
				statusEffectsToRemove.forEach((ail) => {
					removeStatusEffect(game, pos, ail.statusEffectInstance)
				})
			})
		}
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		player.hooks.onDefence.remove(instance)
		opponentPlayer.hooks.afterApply.remove(instance)
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const {currentPlayer} = game
		const result: CanAttachResult = []

		if (!['single_use', 'effect'].includes(pos.slot.type)) result.push('INVALID_SLOT')
		if (pos.player.id !== currentPlayer.id) result.push('INVALID_PLAYER')
		if (pos.slot.type === 'effect') {
			if (!pos.row?.hermitCard) result.push('UNMET_CONDITION_SILENT')
		}

		return result
	}

	// Allows placing in effect or single use slot
	public override getActions(game: GameModel): TurnActions {
		const {currentPlayer} = game

		// Is there is a hermit on the board with space for an effect card
		const spaceForEffect = currentPlayer.board.rows.some((row) => {
			return !!row.hermitCard && !row.effectCard
		})
		const hasHermit = currentPlayer.board.rows.some((row) => !!row.hermitCard)
		const spaceForSingleUse = !game.currentPlayer.board.singleUseCard

		const actions: TurnActions = []
		if (spaceForEffect) actions.push('PLAY_EFFECT_CARD')
		if (hasHermit && spaceForSingleUse) actions.push('PLAY_SINGLE_USE_CARD')
		return actions
	}

	override showSingleUseTooltip(): boolean {
		return true
	}
}

export default MilkBucketEffectCard
