import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {SlotInfo} from '../../../types/cards'
import {CardInstance} from '../../../types/game-state'
import {PickRequest} from '../../../types/server-requests'
import {applySingleUse, getActiveRowPos} from '../../../utils/board'
import Card, {SingleUse, singleUse} from '../../base/card'

class CrossbowSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'crossbow',
		numericId: 8,
		name: 'Crossbow',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		description: "Do 20hp damage to up to 3 of your opponent's active or AFK Hermits.",
		hasAttack: true,
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const pickCondition = slot.every(slot.opponent, slot.hermitSlot, slot.not(slot.empty))

		let targets = new Set<number>()

		player.hooks.getAttackRequests.add(instance, (activeInstance, hermitAttackType) => {
			// Rather than allowing you to choose to damage less we will make you pick the most you can
			let totalTargets = Math.min(3, game.filterSlots(pickCondition).length)
			let targetsRemaining = totalTargets

			const pickRequest = {
				playerId: player.id,
				id: this.props.id,
				onResult(pickedSlot: SlotInfo) {
					const rowIndex = pickedSlot.rowIndex
					if (!pickedSlot.card || rowIndex === null) return

					// Add the row to the chosen list
					targets.add(rowIndex)
					targetsRemaining--

					if (targetsRemaining > 0) {
						addPickRequest()
					}
				},
				onTimeout() {
					// We didn't pick a target so do nothing
				},
			}

			function addPickRequest() {
				let remaining = targetsRemaining.toString()
				if (totalTargets != totalTargets) remaining += ' more'
				const request: PickRequest = {
					...pickRequest,
					canPick: slot.every(
						pickCondition,
						...Array.from(targets).map((row: number) => slot.not(slot.rowIndex(row)))
					),
					message: `Pick ${remaining} of your opponent's Hermits`,
				}
				game.addPickRequest(request)
			}

			addPickRequest()
		})

		player.hooks.getAttack.add(instance, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return null

			const attack = Array.from(targets).reduce((r: null | AttackModel, target, i) => {
				const row = opponentPlayer.board.rows[target]
				if (!row || !row.hermitCard) return r
				const newAttack = new AttackModel({
					id: this.getInstanceKey(instance),
					attacker: activePos,
					target: {
						player: opponentPlayer,
						rowIndex: target,
						row,
					},
					type: 'effect',
					log: (values) =>
						i === 0
							? `${values.defaultLog} to attack ${values.target} for ${values.damage} damage`
							: `, ${values.target} for ${values.damage} damage`,
				}).addDamage(this.props.id, 20)

				if (r) return r.addNewAttack(newAttack)

				return newAttack
			}, null)

			return attack
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId) return

			applySingleUse(game)

			// Do not apply single use more than once
			player.hooks.onAttack.remove(instance)
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos
		player.hooks.getAttackRequests.remove(instance)
		player.hooks.getAttack.remove(instance)
		player.hooks.onAttack.remove(instance)

		const targetsKey = this.getInstanceKey(instance, 'targets')
		const remainingKey = this.getInstanceKey(instance, 'remaining')
	}
}

export default CrossbowSingleUseCard
