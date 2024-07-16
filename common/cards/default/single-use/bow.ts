import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import {CardComponent, SlotComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import {RowEntity} from '../../../types/game-state'

class Bow extends Card {
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
		const {player} = component

		let pickedRow: RowEntity | null = null

		player.hooks.getAttackRequests.add(component, () => {
			game.addPickRequest({
				playerId: player.id,
				id: this.props.id,
				message: "Pick one of your opponent's AFK Hermits",
				canPick: this.pickCondition,
				onResult(pickedSlot) {
					if (!pickedSlot.inRow()) return
					pickedRow = pickedSlot.rowEntity
				},
			})
		})

		player.hooks.getAttack.add(component, () => {
			const bowAttack = game
				.newAttack({
					attacker: component.entity,
					target: pickedRow,
					type: 'effect',
					log: (values) =>
						`${values.defaultLog} to attack ${values.target} for ${values.damage} damage`,
				})
				.addDamage(component.entity, 40)

			return bowAttack
		})

		player.hooks.onAttack.add(component, (attack) => {
			if (attack.attacker?.entity !== component.entity) return
			applySingleUse(game, component.slot)
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.getAttackRequests.remove(component)
		player.hooks.getAttack.remove(component)
		player.hooks.onAttack.remove(component)
	}
}

export default Bow
