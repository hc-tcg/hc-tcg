import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {RowEntity} from '../../entities'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {applySingleUse} from '../../utils/board'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const pickCondition = query.every(
	query.slot.opponent,
	query.slot.hermit,
	query.not(query.slot.empty),
	query.not(query.slot.active),
)

const Bow: SingleUse = {
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
		query.exists(SlotComponent, pickCondition),
	),
	attackPreview: (_game) => '$A40$',
	onAttach(
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
				canPick: pickCondition,
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
					player: player.entity,
					target: pickedRow,
					type: 'effect',
					log: (values) =>
						`${values.defaultLog} to attack ${values.target} for ${values.damage} damage`,
				})
				.addDamage(component.entity, 40)

			return bowAttack
		})

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.APPLY_SINGLE_USE_ATTACK,
			(attack) => {
				if (attack.attacker?.entity !== component.entity) return
				applySingleUse(game, component.slot)
				observer.unsubscribeFromEverything()
			},
		)
	},
}

export default Bow
