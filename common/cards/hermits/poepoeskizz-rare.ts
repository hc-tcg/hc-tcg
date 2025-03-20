import {
	CardComponent,
	ObserverComponent,
	RowComponent,
	SlotComponent,
} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {afterAttack, beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const PoePoeSkizzRare: Hermit = {
	...hermit,
	id: 'poepoeskizz_rare',
	numericId: 1224,
	name: 'Poe Poe Skizz',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'rare',
	tokens: 1,
	type: ['pvp'],
	health: 250,
	primary: {
		name: 'Teardown',
		cost: ['pvp'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Jumpscare',
		cost: ['pvp', 'pvp', 'any'],
		damage: 90,
		power:
			'After your attack, you can choose to move your active Hermit and any attached cards to any open row on the game board, and then do an additional 20hp damage to the Hermit directly opposite your active Hermit.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		let pickedRow: RowComponent | null = null

		observer.subscribe(
			player.hooks.getAttackRequests,
			(instance, attackType) => {
				if (instance.entity !== component.entity || attackType !== 'secondary')
					return
				pickedRow = null
				if (!component.slot.inRow() || query.slot.frozen(game, component.slot))
					return

				if (
					!game.components.exists(
						SlotComponent,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.empty,
					)
				)
					return

				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message: 'Pick an empty Hermit slot or your active Hermit.',
					canPick: query.every(
						query.slot.hermit,
						query.slot.currentPlayer,
						query.some(
							query.slot.empty,
							query.slot.rowIs(component.slot.rowEntity),
						),
					),
					onResult(pickedSlot) {
						if (!pickedSlot.inRow() || !component.slot.inRow()) return
						if (pickedSlot.row.entity === component.slot.rowEntity) return

						pickedRow = pickedSlot.row
					},
				})
			},
		)

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.ADD_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return
				if (!component.slot.inRow()) return

				if (!pickedRow || !component.slot.inRow()) return
				if (pickedRow.entity === component.slot.rowEntity) return

				game.swapRows(pickedRow, component.slot.row)

				const jumpscareTarget = game.components.find(
					RowComponent,
					query.row.opponentPlayer,
					game.components.filter(RowComponent, query.row.opponentPlayer)
						.length > 1
						? query.row.index(component.slot.row.index)
						: query.anything, // Lets Jumpscare always damage opponent, if opponent only has a single row and player can move
				)

				if (!jumpscareTarget || !jumpscareTarget.getHermit()) return

				const newRowIndex = pickedRow.index
				const jumpscareAttack = game.newAttack({
					attacker: component.entity,
					target: jumpscareTarget.entity,
					type: 'secondary',
					log: (values) =>
						` and moved to row #${newRowIndex + 1} to deal ${values.damage} to ${values.target}`,
				})
				jumpscareAttack.addDamage(component.entity, 20)
				jumpscareAttack.shouldIgnoreCards.push(
					query.card.entity(component.entity),
				)
				attack.addNewAttack(jumpscareAttack)
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

export default PoePoeSkizzRare
