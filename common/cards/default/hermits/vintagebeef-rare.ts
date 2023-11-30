import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import HermitCard from '../../base/hermit-card'
import {removeAilment} from '../../../utils/board'

class VintageBeefRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'vintagebeef_rare',
			numericId: 103,
			name: 'Beef',
			rarity: 'rare',
			hermitType: 'builder',
			health: 290,
			primary: {
				name: 'Poik',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Beefy Tunes',
				cost: ['builder', 'builder'],
				damage: 80,
				power: 'Flip a coin. If heads, all status effects are removed from your Hermits.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return

			const coinFlip = flipCoin(player, this.id)
			if (coinFlip[0] !== 'heads') return

			player.board.rows.forEach((row) => {
				if (!row.hermitCard) return

				const ailmentsToRemove = game.state.ailments.filter((ail) => {
					return ail.targetInstance === row.hermitCard.cardInstance
				})

				ailmentsToRemove.forEach((ail) => {
					removeAilment(game, pos, ail.ailmentInstance)
				})
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default VintageBeefRareHermitCard
