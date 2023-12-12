import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import HermitCard from '../../base/hermit-card'

class ZedaphPlaysRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'zedaphplays_rare',
			numericId: 114,
			name: 'Zedaph',
			rarity: 'rare',
			hermitType: 'explorer',
			health: 290,
			primary: {
				name: 'Sheep Stare',
				cost: ['explorer'],
				damage: 50,
				power:
					'Flip a Coin.\n\nIf heads, opponent flips a coin their next turn.\n\nIf heads, opponent damages themselves.',
			},
			secondary: {
				name: 'Get Dangled',
				cost: ['explorer', 'explorer'],
				damage: 80,
				power: null,
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)
		const coinFlipResult = this.getInstanceKey(instance, 'coinFlipResult')

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== instanceKey || attack.type !== 'primary') return

			const coinFlip = flipCoin(player, this.id)
			if (coinFlip[0] !== 'heads') return

			opponentPlayer.hooks.beforeAttack.add(instance, (attack) => {
				if (attack.isType('ailment') || attack.isBacklash) return
				if (!attack.attacker) return

				// No need to flip a coin for multiple attacks
				if (!player.custom[coinFlipResult]) {
					const coinFlip = flipCoin(player, this.id, 1, opponentPlayer)
					player.custom[coinFlipResult] = coinFlip[0]
				}

				if (player.custom[coinFlipResult] === 'heads') {
					// Change attack target - this just works
					attack.target = attack.attacker
				}
			})

			opponentPlayer.hooks.onTurnEnd.add(instance, () => {
				// Delete our hook at the end of opponents turn
				delete player.custom[coinFlipResult]
				opponentPlayer.hooks.onTurnEnd.remove(instance)
				opponentPlayer.hooks.beforeAttack.remove(instance)
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default ZedaphPlaysRareHermitCard
