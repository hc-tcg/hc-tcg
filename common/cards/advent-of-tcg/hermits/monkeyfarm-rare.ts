import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {discardCard} from '../../../utils/movement'
import HermitCard from '../../base/hermit-card'
import {getNonEmptyRows} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'

class MonkeyfarmRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'monkeyfarm_rare',
			numericId: 212,
			name: 'Monkeyfarm',
			rarity: 'rare',
			hermitType: 'farm',
			health: 250,
			primary: {
				name: 'Skull',
				cost: ['farm'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Monkeystep',
				cost: ['farm', 'farm'],
				damage: 80,
				power: "Flip a coin. If heads, discard 1 attached item card from an opponent's AFK Hermit.",
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.afterAttack.add(instance, (attack) => {
			const attacker = attack.getAttacker()
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary' || !attacker)
				return

			const coinFlip = flipCoin(player, attacker.row.hermitCard)
			if (coinFlip[0] !== 'heads') return

			const emptyRows = getNonEmptyRows(opponentPlayer, true, true)
			const opponentItemCards = emptyRows.reduce(
				(partialSum, a) => partialSum + a.row.itemCards.filter((x) => x != null).length,
				0
			)

			if (opponentItemCards == 0) return

			game.addPickRequest({
				playerId: player.id,
				id: this.id,
				message: "Pick one of your opponent's AFK Hermit's item cards",
				onResult(pickResult) {
					if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_INVALID_PLAYER'

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
		player.hooks.afterAttack.remove(instance)
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
