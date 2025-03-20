import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import DyedEffect from '../../../status-effects/dyed'
import {afterAttack} from '../../../types/priorities'
import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const Smajor1995Rare: Hermit = {
	...hermit,
	id: 'smajor1995_rare',
	numericId: 276,
	name: 'Scott',
	expansion: 'mcyt',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 0,
	type: ['builder'],
	health: 270,
	primary: {
		name: 'Color Splash',
		cost: ['any'],
		damage: 30,
		power: null,
	},
	secondary: {
		name: 'To Dye For',
		cost: ['any', 'any', 'any'],
		damage: 70,
		power:
			'After your attack, select one of your AFK Hermits to use items of any type.',
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
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				const pickCondition = query.every(
					query.slot.currentPlayer,
					query.slot.hermit,
					query.not(query.slot.active),
					query.not(query.slot.empty),
				)

				if (
					!game.components.exists(
						SlotComponent,
						pickCondition,
						query.not(query.slot.hasStatusEffect(DyedEffect)),
					)
				)
					return

				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message: 'Choose an AFK Hermit to dye.',
					canPick: pickCondition,
					onResult(pickedSlot) {
						const pickedCard = pickedSlot.card
						if (!pickedCard) return

						game.components
							.new(StatusEffectComponent, DyedEffect, component.entity)
							.apply(pickedCard.entity)
					},
				})
			},
		)
	},
}

export default Smajor1995Rare
