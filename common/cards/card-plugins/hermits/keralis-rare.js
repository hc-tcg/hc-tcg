import HermitCard from './_hermit-card'
import {GameModel} from '../../../../server/models/game-model'
import {HERMIT_CARDS} from '../..'

class KeralisRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'keralis_rare',
			name: 'Keralis',
			rarity: 'rare',
			hermitType: 'terraform',
			health: 250,
			primary: {
				name: 'Booshes',
				cost: ['any'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Sweet Face',
				cost: ['terraform', 'terraform', 'any'],
				damage: 0,
				power: 'Heal any AFK Hermit for 100hp.',
			},
			pickOn: 'attack',
			pickReqs: [{target: 'board', type: ['hermit'], amount: 1, active: false}],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		// Heals the afk hermit *before* we actually do damage
		player.hooks.onAttack[instance] = (attack, pickedSlots) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			const pickedHermit = pickedSlots[this.id]?.[0]
			if (!pickedHermit || !pickedHermit.row) return

			const rowState = pickedHermit.row.state
			if (!rowState.hermitCard) return

			const hermitInfo = HERMIT_CARDS[rowState.hermitCard.cardId]
			if (!hermitInfo) return

			// Heal
			rowState.health = Math.min(
				rowState.health + 100,
				hermitInfo.health // Max health
			)
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		delete pos.player.hooks.onAttack[instance]
	}
}

export default KeralisRareHermitCard
