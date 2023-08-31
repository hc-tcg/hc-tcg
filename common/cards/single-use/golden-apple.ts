import SingleUseCard from '../base/single-use-card'
import {HERMIT_CARDS} from '..'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {isActive} from '../../utils/game'
import {getNonEmptyRows} from '../../utils/board'

class GoldenAppleSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'golden_apple',
			name: 'Golden Apple',
			rarity: 'ultra_rare',
			description: 'Heal AFK Hermit 100hp.',
			pickOn: 'apply',
			pickReqs: [
				{
					target: 'player',
					slot: ['hermit'],
					type: ['hermit', 'effect'],
					amount: 1,
					active: false,
				},
			],
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
				row.health = Math.min(row.health + 100, hermitInfo.health)
			}
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach
		
		const {player} = pos

		// Need active hermit to play
		if (!isActive(player)) return 'NO'

		// Can't attach it there are not any inactive hermits
		const inactiveHermits = getNonEmptyRows(player, false)
		if (inactiveHermits.length === 0) return 'NO'

		return 'YES'
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default GoldenAppleSingleUseCard
