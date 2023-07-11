import SingleUseCard from './_single-use-card'
import {discardCard} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

class SplashPotionOfPoisonSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'splash_potion_of_poison',
			name: 'Splash Potion of Poison',
			rarity: 'rare',
			description:
				'Deal an additional 20hp damage every turn until poisoned Hermit is down to 10hp.\n\nIgnores armour. Continues to poison if health is recovered.\n\nDoes not knock out Hermit.',
		})
	}

	canApply() {
		return true
	}

	/**
	 * Called when an instance of this card is applied
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
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
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		if (pos.slot.type !== 'single_use') return 'INVALID'

		if (pos.opponentPlayer.board.activeRow === null) return 'NO'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onApply[instance]
	}
}

export default SplashPotionOfPoisonSingleUseCard
