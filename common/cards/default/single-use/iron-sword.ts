import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class IronSword extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'iron_sword',
		numericId: 46,
		name: 'Iron Sword',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		description: "Do 20hp damage to your opponent's active Hermit.",
		hasAttack: true,
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = pos

		player.hooks.getAttack.add(component, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return null
			const opponentActivePos = getActiveRowPos(opponentPlayer)
			if (!opponentActivePos) return null

			const swordAttack = new AttackModel({
				id: this.getInstanceKey(component, 'attack'),
				attacker: activePos,
				target: opponentActivePos,
				type: 'effect',
				log: (values) =>
					`${values.defaultLog} to attack ${values.target} for ${values.damage} damage`,
			}).addDamage(this.props.id, 20)

			return swordAttack
		})

		player.hooks.onAttack.add(component, (attack) => {
			const attackId = this.getInstanceKey(component, 'attack')
			if (attack.id !== attackId) return null

			// We've executed our attack, apply effect
			applySingleUse(game)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.getAttack.remove(component)
		player.hooks.onAttack.remove(component)
	}
}

export default IronSword
