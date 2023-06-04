import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'

class CurseOfBindingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'curse_of_binding',
			name: 'Curse Of Binding',
			rarity: 'common',
			description:
				'Opposing active Hermit can not go AFK on the following turn.\n\nDiscard after use.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/pick-process').PickedSlotsInfo} pickedSlots
	 */
	onApply(game, instance, pickedSlots) {
		const {opponentPlayer} = game.ds

		opponentPlayer.hooks.availableActions[instance] = (availableActions) => {
			return availableActions.filter(
				(action) => action !== 'CHANGE_ACTIVE_HERMIT'
			)
		}
	}

	// then when turn ends, delete opponentPlayer.hooks[this.id]

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		// set flag on opponent player
		game.hooks.applyEffect.tap(this.id, () => {
			const {singleUseInfo, opponentPlayer} = game.ds

			if (singleUseInfo?.id === this.id) {
				opponentPlayer.custom[this.id] = true
				return 'DONE'
			}
		})

		// if flag is true, remove change of active hermit from available actions
		game.hooks.availableActions.tap(
			this.id,
			(availableActions, pastTurnActions, lockedActions) => {
				const {singleUseInfo, currentPlayer} = game.ds
				if (!currentPlayer.custom[this.id]) return availableActions
				if (currentPlayer.board.activeRow === null) return availableActions

				// lock switching hermit so it can't be done by anything
				lockedActions.push('CHANGE_ACTIVE_HERMIT')
				return availableActions.filter(
					(action) => action !== 'CHANGE_ACTIVE_HERMIT'
				)
			}
		)

		// at end of turn remove flag
		game.hooks.turnEnd.tap(this.id, () => {
			const {currentPlayer} = game.ds
			delete currentPlayer.custom[this.id]
		})
	}
}

export default CurseOfBindingSingleUseCard
