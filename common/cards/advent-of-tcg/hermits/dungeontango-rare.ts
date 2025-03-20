import assert from 'assert'
import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {afterAttack, beforeAttack} from '../../../types/priorities'
import {getSupportingItems} from '../../../utils/board'
import {fisherYatesShuffle} from '../../../utils/fisher-yates'
import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const DungeonTangoRare: Hermit = {
	...hermit,
	id: 'dungeontango_rare',
	numericId: 208,
	name: 'DM tango',
	expansion: 'advent_of_tcg',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 2,
	type: 'miner',
	health: 280,
	primary: {
		name: 'Lackey',
		cost: ['any'],
		damage: 40,
		power:
			'Discard 1 item card attached to this Hermit to search your deck for the first Hermit card to draw and then shuffle your deck. If you have no more Hermit cards, keep the item card attached.',
	},
	secondary: {
		name: 'Ravager',
		cost: ['miner', 'miner', 'any'],
		damage: 90,
		power: null,
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		let pickedCard: CardComponent | null = null

		observer.subscribe(
			player.hooks.getAttackRequests,
			(activeInstance, hermitAttackType) => {
				if (
					activeInstance.entity !== component.entity ||
					hermitAttackType !== 'primary'
				)
					return

				if (!component.slot.inRow()) return

				const pickableSlots = getSupportingItems(
					game,
					component.slot.row,
				).flatMap((card) =>
					query.slot.frozen(game, card.slot) ? [] : [card.slot],
				)
				const pickCondition = (_game: GameModel, value: SlotComponent) =>
					pickableSlots.includes(value)

				if (!pickableSlots.length) {
					pickedCard = null
					return
				}

				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message: 'Choose an item card to discard',
					canPick: pickCondition,
					onResult(pickedSlot) {
						pickedCard = pickedSlot.card
					},
					onTimeout() {
						const firstItem = game.components.find(SlotComponent, pickCondition)
						if (!firstItem) return
						pickedCard = firstItem.card
					},
				})
			},
		)

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || !attack.isType('primary'))
					return
				if (pickedCard === null) return

				const hermitCard = player
					.getDrawPile()
					.sort(CardComponent.compareOrder)
					.find((card) => card.isHermit())
				if (hermitCard) {
					hermitCard.draw()
					pickedCard.discard()
				}

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
			},
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(_attack) => {
				pickedCard = null
			},
		)
	},
}

export default DungeonTangoRare
