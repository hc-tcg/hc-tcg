import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {afterAttack} from '../../../types/priorities'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const Cubfan135Rare: Hermit = {
	...hermit,
	id: 'cubfan135_rare',
	numericId: 10,
	name: 'Cub',
	expansion: 'default',
	rarity: 'rare',
	tokens: 1,
	type: 'speedrunner',
	health: 260,
	primary: {
		name: 'Dash',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: "Let's Go",
		cost: ['speedrunner', 'speedrunner', 'speedrunner'],
		damage: 100,
		power: 'After attack, you can choose to go AFK.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			player.hooks.afterAttack,
			afterAttack.HERMIT_ATTACK_REQUESTS,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				if (
					!game.components.exists(
						SlotComponent,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.not(query.slot.active),
						query.not(query.slot.empty),
						query.actionAvailable('CHANGE_ACTIVE_HERMIT'),
					)
				)
					return

				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message:
						'Pick one of your Hermits to become or stay as active Hermit',
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
				})
			},
		)
	},
}

export default Cubfan135Rare
