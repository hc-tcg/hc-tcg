import HermitCard from './_hermit-card'
import {HERMIT_CARDS} from '../../../cards'
import {GameModel} from '../../../../server/models/game-model'

class Iskall85RareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'iskall85_rare',
			name: 'Iskall',
			rarity: 'rare',
			hermitType: 'farm',
			health: 290,
			primary: {
				name: 'Of Doom',
				cost: ['farm'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Bird Poop',
				cost: ['farm', 'farm'],
				damage: 80,
				power: 'Does double damage versus Builder types.',
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
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary' || !attack.target) return

			const isBuilder =
				attack.target.row.hermitCard &&
				HERMIT_CARDS[attack.target.row.hermitCard.cardId]?.hermitType === 'builder'
					? 2
					: 1

			attack.multiplyDamage(this.id, isBuilder)
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
}

export default Iskall85RareHermitCard
