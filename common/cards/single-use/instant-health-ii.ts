import SingleUseCard from '../base/single-use-card'
import {HERMIT_CARDS} from '..'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'

class InstantHealthIISingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'instant_health_ii',
			numericId: 43,
			name: 'Instant Health II',
			rarity: 'rare',
			description: 'Heal active or AFK Hermit 60hp.',
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
				row.health = Math.min(row.health + 60, hermitInfo.health)
			} else {
				// Armor Stand
				row.health += 60
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default InstantHealthIISingleUseCard
