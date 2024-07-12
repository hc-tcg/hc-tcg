import {GameModel} from '../../../models/game-model'
import {HermitAttackType} from '../../../types/attack'
import {CardComponent} from '../../../types/game-state'
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

	imitatingCard = new InstancedValue<CardComponent | null>(() => null)
	pickedAttack = new InstancedValue<HermitAttackType | null>(() => null)

	override getAttack(
		game: GameModel,
		component: CardComponent,
		hermitAttackType: HermitAttackType
	) {
		const {player} = pos
		const attack = super.getAttack(game, component, pos, hermitAttackType)

		if (!attack || attack.type !== 'secondary') return attack
		if (attack.id !== this.getInstanceKey(component)) return attack

		const imitatingCard = this.imitatingCard.get(component)
		const pickedAttack = this.pickedAttack.get(component)

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

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = pos

		player.hooks.getAttackRequests.add(component, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance.entity !== component.entity) return
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
							this.pickedAttack.set(component, attack)

							// Replace the hooks of the card we're imitating only if it changed
							let imitatingCard = this.imitatingCard.get(component)
							if (!imitatingCard || pickedCard.props.id !== imitatingCard.props.id) {
								if (imitatingCard) {
									imitatingCard.card.onDetach(game, imitatingCard, pos)
								}

								this.imitatingCard.set(component, pickedCard)
								pickedCard.card.onAttach(game, pickedCard, pos)
								player.hooks.getAttackRequests.call(pickedCard, modalResult.pick)
							}

							return 'SUCCESS'
						},
						onTimeout: () => {
							this.imitatingCard.set(component, pickedCard)
							this.pickedAttack.set(component, 'primary')
						},
					})
				},
				onTimeout() {
					// We didn't pick someone to imitate so do nothing
				},
			})
		})

		player.hooks.onActiveRowChange.add(component, (oldRow, newRow) => {
			if (pos.rowIndex === oldRow) {
				// We switched away from ren, delete the imitating card
				const imitatingCard = this.imitatingCard.get(component)
				if (imitatingCard) {
					// Detach the old card
					imitatingCard.card.onDetach(game, imitatingCard, pos)
				}
			}
		})

		player.hooks.blockedActions.add(component, (blockedActions) => {
			// Block "Role Play" if there are not opposing Hermit cards other than rare Ren(s)
			if (!game.someSlotFulfills(slot.every(slot.activeRow, slot.hasInstance(instance))))
				return blockedActions
			if (!game.someSlotFulfills(this.pickCondition)) blockedActions.push('SECONDARY_ATTACK')
			return blockedActions
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = pos

		// If the card we are imitating is still attached, detach it
		const imitatingCard = this.imitatingCard.get(component)
		if (imitatingCard) {
			imitatingCard.card.onDetach(game, imitatingCard, pos)
		}

		// Remove hooks and custom data
		this.imitatingCard.clear(component)
		this.pickedAttack.clear(component)
		player.hooks.getAttackRequests.remove(component)
		player.hooks.onActiveRowChange.remove(component)
		player.hooks.blockedActions.remove(component)
	}
}

export default RendogRareHermitCard
