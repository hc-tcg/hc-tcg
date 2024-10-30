import {
	CardComponent,
	ObserverComponent,
	RowComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {afterAttack} from '../../../types/priorities'
import {applySingleUse} from '../../../utils/board'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const moveRowEntry = (row: RowComponent): string =>
	`$p${row.player.playerName}$ moved $p${row.getHermit()?.props.name}$ to row #${row.index + 1}`

const WindBurst: SingleUse = {
	...singleUse,
	id: 'wind-burst',
	numericId: 245,
	name: 'Wind Burst',
	expansion: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 0,
	description:
		'After your attack, you and your opponent must move your active Hermit and any attached cards to an open row on the game board if able.\nYour opponent moves their active Hermit first.',
	log: (values) => `${values.defaultLog} with {your|their} attack`,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.EFFECT_POST_ATTACK_REQUESTS,
			(attack) => {
				if (!attack.isType('primary', 'secondary')) return
				applySingleUse(game)
				// Only Apply this for the first attack
				observer.unsubscribe(game.hooks.afterAttack)

				const opponentPickCondition = query.every(
					query.slot.opponent,
					query.slot.hermit,
					query.slot.empty,
				)

				// If opponent can move their active row and didn't just die, add a pick request for them to move
				if (
					opponentPlayer.activeRow?.health &&
					game.components.exists(
						SlotComponent,
						query.slot.opponent,
						query.slot.active,
						query.slot.hermit,
						query.not(query.slot.frozen),
					) &&
					game.components.exists(SlotComponent, opponentPickCondition)
				) {
					game.addPickRequest({
						player: opponentPlayer.entity,
						id: component.entity,
						message: 'Pick an empty Hermit slot',
						canPick: opponentPickCondition,
						onResult(pickedSlot) {
							if (!pickedSlot.inRow() || !opponentPlayer.activeRow) return

							game.swapRows(opponentPlayer.activeRow, pickedSlot.row)

							game.battleLog.addEntry(
								opponentPlayer.entity,
								moveRowEntry(opponentPlayer.activeRow),
							)
						},
					})
				}

				const playerPickCondition = query.every(
					query.slot.currentPlayer,
					query.slot.hermit,
					query.slot.empty,
				)

				// If we can move our active row and didn't just die, add a pick request for us to move
				if (
					player.activeRow?.health &&
					game.components.exists(
						SlotComponent,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.active,
						query.not(query.slot.frozen),
					) &&
					game.components.exists(SlotComponent, playerPickCondition)
				) {
					game.addPickRequest({
						player: player.entity,
						id: component.entity,
						message: 'Pick an empty Hermit slot',
						canPick: playerPickCondition,
						onResult(pickedSlot) {
							if (!pickedSlot.inRow() || !player.activeRow) return

							game.swapRows(player.activeRow, pickedSlot.row)

							game.battleLog.addEntry(
								player.entity,
								moveRowEntry(player.activeRow),
							)
						},
					})
				}
			},
		)
	},
}

export default WindBurst
