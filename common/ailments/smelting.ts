import Ailment from './ailment'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {AilmentT} from '../types/game-state'
import {discardCard} from '../utils/movement'

class SmeltingAilment extends Ailment {
	constructor() {
		super({
			id: 'smelting',
			name: 'Smelting',
			description:
				'When the counter reaches 0, upgrades all item cards attached to this Hermit to double items',
			duration: 5,
			counter: true,
			damageEffect: false,
		})
	}

	override onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		game.state.ailments.push(ailmentInfo)
		const {player} = pos

		player.hooks.onTurnStart.add(ailmentInfo.ailmentInstance, () => {
			if (ailmentInfo.duration === undefined) return
			ailmentInfo.duration -= 1
			if (ailmentInfo.duration === 0) {
				discardCard(game, pos.card)
				pos.row?.itemCards.forEach((card) => {
					if (!card) return
					card.cardId = card.cardId.replace('common', 'rare')
				})
			}
		})
	}

	override onRemoval(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onTurnStart.remove(ailmentInfo.ailmentInstance)
	}
}

export default SmeltingAilment
