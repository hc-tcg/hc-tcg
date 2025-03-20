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
	numericId: 62,
	name: 'Crossbow',
	expansion: 'default',
	rarity: 'rare',
	tokens: 1,
	description:
		"Do 20hp damage to up to 3 of your opponent's active or AFK Hermits.",
	hasAttack: true,
	attackPreview: (game) => `$A20$ x ${getTotalTargets(game)}`,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		let targets = new Set<RowEntity>()

		observer.subscribe(
			player.hooks.getAttackRequests,
			(_activeInstance, _hermitAttackType) => {
				let totalTargets = getTotalTargets(game)
				let targetsRemaining = totalTargets

				const pickRequest = {
					player: player.entity,
					id: component.entity,
					onResult(pickedSlot: SlotComponent) {
						if (!pickedSlot.inRow()) return
						targets.add(pickedSlot.row.entity)
						targetsRemaining--

						if (targetsRemaining > 0) {
							addPickRequest()
						}
					},
					onTimeout() {
						// We didn't pick a target so do nothing
					},
				}

				let addPickRequest = () => {
					let remaining = targetsRemaining.toString()
					if (totalTargets != totalTargets) remaining += ' more'
					const request: PickRequest = {
						...pickRequest,
						canPick: query.every(
							pickCondition,
							...Array.from(targets).map((row) =>
								query.not(query.slot.rowIs(row)),
							),
						),
						message: `Pick ${remaining} of your opponent's Hermits`,
					}
					game.addPickRequest(request)
				}

				addPickRequest()
			},
		)

		observer.subscribe(player.hooks.getAttack, () => {
			const attack = Array.from(targets).reduce(
				(r: null | AttackModel, target, i) => {
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
				if (!attack.isAttacker(component.entity)) return

				applySingleUse(game)

				// Do not apply single use more than once
				observer.unsubscribeFromEverything()
			},
		)
	},
}

export default Crossbow
