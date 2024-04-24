import HermitCard from '../../base/hermit-card'
import {HERMIT_CARDS} from '../..'
import {GameModel} from '../../../models/game-model'
import {CardPosModel, getBasicCardPos} from '../../../models/card-pos-model'
import {HermitAttackType} from '../../../types/attack'
import {CardT} from '../../../types/game-state'

class RendogRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'rendog_rare',
			numericId: 87,
			name: 'Rendog',
			rarity: 'rare',
			hermitType: 'builder',
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
		})
	}

	override getAttacks(
		game: GameModel,
		instance: string,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType
	) {
		const {player} = pos
		const pickedAttackKey = this.getInstanceKey(instance, 'pickedAttack')
		const imitatingCardKey = this.getInstanceKey(instance, 'imitatingCard')
		const attacks = super.getAttacks(game, instance, pos, hermitAttackType)

		if (attacks[0].type !== 'secondary') return attacks
		if (attacks[0].id !== this.getInstanceKey(instance)) return attacks

		const imitatingCard: CardT | undefined = player.custom[imitatingCardKey]

		if (!imitatingCard) return []

		// No loops please
		if (imitatingCard.cardId === this.id) return []

		const hermitInfo = HERMIT_CARDS[imitatingCard.cardId]
		if (!hermitInfo) return []

		const attackType = player.custom[pickedAttackKey]
		if (!attackType) return []
		// Delete the stored data about the attack we chose
		delete player.custom[pickedAttackKey]

		// Return the attack we picked from the card we picked
		return hermitInfo.getAttacks(game, imitatingCard.cardInstance, pos, attackType)
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const imitatingCardKey = this.getInstanceKey(instance, 'imitatingCard')
		const pickedAttackKey = this.getInstanceKey(instance, 'pickedAttack')
		const imitatingCardInstance = Math.random().toString()

		player.hooks.getAttackRequests.add(instance, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance !== instance) return
			// Only activate power on secondary attack
			if (hermitAttackType !== 'secondary') return

			game.addPickRequest({
				playerId: player.id,
				id: this.id,
				message: "Pick one of your opponent's Hermits",
				onResult(pickResult) {
					if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_WRONG_PLAYER'

					const rowIndex = pickResult.rowIndex
					if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'

					if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
					const pickedCard = pickResult.card
					if (!pickedCard) return 'FAILURE_INVALID_SLOT'

					// No picking the same card as us
					if (pickedCard.cardId === this.id) return 'FAILURE_WRONG_PICK'

					game.addModalRequest({
						playerId: player.id,
						data: {
							modalId: 'copyAttack',
							payload: {
								modalName: 'Rendog: Choose an attack to copy',
								modalDescription: "Which of the Hermit's attacks do you want to copy?",
								cardPos: getBasicCardPos(game, pickedCard.cardInstance),
							},
						},
						onResult(modalResult) {
							if (!modalResult || !modalResult.pick) return 'FAILURE_INVALID_DATA'
							const attack: HermitAttackType = modalResult.pick

							// Store the chosen attack to copy
							player.custom[pickedAttackKey] = attack

							// Replace the hooks of the card we're imitating only if it changed
							const imitatingCard: CardT | undefined = player.custom[imitatingCardKey]
							if (!imitatingCard || pickedCard.cardId !== imitatingCard.cardId) {
								if (imitatingCard) {
									// Detach the old card
									const hermitInfo = HERMIT_CARDS[imitatingCard.cardId]
									if (hermitInfo) {
										hermitInfo.onDetach(game, imitatingCard.cardInstance, pos)
									}
								}

								// Attach the new card
								const newHermitInfo = HERMIT_CARDS[pickedCard.cardId]
								if (newHermitInfo) newHermitInfo.onAttach(game, imitatingCardInstance, pos)

								// Store which card we are imitating with our own instance
								player.custom[imitatingCardKey] = {
									cardId: pickedCard.cardId,
									cardInstance: imitatingCardInstance,
								}
							}

							// Add the attack requests of the chosen card
							player.hooks.getAttackRequests.call(imitatingCardInstance, modalResult.pick)

							return 'SUCCESS'
						},
						onTimeout() {
							player.custom[pickedAttackKey] = {
								card: pickedCard,
								attack: 'primary',
							}
						},
					})

					return 'SUCCESS'
				},
				onTimeout() {
					// We didn't pick someone to imitate so do nothing
				},
			})
		})

		player.hooks.onActiveRowChange.add(instance, (oldRow, newRow) => {
			if (pos.rowIndex === oldRow) {
				// We switched away from ren, delete the imitating card
				const imitatingCard: CardT | undefined = player.custom[imitatingCardKey]
				if (imitatingCard) {
					// Detach the old card
					const hermitInfo = HERMIT_CARDS[imitatingCard.cardId]
					if (hermitInfo) {
						hermitInfo.onDetach(game, imitatingCard.cardInstance, pos)
					}
				}
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const imitatingCardKey = this.getInstanceKey(instance, 'imitatingCard')
		const pickedAttackKey = this.getInstanceKey(instance, 'pickedAttack')

		// If the card we are imitating is till attached, detach it
		const imitatingCard: CardT | undefined = player.custom[imitatingCardKey]
		if (imitatingCard) {
			const hermitInfo = HERMIT_CARDS[player.custom[imitatingCardKey]]
			if (hermitInfo) {
				hermitInfo.onDetach(game, imitatingCard.cardInstance, pos)
			}
		}

		// Remove hooks and custom data
		player.hooks.getAttackRequests.remove(instance)
		player.hooks.onActiveRowChange.remove(instance)
		delete player.custom[imitatingCardKey]
		delete player.custom[pickedAttackKey]
	}
}

export default RendogRareHermitCard
