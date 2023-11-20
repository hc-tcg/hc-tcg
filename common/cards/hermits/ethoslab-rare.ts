import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {flipCoin} from '../../utils/coinFlips'
import HermitCard from '../base/hermit-card'
import { applyAilment } from '../../utils/board'

class EthosLabRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'ethoslab_rare',
			numericId: 20,
			name: 'Etho',
			rarity: 'rare',
			hermitType: 'redstone',
			health: 280,
			primary: {
				name: 'Oh Snappers',
				cost: ['redstone'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Blue Fire',
				cost: ['redstone', 'redstone'],
				damage: 80,
				power:
					'Flip a coin. If heads, the opposing Hermit is now burned.\n\nBurn does an additional 20hp damage at the end of your turns.\n\nGoing AFK does not eliminate the burn.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary' || !attack.target) return

			const coinFlip = flipCoin(player, this.id)

			if (coinFlip[0] !== 'heads') return

			applyAilment(game, 'fire', attack.target.row.hermitCard.cardInstance)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default EthosLabRareHermitCard
