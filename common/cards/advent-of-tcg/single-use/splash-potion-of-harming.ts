import {AttackModel} from '../../models/attack-model'
import CardOld from '../../base/card'
import {CardComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {applySingleUse} from '../../utils/board'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

class SplashPotionOfHarming extends CardOld {
	props: SingleUse = {
		...singleUse,
		id: 'splash_potion_of_harming',
		numericId: 226,
		name: 'Splash potion of harming',
		expansion: 'advent_of_tcg',
		rarity: 'common',
		tokens: 3,
		description:
			"Deal 40hp damage to the opponent's active hermit and 20hp damage to all other opponent Hermits.",
		hasAttack: true,
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: Observer,
	) {
		const {opponentPlayer, player} = pos

		player.hooks.getAttack.add(component, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return null
			const activeIndex = activePos.rowIndex
			const opponentRows = opponentPlayer.board.rows

			const attack = opponentRows.reduce((r: null | AttackModel, row, i) => {
				if (!row || !row.hermitCard) return r
				const newAttack = new AttackModel({
					id: this.getInstanceKey(component),
					attacker: activePos,
					target: {
						player: opponentPlayer,
						rowIndex: i,
						row: row,
					},
					type: 'effect',
					log: (values) =>
						i === activeIndex
							? `${values.defaultLog} to attack ${values.target} for ${values.damage} damage`
							: `, ${values.target} for ${values.damage} damage`,
				}).addDamage(this.props.id, 40)
				if (r) return r.addNewAttack(newAttack)
				return newAttack
			}, null)

			return attack
		})

		player.hooks.onAttack.add(component, (attack) => {
			const attackId = this.getInstanceKey(component)
			if (attack.id !== attackId) return

			applySingleUse(game)

			player.hooks.onAttack.remove(component)
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.getAttack.remove(component)
		player.hooks.onAttack.remove(component)
	}
}

export default SplashPotionOfHarming
