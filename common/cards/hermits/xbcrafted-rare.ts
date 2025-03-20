import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {IgnoreAttachSlotEffect} from '../../status-effects/ignore-attach'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const XBCraftedRare: Hermit = {
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
			"Any effect cards attached to your opponent's Hermits are ignored during this turn.",
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.IGNORE_CARDS,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				game.components
					.filter(
						CardComponent,
						query.card.opponentPlayer,
						query.card.slot(query.slot.hermit),
					)
					.filter((x) =>
						game.components
							.new(
								StatusEffectComponent,
								IgnoreAttachSlotEffect,
								component.entity,
							)
							.apply(x.entity),
					)
			},
		)
	},
}

export default XBCraftedRare
