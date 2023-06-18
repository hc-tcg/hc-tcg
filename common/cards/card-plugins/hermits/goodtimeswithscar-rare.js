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
		const {player, otherPlayer, row} = pos
		const reviveNextTurn = this.getInstanceKey(instance, 'reviveNextTurn')
		const scarRevivedKey = this.getInstanceKey(instance, 'revived')

		player.hooks.onAttack[instance] = (attack) => {
			if (
				attack.id !== this.getInstanceKey(instance) ||
				attack.type !== 'secondary'
			)
				return

			player.custom[reviveNextTurn] = true
		}

		otherPlayer.hooks.afterAttack[instance] = (afterAttack) => {
			if (
				!afterAttack ||
				!afterAttack.attack.target ||
				afterAttack.attack.target.index !== pos.rowIndex
			)
				return

			if (player.custom[reviveNextTurn] && !player.custom[scarRevivedKey]) {
				if (!row || !row.health || row.health > 0) {
					return
				}

				row.health = 50
				row.ailments = []
				player.custom[scarRevivedKey] = true
			}
			delete player.custom[reviveNextTurn]
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, otherPlayer} = pos
		const reviveNextTurn = this.getInstanceKey(instance, 'reviveNextTurn')
		const scarRevivedKey = this.getInstanceKey(instance, 'revived')
		// Remove hooks
		delete player.hooks.onAttack[instance]
		delete otherPlayer.hooks.afterAttack[instance]
		delete player.custom[reviveNextTurn]
		delete player.custom[scarRevivedKey]
	}
}

export default GoodTimesWithScarRareHermitCard
