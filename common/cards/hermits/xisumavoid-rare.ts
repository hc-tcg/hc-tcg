import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {flipCoin} from '../../utils/coinFlips'
import HermitCard from '../base/hermit-card'

class XisumavoidRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'xisumavoid_rare',
			name: 'Xisuma',
			rarity: 'rare',
			hermitType: 'redstone',
			health: 280,
			primary: {
				name: 'Goodness Me',
				cost: ['redstone'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Cup of Tea',
				cost: ['redstone', 'redstone'],
				damage: 80,
				power:
					'Flip a coin. If heads, opponent is now poisoned.\n\nPoison does an additional 20hp damage on your turns.\n\nGoing AFK does not eliminate the poison.',
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

			const hasDamageEffect = attack.target.row.ailments.some(
				(a) => a.id === 'fire' || a.id === 'poison'
			)
			if (!hasDamageEffect) {
				attack.target.row.ailments.push({id: 'poison'})
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default XisumavoidRareHermitCard
