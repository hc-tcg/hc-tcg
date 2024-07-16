import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class StressMonster101Rare extends Card {
	props: Hermit = {
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
				"You and your opponent's active Hermit take damage equal to your active Hermit's health.\nAny damage this Hermit takes due to this ability can not be redirected.",
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return
			if (!component.slot.inRow()) return

			const backlashAttack = game.newAttack({
				attacker: component.entity,
				target: game.opponentPlayer.activeRowEntity,
				type: 'secondary',
				isBacklash: true,
				log: (values) => ` and took ${values.damage} backlash damage`,
			})
			const attackDamage = component.slot.row.health
			attack.addDamage(component.entity, attackDamage || 0)
			backlashAttack.addDamage(component.entity, attackDamage || 0)

			attack.addNewAttack(backlashAttack)
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default StressMonster101Rare
