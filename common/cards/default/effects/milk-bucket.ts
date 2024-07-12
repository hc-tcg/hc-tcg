import {GameModel} from '../../../models/game-model'
import {applySingleUse, removeStatusEffect} from '../../../utils/board'
import {query, slot} from '../../../filters'
import Card, {Attach, SingleUse} from '../../base/card'
import {attach, singleUse} from '../../base/defaults'
import { CardComponent } from '../../../types/components'

class MilkBucketEffectCard extends Card {
	props: Attach & SingleUse = {
		...attach,
		...singleUse,
		id: 'milk_bucket',
		numericId: 79,
		name: 'Milk Bucket',
		category: 'attach',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		description:
			'Remove poison and bad omen from one of your Hermits.\nIf attached, prevents the Hermit this card is attached to from being poisoned.',
		attachCondition: query.some(attach.attachCondition, singleUse.attachCondition),
		log: (values) => {
			if (values.pos.slotType === 'single_use')
				return `${values.defaultLog} on $p${values.pick.name}$`
			return `$p{You|${values.player}}$ attached $e${this.props.name}$ to $p${values.pos.hermitCard}$`
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer, rowId: row} = pos
		if (pos.type === 'single_use') {
			game.addPickRequest({
				playerId: player.id,
				id: this.props.id,
				message: 'Pick one of your Hermits',
				canPick: slot.every(slot.player, slot.hermitSlot, slot.not(slot.empty)),
				onResult(pickedSlot) {
					const statusEffectsToRemove = game.state.statusEffects.filterEntities((ail) => {
						return (
							ail.targetInstance.component === pickedSlot.cardId?.component &&
							(ail.props.id == 'poison' || ail.props.id == 'badomen')
						)
					})
					statusEffectsToRemove.forEach((ail) => {
						removeStatusEffect(game, pos, ail)
					})

					applySingleUse(game, pickedSlot)
				},
			})
		} else if (pos.type === 'attach') {
			// Straight away remove poison
			const poisonStatusEffect = game.state.statusEffects.findEntity((ail) => {
				return (
					ail.targetInstance.component === row?.hermitCard?.component && ail.props.id == 'poison'
				)
			})
			if (poisonStatusEffect) {
				removeStatusEffect(game, pos, poisonStatusEffect)
			}

			player.hooks.onDefence.add(component, (attack) => {
				if (!row) return
				const statusEffectsToRemove = game.state.statusEffects.filterEntities((ail) => {
					return (
						ail.targetInstance.component === row.hermitCard?.component &&
						(ail.props.id == 'poison' || ail.props.id == 'badomen')
					)
				})
				statusEffectsToRemove.forEach((ail) => {
					removeStatusEffect(game, pos, ail)
				})
			})

			opponentPlayer.hooks.afterApply.add(component, () => {
				if (!row) return
				const statusEffectsToRemove = game.state.statusEffects.filterEntities((ail) => {
					return (
						ail.targetInstance.component === row.hermitCard?.component &&
						(ail.props.id == 'poison' || ail.props.id == 'badomen')
					)
				})
				statusEffectsToRemove.forEach((ail) => {
					removeStatusEffect(game, pos, ail)
				})
			})
		}
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos
		player.hooks.onDefence.remove(component)
		opponentPlayer.hooks.afterApply.remove(component)
	}
}

export default MilkBucketEffectCard
