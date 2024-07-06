import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {applyStatusEffect, removeStatusEffect} from '../../../utils/board'
import Card, {Attach, attach} from '../../base/card'
import {CardInstance} from '../../../types/game-state'

class FurnaceEffectCard extends Card {
	props: Attach = {
		...attach,
		id: 'furnace',
		numericId: 203,
		name: 'Furnace',
		expansion: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 1,
		description:
			'After 4 turns, all single item cards attached to that Hermit are converted to double item cards. This card is then discarded.',
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		applyStatusEffect(game, 'smelting', instance)
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		game.state.statusEffects.forEach((ail) => {
			if (ail.targetInstance === instance) {
				removeStatusEffect(game, pos, ail)
			}
		})
	}
}

export default FurnaceEffectCard
