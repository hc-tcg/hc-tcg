import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {CardPos} from '../../../../server/models/card-pos-model'
import {getActiveRow} from '../../../../server/utils'

class PotionOfWeaknessSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'potion_of_weakness',
			name: 'Potion of Weakness',
			rarity: 'common',
			description:
				"Opponent's active Hermit type is now weak to your active Hermit's type for 3 turns.",
		})
	}

	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
			const opponentActiveRow = getActiveRow(opponentPlayer)
			if (!opponentActiveRow) return
			opponentActiveRow.ailments.push({id: 'weakness', duration: 3})
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onApply[instance]
	}
	getExpansion() {
		return 'alter_egos'
	}
}

export default PotionOfWeaknessSingleUseCard
