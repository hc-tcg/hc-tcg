import {CardComponent, ObserverComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const StressMonster101Rare: Hermit = {
	...hermit,
	id: 'stressmonster101_rare',
	numericId: 93,
	name: 'Stress',
	expansion: 'default',
	rarity: 'rare',
	tokens: 3,
	type: 'prankster',
	health: 300,
	primary: {
		name: 'Plonker',
		cost: ['prankster'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Yolo',
		cost: ['prankster', 'prankster', 'prankster'],
		damage: 0,
		power:
			"You and your opponent's active Hermits take damage equal to your active Hermit's health.\nAny damage this Hermit takes due to this ability can not be redirected.",
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (
					!attack.isAttacker(component.entity) ||
					attack.type !== 'secondary' ||
					attack.isBacklash
				)
					return
				if (!component.slot.inRow()) return

				const backlashAttack = game.newAttack({
					attacker: component.entity,
					target: player.activeRowEntity,
					type: 'secondary',
					isBacklash: true,
					log: (values) => ` and took ${values.damage} backlash damage`,
				})
				const attackDamage = component.slot.row.health
				if (attackDamage === null) return
				attack.addDamage(component.entity, attackDamage)
				backlashAttack.addDamage(component.entity, attackDamage)

				attack.addNewAttack(backlashAttack)
			},
		)
	},
}

export default StressMonster101Rare
