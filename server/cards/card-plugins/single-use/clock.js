import SingleUseCard from './_single-use-card'

class ClockSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'clock',
			name: 'Clock',
			rarity: 'ultra_rare',
			description: 'Opponent skips their next turn.\n\nDiscard after use.',
		})

		this.useReqs = [{target: 'opponent', type: 'hermit', amount: 1}]
	}
	register(game) {
		game.hooks.turnStart.tap(this.id, (derivedState) => {
			const {currentPlayer} = derivedState
			if (currentPlayer.custom[this.id]) {
				console.log('Turn skipped')
				delete currentPlayer.custom[this.id]
				return 'SKIP'
			}
		})

		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, opponentPlayer} = derivedState
			if (singleUseInfo?.id === this.id) {
				if (game.state.turn < 2) {
					console.log("Can't play clock on first turn")
					return 'INVALID'
				}
				opponentPlayer.custom[this.id] = true
				return 'DONE'
			}
		})
	}
}

export default ClockSingleUseCard
