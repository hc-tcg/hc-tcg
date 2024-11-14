import assert from 'assert'
import {
	CardComponent,
	type ObserverComponent,
	type PlayerComponent,
} from '../../../components'
import query from '../../../components/query'
import {type CardEntity} from '../../../entities'
import {type GameModel} from '../../../models/game-model'
import type ComponentTable from '../../../types/ecs'
import {type SelectCards} from '../../../types/modal-requests'
import {executeExtraAttacks} from '../../../utils/attacks'
import {fisherYatesShuffle} from '../../../utils/fisher-yates'
import {singleUse} from '../../defaults'
import TNT from '../../single-use/tnt'
import {type SingleUse} from '../../types'
import MinecartWithTNT from './tnt-minecart'

const RedstoneTorch: SingleUse = {
	...singleUse,
	id: 'redstone_torch',
	numericId: 252,
	name: 'Redstone Torch',
	expansion: 'advent_of_tcg_ii',
	rarity: 'rare',
	tokens: 3,
	description:
		"Detonate all the TNT and TNT Minecarts in your deck. Discard the cards adjacent to each TNT. Deal 40hp damage to your Opponent's Active Hermit for each TNT detonated. Afterwards, shuffle your deck.",
	showConfirmationModal: true,
	attachCondition: query.every(
		singleUse.attachCondition,
		query.slot.opponentHasActiveHermit,
		(_game, pos) => pos.player.getDeck().length > 0,
	),
	log: (values) => values.defaultLog,
	onAttach: (
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) => {
		const {player} = component
		observer.subscribe(player.hooks.onApply, handleApply({game, component}))
	},
}

type handleApplyProps = {
	game: GameModel
	component: CardComponent
}
function handleApply({game, component}: handleApplyProps): () => void {
	return () => {
		const {player, opponentPlayer, entity} = component
		const tntCardEntities = getTntCardEntities(game.components)
		const tntAdjacentCards = getTntAdjacentCards(
			player.getDeck(),
			tntCardEntities,
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

			onResult: handleResult({
				tntAdjacentCards,
				opponentPlayer,
				componentEntity: entity,
				tntCardEntities,
				player,
				game,
			}),
			onTimeout() {
				// Do nothing
			},
		})
	}
	function getTntCardEntities(components: ComponentTable) {
		return components.filterEntities(
			CardComponent,
			query.card.slot(query.slot.deck, query.slot.currentPlayer),
			query.card.is(TNT, MinecartWithTNT),
		)
	}
	function getTntAdjacentCards(
		playerDeck: CardComponent[],
		tntCardEntities: CardEntity[],
	) {
		playerDeck.sort(CardComponent.compareOrder)

		return playerDeck.filter((card, i) => {
			const followingCardIsTnt =
				i < playerDeck.length - 1 &&
				tntCardEntities.includes(playerDeck[i + 1].entity)

			const previousCardIsTnt =
				i > 0 && tntCardEntities.includes(playerDeck[i - 1].entity)

			return (
				followingCardIsTnt ||
				previousCardIsTnt ||
				tntCardEntities.includes(card.entity)
			)
		})
	}
}

type handleResultProps = {
	tntAdjacentCards: CardComponent[]
	opponentPlayer: PlayerComponent
	player: PlayerComponent
	componentEntity: CardEntity
	game: GameModel
	tntCardEntities: CardEntity[]
}
function handleResult({
	tntAdjacentCards,
	game,
	componentEntity,
	player,
	opponentPlayer,
	tntCardEntities,
}: handleResultProps) {
	return (modalResult: SelectCards.Result) => {
		if (!modalResult) return

		tntAdjacentCards.forEach((card) => card.discard())
		const tntAttack = createTntAttack()
		executeExtraAttacks(game, [tntAttack])
		shuffleCards(player.getDeck())

		return 'SUCCESS'
	}

	function createTntAttack() {
		return game
			.newAttack({
				attacker: componentEntity,
				player: player.entity,
				target: opponentPlayer.activeRowEntity,
				type: 'effect',
				log: (values) =>
					`${values.player} detonated their ${tntCardEntities.length} $e${TNT.name}$ with $e${RedstoneTorch.name}$ to attack ${values.target} for ${values.damage} damage `,
			})
			.addDamage(componentEntity, 40 * tntCardEntities.length)
	}

	function shuffleCards(deckCards: CardComponent[]) {
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
		deckCards.forEach((card) => card.hooks.onChangeSlot.call(card.slot))
	}
}

export default RedstoneTorch
