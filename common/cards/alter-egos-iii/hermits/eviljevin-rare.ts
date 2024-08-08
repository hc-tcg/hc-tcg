import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class EvilJevinRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'eviljevin_rare',
		numericId: 153,
		name: 'Evil Jevin',
		expansion: 'alter_egos_iii',
		palette: 'alter_egos',
		background: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		type: 'speedrunner',
		health: 280,
		primary: {
			name: 'Ambush',
			cost: ['speedrunner'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Emerge',
			cost: ['speedrunner', 'speedrunner'],
			damage: 80,
			power:
				'Flip a coin.\nIf heads, choose one Hermit card from your discard pile and return it to your hand.',
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

			const modalCondition = query.every(
				query.card.currentPlayer,
				query.card.slot(query.slot.discardPile),
				query.card.isHermit,
			)

			let pickableCards = game.components
				.filter(CardComponent, modalCondition)
				.map((card) => card.entity)

			if (pickableCards.length === 0) return

			const coinFlip = flipCoin(player, component, 1)
			if (coinFlip[0] !== 'heads') return

			game.addModalRequest({
				player: player.entity,
				data: {
					modalId: 'selectCards',
					payload: {
						modalName: 'Evil Jevin - Emerge',
						modalDescription:
							'Choose a Hermit card to retrieve from your discard pile.',
						cards: pickableCards,
						selectionSize: 1,
						primaryButton: {
							text: 'Draw Card',
							variant: 'default',
						},
						secondaryButton: {
							text: 'Do Nothing',
							variant: 'default',
						},
					},
				},
				onResult(modalResult) {
					if (!modalResult?.result) return 'SUCCESS'
					if (!modalResult.cards) return 'FAILURE_INVALID_DATA'
					if (modalResult.cards.length !== 1) return 'FAILURE_CANNOT_COMPLETE'

					let card = game.components.get(modalResult.cards[0].entity)
					card?.draw()

					return 'SUCCESS'
				},
				onTimeout() {
					// Do nothing
				},
			})
		})
	}
}

export default EvilJevinRare
