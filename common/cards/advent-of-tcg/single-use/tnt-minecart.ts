import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {beforeAttack} from '../../../types/priorities'
import {applySingleUse} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const MinecartWithTNT: SingleUse = {
	...singleUse,
	id: 'tnt_minecart',
	numericId: 1397,
	name: 'Minecart with TNT',
	expansion: 'minecraft',
	rarity: 'rare',
	tokens: 2,
	description:
		"Flip a coin.\nIf heads, do 100hp damage to your opponent's active Hermit.\nIf tails, your active Hermit takes 40hp damage.",
	hasAttack: true,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.getAttack, () => {
			const coinFlip = flipCoin(game, player, component)

			if (coinFlip[0] === 'heads') {
				return game
					.newAttack({
						attacker: component.entity,
						player: player.entity,
						target: opponentPlayer.activeRowEntity,
						type: 'effect',
						log: (values) =>
							`${values.defaultLog}, and ${values.coinFlip} to attack ${values.target} for ${values.damage} damage `,
					})
					.addDamage(component.entity, 100)
			} else {
				return game
					.newAttack({
						attacker: component.entity,
						player: player.entity,
						target: player.activeRowEntity,
						type: 'effect',
						isBacklash: true,
						log: (values) =>
							`${values.defaultLog}, and ${values.coinFlip} so ${values.target} took ${values.damage} backlash damage`,
					})
					.addDamage(component.entity, 40)
			}
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

export default MinecartWithTNT
