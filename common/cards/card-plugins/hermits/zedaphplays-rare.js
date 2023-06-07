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

			const coinFlip = flipCoin(player)
			player.coinFlips[this.id] = coinFlip

			if (coinFlip[0] !== 'heads') return

			otherPlayer.custom[instanceKey] = flipCoin(player)
		}

		otherPlayer.hooks.beforeAttack[instance] = (attack) => {
			if (!['primary', 'secondary', 'zero'].includes(attack.type)) return
			if (!attack.attacker) return

			const coinFlip = otherPlayer.custom[instanceKey]
			if (!coinFlip) return

			otherPlayer.coinFlips['Opponent ' + this.name] = coinFlip

			if (coinFlip[0] === 'heads') {
				// Change attack target - this just works
				attack.target = attack.attacker
			}
		}

		otherPlayer.hooks.turnEnd[instance] = () => {
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
		const {player} = pos
		// Remove hooks
		delete player.hooks.onAttack[instance]
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		// On Zed's attack flipCoin and set flag
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer, opponentPlayer} = game.ds
			const {moveRef, typeAction} = attackState

			if (typeAction !== 'PRIMARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') {
				currentPlayer.custom[this.id] = flipCoin(currentPlayer)
			}

			return target
		})

		// When opponent attacks check flag and add second coin flip if set
		game.hooks.attack.tap(this.id, (target) => {
			const {opponentPlayer, currentPlayer} = game.ds

			const coinFlip = opponentPlayer.custom[this.id]
			if (!coinFlip) return target
			delete opponentPlayer.custom[this.id]

			currentPlayer.coinFlips['Opponent ' + this.name] = coinFlip
			if (coinFlip[0] !== 'heads') return target

			target.reverseDamage = true
			return target
		})

		// When Zed has turn again, and opponent didn't attack remove flag
		game.hooks.turnStart.tap(this.id, () => {
			const {currentPlayer} = game.ds
			if (!currentPlayer.custom[this.id]) return
			delete currentPlayer.custom[this.id]
		})
	}
}

export default ZedaphPlaysRareHermitCard
