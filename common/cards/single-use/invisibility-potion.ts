import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import {GameModel} from '../../models/game-model'
import {
	InvisibilityPotionHeadsEffect,
	InvisibilityPotionTailsEffect,
} from '../../status-effects/invisibility-potion'
import {flipCoin} from '../../utils/coinFlips'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const InvisibilityPotion: SingleUse = {
	...singleUse,
	id: 'invisibility_potion',
	numericId: 44,
	name: 'Invisibility Potion',
	expansion: 'default',
	rarity: 'rare',
	tokens: 0,
	description:
		"Flip a coin.\nIf heads, your opponent's next attack misses. If tails, their attack damage doubles.",
	showConfirmationModal: true,
	sidebarDescriptions: [
		{
			type: 'glossary',
			name: 'missed',
		},
	],
	log: (values) => `${values.defaultLog}, and ${values.coinFlip}`,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onApply, () => {
			if (flipCoin(game, player, component)[0] === 'heads') {
				game.components
					.new(
						StatusEffectComponent,
						InvisibilityPotionHeadsEffect,
						component.entity,
					)
					.apply(player.entity)
			} else {
				game.components
					.new(
						StatusEffectComponent,
						InvisibilityPotionTailsEffect,
						component.entity,
					)
					.apply(player.entity)
			}
		})
	},
}

export default InvisibilityPotion
