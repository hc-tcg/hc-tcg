import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {RowEntity} from '../../entities'
import {AttackModel} from '../../models/attack-model'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {PickRequest} from '../../types/server-requests'
import {applySingleUse} from '../../utils/board'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const pickCondition = query.every(
	query.slot.opponent,
	query.slot.hermit,
	query.not(query.slot.empty),
)

function getTotalTargets(game: GameModel) {
	return Math.min(
		3,
		game.components.filter(SlotComponent, pickCondition).length,
	)
}

const Crossbow: SingleUse = {
	...singleUse,
	id: 'crossbow',
	numericId: 8,
	name: 'Crossbow',
	expansion: 'default',
	rarity: 'rare',
	tokens: 1,
	description:
		"Do 20hp damage to up to 3 of your opponent's active or AFK Hermits.",
	hasAttack: true,
	attackPreview: (game) => `$A20$ x ${getTotalTargets(game)}`,
	data() {
		return {
			targets: [],
			targetsRemaining: 0,
			totalTargets: 0,
		}
	},
	onCreate(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		const pickRequest = {
			creator: component.entity,
			player: player.entity,
			id: component.entity,
		}

		let addPickRequest = () => {
			let remaining = component.data.targetsRemaining.toString()
			if (component.data.targetsRemaining != component.data.totalTargets)
				remaining += ' more'
			const request: PickRequest = {
				...pickRequest,
				canPick: query.every(
					pickCondition,
					...component.data.targets.map((row: RowEntity) =>
						query.not(query.slot.rowIs(row)),
					),
				),
				message: `Pick ${remaining} of your opponent's Hermits`,
			}
			game.addPickRequest(request)
		}

		observer.subscribe(
			player.hooks.getAttackRequests,
			(_activeInstance, _hermitAttackType) => {
				if (!component.onGameBoard) return
				component.data.totalTargets = getTotalTargets(game)
				component.data.targetsRemaining = component.data.totalTargets

				addPickRequest()
			},
		)

		observer.subscribe(game.hooks.onPickRequestResolve, (req, pickedSlot) => {
			if (req.creator !== component.entity) return
			if (!pickedSlot.inRow()) return
			component.data.targets.push(pickedSlot.row.entity)
			component.data.targetsRemaining--

			if (component.data.targetsRemaining > 0) {
				addPickRequest()
			}
		})

		observer.subscribe(player.hooks.getAttack, () => {
			if (!component.onGameBoard) return
			const attack = component.data.targets.reduce(
				(r: null | AttackModel, target: RowEntity, i: number) => {
					const newAttack = game
						.newAttack({
							attacker: component.entity,
							player: player.entity,
							target: target,
							type: 'effect',
							log: (values) =>
								i === 0
									? `${values.defaultLog} to attack ${values.target} for ${values.damage} damage`
									: `, ${values.target} for ${values.damage} damage`,
						})
						.addDamage(component.entity, 20)

					if (r) return r.addNewAttack(newAttack)

					return newAttack
				},
				null,
			)

			return attack
		})

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.APPLY_SINGLE_USE_ATTACK,
			(attack) => {
				if (!component.onGameBoard) return
				if (!attack.isAttacker(component.entity)) return

				applySingleUse(game)
			},
		)
	},
}

export default Crossbow
