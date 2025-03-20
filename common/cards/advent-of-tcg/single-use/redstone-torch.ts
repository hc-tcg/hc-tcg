import assert from 'assert'
import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {executeExtraAttacks} from '../../../utils/attacks'
import {fisherYatesShuffle} from '../../../utils/fisher-yates'
import {singleUse} from '../../defaults'
import TNT from '../../single-use/tnt'
import {SingleUse} from '../../types'
import MinecartWithTNT from './tnt-minecart'

const RedstoneTorch: SingleUse = {
	...singleUse,
	id: 'redstone_torch',
	numericId: 1399,
	name: 'Redstone Torch',
	expansion: 'minecraft',
	rarity: 'rare',
	tokens: 3,
	description:
		"Detonate all the TNT and TNT Minecarts in your deck. Discard the cards adjacent to each TNT. Deal 40hp damage to your Opponent's Active Hermit for each TNT detonated. Afterwards, shuffle your deck.",
	showConfirmationModal: true,
	attachCondition: query.every(
		singleUse.attachCondition,
		query.slot.opponentHasActiveHermit,
		(_game, pos) => pos.player.getDrawPile().length > 0,
	),
	log: (values) => values.defaultLog,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component
		observer.subscribe(player.hooks.onApply, () => {
			const tntCardEntities = game.components.filterEntities(
				CardComponent,
				query.card.slot(query.slot.deck, query.slot.currentPlayer),
				query.card.is(TNT, MinecartWithTNT),
			)

			const playerDeck = player.getDrawPile().sort(CardComponent.compareOrder)

			const tntAdjacentCards = playerDeck.reduce(
				(reducer: Array<CardComponent>, card, i) => {
					if (
						(i < playerDeck.length - 1 &&
							tntCardEntities.includes(playerDeck[i + 1].entity)) ||
						(i > 0 && tntCardEntities.includes(playerDeck[i - 1].entity)) ||
						tntCardEntities.includes(card.entity)
					) {
						return [...reducer, card]
					}
					return reducer
				},
				[],
			)

			game.addModalRequest({
				player: player.entity,
				modal: {
					type: 'selectCards',
					name: 'Redstone Torch',
					description: 'These cards are going to be discarded.',
					cards: tntAdjacentCards.map((card) => card.entity),
					selectionSize: 0,
					primaryButton: {
						text: 'Detonate',
						variant: 'error',
					},
					cancelable: false,
				},
				onResult(modalResult) {
					if (!modalResult) return

					tntAdjacentCards.forEach((card) => card.discard())

					const tntAttack = game
						.newAttack({
							attacker: component.entity,
							player: player.entity,
							target: opponentPlayer.activeRowEntity,
							type: 'effect',
							log: (values) =>
								`${values.player} detonated their ${tntCardEntities.length} $e${TNT.name}$ with $e${RedstoneTorch.name}$ to attack ${values.target} for ${values.damage} damage `,
						})
						.addDamage(component.entity, 40 * tntCardEntities.length)

					executeExtraAttacks(game, [tntAttack])

					const deckCards = player.getDrawPile()
					const newOrder = fisherYatesShuffle(
						deckCards.map((card) => {
							assert(card.slot.inDeck())
							return card.slot.order
						}),
						game.rng,
					)
					deckCards.forEach((card, i) => {
						assert(card.slot.inDeck())
						card.slot.order = newOrder[i]
					})

					return 'SUCCESS'
				},
				onTimeout() {
					// Do nothing
				},
			})
		})
	},
}

export default RedstoneTorch
