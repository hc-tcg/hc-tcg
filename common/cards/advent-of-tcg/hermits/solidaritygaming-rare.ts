import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {applyStatusEffect, removeStatusEffect} from '../../../utils/board'
import {slot} from '../../../filters'
import Card, {Hermit, hermit} from '../../base/card'
import {CardComponent} from '../../../types/game-state'

class SolidaritygamingRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'solidaritygaming_rare',
		numericId: 220,
		name: 'Jimmy',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 2,
		type: 'prankster',
		health: 270,
		primary: {
			name: 'The Law',
			cost: ['prankster', 'any'],
			damage: 70,
			power:
				'After your attack, choose one of your AFK Hermits to protect. This Hermit does not take damage on their first active turn.\nOnly one Hermit can be protected at a time.',
		},
		secondary: {
			name: 'Not a toy',
			cost: ['prankster', 'prankster', 'prankster'],
			damage: 100,
			power: null,
		},
	}

	public override onAttach(game: GameModel, instance: CardComponent, pos: CardPosModel): void {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'primary') return
			player.board.rows.forEach((row) => {
				if (!row.hermitCard) return

				const statusEffectsToRemove = game.state.statusEffects.filter((ail) => {
					return (
						ail.targetInstance.instance === row.hermitCard.instance &&
						ail.statusEffect.props.id === 'protected'
					)
				})

				statusEffectsToRemove.forEach((ail) => {
					removeStatusEffect(game, pos, ail)
				})
			})

			const pickCondition = slot.every(
				slot.player,
				slot.not(slot.activeRow),
				slot.not(slot.empty),
				slot.hermitSlot
			)

			if (!game.someSlotFulfills(pickCondition)) return

			game.addPickRequest({
				playerId: player.id,
				id: instance.entity,
				message: 'Choose an AFK Hermit to protect',
				canPick: pickCondition,
				onResult(pickedSlot) {
					const rowIndex = pickedSlot.rowIndex
					if (!pickedSlot.cardId || rowIndex === null) return

					applyStatusEffect(game, 'protected', pickedSlot.cardId)
				},
			})
		})
	}

	public override onDetach(game: GameModel, instance: CardComponent, pos: CardPosModel): void {
		const {player} = pos
		player.hooks.onAttack.remove(instance)
	}
}

export default SolidaritygamingRareHermitCard
