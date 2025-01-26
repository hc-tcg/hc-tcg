import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {flipCoin} from '../../utils/coinFlips'
import {getFormattedName} from '../../utils/game'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const Spyglass: SingleUse = {
	...singleUse,
	id: 'spyglass',
	numericId: 91,
	name: 'Spyglass',
	expansion: 'default',
	rarity: 'rare',
	tokens: 1,
	description:
		"Look at your opponent's hand, and then flip a coin.\nIf heads, choose one card to discard from your opponent's hand.",
	showConfirmationModal: true,
	log: (values) => `${values.defaultLog}, and ${values.coinFlip}`,
	attachCondition: query.every(
		singleUse.attachCondition,
		(game, _pos) => game.state.turn.turnNumber !== 1,
	),
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onApply, () => {
			const coinFlip = flipCoin(game, player, component)
			const canDiscard =
				coinFlip[0] === 'heads' && opponentPlayer.getHand().length > 0

			const getEntry = (card: CardComponent): string => {
				return `$p{You|${player.playerName}}$ discarded ${getFormattedName(
					card.props.id,
					true,
				)} from {$o${opponentPlayer.playerName}'s$|your} hand`
			}

			game.addModalRequest({
				player: player.entity,
				modal: {
					type: 'selectCards',
					name: 'Spyglass',
					description: canDiscard ? 'Select 1 card to discard' : '',
					cards: opponentPlayer.getHand().map((card) => card.entity),
					selectionSize: canDiscard ? 1 : 0,
					cancelable: true,
					primaryButton: {
						text: canDiscard ? 'Confirm Selection' : 'Close',
						variant: 'default',
					},
				},
				onResult(modalResult) {
					if (!modalResult) return
					if (!canDiscard) return

					if (!modalResult.cards || modalResult.cards.length !== 1) return

					let card = game.components.get(modalResult.cards[0].entity)
					if (!card) return

					card.discard()

					game.battleLog.addEntry(player.entity, getEntry(card))

					return
				},
				onTimeout() {
					if (canDiscard) {
						// Discard a random card from the opponent's hand
						let opponentHand = opponentPlayer.getHand()
						const slotIndex = Math.floor(game.rng() * opponentHand.length)
						game.battleLog.addEntry(
							player.entity,
							getEntry(opponentHand[slotIndex]),
						)
						opponentHand[slotIndex].discard()
					}
				},
			})
		})
	},
}

export default Spyglass
