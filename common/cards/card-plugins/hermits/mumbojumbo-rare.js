import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {HERMIT_CARDS} from '../../../cards'
import {GameModel} from '../../../../server/models/game-model'

/*
- Beef confirmed that double damage condition includes other rare mumbos.
*/
class MumboJumboRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'mumbojumbo_rare',
			name: 'Mumbo',
			rarity: 'rare',
			hermitType: 'prankster',
			health: 290,
			primary: {
				name: 'Moustache',
				cost: ['prankster'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Quite Simple',
				cost: ['prankster', 'prankster'],
				damage: 40,
				power:
					'Flip a coin twice. Add 20hp damage for every heads. Total damage doubles if you have at least one other AFK Prankster.',
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
			if (
				attack.id !== this.getInstanceKey(instance) ||
				attack.type !== 'secondary'
			)
				return

			const coinFlip = flipCoin(currentPlayer, 2)
			currentPlayer.coinFlips[this.id] = coinFlip

			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			const pranksterAmount = currentPlayer.board.rows.filter(
				(row, index) =>
					row.hermitCard &&
					index !== currentPlayer.board.activeRow &&
					HERMIT_CARDS[row.hermitCard.cardId]?.hermitType === 'prankster'
			).length

			attack.addDamage(headsAmount * 20)
			if (pranksterAmount > 0) attack.multiplyDamage(2)
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

export default MumboJumboRareHermitCard
