import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

class LlamadadRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'llamadad_rare',
			name: 'Llamadad',
			rarity: 'rare',
			hermitType: 'balanced',
			health: 290,
			primary: {
				name: 'Spitz',
				cost: ['balanced'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Matilda',
				cost: ['balanced', 'balanced'],
				damage: 80,
				power: 'Flip a coin.\n\nIf heads, Matilda does an additional 40hp damage.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onAttack[instance] = (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return

			const coinFlip = flipCoin(player, this.id)
			if (coinFlip[0] === 'heads') {
				attack.addDamage(this.id, 40)
			}
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

	getExpansion() {
		return 'alter_egos'
	}

	getPalette() {
		return 'alter_egos'
	}

	getBackground() {
		return 'alter_egos_background'
	}
}

export default LlamadadRareHermitCard
