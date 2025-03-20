import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import RoyalProtectionEffect from '../../status-effects/royal-protection'
import {afterAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const PrincessGemRare: Hermit = {
	...hermit,
	id: 'princessgem_rare',
	numericId: 1243,
	name: 'Princess Gem',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'rare',
	tokens: 1,
	type: ['speedrunner'],
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
			name: 'royal-protection',
		},
	],
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.HERMIT_ATTACK_REQUESTS,
			(attack) => {
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
							.new(
								StatusEffectComponent,
								RoyalProtectionEffect,
								component.entity,
							)
							.apply(pickedSlot.card?.entity)
					},
				})
			},
		)
	},
}

export default PrincessGemRare
