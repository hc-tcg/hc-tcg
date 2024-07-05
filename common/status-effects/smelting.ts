import StatusEffect, {Counter, StatusEffectProps} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {StatusEffectInstance} from '../types/game-state'
import {discardCard} from '../utils/movement'

class SmeltingStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		id: 'smelting',
		name: 'Smelting',
		description:
			'When the counter reaches 0, upgrades all item cards attached to this Hermit to double items',
		counter: 4,
		counterType: 'turns',
		damageEffect: false,
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		game.state.statusEffects.push(statusEffectInfo)
		const {player} = pos

		player.hooks.onTurnStart.add(statusEffectInfo, () => {
			if (statusEffectInfo.counter === null) return
			statusEffectInfo.counter -= 1
			if (statusEffectInfo.counter === 0) {
				discardCard(game, pos.card)
				pos.row?.itemCards.forEach((card) => {
					if (!card) return
					card.card.props.id = card.card.props.id.replace('common', 'rare')
				})
			}
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onTurnStart.remove(statusEffectInfo)
	}
}

export default SmeltingStatusEffect
