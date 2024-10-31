import {CardComponent, ObserverComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const WelsknightRare: Hermit = {
	...hermit,
	id: 'welsknight_rare',
	numericId: 107,
	name: 'Wels',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	type: 'pvp',
	health: 280,
	primary: {
		name: "Knight's Blade",
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Vengeance',
		cost: ['pvp', 'pvp', 'pvp'],
		damage: 100,
		power:
			"If this Hermit's HP is orange (190-100), do an additional 20hp damage.\nIf this Hermit's HP is red (90 or lower), do an additional 40hp damage.",
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return
				if (!component.slot.inRow() || !component.slot.row.health) return

				if (component.slot.row.health < 200)
					attack.addDamage(component.entity, 20)
				if (component.slot.row.health < 100)
					attack.addDamage(component.entity, 20)
			},
		)
	},
}

export default WelsknightRare
