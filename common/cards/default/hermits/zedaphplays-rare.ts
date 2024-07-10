import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardComponent, CoinFlipT} from '../../../types/game-state'
import {applyStatusEffect} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import Card, {Hermit, hermit} from '../../base/card'

class ZedaphPlaysRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'zedaphplays_rare',
		numericId: 114,
		name: 'Zedaph',
		expansion: 'default',
		rarity: 'rare',
		type: 'explorer',
		tokens: 2,
		health: 290,
		primary: {
			name: 'Sheep Stare',
			cost: ['explorer'],
			damage: 50,
			power:
				"Flip a coin.\nIf heads, on your opponent's next turn, flip a coin.\nIf heads, your opponent's active Hermit attacks themselves.",
		},
		secondary: {
			name: 'Get Dangled',
			cost: ['explorer', 'explorer'],
			damage: 80,
			power: null,
		},
	}

	override onAttach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onAttack.add(instance, (attack) => {
			const attacker = attack.getAttacker()
			if (attack.id !== instanceKey || attack.type !== 'primary' || !attacker) return

			const attackerHermit = attacker.row.hermitCard
			const coinFlip = flipCoin(player, attackerHermit)
			if (coinFlip[0] !== 'heads') return

			applyStatusEffect(game, 'sheep-stare', attack.getTarget()?.row.hermitCard)
		})
	}

	override onDetach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player} = pos

		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default ZedaphPlaysRareHermitCard
