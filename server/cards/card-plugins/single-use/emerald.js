import SingleUseCard from './_single-use-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class EmeraldSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'emerald',
			name: 'Emerald',
			rarity: 'rare',
			description:
				'Swap 1 effect card with opposing active Hermit.\n\nDiscard after use.',
		})

		this.useReqs = [
			{target: 'opponent', type: 'hermit', amount: 1, active: true},
			{target: 'player', type: 'hermit', amount: 1, active: true},
		]
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.applyEffect.tap(this.id, () => {
			const {singleUseInfo, playerActiveRow, opponentActiveRow, currentPlayer, opponentPlayer} = game.ds
			if (singleUseInfo?.id === this.id) {
				if (!playerActiveRow || !opponentActiveRow) return 'INVALID'
				const pEffect = playerActiveRow?.effectCard
				const oEffect = opponentActiveRow?.effectCard
				playerActiveRow.effectCard = oEffect
				opponentActiveRow.effectCard = pEffect
				// Handle Bed
				if (oEffect?.cardId === 'bed' || pEffect?.cardId === 'bed') {
					const players = [currentPlayer, opponentPlayer]
					players.forEach((playerState) => {
						// Remove bed from custom data, the players will be put back to sleep at the end of the action by the bed,
						// by doing this we reset the sleep counter if the players swap beds and a bed can be used after using a emerald
						delete playerState.custom['bed']
					})
				}
				return 'DONE'
			}
		})
	}
}

export default EmeraldSingleUseCard
