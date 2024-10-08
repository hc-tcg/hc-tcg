import {CardComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import CardOld from '../../base/card'
import {hermit} from '../defaults'
import {Hermit} from '../types'

class ShubbleYTRare extends CardOld {
	props: Hermit = {
		...hermit,
		id: 'shubbleyt_rare',
		numericId: 217,
		name: 'Shelby',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 1,
		type: 'terraform',
		health: 300,
		primary: {
			name: 'Good Witch',
			cost: ['terraform'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Parallel World',
			cost: ['terraform', 'terraform'],
			damage: 80,
			power:
				'After your attack, view the top card of your deck. You may choose to place it on the bottom of your deck.',
		},
	}

	public override onAttach(game: GameModel, component: CardComponent): void {
		const {player} = component

		player.hooks.afterAttack.add(component, (attack) => {
			if (attack.id !== this.getInstanceKey(component)) return
			if (attack.type !== 'secondary') return

			game.addModalRequest({
				player: player.entity,
				modall: {
					type: 'selectCards',
					payload: {
						modalName: 'Shelby - Parallel World',
						modalDescription: 'Place your top card on bottom of deck?',
						cards: [player.pile[0].toLocalCardInstance()],
						selectionSize: 0,
						primaryButton: {
							text: 'Place on Bottom',
							variant: 'primary',
						},
						secondaryButton: {
							text: 'Do Nothing',
							variant: 'secondary',
						},
					},
				},
				onResult(modalResult) {
					if (!modalResult) return 'SUCCESS'
					if (!modalResult.result) return 'SUCCESS'

					const topCard = player.pile.shift()
					if (!topCard) return 'SUCCESS'
					player.pile.push(topCard)

					return 'SUCCESS'
				},
				onTimeout() {},
			})
		})
	}

	public override onDetach(_game: GameModel, component: CardComponent): void {
		const {player} = component

		player.hooks.afterAttack.remove(component)
	}
}

export default ShubbleYTRare
