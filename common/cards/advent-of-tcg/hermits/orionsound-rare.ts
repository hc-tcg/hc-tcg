import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import MelodyEffect from '../../../status-effects/melody'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const OrionSoundRare: Hermit = {
	...hermit,
	id: 'orionsound_rare',
	numericId: 213,
	name: 'Oli',
	expansion: 'advent_of_tcg',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 1,
	type: 'speedrunner',
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

		let cardsWithStatusEffects: Array<string> = []

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'primary')
				return

			game.addPickRequest({
				player: player.entity,
				id: component.entity,
				message: 'Choose an Active or AFK Hermit to heal.',
				canPick: query.every(query.not(query.slot.empty)),
				onResult(pickedSlot) {
					const pickedCard = pickedSlot.getCard()
					if (!pickedCard) return

					game.components
						.new(StatusEffectComponent, MelodyEffect, component.entity)
						.apply(pickedCard.entity)
					cardsWithStatusEffects.push(pickedCard.entity)
				},
			})
		})
	},
}

export default OrionSoundRare
