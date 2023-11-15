import EffectCard from '../base/effect-card'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {applyAilment, removeAilment} from '../../utils/board'

class BrewingStandEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'brewing_stand',
			numericId: 160,
			name: 'Brewing stand',
			rarity: 'rare',
			description:
				'Attach to a Hermit, every 2 turns consumes 1 item card and heals the Hermit it is attached to 50hp',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		applyAilment(game, 'brewing', instance)
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		removeAilment(game, pos, instance)
	}
}

export default BrewingStandEffectCard
