import CardOld from '../../base/card'
import {CardComponent} from '../../components'
import {slot} from '../../components/query'
import {GameModel} from '../../models/game-model'
import {hermit} from '../defaults'
import {Hermit} from '../types'

class SolidaritygamingRare extends CardOld {
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

	public override onAttach(game: GameModel, component: CardComponent): void {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			if (
				attack.id !== this.getInstanceKey(component) ||
				attack.type !== 'primary'
			)
				return
			player.board.rows.forEach((row) => {
				if (!row.hermitCard) return

				const statusEffectsToRemove = game.state.statusEffects.filterEntities(
					(ail) => {
						return (
							ail.targetInstance.component === row.hermitCard.component &&
							ail.statusEffect.props.id === 'protected'
						)
					},
				)

				statusEffectsToRemove.forEach((ail) => {
					removeStatusEffect(game, pos, ail)
				})
			})

			const pickCondition = slot.every(
				slot.player,
				slot.not(slot.active),
				slot.not(slot.empty),
				slot.hermit,
			)

			if (!game.someSlotFulfills(pickCondition)) return

			game.addPickRequest({
				player: player.entity,
				id: component.entity,
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

	public override onDetach(_game: GameModel, component: CardComponent): void {
		const {player} = component
		player.hooks.onAttack.remove(component)
	}
}

export default SolidaritygamingRare
