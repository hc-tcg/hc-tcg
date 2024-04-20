import {HERMIT_CARDS} from '../..'
import {CardPosModel, getBasicCardPos} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {HermitAttackType} from '../../../types/attack'
import {CardT} from '../../../types/game-state'
import {getNonEmptyRows} from '../../../utils/board'
import HermitCard from '../../base/hermit-card'

class ZombieCleoRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'zombiecleo_rare',
			numericId: 116,
			name: 'Cleo',
			rarity: 'rare',
			hermitType: 'pvp',
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
		})
	}

	override getAttacks(
		game: GameModel,
		instance: string,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType
	) {
		const {player} = pos
		const pickedCardKey = this.getInstanceKey(instance, 'pickedCard')
		const attacks = super.getAttacks(game, instance, pos, hermitAttackType)

		if (attacks[0].type !== 'secondary') return attacks

		const pickedCard: CardT = player.custom[pickedCardKey]?.card
		const attackType = player.custom[pickedCardKey]?.attack

		// Delete the stored data straight away
		delete pos.player.custom[pickedCardKey]

		if (!pickedCard || !attackType) return []

		// No loops please
		if (pickedCard.cardId === this.id) return []

		const hermitInfo = HERMIT_CARDS[pickedCard.cardId]
		if (!hermitInfo) return []

		// Return that cards secondary attack
		return hermitInfo.getAttacks(game, pickedCard.cardInstance, pos, attackType)
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const pickedCardKey = this.getInstanceKey(instance, 'pickedCard')

		player.hooks.getAttackRequests.add(instance, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance !== instance) return

			// Only secondary attack
			if (hermitAttackType !== 'secondary') return

			// Make sure we have an afk hermit to pick
			const afk = getNonEmptyRows(player, true)
			if (afk.length === 0) return

			game.addPickRequest({
				playerId: player.id,
				id: this.id,
				message: 'Pick one of your AFK Hermits',
				onResult(pickResult) {
					if (pickResult.playerId !== player.id) return 'FAILURE_INVALID_PLAYER'

					const rowIndex = pickResult.rowIndex
					if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
					if (rowIndex === player.board.activeRow) return 'FAILURE_INVALID_SLOT'

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
								modalName: 'Cleo: Choose an attack to copy',
								modalDescription: "Which of the Hermit's attacks do you want to copy?",
								cardPos: getBasicCardPos(game, pickedCard.cardInstance),
							},
						},
						onResult(modalResult) {
							if (!modalResult || !modalResult.pick) return 'FAILURE_INVALID_DATA'

							// Store the card id to use when getting attacks
							player.custom[pickedCardKey] = {
								card: pickedCard,
								attack: modalResult.pick,
							}

							// Add the attack requests of the chosen card as they would not be called otherwise
							player.hooks.getAttackRequests.call(pickedCard.cardInstance, modalResult.pick)

							return 'SUCCESS'
						},
						onTimeout() {
							player.custom[pickedCardKey] = {
								card: pickedCard,
								attack: 'primary',
							}
						},
					})

					return 'SUCCESS'
				},
				onTimeout() {
					// We didn't pick someone so do nothing
				},
			})
		})

		// @TODO requires getActions to be able to remove
		player.hooks.blockedActions.add(instance, (blockedActions) => {
			const afkHermits = getNonEmptyRows(player, true).length
			if (
				player.board.activeRow === pos.rowIndex &&
				afkHermits <= 0 &&
				!blockedActions.includes('SECONDARY_ATTACK')
			) {
				blockedActions.push('SECONDARY_ATTACK')
			}

			return blockedActions
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const pickedCardKey = this.getInstanceKey(instance, 'pickedCard')
		player.hooks.getAttackRequests.remove(instance)
		player.hooks.blockedActions.remove(instance)
		delete player.custom[pickedCardKey]
	}
}

export default ZombieCleoRareHermitCard
