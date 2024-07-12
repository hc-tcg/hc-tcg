import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
import {CardComponent} from '../../../types/game-state'
import {isTargeting} from '../../../utils/attacks'
import {discardCard} from '../../../utils/movement'
import Card, {attach, Attach} from '../../base/card'

class LightningRodEffectCard extends Card {
	props: Attach = {
		...attach,
		id: 'lightning_rod',
		numericId: 121,
		name: 'Lightning Rod',
		expansion: 'alter_egos',
		rarity: 'rare',
		tokens: 2,
		description:
			"All damage done to your Hermits on your opponent's turn is taken by the Hermit this card is attached to.\nDiscard after damage is taken. Only one of these cards can be attached to your Hermits at a time.",
		attachCondition: slot.every(
			attach.attachCondition,
			slot.not(
				slot.someSlotFulfills(slot.every(slot.player, slot.attachSlot, slot.hasId('lightning_rod')))
			)
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer, rowId: row, rowIndex} = pos

		opponentPlayer.hooks.beforeAttack.add(component, (attack) => {
			if (attack.isType('status-effect') || attack.isBacklash) return
			if (!row || rowIndex === null || !row.hermitCard) return

			// Only on opponents turn
			if (game.currentPlayerEntity !== opponentPlayer.id) return

			// Attack already has to be targeting us
			if (attack.getTarget()?.player.id !== player.id) return

			attack.setTarget(this.props.id, {
				player,
				rowIndex,
				row,
			})
		})

		opponentPlayer.hooks.afterAttack.add(component, (attack) => {
			if (!isTargeting(attack, pos)) return
			if (attack.calculateDamage() <= 0) return

			discardCard(game, pos.cardId)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {opponentPlayer} = pos
		opponentPlayer.hooks.beforeAttack.remove(component)
		opponentPlayer.hooks.afterAttack.remove(component)
	}
}

export default LightningRodEffectCard
