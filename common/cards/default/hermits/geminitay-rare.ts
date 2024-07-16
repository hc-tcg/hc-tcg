import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {card} from '../../../components/query'

// Because of this card we can't rely elsewhere on the suCard to be in state on turnEnd hook
class GeminiTayRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'geminitay_rare',
		numericId: 28,
		name: 'Gem',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		type: 'terraform',
		health: 270,
		primary: {
			name: "It's Fine",
			cost: ['terraform'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Geminislay',
			cost: ['terraform', 'terraform'],
			damage: 80,
			power: 'At the end of your turn, you may use an additional single use effect card.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			if (attack.attacker?.entity !== component.entity || attack.type !== 'secondary') return

			player.hooks.afterAttack.add(component, (_attack) => {
				// Discard the single-use card.
				game.components.find(CardComponent, card.isSingleUse, card.active)?.discard()

				// We are hooking into afterAttack, so we just remove the blocks on actions
				// The beauty of this is that there is no need to replicate any of the existing logic anymore
				game.removeCompletedActions('SINGLE_USE_ATTACK', 'PLAY_SINGLE_USE_CARD')
				game.removeBlockedActions('game', 'PLAY_SINGLE_USE_CARD')

				player.hooks.afterAttack.remove(component)
			})
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component

		// Remove hook
		player.hooks.onAttack.remove(component)
	}
}

export default GeminiTayRare
