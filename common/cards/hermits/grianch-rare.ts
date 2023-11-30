import HermitCard from '../base/hermit-card'
import {HERMIT_CARDS} from '..'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {getNonEmptyRows} from '../../utils/board'
import {flipCoin} from '../../utils/coinFlips'

class GrianchRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'grianch_rare',
			numericId: 174,
			name: 'The Grianch',
			rarity: 'rare',
			hermitType: 'terraform',
			health: 250,
			primary: {
				name: 'Nice',
				cost: ['prankster', 'any'],
				damage: 70,
				power: 'Heal any AFK Hermit for 40hp.',
			},
			secondary: {
				name: 'Naughty',
				cost: ['prankster', 'prankster'],
				damage: 80,
				power:
					'Flip a Coin.\n\nIf heads, attack damage doubles.\n\nIf tails, your opponent may attack twice next round.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)
		const canAttackTwice = this.getInstanceKey(instance, 'reviveNextTurn')

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== instanceKey || attack.type !== 'secondary') return

			const coinFlip = flipCoin(player, this.id)

			if (coinFlip[0] === 'tails') {
				player.custom[canAttackTwice] = true
				return
			}

			attack.addDamage(this.id, this.secondary.damage)
		})

		opponentPlayer.hooks.afterAttack.add(instance, (attack) => {
			if (!player.custom[canAttackTwice]) return
			game.removeCompletedActions('PRIMARY_ATTACK', 'SECONDARY_ATTACK')
			delete player.custom[canAttackTwice]
		})

		player.hooks.afterAttack.add(instance, (attack) => {
			if (attack.id !== instanceKey || attack.type !== 'primary') return

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
		const {player, opponentPlayer} = pos
		const canAttackTwice = this.getInstanceKey(instance, 'reviveNextTurn')
		player.hooks.onAttack.remove(instance)
		player.hooks.afterAttack.remove(instance)
		opponentPlayer.hooks.afterAttack.remove(instance)
		delete player.custom[canAttackTwice]
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
