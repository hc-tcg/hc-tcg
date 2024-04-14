import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import HermitCard from '../../base/hermit-card'
import {applyStatusEffect, getActiveRow} from '../../../utils/board'

class XisumavoidRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'xisumavoid_rare',
			numericId: 112,
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
					'Flip a coin. If heads, the opposing active Hermit is now poisoned.\n\nPoison does an additional 20hp damage every turn until poisoned Hermit is down to 10hp.\n\nIgnores armour. Continues to poison if health is recovered.\n\nDoes not knock out Hermit.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (
				attack.id !== attackId ||
				attack.type !== 'secondary' ||
				!attack.target ||
				!attack.attacker
			)
				return

			const coinFlip = flipCoin(player, attack.attacker.row.hermitCard)

			if (coinFlip[0] !== 'heads') return

			const opponentActiveRow = getActiveRow(opponentPlayer)
			if (!opponentActiveRow || !opponentActiveRow.hermitCard) return

			applyStatusEffect(game, 'poison', opponentActiveRow?.hermitCard.cardInstance)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default XisumavoidRareHermitCard
