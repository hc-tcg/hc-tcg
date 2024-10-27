import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {executeAttacks} from '../../utils/attacks'
import {applySingleUse} from '../../utils/board'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const pickCondition = query.every(
	query.slot.empty,
	query.slot.hermit,
	query.slot.currentPlayer,
)

const EnderPearl: SingleUse = {
	...singleUse,
	id: 'ender_pearl',
	numericId: 141,
	name: 'Ender Pearl',
	expansion: 'alter_egos',
	rarity: 'common',
	tokens: 0,
	description:
		'Before your attack, move your active Hermit and any attached cards to any open row on the game board. Your active Hermit also takes 10hp damage.',
	attachCondition: query.every(
		singleUse.attachCondition,
		query.exists(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.active,
			query.slot.hermit,
			query.not(query.slot.frozen),
		),
		query.exists(SlotComponent, pickCondition),
	),
	log: (values) =>
		`${values.defaultLog} to move $p${
			values.game.currentPlayer.activeRow?.getHermit()?.props.name
		}$ to row #${values.pick.rowIndex}`,
	onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		const {player} = component

		game.addPickRequest({
			player: player.entity,
			id: component.entity,
			message: 'Pick an empty Hermit slot',
			canPick: pickCondition,
			onResult(pickedSlot) {
				if (!pickedSlot.inRow() || !player.activeRow) return

				// Apply
				applySingleUse(game, pickedSlot)

				// Move us
				game.swapRows(player.activeRow, pickedSlot.row)

				// Do 10 damage
				const attack = game
					.newAttack({
						attacker: component.entity,
						player: player.entity,
						target: player.activeRowEntity,
						type: 'effect',
						isBacklash: true,
					})
					.addDamage(this.id, 10)
				executeAttacks(game, [attack])
			},
		})
	},
}

export default EnderPearl
