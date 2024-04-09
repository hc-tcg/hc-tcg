import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {healRow} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'
import {HERMIT_CARDS} from '../../index'

class SplashPotionOfHealingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'splash_potion_of_healing',
			numericId: 89,
			name: 'Splash Potion of Healing',
			rarity: 'common',
			description: 'Heal each of your active and AFK Hermits 20hp.',
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.add(instance, () => {
			for (let row of player.board.rows) {
				if (!row.hermitCard) continue
				const hermitInfo = HERMIT_CARDS[row.hermitCard.cardId]
				if (hermitInfo) {
					healRow(row, 20)
				}
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default SplashPotionOfHealingSingleUseCard
