import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'

class CurseOfBindingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'curse_of_binding',
			name: 'Curse Of Binding',
			rarity: 'common',
			description:
				"Your opponent's active Hermit can not go AFK on their next turn.",
		})
	}

	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 * @param {import('common/types/pick-process').PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const {otherPlayer} = pos

		otherPlayer.hooks.blockedActions[instance] = (blockedActions) => {
			if (!blockedActions.includes('CHANGE_ACTIVE_HERMIT')) {
				blockedActions.push('CHANGE_ACTIVE_HERMIT')
			}
			return blockedActions
		}

		otherPlayer.hooks.onTurnEnd[instance] = () => {
			// Remove effects of card and clean up
			delete otherPlayer.hooks.blockedActions[instance]
			delete otherPlayer.hooks.onTurnEnd[instance]
		}
	}
}

export default CurseOfBindingSingleUseCard
