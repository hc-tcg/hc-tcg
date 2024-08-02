import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

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

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
				return

			let removeFrom = game.components.filter(
				StatusEffectComponent,
				query.effect.type('normal', 'damage'),
				query.effect.targetIsCardAnd(
					query.card.currentPlayer,
					query.card.slot(query.slot.hermit),
				),
			)

			if (removeFrom.length === 0) return

			const coinFlip = flipCoin(player, component)
			if (coinFlip[0] !== 'heads') return

			removeFrom.forEach((effect) => effect.remove())
		})
	}
}

export default VintageBeefRare
