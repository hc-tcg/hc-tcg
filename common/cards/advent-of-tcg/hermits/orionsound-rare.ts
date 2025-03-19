import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import MelodyEffect from '../../../status-effects/melody'
import {afterAttack} from '../../../types/priorities'
import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const OrionSoundRare: Hermit = {
	...hermit,
	id: 'orionsound_rare',
	numericId: 464,
	name: 'Oli',
	expansion: 'mcyt',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 1,
	type: ['speedrunner'],
	health: 280,
	primary: {
		name: 'Melody',
		cost: ['speedrunner'],
		damage: 60,
		power:
			'Select an Active or AFK Hermit. Selected Hermit is healed by 10hp every turn until this Hermit is knocked out.',
	},
	secondary: {
		name: 'Concert',
		cost: ['speedrunner', 'speedrunner'],
		damage: 80,
		power: null,
	},
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
				if (!attack.isAttacker(component.entity) || attack.type !== 'primary')
					return

				const pickCondition = query.every(
					query.slot.hermit,
					query.not(query.slot.empty),
				)

				if (
					!game.components.exists(
						SlotComponent,
						pickCondition,
						query.not(query.slot.hasStatusEffect(MelodyEffect)),
					)
				)
					return

				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message: 'Choose an Active or AFK Hermit to heal.',
					canPick: pickCondition,
					onResult(pickedSlot) {
						const pickedCard = pickedSlot.card
						if (!pickedCard) return

						game.components
							.new(StatusEffectComponent, MelodyEffect, component.entity)
							.apply(pickedCard.entity)
					},
				})
			},
		)
	},
}

export default OrionSoundRare
