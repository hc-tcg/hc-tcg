import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {TurnActions} from '../../../types/game-state'
import {discardCard, isSlotEmpty} from '../../../utils/movement'
import EffectCard from '../../base/effect-card'

class SlimeballEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'slimeball',
			numericId: 204,
			name: 'Slimeball',
			rarity: 'ultra_rare',
			description:
				"Attach to any Hermit, including your opponent's. That Hermit and its attached items will not be removed from the slot they are attached to, unless that Hermit is knocked out. After either player attempts to remove any of these cards, Slimeball will be discarded.",
		})
	}

	override canBeAttachedTo = slot.every(slot.opponent, slot.effectSlot, slot.empty)

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onSlotChange.add(instance, (slot) => {
			if (!isSlotEmpty(slot) && slot.rowIndex === pos.rowIndex) {
				pos.player.hooks.onSlotChange.remove(instance)
				discardCard(game, pos.card)
				return false
			}
			return true
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		pos.player.hooks.onSlotChange.remove(instance)
		pos.player.hooks.onDetach.remove(instance)
	}

	public override getExpansion(): string {
		return 'advent_of_tcg'
	}
}

export default SlimeballEffectCard
