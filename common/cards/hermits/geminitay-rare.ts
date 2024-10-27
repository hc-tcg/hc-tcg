import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {afterAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

// Because of this card we can't rely elsewhere on the suCard to be in state on turnEnd hook
const GeminiTayRare: Hermit = {
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
		power:
			'At the end of your turn, you may use an additional single use effect card.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.HERMIT_REMOVE_SINGLE_USE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				// Discard the single-use card.
				game.components
					.find(CardComponent, query.card.slot(query.slot.singleUse))
					?.discard()

				// We are hooking into afterAttack, so we just remove the blocks on actions
				// The beauty of this is that there is no need to replicate any of the existing logic anymore
				game.removeCompletedActions('SINGLE_USE_ATTACK', 'PLAY_SINGLE_USE_CARD')
				game.removeBlockedActions(
					'game',
					'SINGLE_USE_ATTACK',
					'PLAY_SINGLE_USE_CARD',
				)
				player.singleUseCardUsed = false
			},
		)
	},
}

export default GeminiTayRare
