import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import SleepingEffect from '../../../status-effects/sleeping'
import {applySingleUse} from '../../../utils/board'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

const ChorusFruit: SingleUse = {
	...singleUse,
	id: 'chorus_fruit',
	numericId: 5,
	name: 'Chorus Fruit',
	expansion: 'default',
	rarity: 'common',
	tokens: 1,
	description:
		'After your attack, choose an AFK Hermit to set as your active Hermit.',
	log: (values) => `${values.defaultLog} with {your|their} attack`,
	attachCondition: query.every(
		singleUse.attachCondition,
		query.actionAvailable('CHANGE_ACTIVE_HERMIT'),
		query.not(
			query.exists(
				SlotComponent,
				query.slot.currentPlayer,
				query.slot.hermit,
				query.slot.active,
				query.slot.hasStatusEffect(SleepingEffect),
			),
		),
		query.exists(
			CardComponent,
			query.card.currentPlayer,
			query.card.slot(query.slot.hermit),
			query.not(query.card.active),
		),
	),
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isType('primary', 'secondary')) return

			applySingleUse(game, component.slot)

			observer.unsubscribe(player.hooks.onAttack)

			observer.oneShot(player.hooks.afterAttack, () =>
				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message: 'Pick one of your Hermits to become the new active Hermit',
					canPick: query.every(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.not(query.slot.empty),
					),
					onResult(pickedSlot) {
						if (!pickedSlot.inRow()) return
						if (pickedSlot.row.entity !== player.activeRowEntity) {
							player.changeActiveRow(pickedSlot.row)
						}
					},
				}),
			)
		})
	},
}

export default ChorusFruit
