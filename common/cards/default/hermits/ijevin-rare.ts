import {
	CardComponent,
	ObserverComponent,
	RowComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const IJevinRare: Hermit = {
	...hermit,
	id: 'ijevin_rare',
	numericId: 39,
	name: 'Jevin',
	expansion: 'default',
	rarity: 'rare',
	tokens: 1,
	type: 'speedrunner',
	health: 300,
	primary: {
		name: 'Your Boi',
		cost: ['any'],
		damage: 30,
		power: null,
	},
	secondary: {
		name: 'Peace Out',
		cost: ['speedrunner', 'speedrunner', 'any'],
		damage: 90,
		power:
			'After your attack, your opponent must choose an AFK Hermit to set as their active Hermit, unless they have no AFK Hermits.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.afterAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
				return

			const pickCondition = query.every(
				query.not(query.slot.active),
				query.not(query.slot.empty),
				query.slot.opponent,
				query.slot.hermit,
			)

			if (!game.components.exists(SlotComponent, pickCondition)) return

			game.addPickRequest({
				player: opponentPlayer.entity, // For opponent player to pick
				id: component.entity,
				message: 'Choose a new active Hermit from your AFK Hermits.',
				canPick: pickCondition,
				onResult(pickedSlot) {
					if (!pickedSlot.inRow()) return
					opponentPlayer.changeActiveRow(pickedSlot.row)
				},
				onTimeout() {
					let rowComponent = game.components.find(
						RowComponent,
						query.not(query.row.active),
					)
					if (!rowComponent) return
					opponentPlayer.changeActiveRow(rowComponent)
				},
			})
		})
	},
}

export default IJevinRare
