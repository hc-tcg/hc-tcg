import Card from '../../base/card'
import * as query from '../../../components/query'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'

class EvilJevinRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'eviljevin_rare',
		numericId: 153,
		name: 'Evil Jevin',
		expansion: 'alter_egos_ii',
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
				'Flip a coin. If heads, choose one Hermit card from your discard pile and return it to your hand.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const modalCondition = query.every(
				query.card.currentPlayer,
				query.card.slot(query.slot.discardPile),
				query.card.isHermit
			)

			let pickableCards = game.components
				.filter(CardComponent, modalCondition)
				.map((card) => card.entity)

			if (pickableCards.length === 0) return

			const coinFlip = flipCoin(player, component, 1)
			if (coinFlip[0] !== 'heads') return

			game.addModalRequest({
				playerId: player.id,
				data: {
					modalId: 'selectCards',
					payload: {
						modalName: 'Evil Jevin: Choose a Hermit card to retrieve from your discard pile.',
						modalDescription: '',
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
