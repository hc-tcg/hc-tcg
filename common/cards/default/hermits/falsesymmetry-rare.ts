import {HERMIT_CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {healRow} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import HermitCard from '../../base/hermit-card'

class FalseSymmetryRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'falsesymmetry_rare',
			numericId: 23,
			name: 'False',
			rarity: 'rare',
			hermitType: 'builder',
			health: 250,
			primary: {
				name: 'High Noon',
				cost: ['builder'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Supremacy',
				cost: ['builder', 'any'],
				damage: 70,
				power: 'Flip a coin.\n\nIf heads, heal 40hp to this Hermit.',
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
			const attacker = attack.attacker
			if (!attacker) return

			// Heal 40hp
			const hermitInfo = HERMIT_CARDS[attacker.row.hermitCard.cardId]
			healRow(attacker.row, 40)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default FalseSymmetryRareHermitCard
