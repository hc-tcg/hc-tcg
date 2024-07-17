import CardStatusEffect, {StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {card, query} from '../components/query'
import {CardComponent, StatusEffectComponent} from '../components'

class DyedEffect extends CardStatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		id: 'dyed',
		name: 'Dyed',
		description: 'Items attached to this Hermit become any type.',
		applyCondition: query.not(card.hasStatusEffect(DyedEffect)),
	}

	override onApply(game: GameModel, effect: StatusEffectComponent, target: CardComponent) {
		target.player.hooks.availableEnergy.add(effect, (availableEnergy) => {
			if (!target.slot.inRow() || target.player.activeRowEntity !== target.slot.row.entity)
				return availableEnergy
			return availableEnergy.map(() => 'any')
		})
	}

	override onRemoval(game: GameModel, effect: StatusEffectComponent, target: CardComponent) {
		const {player, opponentPlayer} = target

		player.hooks.availableEnergy.remove(effect)
		opponentPlayer.hooks.onTurnEnd.remove(effect)
	}
}

export default DyedEffect
