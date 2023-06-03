import {AttackModel} from '../../../../server/models/attack-model'
import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'

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
		const {currentPlayer} = game.ds

		currentPlayer.hooks.onAttack[instance] = (attack, pickedCards) => {
			if (attack.attacker) {
				const backlashAttack = new AttackModel({
					id: this.getInstanceKey(instance, 'backlash'),
					target: attack.attacker,
					type: 'backlash',
				})
				backlashAttack.addDamage(20)
				backlashAttack.ignoreAttachedEffects = true

				attack.addNewAttack(backlashAttack)
				console.log('Hook called')
			}

			return attack
		}
	}
}

export default WolfEffectCard
