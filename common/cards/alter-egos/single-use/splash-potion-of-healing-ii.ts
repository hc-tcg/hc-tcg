import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {healRow} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'
import {HERMIT_CARDS} from '../../index'

class SplashPotionOfHealingIISingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'splash_potion_of_healing_ii',
			numericId: 147,
			name: 'Splash Potion of Healing II',
			rarity: 'rare',
			description: 'Heal each of your active and AFK Hermits 30hp.',
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
					healRow(row, 30)
				}
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default SplashPotionOfHealingIISingleUseCard
