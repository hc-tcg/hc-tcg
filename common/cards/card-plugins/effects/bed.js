import EffectCard from './_effect-card'
import {HERMIT_CARDS} from '../../../cards'
import {discardCard} from '../../../../server/utils'
import {getCardPos} from '../../../../server/utils/cards'
/*
Info confirmed by beef:
- If knockback is used, sleeping opponent goes AFK but wakes up.
- Discarding/Stealing the bed does not effect the sleeping opponent.
- You can use single use effects while sleeping that don't cause any damage.
- Bed can be placed only on active hermit.
- You go to sleep the moment you place the bed down so technically you lose 3 turns of attacking.
*/
class BedEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'bed',
			name: 'Bed',
			rarity: 'ultra_rare',
			description:
				"Player sleeps for the rest of this and next 2 turns. Can't attack. Restores full health when bed is attached.\n\nCan still draw and attach cards while sleeping.\n\nMust be placed on active hermit.\n\nDiscard after player wakes up.\n\n\n\nCan not go afk while sleeping.\n\nIf made afk by opponent player, hermit goes afk but also wakes up.",
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 * @returns {boolean}
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game.ds

		if (pos.slotType !== 'effect') return false
		if (pos.playerId !== currentPlayer.id) return false
		if (!pos.rowState?.hermitCard) return false

		// bed addition - hermit must also be active to attach
		if (!(currentPlayer.board.activeRow === pos.rowIndex)) return false

		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onAttach(game, instance) {
		// Give the current row sleeping for 3 turns
		const pos = getCardPos(game, instance)
		if (!pos) return
		const {rowState: row} = pos

		if (row && row.hermitCard) {
			row.health = HERMIT_CARDS[row.hermitCard.cardId].health

			// Clear any previous sleeping
			row.ailments = row.ailments.filter((a) => a.id !== 'sleeping')

			// Set new sleeping for two more turns
			row.ailments.push({id: 'sleeping', duration: 2})
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance The card instance on the board
	 */
	onTurnStart(game, instance) {
		const pos = getCardPos(game, instance)
		if (!pos) return
		const {rowState} = pos

		const isSleeping = rowState?.ailments.some((a) => a.id === 'sleeping')

		// if sleeping has worn off, discard the bed
		if (!isSleeping) {
			discardCard(game, rowState?.effectCard)
		}
	}

	//@TODO more to do here, when hermit goes afk, when bed gets detached, etc

	//**
	//* @param {GameModel} game
	//*/
	//egister(game) {
	//	// Discard bed after sleeping & store who had bed at start of turn
	//	game.hooks.turnStart.tap(this.id, () => {
	//		const {currentPlayer, opponentPlayer} = game.ds
	//		const players = [currentPlayer, opponentPlayer]
	//		players.forEach((playerState) => {
	//			const bedInfo = {}
	//			playerState.board.rows.forEach((row, rowIndex) => {
	//				const isSleeping = row.ailments.some((a) => a.id === 'sleeping')
	//				const hasBed = row.effectCard?.cardId === this.id
	//				if (!isSleeping && hasBed) {
	//					discardCard(game, row.effectCard)
	//				} else if (hasBed) {
	//					// Need to store the bed instance to check if it is the same bed later
	//					bedInfo[rowIndex] = row.effectCard?.cardInstance
	//				}
	//			})
	//			if (Object.keys(bedInfo).length > 0) {
	//				playerState.custom[this.id] = bedInfo
	//			}
	//		})
	//	})

	//	// Set sleeping if hermit received bed in given turn
	//	game.hooks.actionEnd.tap(this.id, () => {
	//		const {currentPlayer, opponentPlayer} = game.ds

	//		// We need to check both players, because of Emerald or Grian
	//		const players = [currentPlayer, opponentPlayer]
	//		players.forEach((playerState) => {
	//			const bedInfo = playerState.custom[this.id] || {}
	//			playerState.board.rows.forEach((row, index) => {
	//				const hasBed = row.effectCard?.cardId === this.id
	//				const previousBed = bedInfo[index]
	//				const currentBed = row.effectCard?.cardInstance
	//				if (hasBed && currentBed != previousBed && row.hermitCard) {
	//					row.health = HERMIT_CARDS[row.hermitCard.cardId].health
	//					// Clear any previous sleeping
	//					row.ailments = row.ailments.filter((a) => a.id !== 'sleeping')
	//					// Set new sleeping for full two turns
	//					row.ailments.push({id: 'sleeping', duration: 2})
	//				}
	//			})
	//		})
	//	})

	//	// Cleanup map of who had the bed
	//	game.hooks.turnEnd.tap(this.id, () => {
	//		const {currentPlayer, opponentPlayer} = game.ds
	//		delete currentPlayer.custom[this.id]
	//		delete opponentPlayer.custom[this.id]
	//	})
	//}
}

export default BedEffectCard
