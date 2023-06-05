import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
import {HERMIT_CARDS} from '../..'

class FalseSymmetryRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'falsesymmetry_rare',
			name: 'False',
			rarity: 'rare',
			hermitType: 'builder',
			health: 250,
			primary: {
				name: 'High Noon',
				cost: ['builder'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Supremacy',
				cost: ['builder', 'any'],
				damage: 70,
				power: 'Flip a coin.\n\nIf heads, heal 40hp to this Hermit.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onAttach(game, instance) {
		const {currentPlayer} = game.ds

		currentPlayer.hooks.onAttack[instance] = (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'tails') return
			const attacker = attack.attacker
			if (!attacker) return

			// Heal 40hp
			const hermitInfo = HERMIT_CARDS[attacker.row.hermitCard.cardId]
			attacker.row.health = Math.min(
				attacker.row.health + 40,
				hermitInfo.health
			)
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onDetach(game, instance) {
		const {currentPlayer} = game.ds
		// Remove hooks
		delete currentPlayer.hooks.onAttack[instance]
	}
}

export default FalseSymmetryRareHermitCard
