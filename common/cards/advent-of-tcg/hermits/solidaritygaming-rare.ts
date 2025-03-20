import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import ProtectedEffect from '../../../status-effects/protected'
import {afterAttack} from '../../../types/priorities'
import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const SolidaritygamingRare: Hermit = {
	...hermit,
	id: 'solidaritygaming_rare',
	numericId: 274,
	name: 'Jimmy',
	expansion: 'mcyt',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 2,
	type: ['prankster'],
	health: 270,
	primary: {
		name: 'The Law',
		cost: ['prankster', 'any'],
		damage: 70,
		power:
			'After your attack, choose one of your AFK Hermits to protect from damage on their first active turn.\nOnly one Hermit can be protected at a time.',
	},
	secondary: {
		name: 'Not a toy',
		cost: ['prankster', 'prankster', 'prankster'],
		damage: 100,
		power: null,
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	): void {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.HERMIT_ATTACK_REQUESTS,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'primary')
					return

				const pickCondition = query.every(
					query.slot.currentPlayer,
					query.slot.hermit,
					query.not(query.slot.active),
					query.not(query.slot.empty),
				)

				if (!game.components.exists(SlotComponent, pickCondition)) return

				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message: 'Choose an AFK Hermit to protect',
					canPick: pickCondition,
					onResult(pickedSlot) {
						if (!pickedSlot.inRow() || !pickedSlot.card) return

						game.components
							.new(StatusEffectComponent, ProtectedEffect, component.entity)
							.apply(pickedSlot.card?.entity)
					},
				})
			},
		)
	},
}

export default SolidaritygamingRare
