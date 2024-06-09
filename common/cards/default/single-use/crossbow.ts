import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {PickRequest} from '../../../types/server-requests'
import {applySingleUse, getActiveRowPos, getNonEmptyRows} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class CrossbowSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'crossbow',
			numericId: 8,
			name: 'Crossbow',
			rarity: 'rare',
			description: "Do 20hp damage to up to 3 of your opponent's active or AFK Hermits.",
			log: null,
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const targetsKey = this.getInstanceKey(instance, 'targets')
		const remainingKey = this.getInstanceKey(instance, 'remaining')

		player.hooks.getAttackRequests.add(instance, (activeInstance, hermitAttackType) => {
			// Rather than allowing you to choose to damage less we will make you pick the most you can
			const pickAmount = Math.min(3, getNonEmptyRows(opponentPlayer).length)
			player.custom[targetsKey] = []
			player.custom[remainingKey] = pickAmount

			const pickRequest: PickRequest = {
				playerId: player.id,
				id: this.id,
				message: "Pick {?} of your opponent's Hermits",
				onResult(pickResult) {
					if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_INVALID_PLAYER'

					const rowIndex = pickResult.rowIndex
					if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'

					if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					// If we already picked the row
					if (player.custom[targetsKey].includes(rowIndex)) return 'FAILURE_WRONG_PICK'

					// Add the row to the chosen list
					player.custom[targetsKey].push(rowIndex)

					player.custom[remainingKey]--
					const newRemaining = player.custom[remainingKey]
					if (player.custom[remainingKey] > 0) {
						addPickRequest(newRemaining)
					} else {
						delete player.custom[remainingKey]
					}

					return 'SUCCESS'
				},
				onTimeout() {
					// We didn't pick a target so do nothing
				},
			}

			function addPickRequest(newRemaining: number) {
				let remaining = newRemaining.toString()
				if (newRemaining != pickAmount) remaining += ' more'
				const request: PickRequest = {
					...pickRequest,
					message: pickRequest.message.replace('{?}', remaining),
				}
				game.addPickRequest(request)
			}

			addPickRequest(pickAmount)
		})

		player.hooks.getAttack.add(instance, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return null

			const targets: Array<number> = player.custom[targetsKey]
			if (targets === undefined) return null

			const attack = targets.reduce((r: null | AttackModel, target, i) => {
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
				}).addDamage(this.id, 20)

				if (r) return r.addNewAttack(newAttack)

				return newAttack
			}, null)

			return attack
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId) return

			applySingleUse(game)

			delete player.custom[targetsKey]

			// Do not apply single use more than once
			player.hooks.onAttack.remove(instance)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.getAttackRequests.remove(instance)
		player.hooks.getAttack.remove(instance)
		player.hooks.onAttack.remove(instance)

		const targetsKey = this.getInstanceKey(instance, 'targets')
		const remainingKey = this.getInstanceKey(instance, 'remaining')
		delete player.custom[targetsKey]
		delete player.custom[remainingKey]
	}

	override canAttack() {
		return true
	}
}

export default CrossbowSingleUseCard
