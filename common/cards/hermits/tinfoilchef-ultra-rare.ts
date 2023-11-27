import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {isRemovable} from '../../utils/cards'
import {flipCoin} from '../../utils/coinFlips'
import {discardCard} from '../../utils/movement'
import HermitCard from '../base/hermit-card'

class TinFoilChefUltraRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'tinfoilchef_ultra_rare',
			numericId: 99,
			name: 'TFC',
			rarity: 'ultra_rare',
			hermitType: 'miner',
			health: 300,
			primary: {
				name: 'Phone Call',
				cost: ['miner'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Take It Easy',
				cost: ['miner', 'miner', 'miner'],
				damage: 100,
				power:
					'Flip a Coin.\n\nIf heads, opponent is forced to discard effect card attached to active Hermit.\n\nOnly one effect card per opposing Hermit can be discarded.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.beforeAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			if (opponentPlayer.board.activeRow === null) return 'NO'
			const opponentActiveRow = opponentPlayer.board.rows[opponentPlayer.board.activeRow]
			if (!opponentActiveRow.effectCard || !isRemovable(opponentActiveRow.effectCard)) return

			// Can't discard two items on the same hermit
			const limit = player.custom[this.getInstanceKey(instance)] || {}
			if (limit[opponentActiveRow.hermitCard.cardInstance]) return

			const coinFlip = flipCoin(player, this.id)
			if (coinFlip[0] === 'tails') return

			limit[opponentActiveRow.hermitCard.cardInstance] = true
			player.custom[this.getInstanceKey(instance)] = limit

			discardCard(game, opponentActiveRow.effectCard)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.beforeAttack.remove(instance)
		delete player.custom[this.getInstanceKey(instance)]
	}
}

export default TinFoilChefUltraRareHermitCard
