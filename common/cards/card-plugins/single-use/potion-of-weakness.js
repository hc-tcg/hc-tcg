import SingleUseCard from './_single-use-card'
import {discardCard} from '../../../../server/utils'
import {HERMIT_CARDS} from '../../../cards'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class PotionOfWeaknessSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'potion_of_weakness',
			name: 'Potion of Weakness',
			rarity: 'common',
			description:
				"Makes opponent's active hermit's type weak to user's active hermit's type for 3 turns.\n\nDiscard after use.",
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.applyEffect.tap(this.id, () => {
			const {
				singleUseInfo,
				currentPlayer,
				playerHermitInfo,
				opponentHermitInfo,
			} = game.ds
			if (singleUseInfo?.id === this.id) {
				if (!playerHermitInfo || !opponentHermitInfo) return 'INVALID'
				const extraStrengths = currentPlayer.custom[this.id] || {}
				currentPlayer.custom[this.id] = extraStrengths

				const playerType = playerHermitInfo.hermitType
				const opponentType = opponentHermitInfo.hermitType

				const extraKey = playerType + '_' + opponentType
				const extraType = extraStrengths[extraKey] || {}
				extraType.strengthType = playerType
				extraType.weaknessType = opponentType
				extraType.duration = 3
				extraStrengths[extraKey] = extraType

				return 'DONE'
			}
		})

		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const targetInfo = HERMIT_CARDS[target.row.hermitCard.cardId]
			const attackerInfo = attackState.attacker.hermitInfo

			if (!targetInfo || !attackerInfo) return target

			const extraStrengths = currentPlayer.custom[this.id] || {}
			const extraKey = attackerInfo.hermitType + '_' + targetInfo.hermitType
			const hasExtra = extraStrengths[extraKey]

			if (hasExtra) target.hasWeakness = true

			return target
		})

		game.hooks.turnEnd.tap(this.id, () => {
			const {currentPlayer} = game.ds
			const extraStrengths = currentPlayer.custom[this.id]
			if (!extraStrengths) return

			for (const id in extraStrengths) {
				const extraType = extraStrengths[id]
				extraType.duration--
				if (extraType.duration <= 0) delete extraStrengths[id]
			}

			if (Object.keys(extraStrengths).length === 0) {
				delete currentPlayer.custom[this.id]
			}
		})
	}
}

export default PotionOfWeaknessSingleUseCard
