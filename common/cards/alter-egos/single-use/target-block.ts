import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
import {CardComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class TargetBlockSingleUseCard extends Card {
	pickCondition = slot.every(
		slot.opponent,
		slot.hermitSlot,
		slot.not(slot.activeRow),
		slot.not(slot.empty)
	)

	props: SingleUse = {
		...singleUse,
		id: 'target_block',
		numericId: 149,
		name: 'Target Block',
		expansion: 'alter_egos',
		rarity: 'rare',
		tokens: 3,
		description:
			"Choose one of your opponent's AFK Hermits to take all damage done during this turn.",
		attachCondition: slot.every(
			singleUse.attachCondition,
			slot.someSlotFulfills(this.pickCondition)
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		game.addPickRequest({
			playerId: player.id,
			id: this.props.id,
			message: "Pick one of your opponent's AFK Hermits",
			canPick: this.pickCondition,
			onResult(pickedSlot) {
				const rowIndex = pickedSlot.rowIndex
				if (!pickedSlot.cardId || rowIndex === null) return

				const row = opponentPlayer.board.rows[rowIndex]
				if (!row.hermitCard) return

				// Apply the card
				applySingleUse(game, pickedSlot)

				// Redirect all future attacks this turn
				player.hooks.beforeAttack.add(component, (attack) => {
					if (attack.isType('status-effect') || attack.isBacklash) return

					attack.setTarget(this.id, {
						player: opponentPlayer,
						rowIndex,
						row,
					})
				})
			},
		})

		player.hooks.onTurnEnd.add(component, () => {
			player.hooks.beforeAttack.remove(component)
			player.hooks.onTurnEnd.remove(component)
			opponentPlayer.hooks.onDefence.remove(component)
		})
	}
}

export default TargetBlockSingleUseCard
