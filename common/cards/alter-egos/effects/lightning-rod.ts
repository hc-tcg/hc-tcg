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
				"Attach to any of your active or AFK Hermits.\n\n All damage done to you on your opponent's next turn is taken by the Hermit this card is attached to.\n\nDiscard after damage is taken.\n\nOnly one of these cards can be attached at a time.",
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		const board = pos.player.board
		if (board.rows.find((row) => row.effectCard?.cardId === this.id)) {
			// Can't attach if there's already one attached
			return 'NO'
		}

		return 'YES'
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer, row, rowIndex} = pos

		// Only on opponents turn
		opponentPlayer.hooks.beforeAttack.add(instance, (attack) => {
			if (attack.isType('ailment') || attack.isBacklash) return
			if (!row || rowIndex === null || !row.hermitCard) return

			// Attack already has to be targeting us
			if (attack.target?.player.id !== player.id) return

			attack.target = {
				player: player,
				rowIndex: rowIndex,
				row: row,
			}
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
