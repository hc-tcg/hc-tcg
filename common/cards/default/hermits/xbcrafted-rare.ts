import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {CardComponent} from '../../../components'

class XBCraftedRare extends Card {
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

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.beforeAttack.addBefore(component, (attack) => {
			if (attack.id !== this.getInstanceKey(component) || attack.type !== 'secondary') return
			// All attacks from our side should ignore opponent attached effect card this turn
			attack.shouldIgnoreCards.push(slot.every(slot.opponent, slot.attachSlot, slot.activeRow))
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component

		// Remove hooks
		player.hooks.beforeAttack.remove(component)
		player.hooks.afterAttack.remove(component)
	}
}

export default XBCraftedRare
