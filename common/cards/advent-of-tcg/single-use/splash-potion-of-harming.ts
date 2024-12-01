import {
	CardComponent,
	ObserverComponent,
	RowComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {beforeAttack} from '../../../types/priorities'
import {applySingleUse} from '../../../utils/board'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

function getTargetHermits(game: GameModel) {
	return game.components
		.filter(
			RowComponent,
			query.row.opponentPlayer,
			query.row.hermitSlotOccupied,
		)
		.sort(
			(a, b) =>
				-Number(a.index === game.opponentPlayer.activeRow?.index) ||
				Number(b.index === game.opponentPlayer.activeRow?.index) ||
				a.index - b.index,
		)
}

const SplashPotionOfHarming: SingleUse = {
	...singleUse,
	id: 'splash_potion_of_harming',
	numericId: 226,
	name: 'Splash Potion of Harming',
	expansion: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 3,
	description:
		"Deal 40hp damage to the opponent's active hermit and 20hp damage to all other opponent Hermits.",
	hasAttack: true,
	attackPreview: (game) => {
		const targets = getTargetHermits(game)
		if (targets.length === 0) {
			return '$A0$'
		}
		if (targets[0].index === game.opponentPlayer.activeRow?.index) {
			return targets.length === 1
				? '$A40$'
				: `$A40$ + $A20$ x ${targets.length - 1}`
		}
		return `$A20$ x ${targets.length}`
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {opponentPlayer, player} = component

		observer.subscribe(player.hooks.getAttack, () => {
			const activeRow = opponentPlayer.activeRow
			const opponentRows = getTargetHermits(game)

			const attack = game
				.newAttack({
					attacker: component.entity,
					target: opponentRows[0].entity,
					player: player.entity,
					type: 'effect',
					log: (values) =>
						`${values.defaultLog} to attack ${values.target} for ${values.damage} damage`,
				})
				.addDamage(
					component.entity,
					opponentRows[0].entity === activeRow?.entity ? 40 : 20,
				)

			opponentRows.slice(1).forEach((row) => {
				const newAttack = game
					.newAttack({
						attacker: component.entity,
						target: row.entity,
						type: 'effect',
						log: (values) => `, ${values.target} for ${values.damage} damage`,
					})
					.addDamage(component.entity, 20)
				attack.addNewAttack(newAttack)
			})

			return attack
		})

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.APPLY_SINGLE_USE_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity)) return

				applySingleUse(game)

				observer.unsubscribeFromEverything()
			},
		)
	},
}

export default SplashPotionOfHarming
