import SingleUseCard from './_single-use-card'

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
	register(game) {
		// set flag on opponent player
		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, opponentPlayer} = derivedState

			if (singleUseInfo?.id === this.id) {
				opponentPlayer.custom[this.id] = true
				return 'DONE'
			}
		})

		// if flag is true, remove change of active hermit from available actions
		game.hooks.availableActions.tap(
			this.id,
			(availableActions, derivedState) => {
				const {singleUseInfo, currentPlayer} = derivedState
				if (!currentPlayer.custom[this.id]) return availableActions
				if (currentPlayer.board.activeRow === null) return availableActions

				return availableActions.filter(
					(action) => action !== 'CHANGE_ACTIVE_HERMIT'
				)
			}
		)

		// at end of turn remove flag
		game.hooks.turnEnd.tap(this.id, (derivedState) => {
			const {currentPlayer} = derivedState
			delete currentPlayer.custom[this.id]
		})
	}
}

export default CurseOfBindingSingleUseCard
