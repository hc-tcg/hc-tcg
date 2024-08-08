import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import RoyalProtectionEffect from '../../../status-effects/royal-protection'
import CardOld from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class PrincessGemRare extends CardOld {
	props: Hermit = {
		...hermit,
		id: 'princessgem_rare',
		numericId: 168,
		name: 'Princess Gem',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		type: 'speedrunner',
		health: 270,
		primary: {
			name: 'Sunny Days',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Empire',
			cost: ['speedrunner', 'speedrunner', 'any'],
			damage: 90,
			power:
				'After your attack, grant Royal Protection to one of your AFK Hermits until the start of your next turn.',
		},
		sidebarDescriptions: [
			{
				type: 'statusEffect',
				name: 'royal_protection',
			},
		],
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
				return

			const pickCondition = query.every(
				query.slot.currentPlayer,
				query.slot.hermit,
				query.not(query.slot.empty),
				query.not(query.slot.active),
				query.not(query.slot.hasStatusEffect(RoyalProtectionEffect)),
			)

			if (!game.components.exists(SlotComponent, pickCondition)) return

			game.addPickRequest({
				player: player.entity,
				id: component.entity,
				message: 'Pick one of your AFK Hermits',
				canPick: pickCondition,
				onResult: (pickedSlot) => {
					game.components
						.new(StatusEffectComponent, RoyalProtectionEffect, component.entity)
						.apply(pickedSlot.getCard()?.entity)
				},
			})
		})
	}
}

export default PrincessGemRare
