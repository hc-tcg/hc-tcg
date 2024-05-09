import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {isTargetingPos} from '../../../utils/attacks'
import EffectCard from '../../base/effect-card'

class NetheriteArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'netherite_armor',
			numericId: 82,
			name: 'Netherite Armour',
			rarity: 'ultra_rare',
			description:
				'When the Hermit this card is attached to takes damage, that damage is reduced by up to 40hp each turn.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onDefence.add(instance, (attack) => {
			if (!isTargetingPos(attack, pos) || attack.isType('status-effect')) return

			if (player.custom[instanceKey] === undefined) {
				player.custom[instanceKey] = 0
			}

			const totalReduction = player.custom[instanceKey]

			if (totalReduction < 40) {
				const damageReduction = Math.min(attack.calculateDamage(), 40 - totalReduction)
				player.custom[instanceKey] += damageReduction
				attack.reduceDamage(this.id, damageReduction)
			}
		})

		const resetCounter = () => {
			if (player.custom[instanceKey] !== undefined) {
				delete player.custom[instanceKey]
			}
		}

		// Reset counter at the start of every turn
		player.hooks.onTurnStart.add(instance, resetCounter)
		opponentPlayer.hooks.onTurnStart.add(instance, resetCounter)
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		player.hooks.onDefence.remove(instance)
		player.hooks.onTurnStart.remove(instance)
		opponentPlayer.hooks.onTurnStart.remove(instance)
		delete player.custom[this.getInstanceKey(instance)]
	}
}

export default NetheriteArmorEffectCard
