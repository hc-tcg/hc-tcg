import {CardComponent, ObserverComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {afterAttack, beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import Bow from '../single-use/bow'
import Crossbow from '../single-use/crossbow'
import {Hermit} from '../types'

const HotguyRare: Hermit = {
	...hermit,
	id: 'hotguy_rare',
	numericId: 131,
	name: 'Hotguy',
	expansion: 'alter_egos',
	palette: 'alter_egos',
	background: 'alter_egos',
	rarity: 'rare',
	tokens: 2,
	type: 'explorer',
	health: 280,
	primary: {
		name: 'Velocité',
		cost: ['explorer'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Hawkeye',
		cost: ['explorer', 'explorer'],
		damage: 80,
		power:
			"When used with a Bow or Crossbow effect card, that effect card's damage doubles.",
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		let usingSecondaryAttack = false

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity)) return
				usingSecondaryAttack = attack.type === 'secondary'
			},
		)

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!usingSecondaryAttack) return
				if (
					attack.attacker instanceof CardComponent &&
					(attack.attacker.props.id === Bow.id ||
						attack.attacker.props.id === Crossbow.id)
				) {
					attack.addDamage(attack.attacker.entity, attack.getDamage())
				}
			},
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(_attack) => {
				usingSecondaryAttack = false
			},
		)
	},
}

export default HotguyRare
