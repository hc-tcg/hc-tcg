import {GameModel} from '../../../models/game-model'
import {discardCard} from '../../../utils/movement'
import {applySingleUse, removeStatusEffect} from '../../../utils/board'
import {query, slot} from '../../../components/query'
import Card from '../../base/card'
import {attach, singleUse} from '../../base/defaults'
import {CardComponent} from '../../../components'
import {Attach, SingleUse} from '../../base/types'

class WaterBucketEffectCard extends Card {
	props: Attach & SingleUse = {
		...attach,
		...singleUse,
		category: 'attach',
		id: 'water_bucket',
		expansion: 'default',
		numericId: 105,
		name: 'Water Bucket',
		rarity: 'common',
		tokens: 2,
		description:
			'Remove burn and String from one of your Hermits.\nIf attached, prevents the Hermit this card is attached to from being burned.',
		attachCondition: query.some(attach.attachCondition, singleUse.attachCondition),
		log: (values) => {
			if (values.pos.slotType === 'single_use')
				return `${values.defaultLog} on $p${values.pick.name}$`
			return `$p{You|${values.player}}$ attached $e${this.props.name}$ to $p${values.pos.hermitCard}$`
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer, rowId: row} = component
		if (pos.type === 'single_use') {
			game.addPickRequest({
				playerId: player.id,
				id: this.props.id,
				message: 'Pick one of your Hermits',
				canPick: slot.every(slot.player, slot.hermitSlot, slot.not(slot.empty)),
				onResult(pickedSlot) {
					if (pickedSlot.rowIndex === null) return

					const statusEffectsToRemove = game.state.statusEffects.filterEntities((ail) => {
						return (
							ail.targetInstance.component === pickedSlot.cardId?.component &&
							ail.props.id == 'fire'
						)
					})
					statusEffectsToRemove.forEach((ail) => {
						removeStatusEffect(game, pos, ail)
					})

					if (player.board.rows[pickedSlot.rowIndex].effectCard?.props.id === 'string') {
						discardCard(game, player.board.rows[pickedSlot.rowIndex].effectCard)
					}
					for (let i = 0; i < player.board.rows[pickedSlot.rowIndex].itemCards.length; i++) {
						if (player.board.rows[pickedSlot.rowIndex].itemCards[i]?.props.id === 'string') {
							discardCard(game, player.board.rows[pickedSlot.rowIndex].itemCards[i])
						}
					}

					applySingleUse(game, pickedSlot)
				},
			})
		} else if (pos.type === 'attach') {
			// Straight away remove fire
			const fireStatusEffect = game.state.statusEffects.findEntity((ail) => {
				return ail.targetInstance.component === row?.hermitCard?.component && ail.props.id == 'fire'
			})
			if (fireStatusEffect) {
				removeStatusEffect(game, pos, fireStatusEffect)
			}

			player.hooks.onDefence.add(component, (attack) => {
				if (!row) return
				const statusEffectsToRemove = game.state.statusEffects.filterEntities((ail) => {
					return (
						ail.targetInstance.component === row.hermitCard?.component && ail.props.id == 'fire'
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
						ail.targetInstance.component === row.hermitCard?.component && ail.props.id == 'fire'
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
		opponentPlayer.hooks.afterApply.remove(component)
		player.hooks.onDefence.remove(component)
	}
}

export default WaterBucketEffectCard
