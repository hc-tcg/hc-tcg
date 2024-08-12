import {
	CardComponent,
	ObserverComponent,
	RowComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

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
		attackPreview: (game) => {
			const targetAmount = this.getTargetHermits(game).length - 1
			if (targetAmount === 0) return '$A40$'
			return `$A40$ + $A20$ x ${targetAmount}`
		},
	}

	getTargetHermits(game: GameModel) {
		return game.components.filter(
			RowComponent,
			query.row.opponentPlayer,
			query.row.hermitSlotOccupied,
		)
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {opponentPlayer, player} = component

		observer.subscribe(player.hooks.getAttack, () => {
			const activeRow = opponentPlayer.activeRowEntity
			const opponentRows = this.getTargetHermits(game).sort(
				(a, b) => a.index - b.index,
			)

			const attack = game
				.newAttack({
					attacker: component.entity,
					target: opponentRows[0].entity,
					type: 'effect',
					log: (values) =>
						`${values.defaultLog} to attack ${values.target} for ${values.damage} damage`,
				})
				.addDamage(
					component.entity,
					opponentRows[0].entity === activeRow ? 40 : 20,
				)

			opponentRows.slice(1).forEach((row) => {
				const newAttack = game
					.newAttack({
						attacker: component.entity,
						target: row.entity,
						type: 'effect',
						log: (values) => `, ${values.target} for ${values.damage} damage`,
					})
					.addDamage(component.entity, row.entity === activeRow ? 40 : 20)
				attack.addNewAttack(newAttack)
			})

			return attack
		})

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity)) return

			applySingleUse(game)

			observer.unsubscribe(player.hooks.onAttack)
		})
	}
}

export default SplashPotionOfHarming
