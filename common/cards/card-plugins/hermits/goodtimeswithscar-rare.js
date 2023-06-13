import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

// - Game should not consume attached totem if deathloop is active
// - Golden Axe should not bypass deathloop (unlike a totem)
// - Needs to work for death by being attacked or by death by ailments
// TODO - Combination of flip&coin abilities & scar's ability will mean double coin flip for the attack.
// TODO - Scar's coin flip can also occur when he dies from fire/posion at end of a turn
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
					"If this Hermit is knocked out next turn, they're revived with 50hp.Can only be revived once.",
			},
		})

		this.recoverAmount = 50
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, otherPlayer, row, rowIndex} = pos
		const reviveNextTurn = this.getInstanceKey(instance, 'reviveNextTurn')
		const scarRevivedKey = this.getInstanceKey(instance, 'revived')
		player.custom[scarRevivedKey] = true

		player.hooks.onAttack[instance] = (attack) => {
			if (
				attack.id !== this.getInstanceKey(instance) ||
				attack.type !== 'secondary'
			)
				return

			player.custom[reviveNextTurn] = true
		}

		otherPlayer.hooks.afterAttack[instance] = () => {
			if (player.board.activeRow !== rowIndex) return
			if (player.custom[reviveNextTurn] && player.custom[scarRevivedKey]) {
				if (row?.health !== 0) return

				row.health = 50
				row.ailments = []
				delete player.custom[scarRevivedKey]
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
