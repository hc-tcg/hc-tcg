import SingleUseCard from './_single-use-card'
import {applySingleUse} from '../../../utils'

class KnockbackSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'knockback',
			name: 'Knockback',
			rarity: 'rare',
			description:
				"Opposing Hermit goes AFK following user's attack.\n\nOpponent chooses replacement.\n\nCan only be used if opponent has at least 1 AFK Hermit. Discard after use.",
		})
	}
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {singleUseInfo, currentPlayer, opponentPlayer} = derivedState
			if (singleUseInfo?.id === this.id && target.isActive) {
				const hasOtherHermits =
					opponentPlayer.board.rows.filter((row) => !!row.hermitCard).length > 1
				if (!hasOtherHermits) return target
				opponentPlayer.board.activeRow = null
				applySingleUse(currentPlayer)
			}
			return target
		})
	}
}

export default KnockbackSingleUseCard
