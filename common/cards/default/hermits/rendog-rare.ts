import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {HermitAttackType} from '../../../types/attack'
import {CardInstance} from '../../../types/game-state'
import {slot} from '../../../filters'
import Card, {Hermit, InstancedValue, hermit} from '../../base/card'
import {CopyAttack} from '../../../types/server-requests'

class RendogRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'rendog_rare',
		numericId: 87,
		name: 'Rendog',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'builder',
		health: 250,
		primary: {
			name: "Comin' At Ya",
			cost: ['builder'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Role Play',
			cost: ['builder', 'builder', 'builder'],
			damage: 0,
			power: "Use an attack from any of your opponent's Hermits.",
		},
	}

	pickCondition = slot.every(
		slot.opponent,
		slot.hermitSlot,
		slot.not(slot.empty),
		slot.not(slot.hasId(this.props.id)),
		slot.not(slot.hasId('armor_stand'))
	)

	imitatingCard = new InstancedValue<CardInstance | null>(() => null)
	pickedAttack = new InstancedValue<HermitAttackType | null>(() => null)

	override getAttack(
		game: GameModel,
		instance: CardInstance,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType
	) {
		const {player} = pos
		const attack = super.getAttack(game, instance, pos, hermitAttackType)

		if (!attack || attack.type !== 'secondary') return attack
		if (attack.id !== this.getInstanceKey(instance)) return attack

		const imitatingCard = this.imitatingCard.get(instance)
		const pickedAttack = this.pickedAttack.get(instance)

		if (!imitatingCard) return attack
		if (!imitatingCard.isHermit()) return null

		if (!pickedAttack) return null

		// Return the attack we picked from the card we picked
		const newAttack = imitatingCard.card.getAttack(game, imitatingCard, pos, pickedAttack)
		if (!newAttack) return null

		const attackName =
			newAttack.type === 'primary'
				? imitatingCard.props.primary.name
				: imitatingCard.props.secondary.name
		newAttack.updateLog(
			(values) =>
				`${values.attacker} ${values.coinFlip ? values.coinFlip + ', then ' : ''} attacked ${
					values.target
				} with $v${imitatingCard?.props.name}'s ${attackName}$ for ${values.damage} damage`
		)
		return newAttack
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.getAttackRequests.add(instance, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance.id !== instance.id) return
			// Only activate power on secondary attack
			if (hermitAttackType !== 'secondary') return

			game.addPickRequest({
				playerId: player.id,
				id: this.props.id,
				message: "Pick one of your opponent's Hermits",
				canPick: this.pickCondition,
				onResult: (pickedSlot) => {
					if (!pickedSlot.cardId) return
					let pickedCard = pickedSlot.cardId

					game.addModalRequest({
						playerId: player.id,
						data: {
							modalId: 'copyAttack',
							payload: {
								modalName: 'Rendog: Choose an attack to copy',
								modalDescription: "Which of the Hermit's attacks do you want to copy?",
								hermitCard: pickedCard.toLocalCardInstance(),
							},
						},
						onResult: (modalResult) => {
							if (!modalResult) return 'FAILURE_INVALID_DATA'
							if (modalResult.cancel) {
								// Cancel this attack so player can choose a different hermit to imitate
								game.state.turn.currentAttack = null
								game.cancelPickRequests()
								return 'SUCCESS'
							}
							if (!modalResult.pick) return 'FAILURE_INVALID_DATA'
							const attack: HermitAttackType = modalResult.pick

							// Store the chosen attack to copy
							this.pickedAttack.set(instance, attack)

							// Replace the hooks of the card we're imitating only if it changed
							let imitatingCard = this.imitatingCard.get(instance)
							if (!imitatingCard || pickedCard.props.id !== imitatingCard.props.id) {
								if (imitatingCard) {
									imitatingCard.card.onDetach(game, imitatingCard, pos)
								}

								this.imitatingCard.set(instance, pickedCard)
								pickedCard.card.onAttach(game, pickedCard, pos)
								player.hooks.getAttackRequests.call(pickedCard, modalResult.pick)
							}

							return 'SUCCESS'
						},
						onTimeout: () => {
							this.imitatingCard.set(instance, pickedCard)
							this.pickedAttack.set(instance, 'primary')
						},
					})
				},
				onTimeout() {
					// We didn't pick someone to imitate so do nothing
				},
			})
		})

		player.hooks.onActiveRowChange.add(instance, (oldRow, newRow) => {
			if (pos.rowIndex === oldRow) {
				// We switched away from ren, delete the imitating card
				const imitatingCard = this.imitatingCard.get(instance)
				if (imitatingCard) {
					// Detach the old card
					imitatingCard.card.onDetach(game, imitatingCard, pos)
				}
			}
		})

		player.hooks.blockedActions.add(instance, (blockedActions) => {
			// Block "Role Play" if there are not opposing Hermit cards other than rare Ren(s)
			if (!game.someSlotFulfills(this.pickCondition)) blockedActions.push('SECONDARY_ATTACK')
			return blockedActions
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos

		// If the card we are imitating is still attached, detach it
		const imitatingCard = this.imitatingCard.get(instance)
		if (imitatingCard) {
			imitatingCard.card.onDetach(game, imitatingCard, pos)
		}

		// Remove hooks and custom data
		this.imitatingCard.clear(instance)
		this.pickedAttack.clear(instance)
		player.hooks.getAttackRequests.remove(instance)
		player.hooks.onActiveRowChange.remove(instance)
		player.hooks.blockedActions.remove(instance)
	}
}

export default RendogRareHermitCard
