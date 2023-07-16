import HermitCard from './_hermit-card'
import {GameModel} from '../../../../server/models/game-model'

class GoodTimesWithScarRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'goodtimeswithscar_rare',
			name: 'Scar',
			rarity: 'rare',
			hermitType: 'builder',
			health: 270,
			primary: {
				name: 'Scarred For Life',
				cost: ['builder'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Deathloop',
				cost: ['builder', 'any'],
				damage: 70,
				power:
					'If this Hermit is knocked out next turn, they are revived with 50hp.\n\nCan only be revived once.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer, row} = pos
		const reviveNextTurn = this.getInstanceKey(instance, 'reviveNextTurn')

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return

			player.custom[reviveNextTurn] = true
		})

		opponentPlayer.hooks.afterAttack.add(instance, () => {
			if (player.custom[reviveNextTurn]) {
				if (!row || row.health === null || row.health > 0) return

				row.health = 50
				row.ailments = []

				opponentPlayer.hooks.afterAttack.remove(instance)
			}
		})

		opponentPlayer.hooks.onTurnEnd.add(instance, () => {
			delete player.custom[reviveNextTurn]
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, opponentPlayer} = pos
		const reviveNextTurn = this.getInstanceKey(instance, 'reviveNextTurn')
		// Remove hooks
		player.hooks.onAttack.remove(instance)
		opponentPlayer.hooks.afterAttack.remove(instance)
		opponentPlayer.hooks.onTurnEnd.remove(instance)
		delete player.custom[reviveNextTurn]
	}
}

export default GoodTimesWithScarRareHermitCard
