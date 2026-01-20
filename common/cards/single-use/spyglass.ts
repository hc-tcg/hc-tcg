import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {flipCoin} from '../../utils/coin-flips'
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
			flipCoin(
				(coinFlip) => {
					const canDiscard = coinFlip[0] === 'heads'

					const getEntry = (card: CardComponent): string => {
						return `$p{You|${player.playerName}}$ discarded ${getFormattedName(
							card.props.id,
							true,
						)} from {$o${opponentPlayer.playerName}'s$|your} hand`
					}

					//@todo Redo spyglass entirely
					game.addModalRequest({
						player: player.entity,
						modal: {
							type: 'spyglass',
							canDiscard: canDiscard,
						},
						onResult(modalResult) {
							if (!modalResult) return
							if (!canDiscard) return
							if (!modalResult.cards || modalResult.cards.length !== 1) return

							console.log(
								game.components.filter(
									CardComponent,
									query.card.opponentPlayer,
									query.card.slot(query.slot.hand),
								),
							)

							let card = game.components.find(
								CardComponent,
								query.card.entity(modalResult.cards[0]),
							)
							if (!card) return

							card.discard()

							game.battleLog.addEntry(player.entity, getEntry(card))
						},
						onTimeout() {
							// Do nothing, this is the easiest to implement
						},
					})
				},
				game,
				player,
				component,
			)
		})
	},
}

export default Spyglass
