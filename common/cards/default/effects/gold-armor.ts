import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/game-state'
import {isTargetingPos} from '../../../utils/attacks'
import Card, {Attach, attach} from '../../base/card'

class GoldArmorEffectCard extends Card {
	props: Attach = {
		...attach,
		id: 'gold_armor',
		numericId: 29,
		name: 'Gold Armour',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		description:
			'When the Hermit this card is attached to takes damage, that damage is reduced by up to 10hp each turn.',
	}

	override onAttach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		let damageBlocked = 0

		player.hooks.onDefence.add(instance, (attack) => {
			if (!isTargetingPos(attack, pos) || attack.isType('status-effect')) return

			if (damageBlocked < 10) {
				const damageReduction = Math.min(attack.calculateDamage(), 10 - damageBlocked)
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

export default GoldArmorEffectCard
