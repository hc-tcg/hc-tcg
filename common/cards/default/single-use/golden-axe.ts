import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../filters'
import {CardComponent} from '../../../types/game-state'
import {applySingleUse} from '../../../utils/board'
import Card, {SingleUse, singleUse} from '../../base/card'

class GoldenAxeSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'golden_axe',
		numericId: 31,
		name: 'Golden Axe',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		description:
			"Do 40hp damage to your opponent's active Hermit.\nAny effect card attached to your opponent's active Hermit is ignored during this turn.",
		hasAttack: true,
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		let attacking = false

		player.hooks.getAttack.add(component, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return null
			const opponentActivePos = getActiveRowPos(opponentPlayer)
			if (!opponentActivePos) return null

			const axeAttack = new AttackModel({
				id: this.getInstanceKey(component),
				attacker: activePos,
				target: opponentActivePos,
				type: 'effect',
				log: (values) =>
					`${values.defaultLog} to attack ${values.target} for ${values.damage} damage`,
			}).addDamage(this.props.id, 40)

			return axeAttack
		})

		player.hooks.beforeAttack.addBefore(component, (attack) => {
			const attackId = this.getInstanceKey(component)
			const opponentActivePos = getActiveRowPos(opponentPlayer)

			attacking = true

			if (!opponentActivePos) return null

			if (attack.id === attackId) {
				applySingleUse(game)
			}

			attack.shouldIgnoreSlots.push(slot.every(slot.opponent, slot.attachSlot, slot.activeRow))
		})

		player.hooks.afterAttack.add(component, () => {
			player.hooks.getAttack.remove(component)
			player.hooks.afterAttack.remove(component)
		})

		player.hooks.onTurnEnd.add(component, () => {
			player.hooks.beforeAttack.remove(component)
			player.hooks.onTurnEnd.remove(component)

			attacking = false
		})

		player.hooks.onDetach.add(component, () => {
			player.hooks.getAttack.remove(component)
			player.hooks.onTurnEnd.remove(component)
			if (!attacking) {
				player.hooks.beforeAttack.remove(component)
			}
		})
	}
}

export default GoldenAxeSingleUseCard
