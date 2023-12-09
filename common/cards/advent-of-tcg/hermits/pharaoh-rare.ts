import {HERMIT_CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getNonEmptyRows} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import HermitCard from '../../base/hermit-card'

class PharaohRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'pharaoh_rare',
			numericId: 214,
			name: 'Pharaoh',
			rarity: 'rare',
			hermitType: 'balanced',
			health: 300,
			primary: {
				name: 'Targét',
				cost: ['balanced'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Xibalba',
				cost: ['balanced', 'balanced'],
				damage: 80,
				power:
					"Flip a coin. If heads, can give up to 80hp to AFK Hermit. Health given is equal to damage during attack. Can't heal other Pharaohs.",
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.afterAttack.add(instance, (attack) => {
			if (attack.id !== instanceKey || attack.type !== 'secondary') return

			const nonEmptyRows = getNonEmptyRows(player, true, true)
			if (
				nonEmptyRows.length === 0 ||
				nonEmptyRows.every((c) => c.row.hermitCard.cardId === 'pharaoh_rare')
			) {
				return
			}

			const coinFlip = flipCoin(player, this.id)

			if (coinFlip[0] === 'tails') return

			game.addPickRequest({
				playerId: player.id,
				id: this.id,
				message: 'Pick an AFK Hermit from either side of the board',
				onResult(pickResult) {
					const pickedPlayer = game.state.players[pickResult.playerId]
					const rowIndex = pickResult.rowIndex
					if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
					if (rowIndex === pickedPlayer.board.activeRow) return 'FAILURE_INVALID_SLOT'

					if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					// Make sure it's an actual hermit card
					const hermitCard = HERMIT_CARDS[pickResult.card.cardId]
					if (!hermitCard) return 'FAILURE_INVALID_SLOT'
					//C annot heal other pharaohs
					if (hermitCard.id === 'pharaoh_rare') return 'FAILURE_INVALID_SLOT'

					const hermitId = pickedPlayer.board.rows[rowIndex].hermitCard?.cardId
					const hermitHealth = pickedPlayer.board.rows[rowIndex].health
					if (!hermitHealth || !hermitId) return 'FAILURE_INVALID_SLOT'
					const hermitInfo = HERMIT_CARDS[hermitId]
					if (hermitInfo) {
						// Heal
						pickedPlayer.board.rows[rowIndex].health = Math.min(
							hermitHealth + attack.calculateDamage(),
							hermitHealth + 80,
							hermitInfo.health // Max health
						)
					} else {
						// Armor Stand
						pickedPlayer.board.rows[rowIndex].health = Math.min(
							hermitHealth + attack.calculateDamage(),
							hermitHealth + 80
						)
					}
					return 'SUCCESS'
				},
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.afterAttack.remove(instance)
	}

	override getExpansion() {
		return 'advent_of_tcg'
	}

	override getPalette() {
		return 'pharaoh'
	}
}

export default PharaohRareHermitCard
