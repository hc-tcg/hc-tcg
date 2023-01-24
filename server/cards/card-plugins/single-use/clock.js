import SingleUseCard from './_single-use-card'
import {hasSingleUse} from '../../../utils'

class ClockSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'clock',
			name: 'Clock',
			rarity: 'ultra_rare',
			description: 'Opponent skips their next turn.\n\nDiscard after use.',
		})
		this.skipTurn = false
	}
	register(game) {
		game.hooks.turnStart.tap(this.id, () => {
			if (this.skipTurn) {
				console.log('Turn skipped')
				this.skipTurn = false
				return 'SKIP'
			}
		})

		game.hooks.turnEnd.tap(this.id, (derivedState) => {
			const {currentPlayer} = derivedState
			const clockActivated = hasSingleUse(currentPlayer, 'clock', true)
			if (clockActivated) this.skipTurn = true
		})

		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo} = derivedState
			if (singleUseInfo?.id === this.id) {
				if (game.state.turn < 2) {
					console.log("Can't play clock on first turn")
					return 'INVALID'
				}
				return 'DONE'
			}
		})
	}
}

export default ClockSingleUseCard
