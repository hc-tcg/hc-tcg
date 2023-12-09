import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import SingleUseCard from '../../base/single-use-card'

class SplashPotionOfHarmingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'splash_potion_of_harming',
			numericId: 226,
			name: 'Splash potion of harming',
			rarity: 'common',
			description: "Deal 40hp damage to the opponent's active hermit and 20hp damage to all others",
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(instance, () => {
			opponentPlayer.board.rows.forEach((row, i) => {
				if (!row.health) return
				if (opponentPlayer.board.activeRow === i) {
					row.health -= 40
				} else {
					row.health -= 20
				}
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}

	override getExpansion() {
		return 'advent_of_tcg'
	}
}

export default SplashPotionOfHarmingSingleUseCard
