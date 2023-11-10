import HermitCard from '../base/hermit-card'
import {HERMIT_CARDS} from '..'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {HermitAttackType} from '../../types/attack'
import {CardT} from '../../types/game-state'

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
				power: "Use any secondary move of your opponent's Hermits.",
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

		const pickedCard: CardT = player.custom[pickedCardKey]
		if (pickedCard === undefined) return []

		// No loops please
		if (pickedCard.cardId === this.id) return []

		const hermitInfo = HERMIT_CARDS[pickedCard.cardId]
		if (!hermitInfo) return []

		// "Attach" that card to our side of the board
		hermitInfo.onAttach(game, instance, pos)

		// Store which card we are imitating, to delete the hooks next turn
		const imitatingCardKey = this.getInstanceKey(instance, 'imitatingCard')
		player.custom[imitatingCardKey] = pickedCard.cardId

		delete pos.player.custom[pickedCardKey]

		// Return that cards secondary attack
		return hermitInfo.getAttacks(game, instance, pos, hermitAttackType)
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const pickedCardKey = this.getInstanceKey(instance, 'pickedCard')
		const imitatingCardKey = this.getInstanceKey(instance, 'imitatingCard')

		player.hooks.getAttackRequests.add(instance, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance !== instance) return

			// Only secondary attack
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
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					// Store the card id to use when getting attacks
					player.custom[pickedCardKey] = pickResult.card

					return 'SUCCESS'
				},
			})
		})

		// At the start of every turn, remove the hooks of the imitated hermit from our player
		player.hooks.onTurnStart.add(instance, () => {
			if (player.custom[imitatingCardKey] === undefined) return

			// Find the hermit info of the card we were imitating, and "detach" it
			const hermitInfo = HERMIT_CARDS[player.custom[imitatingCardKey]]
			if (hermitInfo) {
				hermitInfo.onDetach(game, instance, pos)
			}

			delete player.custom[imitatingCardKey]
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const imitatingCardKey = this.getInstanceKey(instance, 'imitatingCard')

		player.hooks.getAttackRequests.remove(instance)
		player.hooks.onTurnStart.remove(instance)
		delete player.custom[imitatingCardKey]
	}
}

export default RendogRareHermitCard
