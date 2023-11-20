import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import SingleUseCard from '../base/single-use-card'

class SplashPotionOfPoisonSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'splash_potion_of_poison',
			numericId: 90,
			name: 'Splash Potion of Poison',
			rarity: 'rare',
			description:
				'Deal an additional 20hp damage every turn until poisoned Hermit is down to 10hp.\n\nIgnores armour. Continues to poison if health is recovered.\n\nDoes not knock out Hermit.',
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(instance, (pickedSlots) => {
			const opponentActiveRow = opponentPlayer.board.activeRow
			if (opponentActiveRow === null) return

			const hasDamageEffect = opponentPlayer.board.rows[opponentActiveRow].ailments.some(
				(ailment) => {
					return ailment.id === 'fire' || ailment.id === 'poison'
				}
			)
			if (!hasDamageEffect) {
				opponentPlayer.board.rows[opponentActiveRow].ailments.push({
					id: 'poison',
				})
			}
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		if (pos.opponentPlayer.board.activeRow === null) return 'NO'

		return 'YES'
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default SplashPotionOfPoisonSingleUseCard
