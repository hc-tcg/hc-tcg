import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class Knockback extends Card {
	pickCondition = query.every(
		query.slot.opponent,
		query.slot.hermitSlot,
		query.not(query.slot.activeRow),
		query.not(query.slot.empty)
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
			query.exists(SlotComponent, this.pickCondition)
		),
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.afterAttack, (attack) => {
			applySingleUse(game)
			// Only Apply this for the first attack
			observer.unsubscribe(player.hooks.afterAttack)
		})

		observer.subscribe(player.hooks.onApply, () => {
			const activeRow = getActiveRow(opponentPlayer)

			if (activeRow && activeRow.health) {
				game.addPickRequest({
					playerId: opponentPlayer.id,
					id: component.entity,
					message: 'Choose a new active Hermit from your AFK Hermits',
					canPick: this.pickCondition,
					onResult(pickedSlot) {
						if (!pickedSlot.inRow()) return
						game.changeActiveRow(opponentPlayer, pickedSlot.row)
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

export default Knockback
