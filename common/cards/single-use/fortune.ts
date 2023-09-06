import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import SingleUseCard from '../base/single-use-card'

// We could stop displaying the coin flips but I think it may confuse players when Zedaph or Pearl uses fortune.
class FortuneSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'fortune',
			numericId: 26,
			name: 'Fortune',
			rarity: 'ultra_rare',
			description: 'Any coin flips needed on your attack are not needed and "heads" is assumed.',
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.add(instance, (pickedSlots) => {
			player.hooks.onCoinFlip.add(instance, (id, coinFlips) => {
				for (let i = 0; i < coinFlips.length; i++) {
					coinFlips[i] = 'heads'
				}
				return coinFlips
			})

			player.hooks.onTurnStart.add(instance, () => {
				player.hooks.onTurnStart.remove(instance)
				player.hooks.onCoinFlip.remove(instance)
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.remove(instance)
	}
}

export default FortuneSingleUseCard
