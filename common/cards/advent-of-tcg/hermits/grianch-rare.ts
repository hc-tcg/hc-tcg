import HermitCard from '../../base/hermit-card'
import {HERMIT_CARDS} from '../..'
import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {getNonEmptyRows} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'

class GrianchRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'grianch_rare',
			numericId: 209,
			name: 'The Grianch',
			rarity: 'rare',
			hermitType: 'builder',
			health: 250,
			primary: {
				name: 'Nice',
				cost: ['builder', 'any'],
				damage: 70,
				power: 'Heal any AFK Hermit for 40hp.',
			},
			secondary: {
				name: 'Naughty',
				cost: ['builder', 'builder'],
				damage: 80,
				power:
					'Flip a Coin.\nIf heads, attack damage doubles.\nIf tails, your opponent may attack twice next round.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onAttack.add(instance, (attack) => {
			const attacker = attack.getAttacker()
			if (attack.id !== instanceKey || attack.type !== 'secondary' || !attacker) return

			const coinFlip = flipCoin(player, attacker.row.hermitCard)

			if (coinFlip[0] === 'tails') {
				opponentPlayer.hooks.afterAttack.add(instance, (attack) => {
					game.removeCompletedActions('PRIMARY_ATTACK', 'SECONDARY_ATTACK', 'SINGLE_USE_ATTACK')
					opponentPlayer.hooks.afterAttack.remove(instance)
				})
				return
			}

			attack.addDamage(this.id, this.secondary.damage)
		})

		player.hooks.afterAttack.add(instance, (attack) => {
			if (attack.id !== instanceKey || attack.type !== 'primary') return

			const nonEmptyRows = getNonEmptyRows(player, true, true)
			if (nonEmptyRows.length === 0) return

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
					const hermitId = pickedPlayer.board.rows[rowIndex].hermitCard?.cardId
					const hermitHealth = pickedPlayer.board.rows[rowIndex].health

					if (!hermitHealth || !hermitId) return 'FAILURE_INVALID_SLOT'
					const hermitInfo = HERMIT_CARDS[hermitId]
					if (hermitInfo) {
						// Heal
						pickedPlayer.board.rows[rowIndex].health = Math.min(
							hermitHealth + 40,
							hermitInfo.health // Max health
						)
					} else {
						// Armor Stand
						pickedPlayer.board.rows[rowIndex].health = hermitHealth + 40
					}
					return 'SUCCESS'
				},
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onAttack.remove(instance)
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

export default GrianchRareHermitCard
