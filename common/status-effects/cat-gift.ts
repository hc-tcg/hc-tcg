import {CardComponent, DeckSlotComponent, PlayerComponent} from '../components'
import {StatusEffect, systemStatusEffect} from './status-effect'

const CatGiftEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	icon: 'cat-gift',
	id: 'cat-gift',
	name: 'Cat Gift',
	description:
		'When drawing one card for the end of your turn, draw from the bottom of your deck instead of the top.',
	onApply(game, effect, player, observer) {
		observer.subscribeBefore(player.hooks.onTurnEnd, (drawCards) => {
			drawCards[0]?.attach(
				game.components.new(DeckSlotComponent, player.entity, {
					position: 'front',
				}),
			)
			drawCards[0] =
				player.getDeck().sort(CardComponent.compareOrder).at(-1) || null
			drawCards[0]?.draw()
			effect.remove()
		})
	},
}

export default CatGiftEffect
