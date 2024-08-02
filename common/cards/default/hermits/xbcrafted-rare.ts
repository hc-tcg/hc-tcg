import {GameModel} from '../../../models/game-model'
import query from '../../../components/query'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {CardComponent, ObserverComponent} from '../../../components'

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

	override onAttach(_game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribeBefore(player.hooks.beforeAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return
			// All attacks from our side should ignore opponent attached effect card this turn
			attack.shouldIgnoreCards.push(
				query.every(
					query.card.opponentPlayer,
					query.card.active,
					query.card.slot(query.slot.attach)
				)
			)
		})
	}
}

export default XBCraftedRare
