import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import HermitCard from '../../base/hermit-card'

class TinFoilChefRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'tinfoilchef_rare',
			numericId: 98,
			name: 'TFC',
			rarity: 'rare',
			hermitType: 'miner',
			health: 300,
			primary: {
				name: 'True Hermit',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Branch Mine',
				cost: ['miner', 'miner'],
				damage: 80,
				power: 'Flip a Coin.\n\nIf heads, player draws another card at the end of their turn.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary' || !attack.attacker) return

			const coinFlip = flipCoin(player, attack.attacker.row.hermitCard)
			if (coinFlip[0] === 'tails') return

			const drawCard = player.pile.shift()
			if (drawCard) player.hand.push(drawCard)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default TinFoilChefRareHermitCard
