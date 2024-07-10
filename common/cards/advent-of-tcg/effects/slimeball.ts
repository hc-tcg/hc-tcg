import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../filters'
import {CardInstance} from '../../../types/game-state'
import Card, {Attach, attach} from '../../base/card'

class SlimeballEffectCard extends Card {
	props: Attach = {
		...attach,
		id: 'slimeball',
		numericId: 204,
		name: 'Slimeball',
		rarity: 'ultra_rare',
		tokens: 0,
		expansion: 'advent_of_tcg',
		description:
			"Attach to any Hermit, including your opponent's. That Hermit and its attached items will not be removed from the slot they are attached to, unless that Hermit is knocked out. Attached cards cannot be removed until slimeball is discarded.",
		attachCondition: slot.every(
			slot.opponent,
			slot.attachSlot,
			slot.empty,
			slot.rowHasHermit,
			slot.actionAvailable('PLAY_EFFECT_CARD'),
			slot.not(slot.frozen)
		),
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.freezeSlots.add(instance, () => {
			return slot.every(
				slot.currentPlayer,
				slot.rowIndex(pos.rowIndex),
				slot.not(slot.attachSlot),
				slot.not(slot.empty)
			)
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		pos.player.hooks.freezeSlots.remove(instance)
		pos.player.hooks.onDetach.remove(instance)
	}
}

export default SlimeballEffectCard
