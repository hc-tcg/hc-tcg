import {
	CardComponent,
	ObserverComponent,
	RowComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {afterAttack, beforeAttack} from '../../../types/priorities'
import {hermit} from '../../defaults'
import GoldenAxe from '../../single-use/golden-axe'
import {Hermit} from '../../types'

const LDShadowLadyRare: Hermit = {
	...hermit,
	id: 'ldshadowlady_rare',
	numericId: 211,
	name: 'Lizzie',
	expansion: 'advent_of_tcg',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 2,
	type: 'terraform',
	health: 290,
	primary: {
		name: 'Fairy Fort',
		cost: ['terraform'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Evict',
		cost: ['terraform', 'terraform', 'any'],
		damage: 90,
		power:
			"Move your opponent's active Hermit and any attached cards to an open slot on their board, if one is available. If their Hermit can't be moved, their active Hermit takes 40hp additional damage.",
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		let pickedRow: RowComponent | null = null

		const opponentHasMovableActive = () => {
			const opponentActive = game.components.find(
				SlotComponent,
				query.slot.opponent,
				query.slot.hermit,
				query.slot.active,
			)

			return (
				opponentActive !== null &&
				(!query.slot.frozen(game, opponentActive) ||
					game.components.exists(
						CardComponent,
						query.card.is(GoldenAxe),
						query.card.slot(query.slot.singleUse),
					))
			)
		}

		observer.subscribe(
			player.hooks.getAttackRequests,
			(instance, attackType) => {
				if (instance.entity !== component.entity || attackType !== 'secondary')
					return
				pickedRow = null
				if (!opponentHasMovableActive()) return

				const pickCondition = query.every(
					query.slot.hermit,
					query.slot.opponent,
					query.slot.empty,
					query.not(query.slot.active),
				)

				if (!game.components.exists(SlotComponent, pickCondition)) return

				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message: "Move your opponent's active Hermit to a new slot.",
					canPick: pickCondition,
					onResult(pickedSlot) {
						if (!pickedSlot.inRow()) return
						if (opponentPlayer.activeRow === null) return

						pickedRow = pickedSlot.row
					},
					onTimeout() {
						if (opponentPlayer.activeRow === null) return

						pickedRow = game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.not(query.row.active),
							query.not(query.row.hasHermit),
						)
					},
				})
			},
		)

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || !attack.isType('secondary'))
					return
				if (opponentPlayer.activeRow === null) return
				if (pickedRow === null) {
					attack.addDamage(component.entity, 40)
				} else {
					game.swapRows(opponentPlayer.activeRow, pickedRow)
				}
			},
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(_attack) => {
				pickedRow = null
			},
		)
	},
}

export default LDShadowLadyRare
