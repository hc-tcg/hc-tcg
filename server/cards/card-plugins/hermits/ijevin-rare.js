import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

class IJevinRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'ijevin_rare',
			name: 'Jevin',
			rarity: 'rare',
			hermitType: 'speedrunner',
			health: 300,
			primary: {
				name: 'Your Boi',
				cost: ['any'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: 'Peace Out',
				cost: ['speedrunner', 'speedrunner', 'any'],
				damage: 90,
				power:
					'After attack, opponent is forced to replace active Hermit with AFK Hermit.\n\nIf there are no AFK Hermits, active Hermit remains in battle.',
			},
		})
	}

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {
				attackerHermitCard,
				opponentPlayer,
				typeAction,
				opponentActiveRow,
			} = derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target

			const hasOtherHermits =
				opponentPlayer.board.rows.filter((row) => !!row.hermitCard).length > 1
			if (!hasOtherHermits || !opponentActiveRow) return target
			opponentActiveRow.ailments.push('knockedout')
			opponentPlayer.board.activeRow = null

			return target
		})
	}
}

export default IJevinRareHermitCard
