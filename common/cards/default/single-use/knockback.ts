import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

class Knockback extends Card {
	pickCondition = query.every(
		query.slot.opponent,
		query.slot.hermit,
		query.not(query.slot.active),
		query.not(query.slot.empty),
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
			query.exists(SlotComponent, this.pickCondition),
		),
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.afterAttack, (attack) => {
			// Only hermit attacks are allowed to trigger chorus fruit.
			if (attack.isType('status-effect')) return
			applySingleUse(game)
			// Only Apply this for the first attack
			observer.unsubscribe(player.hooks.afterAttack)
		})

		observer.subscribe(player.hooks.onApply, () => {
			if (!game.components.exists(SlotComponent, this.pickCondition)) return

			let activeRow = opponentPlayer.activeRow
			if (activeRow && activeRow.health) {
				game.addPickRequest({
					player: opponentPlayer.entity,
					id: component.entity,
					message: 'Choose a new active Hermit from your AFK Hermits',
					canPick: this.pickCondition,
					onResult(pickedSlot) {
						if (!pickedSlot.inRow()) return
						opponentPlayer.changeActiveRow(pickedSlot.row)
					},
					onTimeout: () => {
						const slot = game.components.find(SlotComponent, this.pickCondition)
						if (!slot?.inRow()) return
						game.opponentPlayer.changeActiveRow(slot.row)
					},
				})
			}
		})
	}
}

export default Knockback
