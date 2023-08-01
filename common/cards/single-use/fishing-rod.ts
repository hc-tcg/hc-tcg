import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {drawCards} from '../../utils/movement'
import SingleUseCard from '../base/single-use-card'

class FishingRodSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'fishing_rod',
			name: 'Fishing Rod',
			rarity: 'ultra_rare',
			description: 'Draw 2 cards.',
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {player} = pos
		if (player.pile.length <= 2) return 'NO'

		return 'YES'
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			drawCards(player, 2)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default FishingRodSingleUseCard
