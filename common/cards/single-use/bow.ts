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
	data: {
		pickedRow: null,
	},
	onCreate(game, component, observer) {
		observer.setupHook(component.player.hooks.getAttackRequests, () => {
			if (!component.onGameBoard) return
			const {player} = component

			game.addPickRequest({
				player: player.entity,
				id: component.entity,
				message: "Pick one of your opponent's AFK Hermits",
				canPick: pickCondition,
				onResult(pickedSlot) {
					if (!pickedSlot.inRow()) return
					component.data.pickedRow = pickedSlot.rowEntity
				},
			})
		})

		observer.setupHook(component.player.hooks.getAttack, () => {
			if (!component.onGameBoard) return
			const bowAttack = game
				.newAttack({
					attacker: component.entity,
					player: component.player.entity,
					target: component.data.pickedRow,
					type: 'effect',
					log: (values) =>
						`${values.defaultLog} to attack ${values.target} for ${values.damage} damage`,
				})
				.addDamage(component.entity, 40)

			return bowAttack
		})

		observer.setupHookWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.APPLY_SINGLE_USE_ATTACK,
			(attack) => {
				if (!component.onGameBoard) return
				if (attack.attacker?.entity !== component.entity) return
				applySingleUse(game, component.slot)
			},
		)
	},
}

export default Bow
