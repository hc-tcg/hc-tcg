import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {isTargetingPos} from '../../utils/attacks'
import {discardCard} from '../../utils/movement'
import EffectCard from '../base/effect-card'

class ShieldEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'shield',
			numericId: 88,
			name: 'Shield',
			rarity: 'common',
			description: 'Prevent up to 60hp damage.\n\nDiscard following any damage taken.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const instanceKey = this.getInstanceKey(instance)

		// Note that we are using onDefence because we want to activate on any attack to us, not just from the opponent

		player.hooks.onDefence.add(instance, (attack) => {
			if (!isTargetingPos(attack, pos) || attack.isType('ailment')) return

			if (player.custom[instanceKey] === undefined) {
				player.custom[instanceKey] = 0
			}

			const totalReduction = player.custom[instanceKey]

			if (totalReduction < 60) {
				const damageReduction = Math.min(attack.getDamage(), 60 - totalReduction)
				player.custom[instanceKey] += damageReduction
				attack.reduceDamage(this.id, damageReduction)
			}
		})

		player.hooks.afterDefence.add(instance, (attack) => {
			const {player, row} = pos

			if (player.custom[instanceKey] !== undefined && player.custom[instanceKey] > 0 && row) {
				discardCard(game, row.effectCard)
			}

			// Delete the stored damage
			delete player.custom[instanceKey]

			// We only need to check once
			player.hooks.afterDefence.remove(instance)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onDefence.remove(instance)
		player.hooks.afterDefence.remove(instance)
		delete player.custom[this.getInstanceKey(instance)]
	}
}

export default ShieldEffectCard
