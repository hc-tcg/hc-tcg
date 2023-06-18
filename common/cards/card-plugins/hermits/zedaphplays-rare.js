import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import CARDS from '../../../cards'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'

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
		const {player, otherPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onAttack[instance] = (attack) => {
			if (attack.id !== instanceKey || attack.type !== 'primary') return

			const coinFlip = flipCoin(player, this.id)
			player.coinFlips[this.id] = coinFlip

			if (coinFlip[0] !== 'heads') return

			otherPlayer.custom[instanceKey] = flipCoin(player, this.id)
		}

		otherPlayer.hooks.beforeAttack[instance] = (attack) => {
			if (['backlash', 'ailment'].includes(attack.type)) return
			if (!attack.attacker) return

			const coinFlip = otherPlayer.custom[instanceKey]
			if (!coinFlip) return

			otherPlayer.coinFlips['Opponent ' + this.name] = coinFlip

			if (coinFlip[0] === 'heads') {
				// Change attack target - this just works
				attack.target = attack.attacker
			}
		}

		otherPlayer.hooks.onTurnEnd[instance] = () => {
			// Delete our hook at the end of opponents turn
			delete otherPlayer.custom[instanceKey]
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, otherPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)

		// Remove hooks
		delete player.hooks.onAttack[instance]
		delete otherPlayer.hooks.beforeAttack[instance]
		delete otherPlayer.hooks.onTurnEnd[instance]
		delete otherPlayer.custom[instanceKey]
	}
}

export default ZedaphPlaysRareHermitCard
