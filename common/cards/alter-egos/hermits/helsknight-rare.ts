import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import {moveCardToHand} from '../../../utils/movement'
import HermitCard from '../../base/hermit-card'

class HelsknightRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'helsknight_rare',
			numericId: 130,
			name: 'Helsknight',
			rarity: 'rare',
			hermitType: 'pvp',
			health: 270,
			primary: {
				name: 'Pitiful',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Trap Hole',
				cost: ['pvp', 'pvp', 'pvp'],
				damage: 100,
				power:
					'If your opponent uses a single use effect card on their next turn, flip a coin.\n\nIf heads, you take that card after its effect is applied and add it to your hand.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			const attacker = attack.getAttacker()
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary' || !attacker)
				return

			const attackerHermit = attacker.row.hermitCard
			opponentPlayer.hooks.onApply.add(instance, () => {
				if (!opponentPlayer.board.singleUseCard) return
				const coinFlip = flipCoin(player, attackerHermit, 1, opponentPlayer)

				if (coinFlip[0] == 'heads') {
					moveCardToHand(game, opponentPlayer.board.singleUseCard, player)
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
