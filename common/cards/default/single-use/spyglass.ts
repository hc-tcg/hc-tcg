import {GameModel} from '../../../models/game-model'
import {query} from '../../../components/query'
import {CardComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import {getFormattedName} from '../../../utils/game'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class SpyglassSingleUseCard extends Card {
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
		log: (values) => `${values.defaultLog} and ${values.coinFlip}`,
		attachCondition: query.every(
			singleUse.attachCondition,
			(game, pos) => game.state.turn.turnNumber !== 1
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(component, () => {
			const coinFlip = flipCoin(player, component)
			const canDiscard = coinFlip[0] === 'heads' && opponentPlayer.hand.length > 0

			game.addModalRequest({
				playerId: player.id,
				data: {
					modalId: 'selectCards',
					payload: {
						modalName: `Spyglass${canDiscard ? `: Select 1 card to discard` : ''}`,
						modalDescription: '',
						cards: opponentPlayer.hand.map((card) => card.toLocalCardInstance()),
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
					const card =
						opponentPlayer.hand.find((card) => card.id === modalResult.cards![0].component) || null
					discardFromHand(opponentPlayer, card)

					game.battleLog.addEntry(
						player.id,
						`$p{You|${opponentPlayer.playerName}}$ discarded ${getFormattedName(
							modalResult.cards[0].props.id,
							true
						)} from {$o${game.opponentPlayer.playerName}'s$|your} hand`
					)

					return 'SUCCESS'
				},
				onTimeout() {
					if (canDiscard) {
						// Discard a random card from the opponent's hand
						const slotIndex = Math.floor(Math.random() * opponentPlayer.hand.length)
						discardFromHand(opponentPlayer, opponentPlayer.hand[slotIndex])
					}
				},
			})
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onApply.remove(component)
	}
}

export default SpyglassSingleUseCard
