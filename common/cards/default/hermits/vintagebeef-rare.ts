import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {CardComponent, StatusEffectComponent} from '../../../components'
import {card, effect, slot} from '../../../components/query'

class VintageBeefRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'vintagebeef_rare',
		numericId: 103,
		name: 'Beef',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		type: 'builder',
		health: 290,
		primary: {
			name: 'Pojk',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Beefy Tunes',
			cost: ['builder', 'builder'],
			damage: 80,
			power:
				'Flip a coin.\nIf heads, all status effects are removed from your active and AFK Hermits.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: Observer) {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const coinFlip = flipCoin(player, component)
			if (coinFlip[0] !== 'heads') return

			game.components
				.filter(
					StatusEffectComponent,
					effect.type('normal', 'damage'),
					effect.target(card.currentPlayer, card.slot(slot.hermitSlot))
				)
				.forEach((effect) => effect.remove())
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default VintageBeefRare
