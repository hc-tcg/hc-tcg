import {AttackModel} from '../../../../server/models/attack-model'
import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'
import {getCardPos} from '../../../../server/utils/cards'

class WolfEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'wolf',
			name: 'Wolf',
			rarity: 'rare',
			description:
				'Opponent takes 20hp damage after their attack.\nIgnores armour.',
		})
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onAttach(game, instance) {
		const {opponentPlayer, currentPlayer} = game.ds

		opponentPlayer.hooks.onAttack[instance] = (attack, pickedCards) => {
			if (
				attack.attacker &&
				currentPlayer.board.activeRow === getCardPos(game, instance)?.rowIndex
			) {
				const backlashAttack = new AttackModel({
					id: this.getInstanceKey(instance, 'backlash'),
					target: attack.attacker,
					type: 'backlash',
				})
				backlashAttack.addDamage(20)
				backlashAttack.shouldIgnoreCards = [
					(instance) => {
						return true
					},
				]

				attack.addNewAttack(backlashAttack)
			}

			return attack
		}
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onDetach(game, instance) {
		const {opponentPlayer} = game.ds
		delete opponentPlayer.hooks.onAttack[instance]
	}
}

export default WolfEffectCard
