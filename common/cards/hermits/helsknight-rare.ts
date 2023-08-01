import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {flipCoin} from '../../utils/coinFlips'
import {moveCardToHand} from '../../utils/movement'
import HermitCard from '../base/hermit-card'

class HelsknightRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'helsknight_rare',
			name: 'Helsknight',
			rarity: 'rare',
			hermitType: 'pvp',
			health: 270,
			primary: {
				name: 'Pitfall',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Trap Hole',
				cost: ['pvp', 'pvp', 'pvp'],
				damage: 100,
				power:
					'If opponent uses a single use effect card on their next turn, they must flip a coin. If heads, you take the card after its effect is applied and add it to your hand.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return

			opponentPlayer.hooks.onApply.add(instance, () => {
				if (!opponentPlayer.board.singleUseCard) return
				const coinFlip = flipCoin(player, this.id, 1, opponentPlayer)

				if (coinFlip[0] == 'heads') {
					moveCardToHand(game, opponentPlayer.board.singleUseCard, true)
					opponentPlayer.board.singleUseCardUsed = false
				}
			})

			opponentPlayer.hooks.onTurnEnd.add(instance, () => {
				opponentPlayer.hooks.onApply.remove(instance)
				opponentPlayer.hooks.onTurnEnd.remove(instance)
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onAttack.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}

	override getPalette() {
		return 'alter_egos'
	}

	override getBackground() {
		return 'alter_egos_background'
	}
}

export default HelsknightRareHermitCard
