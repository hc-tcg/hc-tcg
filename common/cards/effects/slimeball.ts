import {CARDS} from '..'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {discardCard, isSlotEmpty} from '../../utils/movement'
import EffectCard from '../base/effect-card'

class SlimeballEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'slimeball',
			numericId: 173,
			name: 'Slimeball',
			rarity: 'ultra_rare',
			description:
				"Attach to any Hermit, including your opponent's. That Hermit and it's attached items and effects cannot be moved. After either player attempts to move any of these cards, Slimeball will be discarded.",
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		// attach to effect or item slot
		if (pos.slot.type !== 'effect') return 'INVALID'

		if (!pos.row?.hermitCard) return 'INVALID'

		const cardInfo = CARDS[pos.row.hermitCard.cardId]
		if (!cardInfo) return 'INVALID'
		if (!cardInfo.canAttachToCard(game, pos)) return 'NO'

		return 'YES'
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onCardPositionChange.add(instance, (slot) => {
			if (!isSlotEmpty(slot) && slot.rowIndex === pos.rowIndex) {
				discardCard(game, pos.card)
				return false
			}
			return true
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		pos.player.hooks.onCardPositionChange.remove(instance)
	}
}

export default SlimeballEffectCard
