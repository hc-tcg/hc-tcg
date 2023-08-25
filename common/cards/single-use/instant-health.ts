import SingleUseCard from '../base/single-use-card'
import {HERMIT_CARDS} from '..'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'

class InstantHealthSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'instant_health',
			numeric_id: 42,
			name: 'Instant Health',
			rarity: 'common',
			description: 'Heal active or AFK Hermit 30hp.',
			pickOn: 'apply',
			pickReqs: [{target: 'player', slot: ['hermit', 'effect'], type: ['hermit'], amount: 1}],
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			const pickedCards = pickedSlots[this.id] || []
			if (pickedCards.length !== 1) return

			const row = pickedCards[0].row?.state
			if (!row || !row.health) return
			const card = row.hermitCard
			if (!card) return
			const hermitInfo = HERMIT_CARDS[card.cardId]
			if (hermitInfo) {
				row.health = Math.min(row.health + 30, hermitInfo.health)
			} else {
				// Armor Stand
				row.health += 30
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default InstantHealthSingleUseCard
