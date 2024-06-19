import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {TurnActions} from '../../../types/game-state'
import EffectCard from '../../base/effect-card'
import {CARDS} from '../..'
import {applySingleUse, removeStatusEffect} from '../../../utils/board'
import {CanAttachResult} from '../../base/card'
import {slot} from '../../../slot'

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

	override _attachCondition = slot.some(
		slot.singleUseSlot,
		slot.every(slot.player, slot.effectSlot, slot.rowHasHermit)
	)

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer, row} = pos
		if (pos.slot.type === 'single_use') {
			game.addPickRequest({
				playerId: player.id,
				id: instance,
				message: 'Pick one of your Hermits',
				canPick: slot.every(slot.player, slot.hermitSlot, slot.not(slot.empty)),
				onResult(pickResult) {
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
				},
			})
		} else if (pos.slot.type === 'effect') {
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

	override showSingleUseTooltip(): boolean {
		return true
	}
}

export default MilkBucketEffectCard
