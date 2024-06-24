import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import { healHermit } from '../../../types/game-state'
import SingleUseCard from '../../base/single-use-card'
import {HERMIT_CARDS} from '../../index'

class SplashPotionOfHealingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'splash_potion_of_healing',
			numericId: 89,
			name: 'Splash Potion of Healing',
			rarity: 'common',
			description: 'Heal all of your Hermits 20hp.',
			log: (values) => `${values.defaultLog} and healed all {your|their} Hermits $g20hp$`,
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.add(instance, () => {
			game
				.filterSlots(slot.every(slot.player, slot.hermitSlot))
				.forEach(({row, card}) => healHermit(row, 20))
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default SplashPotionOfHealingSingleUseCard
