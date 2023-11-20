import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {flipCoin} from '../../utils/coinFlips'
import HermitCard from '../base/hermit-card'

class PearlescentMoonRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'pearlescentmoon_rare',
			numericId: 85,
			name: 'Pearl',
			rarity: 'rare',
			hermitType: 'terraform',
			health: 300,
			primary: {
				name: 'Cleaning Lady',
				cost: ['terraform'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Aussie Ping',
				cost: ['terraform', 'any'],
				damage: 70,
				power:
					'Opponent flips a coin on their next turn. If heads, their attack misses. Opponent can not miss on consecutive turns.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const status = this.getInstanceKey(instance, 'status')
		player.custom[status] = 'none'

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return

			if (player.custom[status] === 'missed') {
				player.custom[status] = 'none'
				return
			}

			opponentPlayer.hooks.beforeAttack.add(instance, (attack) => {
				if (attack.isType('ailment', 'effect') || attack.isBacklash) return

				const hasFlipped = player.custom[status] === 'heads' || player.custom[status] === 'tails'

				// Only flip a coin once
				if (!hasFlipped) {
					const coinFlip = flipCoin(player, this.id, 1, opponentPlayer)
					player.custom[status] = coinFlip[0]
				}

				if (player.custom[status] === 'heads') {
					attack.multiplyDamage(this.id, 0).lockDamage()
				}
			})

			opponentPlayer.hooks.onTurnEnd.add(instance, () => {
				if (player.custom[status] === 'heads') {
					player.custom[status] = 'missed'
				}

				opponentPlayer.hooks.beforeAttack.remove(instance)
				opponentPlayer.hooks.onTurnEnd.remove(instance)
			})
		})

		// If the opponent missed the previous turn and we switch hermits or we don't
		// attack this turn then we reset the status
		player.hooks.onTurnEnd.add(instance, () => {
			player.custom[status] = 'none'
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		player.hooks.onAttack.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
		opponentPlayer.hooks.beforeAttack.remove(instance)
		opponentPlayer.hooks.onTurnEnd.remove(instance)
		delete player.custom[this.getInstanceKey(instance, 'status')]
	}
}

export default PearlescentMoonRareHermitCard
