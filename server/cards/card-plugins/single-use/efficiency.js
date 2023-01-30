import SingleUseCard from './_single-use-card'

class EfficiencySingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'efficiency',
			name: 'Efficiency',
			rarity: 'rare',
			description:
				'User can execute attack without having the necessary item cards attached.\n\nCurent turn only.\n\nDiscard after use.',
		})
	}
	register(game) {
		game.hooks.availableActions.tap(
			this.id,
			(availableActions, derivedState) => {
				const {pastTurnActions, currentPlayer} = derivedState
				const suId = currentPlayer.board.singleUseCard?.cardId
				const suUsed = currentPlayer.board.singleUseCardUsed
				if (suId === this.id && suUsed) {
					if (
						pastTurnActions.includes('ATTACK') ||
						pastTurnActions.includes('CHANGE_ACTIVE_HERMIT') ||
						game.state.turn <= 1
					) {
						return availableActions
					}

					const {activeRow} = currentPlayer.board
					if (activeRow !== null) {
						availableActions.push('PRIMARY_ATTACK')
						availableActions.push('SECONDARY_ATTACK')
					}
				}
				return availableActions
			}
		)

		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo} = derivedState
			if (singleUseInfo?.id === this.id) {
				return 'DONE'
			}
		})
	}
}

export default EfficiencySingleUseCard
