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

		player.hooks.onAttack[instance] = (attack) => {
			if (attack.id !== instanceKey || attack.type !== 'primary') return

			const coinFlip = flipCoin(player, this.id)
			if (coinFlip[0] !== 'heads') return

			player.custom[instanceKey] = true
		}

		opponentPlayer.hooks.beforeAttack[instance] = (attack) => {
			if (['backlash', 'ailment'].includes(attack.type)) return
			if (!attack.attacker) return

			const tossCoin = player.custom[instanceKey]
			if (!tossCoin) return

			const coinFlip = flipCoin(player, this.id, 1, opponentPlayer)
			if (coinFlip[0] === 'heads') {
				// Change attack target - this just works
				attack.target = attack.attacker
			}
		}

		opponentPlayer.hooks.onTurnEnd[instance] = () => {
			// Delete our hook at the end of opponents turn
			delete opponentPlayer.custom[instanceKey]
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)

		// Remove hooks
		delete player.hooks.onAttack[instance]
		delete opponentPlayer.hooks.beforeAttack[instance]
		delete opponentPlayer.hooks.onTurnEnd[instance]
		delete opponentPlayer.custom[instanceKey]
	}
}

export default ZedaphPlaysRareHermitCard
