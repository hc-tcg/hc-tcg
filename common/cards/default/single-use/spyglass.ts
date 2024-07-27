import {GameModel} from '../../../models/game-model'
import query from '../../../components/query'
import {CardComponent, ObserverComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import {getFormattedName} from '../../../utils/game'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class Spyglass extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'spyglass',
		numericId: 91,
		name: 'Spyglass',
		expansion: 'default',
		rarity: 'common',
		tokens: 1,
		description:
			"Look at your opponent's hand, and then flip a coin.\nIf heads, choose one card to discard from your opponent's hand.",
		showConfirmationModal: true,
		log: (values) => `${values.defaultLog}, and ${values.coinFlip}`,
		attachCondition: query.every(
			singleUse.attachCondition,
			(game, _pos) => game.state.turn.turnNumber !== 1
		),
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onApply, () => {
			const coinFlip = flipCoin(player, component)
			const canDiscard = coinFlip[0] === 'heads' && opponentPlayer.getHand().length > 0

			const getEntry = (card: CardComponent): string => {
				return `$p{You|${opponentPlayer.playerName}}$ discarded ${getFormattedName(
					card.props.id,
					true
				)} from {$o${game.opponentPlayer.playerName}'s$|your} hand`
			}

			game.addModalRequest({
				playerId: player.id,
				data: {
					modalId: 'selectCards',
					payload: {
						modalName: `Spyglass${canDiscard ? `: Select 1 card to discard` : ''}`,
						modalDescription: '',
						cards: opponentPlayer.getHand().map((card) => card.entity),
						selectionSize: canDiscard ? 1 : 0,
						primaryButton: {
							text: canDiscard ? 'Confirm Selection' : 'Close',
							variant: 'default',
						},
					},
				},
				onResult(modalResult) {
					if (!modalResult) return 'FAILURE_INVALID_DATA'
					if (!canDiscard) return 'SUCCESS'

					if (!modalResult.cards || modalResult.cards.length !== 1) return 'FAILURE_INVALID_DATA'

					let card = game.components.get(modalResult.cards[0].entity)
					if (!card) return 'FAILURE_INVALID_DATA'

					card.discard()

					game.battleLog.addEntry(player.entity, getEntry(card))

					return 'SUCCESS'
				},
				onTimeout() {
					if (canDiscard) {
						// Discard a random card from the opponent's hand
						let opponentHand = opponentPlayer.getHand()
						const slotIndex = Math.floor(Math.random() * opponentHand.length)
						game.battleLog.addEntry(player.entity, getEntry(opponentHand[slotIndex]))
						opponentHand[slotIndex].discard()
					}
				},
			})
		})
	}
}

export default Spyglass
