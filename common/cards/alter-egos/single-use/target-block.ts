import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import {CardComponent, SlotComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class TargetBlock extends Card {
	pickCondition = query.every(
		query.slot.opponent,
		query.slot.hermitSlot,
		query.not(query.slot.activeRow),
		query.not(query.slot.empty)
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
		attachCondition: query.every(
			singleUse.attachCondition,
			query.exists(SlotComponent, this.pickCondition)
		),
	}

	override onAttach(game: GameModel, component: CardComponent, observer: Observer) {
		const {player, opponentPlayer} = component

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

export default TargetBlock
