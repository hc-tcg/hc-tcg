import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/game-state'
import {isTargeting} from '../../../utils/attacks'
import Card, {Attach, attach} from '../../base/card'

class NetheriteArmorEffectCard extends Card {
	props: Attach = {
		...attach,
		id: 'netherite_armor',
		numericId: 82,
		name: 'Netherite Armour',
		expansion: 'default',
		rarity: 'ultra_rare',
		tokens: 4,
		description:
			'When the Hermit this card is attached to takes damage, that damage is reduced by up to 40hp each turn.',
	}

	override onAttach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)

		let damageBlocked = 0

		player.hooks.onDefence.add(instance, (attack) => {
			if (!isTargeting(attack, pos) || attack.isType('status-effect')) return

			if (damageBlocked < 40) {
				const damageReduction = Math.min(attack.calculateDamage(), 40 - damageBlocked)
				damageBlocked += damageReduction
				attack.reduceDamage(this.props.id, damageReduction)
			}
		})

		const resetCounter = () => {
			damageBlocked = 0
		}

		// Reset counter at the start of every turn
		player.hooks.onTurnStart.add(instance, resetCounter)
		opponentPlayer.hooks.onTurnStart.add(instance, resetCounter)
	}

	override onDetach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		player.hooks.onDefence.remove(instance)
		player.hooks.onTurnStart.remove(instance)
		opponentPlayer.hooks.onTurnStart.remove(instance)
	}
}

export default NetheriteArmorEffectCard
