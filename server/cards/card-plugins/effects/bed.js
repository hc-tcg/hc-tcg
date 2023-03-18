import EffectCard from './_effect-card'
import {HERMIT_CARDS} from '../../../cards'
import {discardCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */
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

		this.attachReq = {target: 'player', type: ['effect'], active: true}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		// Discard bed after sleeping & store who had bed at start of turn
		game.hooks.turnStart.tap(this.id, () => {
			const {currentPlayer, opponentPlayer} = game.ds

			// Need to know which row had bed at start of the turn
			const players = [currentPlayer, opponentPlayer]
			players.forEach((playerState) => {
				const bedInfo = playerState.custom[this.id] || {}
				playerState.board.rows.forEach((row, rowIndex) => {
					const isSleeping = row.ailments.some((a) => a.id === 'sleeping')
					const hasBed = row.effectCard?.cardId === this.id
					if (!isSleeping && hasBed) {
						discardCard(game, row.effectCard)
					}
					if (hasBed) bedInfo[rowIndex] = true
				})
				if (Object.keys(bedInfo).length > 0) {
					playerState.custom[this.id] = bedInfo
				}
			})
		})

		// Set sleeping if hermit received bed in given turn
		game.hooks.actionEnd.tap(this.id, () => {
			const {currentPlayer, opponentPlayer} = game.ds

			// We need to check both players, because of emerald
			const players = [currentPlayer, opponentPlayer]
			players.forEach((playerState) => {
				const bedInfo = playerState.custom[this.id] || {}
				playerState.board.rows.forEach((row, index) => {
					const hadBed = bedInfo[index]
					const hasBed = row.effectCard?.cardId === this.id
					if (!hadBed && hasBed && row.hermitCard) {
						row.health = HERMIT_CARDS[row.hermitCard.cardId].health
						// clear any previous sleeping
						row.ailments = row.ailments.filter((a) => a.id !== 'sleeping')
						// set new sleeping for full two turns
						row.ailments.push({id: 'sleeping', duration: 2})
						bedInfo[index] = true
					}
				})
			})
		})

		// Cleanup map of who had the bed
		game.hooks.turnEnd.tap(this.id, () => {
			const {currentPlayer, opponentPlayer} = game.ds
			delete currentPlayer.custom[this.id]
			delete opponentPlayer.custom[this.id]
		})
	}
}

export default BedEffectCard
