import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {HermitAttackType} from '../../../types/attack'
import {CardInstance} from '../../../types/game-state'
import Card, {Hermit, InstancedValue, hermit} from '../../base/card'

class ZombieCleoRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'zombiecleo_rare',
		numericId: 116,
		name: 'Cleo',
		expansion: 'default',
		rarity: 'rare',
		tokens: 3,
		type: 'pvp',
		health: 290,
		primary: {
			name: 'Dismissed',
			cost: ['pvp'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Puppetry',
			cost: ['pvp', 'pvp', 'pvp'],
			damage: 0,
			power: 'Use an attack from any of your AFK Hermits.',
		},
	}

	pickCondition = slot.every(
		slot.player,
		slot.hermitSlot,
		slot.not(slot.empty),
		slot.not(slot.activeRow),
		slot.not(slot.hasId(this.props.id)),
		slot.not(slot.hasId('armor_stand'))
	)

	pickedAttack = new InstancedValue<{card: CardInstance; attack: HermitAttackType} | null>(
		() => null
	)

	override getAttack(
		game: GameModel,
		instance: CardInstance,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType
	) {
		const attack = super.getAttack(game, instance, pos, hermitAttackType)

		if (!attack || attack.type !== 'secondary') return attack

		const pickedCard = this.pickedAttack.get(instance)?.card
		const attackType = this.pickedAttack.get(instance)?.attack

		// Delete the stored data straight away
		this.pickedAttack.set(instance, null)

		if (!pickedCard || !attackType) return null
		if (!pickedCard.isHermit()) return null

		// Return that cards secondary attack
		const newAttack = pickedCard.card.getAttack(game, pickedCard, pos, attackType)
		if (!newAttack) return null
		const attackName =
			newAttack.type === 'primary' ? pickedCard.props.primary.name : pickedCard.props.secondary.name
		newAttack.updateLog(
			(values) =>
				`${values.attacker} ${values.coinFlip ? values.coinFlip + ', then ' : ''} attacked ${
					values.target
				} with $v${pickedCard.props.name}'s ${attackName}$ for ${values.damage} damage`
		)
		return newAttack
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.getAttackRequests.add(instance, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance.instance !== instance.instance) return

			// Only secondary attack
			if (hermitAttackType !== 'secondary') return

			// Make sure we have an afk hermit to pick
			if (!game.someSlotFulfills(this.pickCondition)) return

			game.addPickRequest({
				playerId: player.id,
				id: this.props.id,
				message: 'Pick one of your AFK Hermits',
				canPick: this.pickCondition,
				onResult: (pickedSlot) => {
					const rowIndex = pickedSlot.rowIndex
					if (rowIndex === null) return
					if (rowIndex === player.board.activeRow) return
					const pickedCard = pickedSlot.card
					if (!pickedCard) return

					// No picking the same card as us
					if (pickedCard.props.id === this.props.id) return

					game.addModalRequest({
						playerId: player.id,
						data: {
							modalId: 'copyAttack',
							payload: {
								modalName: 'Cleo: Choose an attack to copy',
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

							// Store the card id to use when getting attacks
							this.pickedAttack.set(instance, {
								card: pickedCard,
								attack: modalResult.pick,
							})

							// Add the attack requests of the chosen card as they would not be called otherwise
							player.hooks.getAttackRequests.call(pickedCard, modalResult.pick)

							return 'SUCCESS'
						},
						onTimeout: () => {
							this.pickedAttack.set(instance, {
								card: pickedCard,
								attack: 'primary',
							})
						},
					})
				},
				onTimeout() {
					// We didn't pick someone so do nothing
				},
			})
		})

		player.hooks.blockedActions.add(instance, (blockedActions) => {
			if (!game.someSlotFulfills(slot.every(slot.activeRow, slot.hasInstance(instance))))
				return blockedActions
			if (!game.someSlotFulfills(this.pickCondition)) {
				blockedActions.push('SECONDARY_ATTACK')
			}

			return blockedActions
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos
		this.pickedAttack.clear(instance)
		player.hooks.getAttackRequests.remove(instance)
		player.hooks.blockedActions.remove(instance)
	}
}

export default ZombieCleoRareHermitCard
