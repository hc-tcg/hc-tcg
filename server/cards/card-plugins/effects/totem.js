import EffectCard from './_effect-card'
import {discardCard} from '../../../utils'

class TotemEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'totem',
			name: 'Totem',
			rarity: 'ultra_rare',
			description:
				'Player recovers +10hp after being knocked out and remains in battle.\n\nDiscard when applied.',
		})
		this.recoverAmount = 10
	}

	reviveHermits(game) {
		const playerStates = Object.values(game.state.players)
		for (let playerState of playerStates) {
			const playerRows = playerState.board.rows
			const activeRow = playerState.board.activeRow
			for (let rowIndex in playerRows) {
				const row = playerRows[rowIndex]
				const hasTotem = row.effectCard?.cardId === this.id
				if (row.hermitCard && row.health <= 0 && hasTotem) {
					row.health = this.recoverAmount
					row.ailments = []
					discardCard(game.state, row.effectCard)
				}
			}
		}
	}

	register(game) {
		// attacks
		game.hooks.attack.tap(this.id, (target) => {
			if (target.effectCardId === this.id) {
				target.recover = Math.max(target.recover, this.recoverAmount)
			}
			return target
		})

		// ailments
		game.hooks.turnEnd.tap(this.id, () => {
			this.reviveHermits(game)
		})
	}
}

export default TotemEffectCard
