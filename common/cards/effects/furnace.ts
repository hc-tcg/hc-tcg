import EffectCard from '../base/effect-card'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {retrieveCard} from '../../utils/movement'

class FurnaceEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'furnace',
			numericId: 170,
			name: 'Furnace',
			rarity: 'rare',
			description:
				'Attach to any hermit. After 5 turns, converts all single item cards to double item cards.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {row} = pos
		row?.itemCards.forEach((card) => {
			if (!card) return
			card.cardId = card.cardId.replace('common', 'rare')
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {}
}

export default FurnaceEffectCard
