import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import BetrayedEffect from '../../status-effects/betrayed'
import {beforeAttack} from '../../types/priorities'
import {PickRequest} from '../../types/server-requests'
import {getSupportingItems} from '../../utils/board'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const HypnotizdRare: Hermit = {
	...hermit,
	id: 'hypnotizd_rare',
	numericId: 37,
	name: 'Hypno',
	expansion: 'default',
	rarity: 'rare',
	tokens: 3,
	type: 'miner',
	health: 270,
	primary: {
		name: 'MmHmm',
		cost: ['miner'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: "Got 'Em",
		cost: ['miner', 'any'],
		damage: 70,
		power:
			"You can choose to attack one of your opponent's AFK Hermits. If you do this, you must discard one item card attached to your active Hermit.",
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	): void {
		const {player, opponentPlayer} = component
		let target: SlotComponent | null = null
		let item: CardComponent | null = null

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_SET_TARGET,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return
				if (!target?.inRow() || !item) return
				attack.setTarget(component.entity, target.row.entity)
				item.discard()
				target = null
				item = null
			},
		)

		observer.subscribe(
			player.hooks.getAttackRequests,
			(activeInstance, hermitAttackType) => {
				item = null
				if (
					activeInstance.entity !== component.entity ||
					hermitAttackType !== 'secondary'
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

				// Betrayed ignores the slot that you pick in this pick request, so we skip this pick request
				// to make the game easier to follow.
				if (player.hasStatusEffect(BetrayedEffect)) return

				if (
					!game.components.exists(
						CardComponent,
						query.card.opponentPlayer,
						query.card.afk,
					)
				)
					return

				if (!game.components.exists(SlotComponent, pickCondition)) return

				const itemRequest: PickRequest = {
					player: player.entity,
					id: component.entity,
					message: 'Choose an item to discard from your active Hermit.',
					canPick: pickCondition,
					onResult(pickedSlot) {
						item = pickedSlot.card
					},
					onTimeout() {
						item =
							game.components.find(SlotComponent, pickCondition)?.card || null
					},
				}

				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message: "Pick one of your opponent's Hermits",
					canPick: query.every(
						query.slot.opponent,
						query.slot.hermit,
						query.not(query.slot.empty),
					),
					onResult: (pickedSlot) => {
						if (!pickedSlot.inRow()) return
						const targetingAfk =
							pickedSlot.rowEntity !== opponentPlayer.activeRowEntity

						// Store the row index to use later
						target = pickedSlot

						if (targetingAfk) {
							// Add a second pick request to remove an item
							game.addPickRequest(itemRequest)
						}
					},
				})
			},
		)
	},
}

export default HypnotizdRare
