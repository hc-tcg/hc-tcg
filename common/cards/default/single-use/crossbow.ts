import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
import {SlotComponent} from '../../../types/cards'
import {CardComponent} from '../../../components'
import {PickRequest} from '../../../types/server-requests'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

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

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos
		const pickCondition = slot.every(slot.opponent, slot.hermitSlot, slot.not(slot.empty))

		let targets = new Set<number>()

		player.hooks.getAttackRequests.add(component, (activeInstance, hermitAttackType) => {
			// Rather than allowing you to choose to damage less we will make you pick the most you can
			let totalTargets = Math.min(3, game.filterSlots(pickCondition).length)
			let targetsRemaining = totalTargets

			const pickRequest = {
				playerId: player.id,
				id: this.props.id,
				onResult(pickedSlot: SlotComponent) {
					const rowIndex = pickedSlot.rowIndex
					if (!pickedSlot.cardId || rowIndex === null) return

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

		player.hooks.getAttack.add(component, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return null

			const attack = Array.from(targets).reduce((r: null | AttackModel, target, i) => {
				const row = opponentPlayer.board.rows[target]
				if (!row || !row.hermitCard) return r
				const newAttack = new AttackModel({
					id: this.getInstanceKey(component),
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

		player.hooks.onAttack.add(component, (attack) => {
			const attackId = this.getInstanceKey(component)
			if (attack.id !== attackId) return

			applySingleUse(game)

			// Do not apply single use more than once
			player.hooks.onAttack.remove(component)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.getAttackRequests.remove(component)
		player.hooks.getAttack.remove(component)
		player.hooks.onAttack.remove(component)

		const targetsKey = this.getInstanceKey(component, 'targets')
		const remainingKey = this.getInstanceKey(component, 'remaining')
	}
}

export default CrossbowSingleUseCard
