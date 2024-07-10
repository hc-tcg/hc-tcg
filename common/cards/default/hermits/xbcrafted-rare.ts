import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../filters'
import Card, {Hermit, hermit} from '../../base/card'
import {CardInstance} from '../../../types/game-state'

class XBCraftedRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'xbcrafted_rare',
		numericId: 110,
		name: 'xB',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		type: 'explorer',
		health: 270,
		primary: {
			name: 'Giggle',
			cost: ['explorer'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Noice!',
			cost: ['explorer', 'any'],
			damage: 70,
			power:
				"Any effect card attached to your opponent's active Hermit is ignored during this turn.",
		},
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.beforeAttack.addBefore(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return
			// All attacks from our side should ignore opponent attached effect card this turn
			attack.shouldIgnoreSlots.push(slot.every(slot.opponent, slot.attachSlot, slot.activeRow))
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos

		// Remove hooks
		player.hooks.beforeAttack.remove(instance)
		player.hooks.afterAttack.remove(instance)
	}
}

export default XBCraftedRareHermitCard
