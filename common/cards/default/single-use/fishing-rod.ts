import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {drawCards} from '../../../utils/movement'
import SingleUseCard from '../../base/single-use-card'

class FishingRodSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'fishing_rod',
			numericId: 24,
			name: 'Fishing Rod',
			rarity: 'ultra_rare',
			description: 'Draw 2 cards.',
			log: (values) => `${values.defaultLog} to draw 2 cards`,
		})
	}

	override _attachCondition = slot.every(
		super.attachCondition,
		(game, pos) => pos.player.pile.length > 2
	)

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.add(instance, () => {
			drawCards(player, 2)
			player.hooks.onApply.remove(instance)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default FishingRodSingleUseCard
