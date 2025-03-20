import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import SleepingEffect from '../../status-effects/sleeping'
import {afterAttack} from '../../types/priorities'
import {applySingleUse} from '../../utils/board'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const ChorusFruit: SingleUse = {
	...singleUse,
	id: 'chorus_fruit',
	numericId: 59,
	name: 'Chorus Fruit',
	expansion: 'default',
	rarity: 'common',
	tokens: 1,
	description:
		'After your attack, choose an AFK Hermit to set as your active Hermit.',
	log: (values) => `${values.defaultLog} with {your|their} attack`,
	attachCondition: query.every(
		singleUse.attachCondition,
		(game, _slot) =>
			!game.isActionBlocked('CHANGE_ACTIVE_HERMIT', ['game', 'betrayed']),
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
			query.card.slot(query.slot.hermit, query.slot.canBecomeActive),
			query.not(query.card.active),
		),
	),
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.EFFECT_POST_ATTACK_REQUESTS,
			(attack) => {
				if (!attack.isType('primary', 'secondary')) return

				applySingleUse(game, component.slot)

				if (game.isActionBlocked('CHANGE_ACTIVE_HERMIT', ['game'])) return

				observer.unsubscribe(game.hooks.afterAttack)

				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message: 'Pick one of your Hermits to become the new active Hermit',
					canPick: query.every(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.not(query.slot.empty),
						query.some(query.slot.active, query.slot.canBecomeActive),
					),
					onResult(pickedSlot) {
						if (!pickedSlot.inRow()) return
						if (pickedSlot.row.entity !== player.activeRowEntity) {
							player.changeActiveRow(pickedSlot.row)
						}
					},
				})
			},
		)
	},
}

export default ChorusFruit
