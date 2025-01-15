import {CardComponent, ObserverComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {CoinFlipResult} from '../../types/game-state'
import {beforeAttack} from '../../types/priorities'
import {applySingleUse} from '../../utils/board'
import {flipCoin} from '../../utils/coinFlips'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const Trident: SingleUse = {
	...singleUse,
	id: 'trident',
	numericId: 150,
	name: 'Trident',
	expansion: 'alter_egos',
	rarity: 'rare',
	tokens: 1,
	description:
		"Do 30hp damage to your opponent's active Hermit.\nFlip a coin.\nIf heads, this card is returned to your hand.",
	hasAttack: true,
	attackPreview: (_game) => '$A30$',
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		let coinflipResult: CoinFlipResult | null = null

		observer.subscribe(player.hooks.getAttack, () => {
			return game
				.newAttack({
					attacker: component.entity,
					player: player.entity,
					target: opponentPlayer.activeRowEntity,
					type: 'effect',
					log: (values) =>
						`${values.defaultLog} to attack ${values.target} for ${values.damage} damage and ${values.coinFlip}`,
				})
				.addDamage(component.entity, 30)
		})

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.APPLY_SINGLE_USE_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity)) return

				coinflipResult = flipCoin(game, player, component)[0]

				applySingleUse(game)
				observer.unsubscribeFromEverything()
			},
		)

		observer.subscribe(player.hooks.afterApply, () => {
			if (coinflipResult === 'heads') {
				component.draw()
			}
		})
	},
}

export default Trident
