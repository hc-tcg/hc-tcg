import EffectCard from './_effect-card'
import {discardCard} from '../../../utils'

class MendingEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'mending',
			name: 'Mending',
			rarity: 'ultra_rare',
			description:
				'When attached, user returns any "single use" card used to their deck.\n\nMending is then discarded.',
		})
	}
	register(game) {
		game.hooks.turnEnd.tap(this.id, (derivedState) => {
			const {currentPlayer} = derivedState

			const activeRow = currentPlayer.board.activeRow
			if (activeRow === null) return
			const effectCard = currentPlayer.board.rows[activeRow]?.effectCard
			if (effectCard?.cardId !== this.id) return

			// get single use card
			const suCard = currentPlayer.board.singleUseCard
			const suUsed = currentPlayer.board.singleUseCardUsed
			if (!suCard || !suUsed) return

			// return single use card to deck at random location
			const randomIndex = Math.floor(
				Math.random() * (currentPlayer.pile.length + 1)
			)
			currentPlayer.pile.splice(randomIndex, 0, suCard)

			// clear single use card slot
			currentPlayer.board.singleUseCardUsed = false
			currentPlayer.board.singleUseCard = null

			// discard mending card from board
			discardCard(game.state, effectCard)
		})
	}
}

export default MendingEffectCard
