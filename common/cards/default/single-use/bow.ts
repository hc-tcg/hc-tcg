import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import {CardComponent, SlotComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class BowSingleUseCard extends Card {
	pickCondition = query.every(
		slot.opponent,
		slot.hermitSlot,
		query.not(slot.empty),
		query.not(slot.activeRow)
	)

	props: SingleUse = {
		...singleUse,
		id: 'bow',
		numericId: 3,
		name: 'Bow',
		expansion: 'default',
		rarity: 'common',
		tokens: 1,
		description: "Do 40hp damage to one of your opponent's AFK Hermits.",
		hasAttack: true,
		attachCondition: query.every(
			singleUse.attachCondition,
			query.exists(SlotComponent, this.pickCondition)
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		let pickedRow: RowState | null = null
		let pickedRowIndex: number | null = null

		player.hooks.getAttackRequests.add(component, () => {
			game.addPickRequest({
				playerId: player.id,
				id: this.props.id,
				message: "Pick one of your opponent's AFK Hermits",
				canPick: this.pickCondition,
				onResult(pickedSlot) {
					pickedRow = pickedSlot.rowId
					pickedRowIndex = pickedSlot.rowIndex
				},
			})
		})

		player.hooks.getAttack.add(component, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return null

			if (!pickedRow || !pickedRow.hermitCard || !pickedRowIndex) return null

			const bowAttack = new AttackModel({
				id: this.getInstanceKey(component),
				attacker: activePos,
				target: {
					player: opponentPlayer,
					rowIndex: pickedRowIndex,
					row: pickedRow,
				},
				type: 'effect',
				log: (values) =>
					`${values.defaultLog} to attack ${values.target} for ${values.damage} damage`,
			}).addDamage(this.props.id, 40)

			return bowAttack
		})

		player.hooks.onAttack.add(component, (attack) => {
			const attackId = this.getInstanceKey(component)
			if (attack.id !== attackId) return
			applySingleUse(game)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.getAttackRequests.remove(component)
		player.hooks.getAttack.remove(component)
		player.hooks.onAttack.remove(component)
	}
}

export default BowSingleUseCard
