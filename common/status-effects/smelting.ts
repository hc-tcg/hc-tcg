import StatusEffect, {Counter, StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {StatusEffectInstance} from '../types/game-state'
import {discardCard} from '../utils/movement'

class SmeltingStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		...statusEffect,
		id: 'smelting',
		name: 'Smelting',
		description:
			'When the counter reaches 0, upgrades all item cards attached to this Hermit to double items',
		counter: 4,
		counterType: 'turns',
	}

	override onApply(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onTurnStart.add(instance, () => {
			if (instance.counter === null) return
			instance.counter -= 1
			if (instance.counter === 0) {
				discardCard(game, pos.cardId)
				pos.rowId?.itemCards.forEach((card) => {
					if (!card) return
					card.card.props.id = card.card.props.id.replace('common', 'rare')
				})
			}
		})
	}

	override onRemoval(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onTurnStart.remove(instance)
	}
}

export default SmeltingStatusEffect
