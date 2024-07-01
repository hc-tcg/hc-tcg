import EffectCard from '../../base/effect-card'
import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {applyStatusEffect, removeStatusEffect} from '../../../utils/board'

class FurnaceEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'furnace',
			numericId: 203,
			name: 'Furnace',
			rarity: 'rare',
			description:
				'After 4 turns, all single item cards attached to that Hermit are converted to double item cards. This card is then discarded.',
		})
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		applyStatusEffect(game, 'smelting', instance)
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		game.state.statusEffects.forEach((ail) => {
			if (ail.targetInstance === instance) {
				removeStatusEffect(game, pos, ail.statusEffectInstance)
			}
		})
	}

	public override getExpansion(): string {
		return 'advent_of_tcg'
	}
}

export default FurnaceEffectCard
