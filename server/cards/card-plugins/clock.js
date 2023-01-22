class ClockEffectCard extends SingleUseCard {
	constructor() {
		super({
			id: 'effect_clock',
			name: 'Clock',
			rarity: 'ultra_rare',
			description: 'Opponent skips their next turn.\n\nDiscard after use.',
		})
		this.skipTurn = false
	}
	register(game) {
		game.hooks.turnStart.tap('ClockEffectCard', (turn) => {
			if (this.skipTurn) {
				console.log('Turn skipped')
				turn.continue()
				this.skipTurn = false
			}
		})

		game.hooks.turnEnd.tap('ClockEffectCard', (turn) => {
			const clockActivated = hasSingleUse(currentPlayer, 'clock', true)
			if (clockActivated) this.skipTurn = true
		})

		game.hooks.applyEffect('ClockEffectCard', (turn, action, singleUseInfo) => {
			if (singleUseInfo.id === this.id) {
				if (game.state.turn < 2) return 'INVALID'
				return 'DONE'
			}
		})
	}
}
