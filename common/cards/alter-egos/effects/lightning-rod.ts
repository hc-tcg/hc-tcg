import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {isTargetingPos} from '../../../utils/attacks'
import {discardCard} from '../../../utils/movement'
import EffectCard from '../../base/effect-card'

class LightningRodEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'lightning_rod',
			numericId: 121,
			name: 'Lightning Rod',
			rarity: 'rare',
			description:
				"All damage done to your Hermits on your opponent's turn is taken by the Hermit this card is attached to.\nDiscard after damage is taken. Only one of these cards can be attached to your Hermits at a time.",
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const result = super.canAttach(game, pos)

		const board = pos.player.board
		if (board.rows.find((row) => row.effectCard?.cardId === this.id)) {
			// Can't attach if there's already one attached
			result.push('UNMET_CONDITION')
		}

		return result
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer, row, rowIndex} = pos

		opponentPlayer.hooks.beforeAttack.add(instance, (attack) => {
			if (attack.isType('status-effect') || attack.isBacklash) return
			if (!row || rowIndex === null || !row.hermitCard) return

			// Only on opponents turn
			if (game.currentPlayerId !== opponentPlayer.id) return

			// Attack already has to be targeting us
			if (attack.getTarget()?.player.id !== player.id) return

			attack.setTarget(this.id, {
				player,
				rowIndex,
				row,
			})
		})

		opponentPlayer.hooks.afterAttack.add(instance, (attack) => {
			if (!isTargetingPos(attack, pos)) return
			if (attack.calculateDamage() <= 0) return

			discardCard(game, pos.card)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer} = pos
		opponentPlayer.hooks.beforeAttack.remove(instance)
		opponentPlayer.hooks.afterAttack.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default LightningRodEffectCard
