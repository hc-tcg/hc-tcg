import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import SleepingEffect from '../../../status-effects/sleeping'

class ChorusFruit extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'chorus_fruit',
		numericId: 5,
		name: 'Chorus Fruit',
		expansion: 'default',
		rarity: 'common',
		tokens: 1,
		description: 'After your attack, choose an AFK Hermit to set as your active Hermit.',
		log: (values) => `${values.defaultLog} with {your|their} attack`,
		attachCondition: query.every(
			singleUse.attachCondition,
			query.not(
				query.exists(
					SlotComponent,
					query.slot.currentPlayer,
					query.slot.hermitSlot,
					query.slot.activeRow,
					query.slot.hasStatusEffect(SleepingEffect)
				)
			)
		),
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		let switchedActiveHermit = false

		observer.subscribe(player.hooks.afterAttack, () => {
			if (switchedActiveHermit) return
			switchedActiveHermit = true

			game.addPickRequest({
				playerId: player.id,
				id: component.entity,
				message: 'Pick one of your Hermits to become the new active Hermit',
				canPick: query.every(query.slot.currentPlayer, query.slot.hermitSlot),
				onResult(pickedSlot) {
					if (!pickedSlot.inRow()) return
					if (pickedSlot.row.entity !== player.activeRowEntity) {
						game.changeActiveRow(player, pickedSlot.row)
						applySingleUse(game, component.slot)
					} else {
						switchedActiveHermit = false
					}
				},
			})
		})
	}
}

export default ChorusFruit
