import {CARDS, HERMIT_CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getActiveRow, getNonEmptyRows} from '../../../utils/board'
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
					'Flip a coin. If heads, can give up to 80hp to AFK Hermit. Health given is equal to damage during attack. Can not heal other Pharaohs.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const playerKey = this.getInstanceKey(instance, 'player')
		const rowKey = this.getInstanceKey(instance, 'row')

		// Pick the hermit to heal
		player.hooks.getAttackRequests.add(instance, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance !== instance) return

			// Only secondary attack
			if (hermitAttackType !== 'secondary') return

			// Make sure there is something to select and coin flip
			const nonEmptyRows = getNonEmptyRows(player, true, true)
			if (
				nonEmptyRows.length === 0 ||
				nonEmptyRows.every((c) => c.row.hermitCard.cardId === 'pharaoh_rare') ||
				!nonEmptyRows.some((rowPos) => HERMIT_CARDS[rowPos.row.hermitCard.cardId] !== undefined)
			) {
				return
			}

			const attacker = getActiveRow(player)?.hermitCard
			if (!attacker) return

			const coinFlip = flipCoin(player, attacker)

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

					//Cannot heal other pharaohs
					if (hermitCard.id === 'pharaoh_rare') return 'FAILURE_INVALID_SLOT'

					// Store the info to use later
					player.custom[playerKey] = pickResult.playerId
					player.custom[rowKey] = rowIndex

					return 'SUCCESS'
				},
				onTimeout() {
					// We didn't pick anyone to heal, so heal no one
				},
			})
		})

		// Heals the afk hermit *before* we actually do damage
		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)

			const pickedPlayer = game.state.players[player.custom[playerKey]]
			if (!pickedPlayer) return
			const pickedRowIndex = player.custom[rowKey]
			const pickedRow = pickedPlayer.board.rows[pickedRowIndex]
			if (!pickedRow || !pickedRow.hermitCard) return

			const hermitInfo = HERMIT_CARDS[pickedRow.hermitCard.cardId]
			if (hermitInfo) {
				// Heal
				pickedRow.health = Math.min(
					pickedRow.health + attack.calculateDamage(),
					hermitInfo.health // Max health
				)
			}
		})

		player.hooks.onTurnEnd.add(instance, () => {
			delete player.custom[playerKey]
			delete player.custom[rowKey]
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.getAttackRequests.remove(instance)
		player.hooks.onAttack.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
	}

	override getExpansion() {
		return 'advent_of_tcg'
	}

	override getPalette() {
		return 'pharaoh'
	}
}

export default PharaohRareHermitCard
