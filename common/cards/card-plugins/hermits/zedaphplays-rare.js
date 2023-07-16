import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

class ZedaphPlaysRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'zedaphplays_rare',
			name: 'Zedaph',
			rarity: 'rare',
			hermitType: 'explorer',
			health: 290,
			primary: {
				name: 'Sheep Stare',
				cost: ['explorer'],
				damage: 50,
				power:
					'Flip a Coin.\n\nIf heads, opponent flips a coin their next turn.\n\nIf heads, opponent damages themselves.',
			},
			secondary: {
				name: 'Get Dangled',
				cost: ['explorer', 'explorer'],
				damage: 80,
				power: null,
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)
		const coinFlipResult = this.getInstanceKey(instance, 'coinFlipResult')

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== instanceKey || attack.type !== 'primary') return

			const coinFlip = flipCoin(player, this.id)
			if (coinFlip[0] !== 'heads') return

			opponentPlayer.hooks.beforeAttack.add(instance, (attack) => {
				if (attack.isType('ailment') || attack.isBacklash) return
				if (!attack.attacker) return

				// No need to flip a coin for multiple attacks
				if (!player.custom[coinFlipResult]) {
					const coinFlip = flipCoin(player, this.id, 1, opponentPlayer)
					player.custom[coinFlipResult] = coinFlip[0]
				}

				if (player.custom[coinFlipResult] === 'heads') {
					// Change attack target - this just works
					attack.target = attack.attacker
					attack.isBacklash = true
				}
			})

			opponentPlayer.hooks.onTurnEnd.add(instance, () => {
				// Delete our hook at the end of opponents turn
				delete player.custom[coinFlipResult]
				opponentPlayer.hooks.onTurnEnd.remove(instance)
				opponentPlayer.hooks.beforeAttack.remove(instance)
			})
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos

		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default ZedaphPlaysRareHermitCard
