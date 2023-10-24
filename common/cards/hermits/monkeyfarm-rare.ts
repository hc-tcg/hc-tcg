import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {discardCard} from '../../utils/movement'
import HermitCard from '../base/hermit-card'

class MonkeyfarmRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'monkeyfarm_rare',
			numericId: 157,
			name: 'Monkeyfarm',
			rarity: 'rare',
			hermitType: 'farm',
			health: 250,
			primary: {
				name: 'Skull',
				cost: ['farm'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Monkesystep',
				cost: ['farm', 'farm'],
				damage: 80,
				power:
					'Discard an item card from an AFK Hermit.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return

			const opponentAfkAmount = opponentPlayer.board.rows.length - 1
			if (opponentAfkAmount == 0)
				return
			
			const opponentActiveRowIndex = opponentPlayer.board.activeRow
			if (!opponentActiveRowIndex)
				return
			const opponentItemCards = opponentPlayer.board.rows.reduce(
				(partialSum, a) => partialSum + a.itemCards.filter((x) => x != null).length, 0
			) - opponentPlayer.board.rows[opponentActiveRowIndex].itemCards.filter((x) => x != null).length
			console.log(opponentItemCards)

			if (opponentItemCards == 0)
				return

			player.pickRequests.push({
				id: this.id,
				message: "Pick one of your opponent's AFK Hermit's item cards",
				onResult(pickResult) {
					if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_WRONG_PLAYER'
	
					const rowIndex = pickResult.rowIndex
					if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
					if (rowIndex === opponentPlayer.board.activeRow) return 'FAILURE_INVALID_SLOT'
	
					if (pickResult.slot.type !== 'item') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'
	
					const row = opponentPlayer.board.rows[rowIndex]
					if (!row.hermitCard) return 'FAILURE_INVALID_SLOT'
	
					// Apply the card
					discardCard(game, pickResult.card)
	
					return 'SUCCESS'
				},
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}

	override getExpansion() {
		return 'advent_of_tcg'
	}

	override getPalette() {
		return 'advent_of_tcg'
	}

	override getBackground() {
		return 'advent_of_tcg'
	}

}

export default MonkeyfarmRareHermitCard
