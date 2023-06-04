import EffectCard from './_effect-card'
import {discardCard} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

//@TODO no longer an attachable item card, no use implementing new logic here
// TODO - Must work with Gemintay ability to use two single use cards per turn (should mend the first one)
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

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onAttach(game, instance) {
		const {currentPlayer} = game.ds
		currentPlayer.hooks.turnEnd[instance] = () => {
			const {currentPlayer, playerEffectCard, playerActiveRow} = game.ds
			if (!playerEffectCard) return
			if (playerActiveRow?.effectCard?.cardInstance !== instance) return
			// return single use card to deck at random location
			const randomIndex = Math.floor(Math.random() * (currentPlayer.pile.length + 1))
			currentPlayer.pile.splice(randomIndex, 0, playerEffectCard)
			// clear single use card slot
			currentPlayer.board.singleUseCardUsed = false
			currentPlayer.board.singleUseCard = null
			// discard mending card from board
			discardCard(game, {
				cardId: this.id,
				cardInstance: instance,
			})
		}
		game.hooks.applyEffect.tap(this.id, () => {
			console.log('Hello')
			
		})
	}
}

export default MendingEffectCard
