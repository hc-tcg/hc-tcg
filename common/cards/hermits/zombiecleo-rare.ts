import {HERMIT_CARDS} from '..'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {HermitAttackType} from '../../types/attack'
import {CardT} from '../../types/game-state'
import {PickedSlots} from '../../types/pick-process'
import {getNonEmptyRows} from '../../utils/board'
import HermitCard from '../base/hermit-card'

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
				power: 'Use a secondary attack from any of your AFK Hermits.',
			},
		})
	}

	override getAttacks(
		game: GameModel,
		instance: string,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType,
		pickedSlots: PickedSlots
	) {
		const imitatingCardKey = this.getInstanceKey(instance, 'imitatingCard')
		const attacks = super.getAttacks(game, instance, pos, hermitAttackType, pickedSlots)

		if (attacks[0].type !== 'secondary') return attacks

		const card: CardT = pos.player.custom[imitatingCardKey]
		if (card === undefined) return []

		// No loops please
		if (card.cardId === this.id) return []

		const hermitInfo = HERMIT_CARDS[card.cardId]
		if (!hermitInfo) return []

		// We used the card, delete the data
		delete pos.player.custom[imitatingCardKey]

		// Return that cards secondary attack
		return hermitInfo.getAttacks(game, card.cardInstance, pos, hermitAttackType, {})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const imitatingCardKey = this.getInstanceKey(instance, 'imitatingCard')

		player.hooks.getAttackRequests.add(instance, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance !== instance) return

			// Only secondary attack
			if (hermitAttackType !== 'secondary') return

			// Make sure there is something to choose
			const playerHasAfk = getNonEmptyRows(player, false).length > 0
			if (!playerHasAfk) return

			game.addPickRequest({
				playerId: player.id,
				id: this.id,
				message: 'Pick one of your AFK Hermits',
				onResult(pickResult) {
					if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'

					const rowIndex = pickResult.rowIndex
					if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
					if (rowIndex === player.board.activeRow) return 'FAILURE_INVALID_SLOT'

					if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					// Store the card to use
					player.custom[imitatingCardKey] = pickResult.card

					return 'SUCCESS'
				},
			})
		})

		player.hooks.blockedActions.add(instance, (blockedActions) => {
			const afkHermits = getNonEmptyRows(player, false).length
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
		const imitatingCardKey = this.getInstanceKey(instance, 'imitatingCard')
		player.hooks.getAttackRequests.remove(instance)
		player.hooks.blockedActions.remove(instance)
		delete player.custom[imitatingCardKey]
	}
}

export default ZombieCleoRareHermitCard
