import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {RowEntity} from '../../../entities'
import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import CardOld from '../../base/card'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

class Bow extends CardOld {
	pickCondition = query.every(
		query.slot.opponent,
		query.slot.hermit,
		query.not(query.slot.empty),
		query.not(query.slot.active),
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
			query.exists(SlotComponent, this.pickCondition),
		),
		attackPreview: (_game) => '$A40$',
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		let pickedRow: RowEntity | null = null

		observer.subscribe(player.hooks.getAttackRequests, () => {
			game.addPickRequest({
				player: player.entity,
				id: component.entity,
				message: "Pick one of your opponent's AFK Hermits",
				canPick: this.pickCondition,
				onResult(pickedSlot) {
					if (!pickedSlot.inRow()) return
					pickedRow = pickedSlot.rowEntity
				},
			})
		})

		observer.subscribe(player.hooks.getAttack, () => {
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

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (attack.attacker?.entity !== component.entity) return
			applySingleUse(game, component.slot)
		})
	}
}

export default Bow
