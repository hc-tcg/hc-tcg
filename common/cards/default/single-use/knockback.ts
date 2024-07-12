import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import {CardComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class KnockbackSingleUseCard extends Card {
	pickCondition = query.every(
		slot.opponent,
		slot.hermitSlot,
		query.not(slot.activeRow),
		query.not(slot.empty)
	)

	props: SingleUse = {
		...singleUse,
		id: 'knockback',
		numericId: 73,
		name: 'Knockback',
		expansion: 'default',
		rarity: 'rare',
		tokens: 0,
		description:
			'After your attack, your opponent must choose an AFK Hermit to set as their active Hermit, unless they have no AFK Hermits.',
		log: (values) => `${values.defaultLog} with {your|their} attack`,
		attachCondition: query.every(
			singleUse.attachCondition,
			slot.someSlotFulfills(this.pickCondition)
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		player.hooks.afterAttack.add(component, (attack) => {
			applySingleUse(game)

			// Only Apply this for the first attack
			player.hooks.afterAttack.remove(component)
		})

		player.hooks.onApply.add(component, () => {
			const activeRow = getActiveRow(opponentPlayer)

			if (activeRow && activeRow.health) {
				game.addPickRequest({
					playerId: opponentPlayer.id,
					id: this.props.id,
					message: 'Choose a new active Hermit from your AFK Hermits',
					canPick: this.pickCondition,
					onResult(pickedSlot) {
						if (pickedSlot.rowIndex === null) return

						game.changeActiveRow(opponentPlayer, pickedSlot.rowIndex)
					},
					onTimeout: () => {
						const row = game.filterSlots(this.pickCondition)[0]
						if (row === undefined || row.rowIndex === null) return
						game.changeActiveRow(game.opponentPlayer, row.rowIndex)
					},
				})
			}
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.afterAttack.remove(component)
		player.hooks.onApply.remove(component)
	}
}

export default KnockbackSingleUseCard
